# Aria AI - Development Guide

## 🏗️ Architecture Overview

Aria is built with a modular, extensible architecture that allows easy addition of new tools and features without breaking changes.

### Core Components

```
aria-ai/
├── app/                     # Next.js app router
│   ├── api/chat/assistant/  # OpenAI Assistant API integration
│   └── chat/               # Main chat interface
├── components/             # Reusable UI components
│   ├── chat/              # Chat-specific components
│   ├── views/             # Widget views (calendar, weather, etc.)
│   └── ui/                # Base UI components (shadcn/ui)
├── lib/                   # Core business logic
│   ├── tools/             # 🔧 Extensible tool system
│   ├── llm/               # LLM provider abstractions
│   ├── hooks/             # React hooks
│   └── file-management/   # Document/file handling
├── integrations/          # External service integrations
│   ├── gcal/             # Google Calendar
│   └── weather/          # Weather API
└── types/                # TypeScript definitions
```

## 🔧 Adding New Tools

The tool system is designed for easy extension. Here's how to add a new tool:

### Step 1: Create the Tool Implementation

Add your tool to `lib/tools/index.ts`:

```typescript
// Add to the appropriate category or create a new one
export const yourNewTools: Tool[] = [
  {
    name: "your_tool_name",
    execute: async (
      args: YourArgsInterface,
      context: ToolExecutionContext
    ): Promise<ToolResult> => {
      try {
        // Your tool logic here
        const result = await yourImplementation(args, context);

        return { success: true, data: result };
      } catch (error) {
        console.error("❌ your_tool_name failed:", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Tool execution failed",
          tool: "your_tool_name",
        };
      }
    },
  },
  // ... more tools
];

// Add to allTools export
export const allTools: Tool[] = [
  ...calendarTools,
  ...weatherTools,
  ...yourNewTools, // Add here
];
```

### Step 2: Update Assistant Tool Definitions

Add the function definition to `lib/llm/providers/openai-assistant.ts` in the tools array:

```typescript
{
  type: "function",
  function: {
    name: "your_tool_name",
    description: "Clear description of what your tool does",
    parameters: {
      type: "object",
      properties: {
        // Define your parameters
        param1: {
          type: "string",
          description: "Parameter description",
        },
      },
      required: ["param1"],
    },
  },
},
```

### Step 3: Update Assistant Instructions (Optional)

If your tool needs specific usage guidance, update the assistant instructions in the same file:

```typescript
⚡ YOUR CAPABILITIES:
You have access to these powerful tools:
// ... existing tools
- your_tool_name: Description of when to use this tool
```

### Step 4: Test Your Tool

The tool system automatically handles:

- ✅ Tool discovery and execution
- ✅ Error handling and logging
- ✅ Streaming responses
- ✅ User feedback (toasts)

## 🔌 Adding New Integrations

### Step 1: Create Integration Class

Create a new file in `integrations/your-service/index.ts`:

```typescript
export interface YourServiceConfig {
  apiKey: string;
  // other config
}

export class YourServiceIntegration {
  private config: YourServiceConfig;

  constructor() {
    this.config = {
      apiKey: process.env.YOUR_SERVICE_API_KEY || "",
    };
  }

  async yourMethod(params: any): Promise<any> {
    // Implementation
  }
}
```

### Step 2: Add Environment Variables

Update `.env.local.example` and your `.env.local`:

```bash
# Your Service
YOUR_SERVICE_API_KEY=your_api_key_here
```

### Step 3: Create Tools

Follow the tool creation process above to expose your integration as tools.

## 🎨 Adding New UI Views

### Step 1: Create View Component

Create `components/views/your-view.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
// Import your UI components

export function YourView() {
  // Your component logic

  return <div className="space-y-4">{/* Your UI */}</div>;
}
```

### Step 2: Add to Type Definitions

Update `types/index.ts`:

```typescript
export type SidebarView =
  | "calendar"
  | "weather"
  | "settings"
  | "models"
  | "your-view";
```

### Step 3: Integrate in Chat Page

Update `app/chat/page.tsx`:

```typescript
// Add to renderPaneContent
case "your-view":
  return <YourView />;
```

Update header to add toggle button in `components/layout/header.tsx`.

## 📊 File Search & Document Management

The system includes a built-in file management system for document search:

### Using File Search

Users can upload documents, and the assistant automatically has access to search through them using the `file_search` tool.

### Extending File Management

Add new file processing capabilities in `lib/file-management/index.ts`:

```typescript
// Add new methods to FileManagementSystem class
async yourFileMethod(params: any): Promise<any> {
  // Implementation
}
```

## 🧪 Testing New Features

### Manual Testing

1. Start the development server: `npm run dev`
2. Test your tool through the chat interface
3. Check browser console for logs
4. Verify tool execution in the UI

### Adding Automated Tests

Create test files following the pattern:

```
__tests__/
├── tools/
│   └── your-tool.test.ts
├── integrations/
│   └── your-integration.test.ts
└── components/
    └── your-component.test.tsx
```

## 🔒 Security Considerations

### Tool Security

- Always validate input parameters
- Check user authentication for sensitive operations
- Log tool usage for debugging
- Handle errors gracefully

### API Keys

- Store all API keys in environment variables
- Never commit secrets to version control
- Use different keys for development/production

## 📈 Performance Optimization

### Tool Performance

- Keep tool execution fast (< 5 seconds)
- Use caching where appropriate
- Implement timeout handling
- Provide progress feedback for long operations

### UI Performance

- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Optimize images and assets
- Use code splitting for large features

## 🚀 Deployment

### Environment Setup

1. Set all required environment variables
2. Test all integrations work in production
3. Verify OpenAI API access and limits
4. Set up monitoring and logging

### Scaling Considerations

- Tool executions are stateless and can be cached
- File uploads use OpenAI's vector storage
- Consider rate limiting for heavy API usage
- Monitor OpenAI API usage and costs

## 🎯 Best Practices

### Code Quality

- Use TypeScript strictly
- Follow the existing naming conventions
- Add JSDoc comments for complex functions
- Keep components focused and small

### User Experience

- Provide clear error messages
- Show loading states for all async operations
- Make tools discoverable through natural language
- Test with real user workflows

### Maintainability

- Keep tools independent and stateless
- Use consistent error handling patterns
- Document complex business logic
- Regular dependency updates

## 🔮 Future Extensions

The architecture supports these future enhancements:

- **Multi-user support**: User-specific tool configurations
- **Plugin system**: Dynamic tool loading
- **Workflow automation**: Chain multiple tools
- **Custom model providers**: Beyond OpenAI
- **Advanced file processing**: OCR, analysis, etc.
- **Real-time collaboration**: Shared assistants
- **Mobile apps**: React Native integration

## 🆘 Troubleshooting

### Common Issues

1. **Tool not appearing**: Check tool registration in `allTools` array
2. **Authentication errors**: Verify environment variables
3. **OpenAI errors**: Check API key and usage limits
4. **File upload issues**: Verify file size and format limits

### Debug Mode

Set `NODE_ENV=development` for detailed logging of:

- Tool executions
- API calls
- Error traces
- Performance metrics

---

Happy coding! 🚀 The modular architecture makes Aria highly extensible while maintaining stability.
