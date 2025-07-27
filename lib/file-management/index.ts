import OpenAI from "openai";

export interface FileUploadResult {
  success: boolean;
  fileId?: string;
  vectorStoreId?: string;
  error?: string;
}

export interface DocumentSearchResult {
  success: boolean;
  results?: Array<{
    content: string;
    score: number;
    filename: string;
  }>;
  error?: string;
}

export class FileManagementSystem {
  private client: OpenAI;
  private vectorStoreId: string | null = null;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Get or create a vector store for the user
  async getOrCreateVectorStore(userId?: string): Promise<string> {
    if (this.vectorStoreId) {
      return this.vectorStoreId;
    }

    try {
      // Try to find existing vector store (you might want to store this in database)
      const storeName = `aria-user-${userId || "default"}-docs`;

      // For now, create a new one each time
      // In production, you'd want to store the vector store ID in your database
      const vectorStore = await this.client.beta.vectorStores.create({
        name: storeName,
        expires_after: {
          anchor: "last_active_at",
          days: 30, // Keep for 30 days of inactivity
        },
      });

      this.vectorStoreId = vectorStore.id;
      console.log(`✅ Created vector store: ${vectorStore.id}`);
      return vectorStore.id;
    } catch (error) {
      console.error("❌ Failed to create vector store:", error);
      throw new Error("Failed to create document storage");
    }
  }

  // Upload a file and add it to the vector store
  async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    userId?: string
  ): Promise<FileUploadResult> {
    try {
      // Get vector store
      const vectorStoreId = await this.getOrCreateVectorStore(userId);

      // Upload file to OpenAI
      const file = await this.client.files.create({
        file: new File([fileBuffer], filename),
        purpose: "assistants",
      });

      console.log(`✅ Uploaded file: ${file.id} (${filename})`);

      // Add file to vector store
      const vectorStoreFile =
        await this.client.beta.vectorStores.files.createAndPoll(vectorStoreId, {
          file_id: file.id,
        });

      if (vectorStoreFile.status === "completed") {
        console.log(`✅ File added to vector store: ${filename}`);
        return {
          success: true,
          fileId: file.id,
          vectorStoreId,
        };
      } else {
        throw new Error(`File processing failed: ${vectorStoreFile.status}`);
      }
    } catch (error) {
      console.error("❌ File upload failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "File upload failed",
      };
    }
  }

  // Search documents in the vector store
  async searchDocuments(
    query: string,
    userId?: string,
    maxResults: number = 5
  ): Promise<DocumentSearchResult> {
    try {
      const vectorStoreId = await this.getOrCreateVectorStore(userId);

      // Search the vector store
      const searchResults = await this.client.beta.vectorStores.search({
        vector_store_id: vectorStoreId,
        query,
        limit: maxResults,
      });

      const results = searchResults.data.map((result) => ({
        content: result.content[0]?.text || "",
        score: result.score,
        filename: result.filename || "Unknown file",
      }));

      console.log(`✅ Document search completed: ${results.length} results`);
      return {
        success: true,
        results,
      };
    } catch (error) {
      console.error("❌ Document search failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Search failed",
      };
    }
  }

  // List files in the vector store
  async listFiles(
    userId?: string
  ): Promise<Array<{ id: string; filename: string; status: string }>> {
    try {
      const vectorStoreId = await this.getOrCreateVectorStore(userId);

      const files = await this.client.beta.vectorStores.files.list(
        vectorStoreId
      );

      const fileDetails = await Promise.all(
        files.data.map(async (vectorFile) => {
          try {
            const file = await this.client.files.retrieve(vectorFile.file_id);
            return {
              id: vectorFile.file_id,
              filename: file.filename || "Unknown",
              status: vectorFile.status,
            };
          } catch (error) {
            return {
              id: vectorFile.file_id,
              filename: "Unknown",
              status: vectorFile.status,
            };
          }
        })
      );

      return fileDetails;
    } catch (error) {
      console.error("❌ Failed to list files:", error);
      return [];
    }
  }

  // Delete a file from the vector store
  async deleteFile(
    fileId: string,
    userId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const vectorStoreId = await this.getOrCreateVectorStore(userId);

      // Remove from vector store
      await this.client.beta.vectorStores.files.del(vectorStoreId, fileId);

      // Delete the actual file
      await this.client.files.del(fileId);

      console.log(`✅ Deleted file: ${fileId}`);
      return { success: true };
    } catch (error) {
      console.error("❌ Failed to delete file:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      };
    }
  }

  // Get vector store ID for the assistant
  getVectorStoreId(): string | null {
    return this.vectorStoreId;
  }
}

// Export singleton instance
export const fileManager = new FileManagementSystem();
