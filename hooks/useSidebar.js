"use client";

import { useState, useEffect, useCallback } from "react";

const DESKTOP_BREAKPOINT = 1280; // xl

export function useSidebar() {
  // Start closed — useEffect will open it on desktop after hydration
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Open on desktop by default
    if (window.innerWidth >= DESKTOP_BREAKPOINT) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
    }

    // Auto-close when resizing below desktop breakpoint
    const handleResize = () => {
      if (window.innerWidth < DESKTOP_BREAKPOINT) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);

  return { isOpen, toggle, close, open };
}
