"use client";

import { Trash2, Plus, PanelLeftClose } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useChat } from "@/store/chatStore";

export function Sidebar({ isOpen, onClose }) {
  const {
    chats,
    activeChatId,
    selectChat,
    deleteChat,
    createNewChat,
    isHydrated,
  } = useChat();

  // Close the sidebar on mobile after selecting a chat
  const handleSelectChat = (id) => {
    selectChat(id);
    if (window.innerWidth < 1280) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop — mobile/tablet only, shown when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs xl:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          // ─── Shared base styles ───────────────────────────────────────────
          "flex h-full flex-col",
          "border-r border-neutral-200 dark:border-neutral-800",
          "bg-neutral-50 dark:bg-neutral-900",

          // ─── Mobile / Tablet: fixed overlay (out of flow) ─────────────────
          // Position: fixed, always 288px wide, slides left/right
          "fixed inset-y-0 left-0 z-40 w-72",
          "transition-transform duration-300",

          // ─── Desktop (xl+): static in-flow flex child ─────────────────────
          // xl:static resets "fixed" → sidebar participates in flex layout
          // xl:translate-x-0 resets any translate from the conditional below
          // xl:transition-[width] collapses by shrinking width instead
          "xl:static xl:inset-auto xl:z-auto",
          "xl:translate-x-0 xl:transition-[width] xl:duration-300",

          // ─── State-dependent (open / closed) ─────────────────────────────
          // Mobile/tablet: slide in or out
          // Desktop: expand or collapse width
          isOpen
            ? "translate-x-0 xl:w-72"
            : "-translate-x-full xl:w-0 xl:overflow-hidden xl:border-r-0",
        ].join(" ")}
        aria-label="Chat history sidebar"
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-2 border-b border-neutral-200 p-3 dark:border-neutral-800 shrink-0">
          <button
            onClick={createNewChat}
            className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200/50 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-300 dark:hover:bg-neutral-800/50 dark:hover:text-white dark:focus-visible:ring-neutral-500"
            aria-label="Create new chat"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>New chat</span>
          </button>

          {/* Close button — hidden on desktop where width collapse handles it */}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-200/50 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-100 dark:focus-visible:ring-neutral-500 shrink-0 xl:hidden"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        </div>

        {/* ── Chat list ── */}
        <div className="flex-1 overflow-y-auto p-3">
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Recent chats
          </h3>

          <div className="flex flex-col gap-1">
            {!isHydrated ? (
              <span className="px-3 text-sm text-neutral-500 dark:text-neutral-400 animate-pulse">
                Loading chats…
              </span>
            ) : chats.length === 0 ? (
              <span className="px-3 text-sm text-neutral-500 dark:text-neutral-400">
                No chats yet
              </span>
            ) : (
              chats.map((chat) => {
                const isActive = chat.id === activeChatId;
                return (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelectChat(chat.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    className={`group relative flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 ${
                      isActive
                        ? "bg-neutral-200 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white"
                        : "text-neutral-600 hover:bg-neutral-200/50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-white"
                    }`}
                  >
                    <span className="truncate pr-8">
                      {chat.title || "New Chat"}
                    </span>

                    <button
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="absolute right-2 rounded p-1 text-neutral-400 opacity-0 transition-opacity hover:bg-neutral-300 hover:text-red-500 group-hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:opacity-100 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-red-400 dark:focus-visible:ring-red-500"
                      aria-label={`Delete "${chat.title || "New Chat"}"`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex shrink-0 flex-col gap-2 border-t border-neutral-200 p-3 dark:border-neutral-800">
          <div className="rounded-lg border border-neutral-200 bg-white/50 px-3 py-2 text-center text-xs font-medium text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-400">
            Made with Mahmoud
          </div>
          <ThemeToggle className="w-full justify-center rounded-lg border border-neutral-200 dark:border-neutral-800" />
        </div>
      </aside>
    </>
  );
}
