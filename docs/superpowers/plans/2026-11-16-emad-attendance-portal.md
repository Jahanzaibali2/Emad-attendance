# Emad Attendance Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a dockerized Next.js + Postgres attendance portal for Emad (clock in/out) and owner (monitor-only) with PKT rules and display-only earned pay.

**Architecture:** Single Next.js app container + Postgres via Docker Compose; Auth.js credentials; Prisma; pure domain module; in-process midnight auto-close.

**Tech Stack:** Next.js (App Router), TypeScript, Prisma, Postgres, Auth.js (credentials), bcryptjs, date-fns-tz / Temporal-style PKT helpers, Vitest, Docker Compose.

## Global Constraints

- All business dates/times: Asia/Karachi (PKT)
- Monthly salary: 15000 PKR; daily target 8h; late after 14:15 PKT
- Seed exactly 2 users (employee + owner) + 1 employee profile
- Golden theme: ink `#1A1408`, parchment `#F7F1E3`, gold `#C5A046`, gold-deep `#8B6914`, slate `#5C5346`, line `#E0D4B8`; fonts Fraunces + Source Sans 3
- Owner has no write actions; no mark-paid; payment settled outside app
- Dockerize: `Dockerfile` + `docker-compose.yml` for local and VPS

---

### Task 1: Scaffold app + Docker + Prisma schema

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `Dockerfile`, `docker-compose.yml`, `.env.example`, `.gitignore`, `prisma/schema.prisma`, `src/lib/prisma.ts`, `src/app/layout.tsx`, `src/app/globals.css`

- [ ] **Step 1:** Create Next.js TypeScript app with App Router in repo root (no src confusion — use `src/`)
- [ ] **Step 2:** Add Prisma schema for User, EmployeeProfile, TimeSession + migrate
- [ ] **Step 3:** Add Dockerfile (standalone) + compose (`app`, `db`) + `.env.example`
- [ ] **Step 4:** Verify `docker compose config` is valid

**Produces:** Runnable empty app skeleton with DB models

---

### Task 2: Domain logic + tests

**Files:**
- Create: `src/lib/time/pkt.ts`, `src/lib/domain/attendance.ts`, `src/lib/domain/pay.ts`, `tests/domain/*.test.ts`

- [ ] **Step 1:** PKT helpers (business date, midnight, weekday count)
- [ ] **Step 2:** Day status + late + worked seconds + earned pay
- [ ] **Step 3:** Vitest coverage for rules from requirements §3–4
- [ ] **Step 4:** Tests pass

**Produces:** Pure functions matching acceptance criteria

---

### Task 3: Auth + seed

**Files:**
- Create: `src/auth.ts`, `src/middleware.ts`, `src/app/login/page.tsx`, `prisma/seed.ts`, `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1:** Auth.js credentials provider; JWT session with role
- [ ] **Step 2:** Middleware protect routes by role
- [ ] **Step 3:** Seed two users + Emad profile from env
- [ ] **Step 4:** Login redirects employee→/today, owner→/monitor

**Produces:** Two-account login working

---

### Task 4: Clock + snapshot services

**Files:**
- Create: `src/lib/services/sessions.ts`, `src/lib/services/summary.ts`, `src/app/actions/clock.ts`

- [ ] **Step 1:** `clockIn` / `clockOut` server actions (employee only, server now)
- [ ] **Step 2:** Today snapshot + month summary + calendar days + day sessions
- [ ] **Step 3:** Auto-close job module + start from instrumentation/boot

**Produces:** Backend behavior complete

---

### Task 5: UI pages (golden theme)

**Files:**
- Create/modify: `src/app/today/page.tsx`, `src/app/monitor/page.tsx`, `src/app/calendar/page.tsx`, shared components, `globals.css`

- [ ] **Step 1:** Tokens + fonts in layout/CSS
- [ ] **Step 2:** Today (clock control + month strip)
- [ ] **Step 3:** Monitor (live status, read-only)
- [ ] **Step 4:** Calendar + day detail

**Produces:** Full UI flows

---

### Task 6: Compose smoke

- [ ] **Step 1:** `docker compose up --build`
- [ ] **Step 2:** Login both users; clock cycle; verify monitor/calendar
- [ ] **Step 3:** Document run commands in README
