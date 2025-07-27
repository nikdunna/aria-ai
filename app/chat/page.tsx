"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { useState } from "react";
import { SidebarView } from "@/types";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [sidebarView, setSidebarView] = useState<SidebarView | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        activeView={sidebarView}
        onViewChange={setSidebarView}
        onOpenChange={setIsSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onViewChange={setSidebarView}
        />

        <main className="flex-1 overflow-hidden">
          <ChatInterface />
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
}
