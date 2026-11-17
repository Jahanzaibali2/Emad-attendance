# Emad Attendance Portal — Technical Design

Date: 2026-11-16  
Status: Approved (build)  
Requirements: `2026-11-16-emad-attendance-portal-requirements.md`

## Approach

Next.js App Router monolith + Postgres, Docker Compose on VPS (`app` + `db`). Auth.js credentials for two seeded users (employee Emad, owner). In-process PKT midnight auto-close. Derived day/month/pay never stored.

## Architecture

- Browser → Next.js container (UI, Auth.js, Server Actions, domain, cron) → Postgres
- Server-authoritative timestamps in `Asia/Karachi`
- Role middleware: employee → `/today`, owner → `/monitor`; shared read-only `/calendar`
- Seed only: two users + one `EmployeeProfile` for Emad Khan (credentials from env)

## Data

- `User`: email, passwordHash, role `EMPLOYEE` | `OWNER`
- `EmployeeProfile`: displayName, expected 14:00–23:00, grace 15, dailyTargetHours 8, monthlySalaryPkr 15000
- `TimeSession`: workDate (PKT), startedAt, endedAt nullable, endReason `CLOCK_OUT` | `AUTO_CLOSED`
- At most one open session per employee (partial unique index)
- Append-only sessions in v1 (clock-out / auto-close only set end)

## Domain (pure, unit-tested)

Day status, late flag, month target (`8 × weekdays`), earned pay `min(15000, worked/target × 15000)`, worked seconds including live open session.

## Docker

- Multi-stage Next standalone Dockerfile
- Compose: `app` + `db` (volume, healthcheck); migrate → seed-if-empty → start
- Same Compose local and VPS; prod differs by env only
- TLS reverse proxy deferred

## Security & errors

- bcrypt hashes; Auth.js HTTP-only cookies; role checks on mutations
- Clear clock conflict messages; generic login failure; boot fails hard on migrate error

## Out of scope

Pause/leave/corrections/mark-paid/multi-employee/notifications/BHHR integration/TLS proxy
