# Nexus — AI Chat App

A modern AI chat interface powered by Groq, built with Next.js and Tailwind CSS.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Groq API key:

```
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
```

Get a key at [console.groq.com](https://console.groq.com).

### Known Limitation: API Key Exposure

Because this app calls the Groq API directly from the browser (no backend proxy), the API key is exposed to anyone who opens the browser's developer tools. This is acceptable for:

- Personal/portfolio use
- Low-risk demos with a restricted API key

In a production application, you would route requests through a backend proxy (e.g., a Next.js API route or a dedicated server) to keep the key server-side. See the PRD (§3.1) for details.

## Deployment

The app is configured for **static export** and can be deployed to any static host (Render, Vercel, Netlify, etc.). To build:

```bash
npm run build
```

The output is in the `out/` directory.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 (utility classes only — no inline styles)
- **Font:** Geist (Vercel's font family)
- **AI:** Groq API (streaming via SSE)
