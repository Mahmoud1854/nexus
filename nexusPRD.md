# Product Requirements Document: Nexus

**Author:** Mahmoud
**Document status:** v1.0 — Ready for development
**Last updated:** June 2026

---

## 1. Overview

### 1.1 What is Nexus?
Nexus is a frontend-only AI chat application inspired by ChatGPT and Claude. It lets users have streaming, markdown-rendered conversations with an LLM (gpt-oss-20b via the Groq API), with persistent chat history stored entirely in the browser.

### 1.2 Purpose
This is a **learning and portfolio project**, built to demonstrate the ability to design and ship a complete, production-feeling AI product end-to-end — UI/UX, state management, streaming API integration, and responsive design — without relying on a backend or auth system.

### 1.3 Goals
- Build a polished, ChatGPT/Claude-quality chat experience
- Demonstrate real-world frontend skills: streaming data handling, complex state (chat history, multiple sessions), clean component architecture
- Produce something genuinely demo-able in interviews and a portfolio/CV

### 1.4 Non-Goals
- Not built for real-world traffic, multiple real users, or cost-at-scale concerns
- Not a commercial product
- No user accounts — every visitor is treated as the same anonymous "Night Owl" persona

---

## 2. Target User

Recruiters, hiring managers, and other developers reviewing Mahmoud's portfolio/CV. The product needs to **look and feel real** in a live demo or screen-share, even though it has no backend behind it.

---

## 3. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js |
| Styling | Tailwind CSS (no inline styles) |
| AI Provider | Groq API |
| Model | `gpt-oss-20b` |
| Data persistence | Browser `localStorage` (no database) |
| Auth | None |
| Backend | None — all API calls made directly from the client |
| Deployment | Render |

### 3.1 Known Tradeoff — API Key Exposure
The Groq API key is hardcoded into the frontend (no backend proxy to hide it). This means it is technically visible to anyone inspecting network requests or source code. This is an accepted, deliberate tradeoff for a no-backend portfolio project, mitigated by:
- Using a disposable/secondary Groq API key, not a primary one
- Setting a usage/spending cap on the Groq account
- Documenting this tradeoff openly in the project README as a known limitation and explaining how it would be solved in production (e.g., a backend proxy route to keep the key server-side)

---

## 4. Core Features (v1 Scope)

### 4.1 Chat Interface
- Central chat window with a greeting state: **"Hello, Night Owl"** shown when no conversation is active (hardcoded persona, since there is no real auth/user identity)
- Input box at the bottom: **"Ask anything..."** placeholder, matching the wireframe
- Submitting a message sends it to the Groq API (`gpt-oss-20b`) and begins a new or continues the current chat

### 4.2 Streaming Responses
- AI responses stream in token-by-token, matching ChatGPT/Claude behavior
- A **"Stop generating"** control is shown while a response is streaming, allowing the user to cancel/abort the in-progress response
- Partial responses (if stopped) remain in the chat history as-is

### 4.3 Chat History (Sidebar)
- Sidebar lists all past chats under "Recent messages," newest first
- Chats are persisted in `localStorage` and survive page refresh/browser close
- **"New Chat"** button starts a fresh, empty conversation
- Each chat is **auto-titled from the user's first message** in that conversation (truncated to ~30–40 characters with ellipsis if longer) — no extra API call required
- **Delete** action available per chat (icon/button on hover or similar), removing it from the sidebar and from `localStorage`
- **No rename** functionality in v1
- Clicking a chat in the sidebar loads its full message history into the main panel

### 4.4 Sidebar Collapse
- Sidebar can be **opened/closed** via a toggle button
- Collapsed state should persist sensible behavior on resize (especially relevant for mobile — see §5)

### 4.5 Markdown & Code Rendering
- AI responses are rendered as **formatted markdown**: headers, bold/italic, lists, links, blockquotes, etc.
- **Code blocks** are rendered with **syntax highlighting**
- Each code block includes a **"Copy code"** button
- Plain AI responses (no markdown) render as normal text

### 4.6 Message Actions
- **Copy** button on each AI response, copying the raw/rendered text to clipboard
- No regenerate, no edit-message functionality in v1 (explicit non-goal, see §6)

### 4.7 Theming
- **Dark mode** and **light mode** supported, with a toggle control
- Theme preference should persist across sessions (stored in `localStorage`, recommended though not strictly specified by stakeholder — flag during build if scope needs trimming)

### 4.8 Error Handling
- Simple, inline error handling: if an API call fails (rate limit, network issue, server error, etc.), show a generic inline message in the chat (e.g., *"Something went wrong. Please try again."*)
- No granular error-type differentiation in v1

### 4.9 Responsive Design
- Fully responsive across **desktop, tablet, and mobile**
- Sidebar behavior should adapt on small screens (e.g., collapses by default or becomes an overlay/drawer on mobile — implementation detail for design phase)

---

## 5. Explicitly Out of Scope (v1)

| Feature | Status |
|---|---|
| User authentication / accounts | ❌ Out of scope |
| Backend server / API proxy | ❌ Out of scope |
| Database (chats stored in `localStorage` only) | ❌ Out of scope |
| Rename chat | ❌ Out of scope |
| Regenerate AI response | ❌ Out of scope |
| Edit user message | ❌ Out of scope |
| Model settings panel (temperature, system prompt, max tokens, etc.) | ❌ Out of scope |
| AI-generated chat titles (extra API call) | ❌ Out of scope — using first-message truncation instead |
| Detailed/granular error states | ❌ Out of scope |

These are reasonable candidates for a "v2 / future improvements" section in the README, showing awareness of what a fuller product would need.

---

## 6. Non-Functional Requirements

- **Code quality:** Clean, well-organized, componentized code. No inline styles — Tailwind utility classes only.
- **Performance:** Streaming should feel responsive; avoid UI jank while tokens are arriving.
- **Persistence reliability:** Chat history and theme preference should not be lost on refresh under normal conditions.
- **Browser support:** Modern evergreen browsers (Chrome, Firefox, Safari, Edge) — no legacy browser support required.

---

## 7. User Flow Summary

1. User lands on Nexus → sees "Hello, Night Owl" greeting and empty input
2. User types a message and submits
3. A new chat is created in the sidebar, auto-titled from that first message
4. AI response streams in below the user's message, rendered as markdown
5. User can copy the AI response, stop generation mid-stream, switch theme, collapse the sidebar, start a new chat, revisit a past chat, or delete a chat
6. All state persists via `localStorage` across sessions

---

## 8. Open Items / Decisions for Build Phase

- Exact mobile sidebar pattern (overlay/drawer vs. push layout) — to be decided during UI implementation
- Whether theme preference persistence is in scope for v1 or a quick v1.1 add
- Confirm Render deployment approach for Next.js (static export vs. Node web service) based on whether any SSR/Next-specific features end up being used