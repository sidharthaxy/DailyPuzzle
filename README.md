# 🧩 DailyPuzzle

A full-stack, **offline-first daily puzzle game** where players solve two uniquely generated puzzles every day — a Path/Maze puzzle and a Sudoku — that are deterministically generated from the current date. Progress is saved locally via IndexedDB and synced to a PostgreSQL backend when a connection is available.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Architecture Overview](#architecture-overview)
5. [Client — In-Depth](#client--in-depth)
   - [Pages](#pages)
   - [Components](#components)
   - [State Management (Zustand Stores)](#state-management-zustand-stores)
   - [Puzzle Engine](#puzzle-engine)
   - [Offline-First Layer (IndexedDB)](#offline-first-layer-indexeddb)
   - [Sync Service](#sync-service)
6. [Server — In-Depth](#server--in-depth)
   - [API Routes](#api-routes)
   - [Controllers](#controllers)
   - [Services](#services)
   - [Database Schema](#database-schema)
7. [Scoring System](#scoring-system)
8. [Setup & Running](#setup--running)
9. [Environment Variables](#environment-variables)

---

## Features

- **Two Daily Puzzles** — A 9×9 Path/Maze puzzle and a 9×9 Sudoku, refreshing every calendar day.
- **Deterministic Generation** — Puzzles are seeded from the date, so every player gets the same puzzle on the same day. Past puzzles can be replayed at any time.
- **Offline-First & PWA Support** — The frontend acts as a Progressive Web App, caching static assets and shells. All puzzle progress is saved to browser IndexedDB so you can open the app and play on an airplane. Completed results queue locally and sync to the server when the device comes back online.
- **Smart Offline UI** — The app listens for connection drops to display a custom dismissible offline banner and intercept login attempts. If offline, the login screen converts to a "You are Offline" prompt guiding players toward Guest Mode.
- **Hint System** — Players may use up to 2 hints per puzzle, each costing 10 points.
- **Streak Tracking** — A daily streak counter rewards consecutive days of solving; streaks are persisted in localStorage per user.
- **Activity Heatmap** — A GitHub-style contribution heatmap on the profile page visualises daily solve history across the full year.
- **Authentication & Guest Mode** — JWT-based cookie authentication with register, login, logout, and an offline-capable Guest Mode (seamlessly allowing offline play without needing to authenticate with an unreachable server).
- **Anti-Cheat Validation** — The server rejects scores with future dates, impossibly fast completion times (< 5 s), or scores outside a valid range.
- **Global Modal System** — A centralised modal handles success, error, confirmation, and celebration dialogs across the app.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 + TypeScript (Vite) |
| **Routing** | React Router DOM v6 |
| **State Management** | Zustand |
| **Styling** | Tailwind CSS |
| **Local Storage** | IndexedDB (native browser API) |
| **Date Utilities** | date-fns |
| **Seeded RNG** | Mulberry32 (custom implementation) |
| **Sudoku Engine** | sudoku.js (bundled) |
| **Backend Framework** | Node.js + Express (TypeScript) |
| **ORM** | Prisma |
| **Database** | PostgreSQL |
| **Authentication** | JSON Web Tokens (JWT) + HTTP-only cookies |
| **Password Hashing** | bcryptjs |

---

## Project Structure

```
DailyPuzzle/
├── package.json              # Root scripts: install, dev, server, db:push
│
├── client/                   # React frontend (Vite + TypeScript)
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx          # React root — mounts <App />
│       ├── App.tsx           # Router + auth guard + app shell
│       ├── styles/
│       │   └── index.css     # Global styles & Tailwind directives
│       ├── pages/
│       │   ├── AuthPage.tsx      # Login / Register / Guest
│       │   ├── Dashboard.tsx     # 7-day puzzle calendar
│       │   ├── DailyOverview.tsx # Pick maze or sudoku for a date
│       │   ├── PuzzlePage.tsx    # Active puzzle gameplay UI
│       │   └── ProfilePage.tsx   # User stats & activity heatmap
│       ├── components/
│       │   ├── Header.tsx        # Top navigation bar + user dropdown
│       │   ├── GlobalModal.tsx   # Centralised modal (success/error/confirm/celebrate)
│       │   └── ActivityHeatmap.tsx # GitHub-style activity grid
│       ├── store/
│       │   ├── authStore.ts      # Auth state (user, login, register, logout, checkAuth)
│       │   ├── puzzleStore.ts    # Active puzzle state (moves, timer, hints, score)
│       │   ├── streakStore.ts    # Daily streak counter (localStorage)
│       │   ├── modalStore.ts     # Global modal open/close state
│       │   └── userStore.ts      # (Reserved for future user profile data)
│       ├── puzzles/
│       │   ├── generator.ts      # Entry point: generateDailyPuzzle(date, type)
│       │   ├── seed.ts           # SHA256 seed derivation from date + secret
│       │   ├── validator.ts      # Dispatch: validatePuzzle → engine validators
│       │   └── engines/
│       │       ├── pathPuzzle.ts     # 9×9 maze generator + BFS validator
│       │       ├── sudokuPuzzle.ts   # 9×9 Sudoku wrapper (sudoku.js)
│       │       └── sudoku.js         # Bundled third-party Sudoku solver/generator
│       ├── db/
│       │   └── indexeddb.ts      # IndexedDB wrapper (progress + unsynced results)
│       ├── services/
│       │   └── syncService.ts    # Syncs queued results to backend on reconnect
│       └── utils/
│           └── seededRandom.ts   # Mulberry32 PRNG factory
│
└── server/                   # Express backend (Node.js + TypeScript)
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── prisma/
    │   └── schema.prisma     # Database models: User, DailyPuzzleResult
    └── src/
        ├── index.ts          # Express app init: CORS, cookie-parser, routes
        ├── routes/
        │   ├── authRoutes.ts     # POST /auth/register|login|logout, GET /auth/me
        │   └── syncRoutes.ts     # POST /sync/daily-scores, GET /sync/daily-scores/:userId
        ├── controllers/
        │   ├── authController.ts # register, login, logout, me handlers
        │   └── syncController.ts # syncDailyScore, getDailyScores handlers
        ├── middleware/           # (placeholder for future auth middleware)
        └── services/
            └── syncService.ts    # Prisma upsert logic for puzzle results
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
│                                                          │
│  React App (Vite)                                        │
│  ┌──────────┐   ┌────────────┐   ┌──────────────────┐   │
│  │  Pages   │──▶│  Zustand   │──▶│  Puzzle Engines  │   │
│  │ (Router) │   │  Stores    │   │ (Path + Sudoku)  │   │
│  └──────────┘   └────────────┘   └──────────────────┘   │
│                      │                                   │
│                       ▼                                  │
│              ┌─────────────────┐                         │
│              │   IndexedDB     │  ← saves on every move  │
│              │ (puzzleStore +  │  ← queues results       │
│              │  unsyncedResults│     when offline         │
│              └────────┬────────┘                         │
│                       │ online event / app load          │
│                       ▼                                  │
│              ┌─────────────────┐                         │
│              │  Sync Service   │                         │
│              └────────┬────────┘                         │
└───────────────────────┼─────────────────────────────────┘
                        │ REST (fetch)
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   Express Server                         │
│                                                          │
│   /auth/*          /sync/*          /health              │
│  authController   syncController                         │
│       │                │                                 │
│  bcrypt + JWT     Validation +                           │
│   cookies         Prisma Upsert                          │
│                        │                                 │
│                   PostgreSQL (via Prisma)                 │
└─────────────────────────────────────────────────────────┘
```

---

## Client — In-Depth

### Pages

#### `AuthPage.tsx`
The authentication entry point. Contains a toggling Login / Register form backed by `useAuthStore`. On success, the user is redirected to `/`. A **Guest** button bypasses auth entirely and creates a temporary in-memory guest identity.
**If Offline:** The standard login form is hidden. A custom UI informs the user that they are offline and provides a single call-to-action to continue playing as a Guest. If the node backend is down but the Wi-Fi is on, any "Failed to fetch" errors trigger a global modal prompting the user to play as a Guest.

#### `Dashboard.tsx`
Displays a 7-day rolling calendar centered on today (3 days back, today, 3 days forward). Each card shows the date and its status: `PAST` (playable, unscored), `TODAY` (highlighted, scored), or `LOCKED` (future, not clickable). Clicking any unlocked date navigates to `/daily/:date`.

#### `DailyOverview.tsx`
Shows the two puzzles available for a given date — Maze and Sudoku. Fetches the user's existing scores from the API to display a completion indicator (✅ / Play). Navigates to `/puzzle?type=path&date=...` or `/puzzle?type=sudoku&date=...`.

#### `PuzzlePage.tsx`
The core gameplay screen. Reads `type` and `date` from URL search params, calls `initDailyPuzzle()` on mount, and renders the appropriate grid:
- **Path Grid** — Clickable cells; players trace a route from `S` to `E`. Adjacent-only moves enforced on the client. Clicking the current tail retracts the path (backtrack).
- **Sudoku Grid** — 9×9 input grid; pre-filled (given) cells are read-only. Accepts digits 1–9 only.

A 1-second timer ticks while the puzzle is active. Up to 2 hints are available (−10 pts each). Submission triggers `validatePuzzle()` client-side; on success, calls `handlePuzzleCompletion()` and opens a celebration or success modal.

#### `ProfilePage.tsx`
Displays the user's current streak and total accumulated score (fetched from the API). Embeds the `ActivityHeatmap` component for a full-year activity visualisation.

---

### Components

#### `Header.tsx`
Persistent top navigation bar. Shows the **DailyPuzzle** brand (links to `/`). When authenticated, shows a circular avatar button (first letter of email) which opens a dropdown containing: user identity, a Theme toggle (stub), and a Logout button. Dropdown auto-closes on outside click via a `mousedown` event listener.

#### `GlobalModal.tsx`
A portal-style, fixed-position modal rendered at the root level. Driven entirely by `useModalStore`. Supports four render modes:
| Type | Behaviour |
|---|---|
| `success` | Green ✓ icon, title, message, "Continue" button |
| `error` | Red ✕ icon, title, message, "Try Again" button |
| `confirm` | Left-aligned title + message with Cancel / Confirm actions |
| `celebration` | Animated spinning 🪙 coin, streak count, score badge, "Superb!" button |

#### `ActivityHeatmap.tsx`
A GitHub Contributions-style grid. Each cell represents one calendar day; colour intensity maps to score thresholds (0 → grey, 1–1000 → light blue, 1001–5000 → medium blue, 5001–10000 → dark blue, 10000+ → deepest blue). Supports year selection back to the user's account creation date. Clicking any active cell navigates to `/daily/:date`.

---

### State Management (Zustand Stores)

#### `authStore.ts`
Manages authentication state. On app mount, `checkAuth()` calls `GET /auth/me` to restore a session from the HTTP-only JWT cookie, preventing logout on refresh. Exposes `login`, `register`, `loginAsGuest`, `logout`, and the `isCheckingAuth` flag (used to show a loading spinner before rendering routes).

#### `puzzleStore.ts`
The most complex store. Manages the full lifecycle of an active puzzle:
- **`initDailyPuzzle(date, type)`** — Generates the puzzle deterministically, then checks IndexedDB for a saved state. If found, restores progress; if already completed, marks `isComplete` immediately.
- **`makeMove(newState)`** — Updates `userState`, starts the timer on first move, and immediately writes to IndexedDB for crash-safe persistence.
- **`useHint()`** — Reveals the next correct step in the path or fills the first incorrect/empty Sudoku cell with the solution value. Saves to IndexedDB.
- **`handlePuzzleCompletion()`** — Calculates score (`100 + max(0, 60 - elapsed_seconds) - hints * 10`), updates streak (today's puzzle only), queues the result in IndexedDB via `saveUnsyncedResult`, and triggers `syncOfflineResults`.
- **`tickTimer()`** — Incremented by a `setInterval` in `PuzzlePage` every 1 second while `isRunning && !isComplete`.

#### `streakStore.ts`
Maintains the current consecutive-day streak in memory and in `localStorage` (keyed by `puzzleStreak_${userId}`). `updateStreak(date)` is idempotent for the same date. Streak increments if the previous solved date is exactly 1 day before the current; otherwise it resets to 1.

#### `modalStore.ts`
Minimal store exposing `openModal(options)` and `closeModal()`. Supports all modal types used by `GlobalModal`.

---

### Puzzle Engine

#### `generator.ts` — Entry Point
`generateDailyPuzzle(dateStr, type)` computes a numeric seed from the date string (`parseInt("YYYYMMDD") * 100 + typeOffset`) and delegates to the appropriate engine. Returns `{ type, puzzleData, solution, difficulty }`.

#### `seed.ts` — SHA256 Seed Derivation
`getSeedForDate(date)` computes `SHA256(date + PUZZLE_SECRET)` via `crypto-js` and parses the first 13 hex characters into a safe integer. `getTodaySeed()` is a convenience wrapper for the current date. *(The current generator does not use this function — it uses the simpler numeric seed approach — but it is available for future hardened seeding.)*

#### `engines/seededRandom.ts` — Mulberry32 PRNG
`createSeededRandom(seed)` returns a factory with three methods: `random()` (float [0,1)), `randomInt(min, max)` (inclusive), and `randomChoice(array)`. Uses the Mulberry32 algorithm for high-quality, reproducible pseudo-randomness.

#### `engines/pathPuzzle.ts` — Maze Engine
Generates a 9×9 grid with a fixed top-left Start (`S`) and bottom-right End (`E`). Places 25–35 random wall tiles (`#`), then runs BFS to verify at least one valid path exists; regenerates if no path is found (retry loop with same seed state). Validation (`validatePath`) checks that the user's path: starts on `S`, ends on `E`, contains no walls, contains no revisits, and has only orthogonally adjacent steps. Any valid path to the end is accepted.

#### `engines/sudokuPuzzle.ts` — Sudoku Engine
Wraps the bundled `sudoku.js` library to generate a puzzle with ~40 given cells (medium/hard difficulty) and compute its full solution. `validateSudoku` reconstructs a board string from `userGrid` and uses `sudoku.get_candidates()` — if no empty cells remain and all candidates are valid, the grid is correct.

#### `validator.ts` — Dispatch Layer
`validatePuzzle(type, userState, solution, puzzleData)` routes to `validatePath` or `validateSudoku` based on puzzle type.

---

### Offline-First Layer (IndexedDB)

`db/indexeddb.ts` manages two object stores in **`DailyPuzzleDB`** (version 2):

| Store | Key | Purpose |
|---|---|---|
| `puzzleStore` | `date` (composite: `YYYY-MM-DD_type_userId`) | Saves live puzzle progress on every move |
| `unsyncedResultsStore` | `id` (same composite key) | Queues completed results for server sync |

**API:**
- `savePuzzleProgress(state)` — Upserts the current move + timer state.
- `loadPuzzleProgress(key)` — Restores a previous session on puzzle init.
- `saveUnsyncedResult(result)` — Queues a completed result for later sync.
- `getUnsyncedResults()` — Retrieves all pending sync entries.
- `markSynced(id)` — Deletes a successfully synced result from the queue.

All methods gracefully degrade (return `undefined`/`[]`) if IndexedDB is unavailable.

---

### Sync Service

`services/syncService.ts` is the bridge between IndexedDB and the backend:

1. Called at app startup (after user login) and on `window.addEventListener('online', ...)`.
2. Guards against offline state: `if (!navigator.onLine) return`.
3. Iterates all queued results from `getUnsyncedResults()`.
4. POSTs each to `POST /sync/daily-scores` with `{ userId, date, score, time, puzzleType }`.
5. On HTTP 200, calls `markSynced(id)` to remove from the queue.
6. Failures are logged but non-fatal — the result remains in the queue for the next sync attempt.

---

## Server — In-Depth

### API Routes

#### Auth — `/auth`
| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Create account; hashes password with bcrypt, returns JWT cookie |
| `POST` | `/auth/login` | Validate credentials; returns JWT cookie |
| `POST` | `/auth/logout` | Clears the JWT cookie |
| `GET` | `/auth/me` | Validates JWT cookie; returns user object or 401 |

#### Sync — `/sync`
| Method | Path | Description |
|---|---|---|
| `POST` | `/sync/daily-scores` | Upsert a puzzle result for a user/date/type combination |
| `GET` | `/sync/daily-scores/:userId` | Fetch all historical results for a user |

#### Health
| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Returns `{ status: "ok" }` — used for server health checks |

---

### Controllers

#### `authController.ts`
- **`register`** — Validates email/password presence, checks for duplicate emails, hashes the password with bcrypt (10 salt rounds), creates the user via Prisma, signs a 7-day JWT, sets an HTTP-only cookie, and returns the user object.
- **`login`** — Looks up user by email, compares password with bcrypt, signs JWT, sets cookie.
- **`logout`** — Clears the `token` cookie.
- **`me`** — Reads the JWT from `req.cookies.token`, verifies the signature, fetches the user from Postgres, and returns the user object.

#### `syncController.ts`
- **`syncDailyScore`** — Validates all required fields, then applies server-side anti-cheat rules:
  - Rejects future dates.
  - Rejects completion times < 5 seconds.
  - Rejects scores outside the range [0, 50,000].
  - Delegates to `saveDailyScore` in the service layer.
- **`getDailyScores`** — Fetches all results for a given `userId` from the service.

---

### Services

#### `syncService.ts` (server)
- **`saveDailyScore`** — Uses `prisma.user.upsert` to auto-create guest users if they don't exist (using a mock email pattern). Then calls `prisma.dailyPuzzleResult.upsert` to insert or update the result for the unique `(userId, date, puzzleType)` combination — preventing duplicate rows.
- **`getDailyScores`** — Returns `{ date, score, puzzleType }` for all results belonging to a user, ordered by date ascending.

---

### Database Schema

**`User`**
| Column | Type | Notes |
|---|---|---|
| `id` | `String` (UUID) | Primary key |
| `email` | `String` | Unique |
| `password` | `String` | bcrypt hash |
| `createdAt` | `DateTime` | Auto-set |

**`DailyPuzzleResult`**
| Column | Type | Notes |
|---|---|---|
| `id` | `String` (UUID) | Primary key |
| `userId` | `String` | Foreign key → `User.id` |
| `date` | `String` | ISO format (`YYYY-MM-DD`) |
| `score` | `Int` | Calculated score |
| `time` | `Int` | Elapsed time in seconds |
| `puzzleType` | `String` | `"path"` or `"sudoku"` |

A unique composite index on `(userId, date, puzzleType)` enforces one result per puzzle per day per user and enables efficient upserts.

---

## Scoring System

Score is calculated client-side upon puzzle completion and validated server-side:

```
score = 100 + max(0, 60 - elapsed_seconds) - (hints_used × 10)
```

- **Base score:** 100 points for any completion.
- **Speed bonus:** Up to 60 additional points for completing in under 60 seconds.
- **Hint penalty:** −10 points per hint used (max 2 hints → −20 pts minimum).
- **Past puzzles:** Replaying a historical puzzle always results in `score = 0` (no streak update).

---

## Setup & Running

### Prerequisites
- Node.js ≥ 18
- A running PostgreSQL instance

### 1. Configure Environment Variables
In the `server/` directory, copy the example environment file and fill in your values:
```bash
cd server
cp .env.example .env
```
See [Environment Variables](#environment-variables) below for all required keys.

### 2. Install, Build & Migrate (Server)
Run all setup steps in one command from the `server/` directory:
```bash
cd server
npm install && npx tsc && npx prisma generate && npx prisma db push
```

This single chain:
1. **`npm install`** — installs all server dependencies
2. **`npx tsc`** — compiles TypeScript to `dist/`
3. **`npx prisma generate`** — generates the Prisma client from `schema.prisma`
4. **`npx prisma db push`** — applies the schema to your PostgreSQL database


### 3. Start the Server
From the `server/` directory:
```bash
npm start
```

---

## Deployment

### Server
Deploy to any Node.js host (Railway, Render, Fly.io, etc.). Set environment variables on your host and run:
```bash
npm start
```

### Client (Vercel)
The frontend is a static Vite build deployed to Vercel.

**Step 1 — Set environment variables** in your Vercel project settings:

| Variable | Value |
|---|---|
| `VITE_API_URL` | Your deployed backend URL (e.g. `https://your-server.railway.app`) |
| `VITE_PUZZLE_SECRET` | Same secret used for puzzle seed derivation (optional) |

**Step 2 — Configure build settings in Vercel:**
- **Root Directory:** `client`
- **Build Command:** `vite build`
- **Output Directory:** `dist`

Vercel will serve the built static files and route all paths to `index.html` to support client-side routing.

---

## Environment Variables

### `server/.env`
| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Full PostgreSQL connection string (e.g., `postgresql://user:pass@localhost:5432/dailypuzzle`) |
| `JWT_SECRET` | ✅ | A strong, random secret string used to sign JWT tokens |
| `PORT` | ❌ | HTTP port for the Express server (default: `8000`) |
| `NODE_ENV` | ❌ | Set to `production` to enable secure cookies |

### `client` — Vercel Environment Variables
| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Your deployed backend URL — the client uses this for all API calls |
| `VITE_PUZZLE_SECRET` | ❌ | Secret appended to the date for SHA256 puzzle seed derivation (default: `puzzle_secret`) |
