"use client";

import { useState, useEffect, useRef, useMemo, memo } from "react";
import { PanelLeft, Copy, Check, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useChat } from "@/store/chatStore";
import { InputBar } from "@/components/InputBar";
import { useTheme } from "@/hooks/useTheme";

const CODE_THEME_LIGHT = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: "#f5f5f5",
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    color: "#383a42",
  },
};

const Message = memo(function Message({ msg, msgId, copiedId, onCopy, markdownComponents }) {
    const isUser = msg.role === "user";

    return (
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`group relative max-w-[95%] sm:max-w-[85%] px-4 py-3 rounded-2xl ${
            isUser
              ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
              : "bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-800 dark:text-neutral-200 w-full"
          }`}
        >
          {!isUser && msg.content && (
            <button
              onClick={() => onCopy(msgId, msg.content)}
              className="absolute -top-2 -right-2 rounded-lg border border-neutral-200 bg-white p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-200 dark:focus-visible:ring-neutral-500 shadow-xs cursor-pointer"
              aria-label="Copy response"
            >
              {copiedId === msgId ? (
                <Check className="h-3.5 w-3.5 text-green-500 stroke-[2.5]" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {msg.content}
            </p>
          ) : msg.content ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {msg.content}
            </ReactMarkdown>
          ) : (
            <div className="flex items-center gap-1.5 py-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 dark:bg-neutral-500 [animation-delay:-0.3s]"></span>
              <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 dark:bg-neutral-500 [animation-delay:-0.15s]"></span>
              <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 dark:bg-neutral-500"></span>
            </div>
          )}
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.msg.content === next.msg.content &&
    prev.msg.role === next.msg.role &&
    prev.copiedId === next.copiedId &&
    prev.markdownComponents === next.markdownComponents
);

export function ChatPanel({ isSidebarOpen, onToggleSidebar }) {
  const {
    activeChat,
    isStreaming,
    error,
    sendMessage,
    stopGeneration,
  } = useChat();

  const [inputValue, setInputValue] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const messageCount = activeChat?.messages?.length ?? 0;
  const lastContent = activeChat?.messages?.at(-1)?.content ?? "";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageCount, lastContent]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue.trim());
    setInputValue("");
  };

  const handleCopyMessage = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  };

  const hasMessages = activeChat && activeChat.messages && activeChat.messages.length > 0;
  const syntaxTheme = isDark ? oneDark : CODE_THEME_LIGHT;

  const markdownComponents = useMemo(() => ({
    h1: ({ children }) => (
      <h1 className="mb-2 mt-4 font-semibold text-lg text-neutral-900 dark:text-neutral-50">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-2 mt-3 font-semibold text-base text-neutral-900 dark:text-neutral-50">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-1 mt-2 font-semibold text-sm text-neutral-900 dark:text-neutral-50">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="mb-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="mb-3 list-disc pl-5 text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-3 list-decimal pl-5 text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="my-2 border-l-4 border-neutral-300 pl-4 italic text-neutral-500 dark:border-neutral-700">
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-neutral-300 dark:border-neutral-700 text-sm">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 font-semibold text-left">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-neutral-300 dark:border-neutral-700 px-4 py-2">
        {children}
      </td>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-blue-600 underline hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded dark:text-blue-400 dark:hover:text-blue-300"
      >
        {children}
      </a>
    ),
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      const codeString = String(children).replace(/\n$/, "");

      if (!inline && match) {
        return (
          <div className="my-3 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-100/80 px-4 py-2 dark:border-neutral-800 dark:bg-[#1e1e2e]">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {match[1]}
              </span>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(codeString);
                  } catch (err) {
                    console.error("Failed to copy code:", err);
                  }
                }}
                className="rounded border border-neutral-300 px-2 py-0.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:focus-visible:ring-neutral-500 cursor-pointer"
              >
                Copy code
              </button>
            </div>
            <SyntaxHighlighter
              language={match[1]}
              style={syntaxTheme}
              PreTag="div"
              customStyle={{
                margin: 0,
                borderRadius: 0,
                fontSize: "0.78rem",
                lineHeight: "1.6",
                padding: "1rem",
              }}
              codeTagProps={{ style: { fontFamily: "'JetBrains Mono', monospace" } }}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        );
      }

      if (!inline) {
        return (
          <pre className="my-3 overflow-x-auto rounded-xl border border-neutral-200 bg-neutral-100 p-4 font-mono text-xs leading-relaxed text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
            <code {...props}>{children}</code>
          </pre>
        );
      }

      return (
        <code
          className="rounded bg-neutral-200/60 px-1.5 py-0.5 font-mono text-xs font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
          {...props}
        >
          {children}
        </code>
      );
    },
  }), [syntaxTheme]);

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-white dark:bg-neutral-950">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-900 bg-white dark:bg-neutral-950 z-10">
        <div className="flex items-center gap-3">
          {!isSidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:focus-visible:ring-neutral-500 transition-colors cursor-pointer"
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          )}
          <span className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Nexus
          </span>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden relative">
        {!hasMessages ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <h1 className="mb-6 text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl">
              Hello, Night Owl
            </h1>
            <div className="w-full px-4 lg:px-8">
              <InputBar
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSend}
                isStreaming={isStreaming}
                onStop={stopGeneration}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              <div className="w-full space-y-6">
                {activeChat.messages.map((msg, index) => {
                  const msgId = msg.id || index;
                  return (
                    <Message
                      key={msgId}
                      msg={msg}
                      msgId={msgId}
                      copiedId={copiedId}
                      onCopy={handleCopyMessage}
                      markdownComponents={markdownComponents}
                    />
                  );
                })}

                {error && (
                  <div
                    className="flex items-center gap-3 border border-red-200 bg-red-50 p-4 rounded-xl text-red-700 shadow-xs dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400"
                    role="alert"
                  >
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t border-neutral-100 bg-white p-4 dark:border-neutral-900 dark:bg-neutral-950 z-10 shrink-0">
              <InputBar
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSend}
                isStreaming={isStreaming}
                onStop={stopGeneration}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
