# Full-Stack Hackathon BME

Starter project for a 3-hour university fullstack programming competition.

## Stack

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL with Docker Compose
- ORM: Prisma
- Package manager: pnpm

## Project Structure

```text
backend/
  prisma/schema.prisma
  src/index.ts
  src/prisma.ts
frontend/
  src/App.tsx
  src/main.tsx
docker-compose.yml
pnpm-workspace.yaml
package.json
```

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Start PostgreSQL:

```bash
docker compose up -d
```

3. Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

On Windows PowerShell, use:

```powershell
Copy-Item backend/.env.example backend/.env
```

4. Create the database tables and Prisma client:

```bash
pnpm db:migrate
```

5. Start frontend and backend together:

```bash
pnpm dev
```

## Local URLs

- Frontend: http://localhost:5173
- Backend health check: http://localhost:4000/api/health
- PostgreSQL: localhost:5432

## Useful Commands

```bash
pnpm dev
pnpm build
pnpm db:migrate
pnpm db:generate
pnpm db:studio
docker compose up -d
docker compose down
```

## Domain Model

The Prisma schema is prepared for an educational portal with:

- users
- roles
- courses
- enrollments
- assignments
- submissions

The starter API already includes health, roles, users, courses, and assignments routes. Add new routes in `backend/src/index.ts` or split them into route files as the app grows during the competition.
