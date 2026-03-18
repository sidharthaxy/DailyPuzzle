# Daily Puzzle Web App

A Daily Puzzle Web App with an Offline-First architecture. Features grid-path and 4x4 Mini Sudoku generated deterministically directly from the date and secret key.

## Project Structure
- **/client**: React (Vite) + Typescript + Tailwind + Zustand + IndexedDB
- **/server**: Node.js + Express + Prisma + PostgreSQL

## Features
- **Deterministic Puzzle Generation**: A new puzzle every day calculated client-side!
- **Offline First**: Progress saves automatically to IndexedDB and syncs when back online.
- **Validations**: Completed puzzles and times sync to the backend, protecting against impossible dates and completion times.

## Setup Instructions

1. **Install Dependencies**
   From the root folder, run:
   ```bash
   npm run install:all
   ```

2. **Configure Environment Variables**
   Inside the `server` directory, copy `.env.example` to `.env` and set your Postgres URL.
   ```bash
   cd server
   cp .env.example .env
   ```

3. **Database Setup**
   Push the Prisma Schema to your Postgres Database:
   ```bash
   npm run db:push
   ```

4. **Run Application**
   Run the backend:
   ```bash
   npm run server
   ```
   
   In a separate terminal block, run the frontend:
   ```bash
   npm run dev
   ```

## Modules Explained

- **Client Engines**: Puzzle files under `/client/src/puzzles` implement the deterministic grid builders and verifiers. They are totally client side and use SHA256 hashes generated from the date.
- **Client State**: Zustand (`usePuzzleStore`, `useUserStore`) holds transient data for score, streak, and timers.
- **Client IndexedDB (Offline-First)**: `src/db/indexeddb.ts` intercepts states. Missing synchronization triggers are held locally until the `/services/syncService.ts` executes a replay of network payloads when `navigator.onLine` verifies internet connection.
- **Server SyncController**: Exposes REST interfaces configured in Express. Prevents users from fabricating scores or predicting times with strong basic validation. Updates are merged via Prisma Upsert for a Postgres DB.
