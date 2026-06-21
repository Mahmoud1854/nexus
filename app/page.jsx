"use client";

import { Sidebar } from "@/components/Sidebar";
import { ChatPanel } from "@/components/ChatPanel";
import { useSidebar } from "@/hooks/useSidebar";
import { ChatProvider } from "@/store/chatStore";

export default function Home() {
  const { isOpen, toggle, close } = useSidebar();

  return (
    <ChatProvider>
      {/*
        h-screen / w-screen  → fill full viewport
        overflow-hidden      → no scroll on the shell itself
        flex                 → Sidebar (static on desktop) + ChatPanel (flex-1)

        On mobile/tablet the Sidebar is `fixed` (out of flow),
        so ChatPanel's flex-1 always fills 100% of the width.

        On desktop the Sidebar is `static` (in flow, width-animated),
        so ChatPanel's flex-1 fills whatever space remains.
      */}
      <div className="flex h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        <Sidebar isOpen={isOpen} onClose={close} />
        <ChatPanel isSidebarOpen={isOpen} onToggleSidebar={toggle} />
      </div>
    </ChatProvider>
  );
}
