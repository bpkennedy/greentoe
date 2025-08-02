Green Thumb 🪴
Interactive investing lessons for teens

1 · Problem & Goals
ID	Statement
P‑01	Adolescents struggle to grasp investing concepts from text‑only resources.
G‑01	Provide a fun, interactive web app where a teen (Benjamin) can explore real‑world stock/ETF performance over time.
G‑02	Keep friction near zero—no log‑in (for teens), no paid data feeds, no analytics tracking.
G‑03	Optional objectives and “completion” badges encourage, but never force, progress.

2 · Target Users
Persona	Traits
Primary: Teen Investor (13‑16 y)	✓ Tech‑savvy, desktop‑first (mobile secondary)
✓ Learns best by doing
✓ Limited cash → fractional‑investing simulations
Secondary: Parent / Guardian	✓ Wants oversight and conversation starters
✓ Uses a simple, password‑protected dashboard

3 · User Stories
#	As a …	I want …	So that …
US‑01	Teen	to add stocks or index funds (e.g., VTI) to a personal watch‑list	I can observe their performance over time.
US‑02	Teen	to click a watch‑list item and see price history, % change, and key facts	I understand how it has been performing.
US‑03	Teen	to browse short, high‑level lessons that explain what the data means	I can connect chart movements to fundamental investing ideas.
US‑04	Parent	to open a dashboard summarizing Benjamin’s activity	I can guide discussions and verify engagement.

4 · Functional Requirements (UPDATE)
ID	Must‑Have	Details
F‑01	Watch‑List CRUD	Add / remove tickers stored in React Context.
F‑02	Price Chart	Client‑side fetch to Alpha Vantage (free tier) via `SWR`; cache response 24 h.
F‑03	Lesson Library	MDX files in `/content/lessons`; static routes `/lessons/[slug]`.
F‑04	Progress Flags	Mark lesson complete when 80 % scrolled; store in React Context.
F‑05	Parent Dashboard	`/parent` route; basic auth (`admin` / `admin`) verified client‑side against an env‑var‑stored hash.
F‑06	No Database	All persistent data lives in the downloadable/loadable files.
F‑07	Encrypted Save / Load	NEW
1. Save: user clicks “Download Data” → app POSTs current state JSON to `/api/encrypt`, which:
  • Encrypts with AES‑256‑GCM using secret `ENCRYPTION_KEY` from server env (never exposed to client).
  • Returns a `application/octet‑stream` blob that triggers a file download (default name `green-thumb-state.gt`).
1. Load: user selects a .gt file → client uploads it to `/api/decrypt`; serverless function returns plain JSON; state is merged into memory.
2. Multiple teens can share a file; only an app instance with the same env key can decrypt it.

Nice‑to‑Have (backlog):
• Badge system (uses Lucide icons as badge art) • CSV export • Shareable watch‑list link

5 · Non‑Functional Requirements (UPDATE)
Topic	Requirement
Security	• AES‑256‑GCM via `crypto` module; key length = 32 bytes.
• `ENCRYPTION_KEY` stored in Vercel Encrypted Environment Variable.
• Serverless routes have `maxDuration: 3 s` and return `400` on malformed payloads.
Privacy	No analytics; data resides only in-memory and written to user‑held files on Save, or loaded on Load.
Performance	≤ 100 KB JS per route (gzipped).
Accessibility	WCAG 2.2 AA; keyboard‑navigable charts.
i18n	Not required (English only).
Devices	Breakpoints: 375 px, 768 px, 1280 px.

6 · Visual & Branding
Element	Spec
Color Theme	Tailwind tokens – `primary-500 #22c55e`, `secondary-500 #3b82f6`, `neutral-900 #0f172a`.
Typography	Tailwind default sans (Inter); `font‑mono` for figures.
Logo	Vector “Green Thumb” in `/public/logo.svg`.
Icon Set	Lucide Icons (`lucide-react`) for UI and badges—use each icon’s original name as badge title.
Tone	Teen‑friendly, minimal slang, short sentences.

7 · Content Architecture
7.1 Lesson List
#	Slug	Title	Lucide Icon
01	`understanding-stocks-index-funds`	Understanding Stocks & Index Funds	`banknote`
02	`reading-performance-charts`	Reading Performance Charts & Tickers	`line-chart`
03	`comparing-investments`	How to Compare Stocks & Funds	`bar-chart-2`
04	`research-before-you-buy`	Planning: Researching Companies	`search`
05	`keeping-emotions-in-check`	Staying Unemotional When Prices Swing	`brain`
06	`understanding-risk`	Risk: High Reward, High Risk vs. Stability	`alert-triangle`

Each MDX file exports:

```ts
Copy
export const meta = {
  title: '...',
  summary: '...',
  learningObjectives: ['...', '...'],
  icon: 'lucide-ICON-NAME'
}
```

7.2 Repo Structure
```txt
Copy
/content
  /lessons
    01-understanding-stocks-index-funds.mdx
    02-reading-performance-charts.mdx
    ...
/data
  index-funds.json        // static fund metadata
/public
  logo.svg
```

8 · Technical Stack (UPDATE)
Concern	Decision
Framework	Next.js 14 (App Router, TypeScript)
Styling	Tailwind CSS + shadcn/ui
State	React Context
Data Fetch	Alpha Vantage (free) via `SWR`
Hosting	Vercel (Preview & Production)
CI/CD	Vercel + GitHub Actions (`lint`, `type‑check`, `build`)
Testing	Vitest + React Testing Library
Icons	`lucide-react` package
Edge / API	Next.js 14 Route Handlers under `/app/api/encrypt/route.ts` and `/app/api/decrypt/route.ts` (Node runtime).
Crypto	Native `crypto.subtle` (Web Crypto) if Edge Runtime, or crypto in Node; wrapped in `lib/crypto.ts`.
File Handling	Client uses `FileSaver.js` (lightweight) for downloads and `<input type="file">` for uploads.

9 · Success Metrics (ADD)
KPI	Target
Successful decrypt rate	≥ 95 % of upload attempts
Avg. session length	≥ 5 min
Lessons completed (first month)	≥ 3
Self‑reported fun	Positive feedback from Benjamin

10 · Risks & Mitigations (UPDATE)
Risk	Likelihood	Impact	Mitigation
Encryption key leaked in bundle	Low	Data files become readable	Never expose key client‑side; lint rule forbids `process.env.ENCRYPTION_KEY` outside API routes.
Upload of corrupted file	Medium	App error	Validate cipher text length, auth tag; show friendly “invalid file” message.
Large files DOS the API route	Low	API slowdown	Enforce 200 KB max payload; reject larger files.
Alpha Vantage rate‑limit	Medium	Charts fail	Local cache 24 h; graceful error UI
UI feels repetitive	High	Drop‑off	Add badge system & streaks (Lucide icons)
Basic‑auth creds exposed in client bundle	Low	Parent view bypassed	Store hash in env var + client‑side comparison

11 · Out of Scope
Real‑money transactions

Role‑based back‑end auth

Multi‑language support

Analytics dashboards

12 · Milestones & Timeline
ID	Deliverable	Duration
M0	PRD approved	–
M1	Scaffold, CI, theme	3 d
M2	Lesson MDX pages	5 d
M3	Watch‑list & charts	5 d
M3a	Encrypt / Decrypt API & client UX	+2 d
M3b	Watch‑list & charts	5 d
M4	Parent dashboard + basic auth	3 d
M5	Beta with Benjamin	1 w
M6	v1.0 launch	–
