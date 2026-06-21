# Nexus — Project Milestones & Task Tracker

**Project:** Nexus AI Chat App  
**Author:** Mahmoud  
**PRD Version:** v1.0  
**Last updated:** June 2026

---

## Milestone 0 — Project Setup & Scaffolding

> Goal: Get a clean, runnable Next.js + Tailwind project on disk with the basic folder structure agreed upon.


- [ ] Configure Tailwind CSS (no inline styles — utility classes only)
- [ ] Set up folder/component structure (`/components`, `/hooks`, `/lib`, `/store` or similar)
- [ ] Add `.env.local` with `NEXT_PUBLIC_GROQ_API_KEY` placeholder and document the known API-key tradeoff in README
- [ ] Confirm deployment target on Render (static export vs. Node web service — PRD open item §8)
- [ ] Push initial scaffold to Git and verify CI/CD pipeline (if any)

---

## Milestone 1 — Core UI Shell (Layout & Theming)

> Goal: The skeleton of the app is visible and navigable. No real data yet — just layout, sidebar, and theme toggle.

- [ ] Build the two-panel layout: collapsible **sidebar** (left) + **main chat area** (right)
- [ ] Sidebar: "New Chat" button, "Recent messages" list area (empty/placeholder), sidebar toggle button
- [ ] Main panel: centered greeting state — **"Hello, Night Owl"** — shown when no chat is active
- [ ] Input bar at the bottom: **"Ask anything…"** placeholder, send button
- [ ] Implement **dark mode / light mode** toggle with smooth transition
- [ ] Persist theme preference in `localStorage`
- [ ] Make layout **fully responsive** — decide and implement mobile sidebar pattern (overlay/drawer vs. push — PRD open item §8)
- [ ] Sidebar collapsed state persists sensible behavior on window resize

---

## Milestone 2 — State Management & Chat History (localStorage)

> Goal: Chat sessions are created, stored, loaded, and deleted — all without any network calls. The UI feels fully interactive.

- [x] Design the in-memory chat data model: `{ id, title, messages: [{role, content, timestamp}] }`
- [x] Wire up global state (React Context / Zustand / Redux — choose and document decision)
- [x] **New Chat** — creates a fresh session and switches the main panel to it
- [x] **Auto-title** — on first user message, truncate to ~30–40 characters with ellipsis; no API call
- [x] **Sidebar list** — renders all sessions newest-first; clicking one loads its history into the main panel
- [x] **Delete chat** — per-item delete button (visible on hover); removes from state and `localStorage`
- [x] Persist all sessions to `localStorage`; hydrate on app load (survive refresh/browser close)
- [x] Edge cases: empty sidebar state, single chat, many chats

---

## Milestone 3 — Groq API Integration & Streaming

> Goal: Real messages go out to the Groq API and token-by-token responses stream back into the UI.

- [x] Set up Groq SDK / raw `fetch` with streaming (`text/event-stream` or SSE) — pick approach
- [x] Send full conversation history as context on each request (`gpt-oss-20b` model)
- [x] Stream tokens into the current assistant message in real time (no UI jank)
- [x] Show **"Stop generating"** button while a stream is active; implement `AbortController` to cancel mid-stream
- [x] Persist partial (stopped) response in history as-is
- [x] Append completed assistant message to `localStorage` after stream finishes

---

## Milestone 4 — Markdown & Code Rendering

> Goal: AI responses look polished — not raw text — and developers are wowed by code block handling.

- [x] Install and configure a markdown renderer (e.g., `react-markdown` + `remark-gfm`)
- [x] Render: headers, bold/italic, lists, blockquotes, links, inline code
- [x] Install and configure syntax highlighter (`react-syntax-highlighter` + Prism oneDark theme)
- [x] Code blocks styled with a clear background and language label
- [x] **"Copy code"** button per code block (copies raw code to clipboard)
- [x] Plain-text AI responses (no markdown) render as normal text without artefacts
- [x] Ensure markdown rendering doesn't break streaming (tokens arrive incrementally)

---

## Milestone 5 — Message Actions & UX Polish

> Goal: Every interaction a user might want feels complete and satisfying.

- [x] **Copy** button on each AI response (copies full rendered/raw text to clipboard)
- [x] Inline **error handling**: if API call fails (rate limit, network error, etc.) show *"Something went wrong. Please try again."* in the chat — no crash, no blank screen
- [x] Auto-scroll to the latest message as tokens stream in
- [x] Prevent double-submission while a stream is active (disable input / send button)
- [x] Input textarea grows/shrinks with content (no fixed single-line input)
- [x] Loading/thinking indicator shown before first token arrives
- [x] Keyboard shortcut: `Enter` to send, `Shift+Enter` for newline

---

## Milestone 6 — Responsive QA & Cross-Browser Testing

> Goal: The app looks and works perfectly on every device and every major browser.

- [x] Desktop (1280px+): full two-panel layout, sidebar open by default
- [x] Tablet (768–1279px): sidebar collapsible, layout adapts gracefully
- [x] Mobile (<768px): sidebar is overlay/drawer, collapses by default
- [ ] Test on Chrome, Firefox, Safari, Edge (evergreen only — no legacy support needed)
- [ ] Verify `localStorage` persistence across all four browsers
- [x] Audit for accessible color contrast in both dark and light modes
- [x] Check keyboard navigability (tab order, focus rings)

---

## Milestone 7 — Performance & Code Quality Audit

> Goal: The codebase is clean enough to show in an interview; the app is snappy enough to demo live.

- [ ] No inline styles anywhere — Tailwind utility classes only
- [ ] Components are focused, reusable, and named clearly
- [ ] No console errors or warnings in production build
- [ ] Streaming feels responsive — profile and fix any render bottlenecks
- [ ] `localStorage` reads/writes are safe (try/catch for storage-full / private browsing edge cases)
- [ ] Unused dependencies removed; bundle size is reasonable

---

## Milestone 8 — Deployment & Documentation

> Goal: The app is live on Render and documented well enough for a portfolio/CV.

- [ ] Confirm Render deployment strategy (static export vs. Node web service) and configure accordingly
- [ ] Set `your_groq_api_key_here` as an environment variable in Render dashboard
- [ ] Verify production build works end-to-end on Render URL
- [ ] Write `README.md`:
  - What the project is and what it demonstrates
  - How to run it locally
  - Known limitations (API key exposure tradeoff — §3.1 of PRD) + how it would be solved in production
  - v2 / future improvements section (rename chat, regenerate response, edit message, model settings, backend proxy, auth)
- [ ] Final demo walkthrough: full user flow works on the live Render URL

---

## Backlog / v2 Candidates

> Explicitly out of scope for v1 (per PRD §5), but worth noting for the README "future improvements" section.

| Feature | Notes |
|---|---|
| Rename chat | Simple UX win |
| Regenerate AI response | Common user expectation |
| Edit user message | Common user expectation |
| Model settings panel | Temperature, system prompt, max tokens |
| AI-generated chat titles | Extra API call per new chat |
| Backend proxy route | Hides API key server-side; the "real" production solution |
| User authentication | Enables real multi-user use |
| Granular error states | Better UX for rate-limit vs. network vs. server errors |
| Database persistence | Replace `localStorage` for durability and cross-device access |

---

*This file is a living document. Update task status as work progresses. Use `[ ]` → `[/]` (in progress) → `[x]` (done).*
