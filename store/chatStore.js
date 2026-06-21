"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const ChatContext = createContext(null);

const STORAGE_KEY = "nexus_chats_v1";

function loadChats() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
    } catch (e) {
      console.error("Failed to load chats from localStorage:", e);
    }
  return [];
}

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const abortControllerRef = useRef(null);
  const stopGenerationRef = useRef(null);
  const isMounted = useRef(false);

  // Load from localStorage on client mount (hydration-safe)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setChats(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load chat history:", e);
    } finally {
      setIsHydrated(true);
      isMounted.current = true;
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch (e) {
      console.error("Failed to save chats to localStorage:", e);
    }
  }, [chats, isHydrated]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    stopGenerationRef.current = stopGeneration;
  }, [stopGeneration]);

  const createNewChat = useCallback(() => {
    if (stopGenerationRef.current) stopGenerationRef.current();
    const newChat = {
      id: crypto.randomUUID(),
      title: "New Chat..",
      messages: [],
      timestamp: Date.now(),
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setError(null);
    return newChat.id;
  }, []);

  const selectChat = useCallback((id) => {
    if (stopGenerationRef.current) stopGenerationRef.current();
    setActiveChatId(id);
    setError(null);
  }, []);

  const deleteChat = useCallback((id, e) => {
    if (e) e.stopPropagation();
    setChats((prev) => {
      const filtered = prev.filter((chat) => chat.id !== id);
      setActiveChatId((currentId) => {
        if (currentId === id) {
          return filtered.length > 0 ? filtered[0].id : null;
        }
        return currentId;
      });
      return filtered;
    });
  }, []);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    let currentId = activeChatId;

    // Capture existing history BEFORE adding the new user message,
    // then build the full context array synchronously to avoid stale-closure issues.
    let existingMessages = [];
    setChats((prev) => {
      const match = prev.find((chat) => chat.id === currentId);
      if (match) {
        existingMessages = match.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
      }
      return prev; // no state change here, just reading
    });

    if (!currentId) {
      currentId = createNewChat();
      existingMessages = []; // fresh chat, no prior messages
    }

    const userMessage = {
      role: "user",
      content,
      timestamp: Date.now(),
    };

    // Build API context: existing messages + new user message
    const messagesForApi = [
      ...existingMessages,
      { role: "user", content },
    ];

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === currentId) {
          const title =
            chat.messages.length === 0
              ? content.length > 35
                ? content.slice(0, 35) + "..."
                : content
              : chat.title;

          return {
            ...chat,
            title,
            messages: [...chat.messages, userMessage],
            timestamp: Date.now(),
          };
        }
        return chat;
      })
    );

    setError(null);
    setIsStreaming(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const assistantPlaceholderId = crypto.randomUUID();
    const assistantMessage = {
      id: assistantPlaceholderId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === currentId) {
          return {
            ...chat,
            messages: [...chat.messages, assistantMessage],
          };
        }
        return chat;
      })
    );

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesForApi }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(
          errData?.error || `API failed (${response.status}): Unknown error`
        );
      }

      if (!response.body) {
        throw new Error("Response body is not readable.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;

          if (cleanLine.startsWith("data: ")) {
            const dataStr = cleanLine.slice(6);
            if (dataStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(dataStr);
              const chunk = parsed.choices?.[0]?.delta?.content || "";
              if (chunk) {
                fullContent += chunk;
                setChats((prev) =>
                  prev.map((chat) => {
                    if (chat.id === currentId) {
                      return {
                        ...chat,
                        messages: chat.messages.map((m) =>
                          m.id === assistantPlaceholderId
                            ? { ...m, content: fullContent }
                            : m
                        ),
                      };
                    }
                    return chat;
                  })
                );
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Stream generation aborted by user.");
      } else {
        console.error("Groq API streaming error:", err);
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [activeChatId, createNewChat]);

  const activeChat = chats.find((chat) => chat.id === activeChatId) || null;

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        activeChatId,
        isStreaming,
        error,
        isHydrated,
        createNewChat,
        selectChat,
        deleteChat,
        sendMessage,
        stopGeneration,
        setError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
