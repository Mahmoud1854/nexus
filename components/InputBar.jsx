"use client";

import { useRef, useEffect } from "react";
import { ArrowUp, Square } from "lucide-react";

export function InputBar({ value, onChange, onSubmit, isStreaming, onStop }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 180)}px`;
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="w-full px-4 py-2 shrink-0">
      <div className="flex items-end gap-2 border border-neutral-200 bg-white p-2 rounded-2xl dark:border-neutral-800 dark:bg-neutral-900 shadow-sm focus-within:ring-1 focus-within:ring-neutral-400 dark:focus-within:ring-neutral-700 transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything.."
          className="max-h-48 min-h-11 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 outline-none dark:text-neutral-100 dark:placeholder-neutral-500"
          disabled={isStreaming}
        />

        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white transition-colors hover:bg-red-650 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 cursor-pointer shadow-xs"
            aria-label="Stop generating"
          >
            <Square className="h-4 w-4 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!value.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white transition-colors hover:bg-neutral-850 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-neutral-500 disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-xs"
            aria-label="Send message"
          >
            <ArrowUp className="h-4.5 w-4.5 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );
}
