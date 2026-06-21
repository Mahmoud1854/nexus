"use client";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function TypewriterText({ text, speed = 25, markdownComponents }) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const displayedRef = useRef(0);
  const prevTextRef = useRef(text);

  useEffect(() => {
    const prev = prevTextRef.current;
    prevTextRef.current = text;

    const isNewContent = !text.startsWith(prev);
    if (isNewContent) {
      displayedRef.current = 0;
      setDisplayedLength(0);
    }
  }, [text]);

  useEffect(() => {
    if (displayedRef.current >= text.length) return;

    const timer = setInterval(() => {
      displayedRef.current += 1;
      if (displayedRef.current >= text.length) {
        displayedRef.current = text.length;
        setDisplayedLength(text.length);
        clearInterval(timer);
        return;
      }
      setDisplayedLength(displayedRef.current);
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  if (!text) return null;

  return (
    <span>
      {markdownComponents ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {text.slice(0, displayedLength)}
        </ReactMarkdown>
      ) : (
        text.slice(0, displayedLength)
      )}
      {displayedLength < text.length && (
        <span className="inline-block w-[2px] h-[1em] bg-current align-text-bottom ml-0.5 animate-pulse" />
      )}
    </span>
  );
}
