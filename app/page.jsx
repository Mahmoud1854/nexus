"use client";

import { Sidebar } from "@/components/Sidebar";
import { ChatPanel } from "@/components/ChatPanel";
import { useSidebar } from "@/hooks/useSidebar";
import { ChatProvider } from "@/store/chatStore";

function MainContent() {
  const { isOpen, toggle, close } = useSidebar();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <Sidebar isOpen={isOpen} onClose={close} />
      <ChatPanel isSidebarOpen={isOpen} onToggleSidebar={toggle} />
    </div>
  );
}

export default function Home() {
  return (
    <ChatProvider>
      <MainContent />
    </ChatProvider>
  );
}
