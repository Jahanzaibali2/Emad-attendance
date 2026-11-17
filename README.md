# Emad's Attendance

Clock in/out for Emad Khan + owner monitor. Next.js + Postgres, Docker Compose.

## Quick start (Docker)

```bash
cp .env.example .env
# edit AUTH_SECRET and seed passwords
docker compose up --build
```

Open http://localhost:3000

Default seed (override via env):

- Employee: `emad@example.com` / `emad-change-me`
- Owner: `owner@example.com` / `owner-change-me`

## Local without Docker app

```bash
docker compose up -d db
cp .env.example .env
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

## Tests

```bash
npm test
```

## VPS

Copy the repo, set `.env`, run `docker compose up -d --build`. Point DNS/proxy to port 3000 when ready.
