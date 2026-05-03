# 🚀 autojobs — AI-Powered ATS Resume & Job Tracker

> **Beat the ATS. Land interviews. Track everything.**

autojobs is a full-stack AI platform that analyses your resume against any job description, generates an ATS-optimised version, writes a tailored cover letter, and lets you track every application in a Kanban board — all in one dark, sleek UI.

---

## ✨ Features

| Feature | Description |
|---|---|
| **ATS Gap Analysis** | Gemini 2.5 Flash scans your resume vs JD — keyword gaps, match score, skill alignment |
| **AI Resume Rewrite** | On-demand resume rewriting optimised for the specific JD |
| **AI Cover Letter** | Tailored cover letter generated per company + role |
| **PDF/DOCX Upload** | Upload your resume as PDF, DOCX, DOC, or TXT — parsed with pdfjs-dist |
| **Job Tracker Kanban** | Drag-and-drop board: Watchlist → Applied → Interviewing → Offer → Rejected |
| **Profile Vault** | One-time profile setup (education, experience, skills, projects, achievements) |
| **Activity Heatmap** | GitHub-style 12-week scan activity calendar |
| **Google OAuth** | Sign in with Google, JWT sessions, middleware-protected routes |

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom CSS design tokens
- **Database**: PostgreSQL via [Neon](https://neon.tech) · ORM: Prisma
- **Auth**: NextAuth.js v4 (Google OAuth + JWT)
- **AI**: Google Gemini 2.5 Flash (`@google/generative-ai`)
- **PDF Parsing**: pdfjs-dist (Mozilla's PDF.js)
- **DOCX Parsing**: mammoth

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/debjit1702/autojobs.git
cd autojobs
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env.local
```
Fill in all values in `.env.local` (see [Environment Variables](#-environment-variables) below).

### 4. Set up the database
```bash
npx prisma db push
npx prisma generate
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔑 Environment Variables

| Variable | Description | Where to get it |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | [Neon](https://neon.tech), Supabase, or local Postgres |
| `NEXTAUTH_SECRET` | Random secret for JWT signing | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your app URL | `http://localhost:3000` locally |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Google Cloud Console |
| `GEMINI_API_KEY` | Gemini API key | [Google AI Studio](https://aistudio.google.com/apikey) |

> ⚠️ **Never commit `.env.local`** — it contains real secrets.

---

## 📁 Project Structure

```
autojobs/
├── app/
│   ├── (app)/             # Protected app routes (dashboard, scan, profile, tracker)
│   ├── (auth)/            # Landing page + setup wizard
│   └── api/               # API routes (scans, profile, trackers, dashboard)
├── components/            # Shared UI components (Sidebar, Modal, Heatmap, etc.)
├── lib/                   # Utilities (Gemini client, ATS pipeline, auth options)
├── prisma/                # Schema + migrations
└── public/                # Static assets
```

---

## 📸 Screenshots

> Sign in with Google → 6-step setup → Dashboard with heatmap → Create scan → ATS match report → AI resume + cover letter → Job tracker Kanban

---

## 📄 License

MIT © [Debjit Biswas](https://github.com/debjit1702)
