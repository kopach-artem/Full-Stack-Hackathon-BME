# BME Education Portal

Fullstack secondary-school education management portal for the BME fullstack and mobile programming competition.

The project is locally runnable, role-based, seeded with demo data, and includes:

- web client
- backend API
- PostgreSQL via Docker Compose
- Prisma ORM
- Expo mobile client
- Playwright end-to-end tests

## Main Features

- JWT authentication with role-based access control
- Four roles:
  - `SUPERADMIN`
  - `ADMIN`
  - `TEACHER`
  - `STUDENT`
- School structure management:
  - classes
  - subjects
  - users
  - subject assignments
- Teacher workflow:
  - see own assigned subjects
  - enter grades for students in assigned classes
  - use weighted grades
- Student workflow:
  - see own class
  - see own subjects
  - see own grades only
  - see weighted average for regular grades
  - see special grade types separately
- Superadmin workflow:
  - manage admin and superadmin accounts
- Mobile client with student and teacher flows
- End-to-end browser tests with Playwright

## Tech Stack

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Mobile: Expo + React Native
- Package manager: pnpm
- Validation/Auth: Zod, JWT, bcrypt
- Testing: Playwright

## Repository Structure

```text
backend/
  prisma/
    schema.prisma
    seed.ts
  src/
    middleware/
    routes/
    index.ts
    prisma.ts
frontend/
  src/
    api/
    context/
    pages/
mobile/
  src/
    api/
    context/
    navigation/
    screens/
tests/
  e2e/
docker-compose.yml
package.json
pnpm-workspace.yaml
README.md
```

## Implemented Web Pages

### Shared

- Login page
- Protected routes
- Role-based navigation

### Admin

- Dashboard
- User management
- Class management
- Subject management
- Subject assignment management

### Teacher

- Dashboard
- My subjects
- Grade entry

### Student

- Dashboard
- My subjects
- My grades

### Superadmin

- Dashboard
- Admin and superadmin management

## Domain Model

The current Prisma schema is built around a school portal:

- `Role`
- `User`
- `Class`
- `Subject`
- `SubjectAssignment`
- `Grade`

Core business rule:

- a student belongs to one class
- a subject is assigned to a class and teacher for an academic year
- a teacher can grade only students inside their own assignments
- a student can see only their own data

## Prerequisites

Install these before starting:

1. Git
2. Node.js 20+ or 22+
3. pnpm
4. Docker Desktop

Recommended checks:

```bash
git --version
node --version
pnpm --version
docker --version
docker compose version
```

## Full Setup From Zero

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd Full-Stack-Hackathon-BME
```

### 2. Check the required tools

Run:

```bash
git --version
node --version
pnpm --version
docker --version
docker compose version
```

You should see installed versions for all of them.

### 3. Install dependencies

```bash
pnpm install
```

### 4. Create the backend environment file

On macOS/Linux:

```bash
cp backend/.env.example backend/.env
```

On Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

### 5. Start PostgreSQL with Docker Compose

```bash
docker compose up -d
```

Optional check:

```bash
docker compose ps
```

The PostgreSQL container should be running and healthy.

### 6. Run Prisma migration

```bash
pnpm db:migrate
```

### 7. Seed demo data

```bash
pnpm db:seed
```

### 8. Start the web app and backend

```bash
pnpm dev
```

This starts:

- backend on `http://localhost:4000`
- frontend on `http://localhost:5173`

### 9. Open the project

Open these URLs in the browser:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:4000/api/health`

## Demo Accounts

These accounts are created by `pnpm db:seed`.

```text
superadmin@school.edu / superadmin123
admin@school.edu / admin123
kovacs.peter@school.edu / teacher123
nagy.anna@school.edu / teacher123
toth.bela@school.edu / student123
kiss.eva@school.edu / student123
molnar.adam@school.edu / student123
```

## Fast Demo Flow

### Admin

Login:

```text
admin@school.edu / admin123
```

Show:

- users
- classes
- subjects
- subject assignments

### Teacher

Login:

```text
kovacs.peter@school.edu / teacher123
```

Show:

- assigned subjects
- student list
- grade entry
- weighted grading flow

### Student

Login:

```text
toth.bela@school.edu / student123
```

Show:

- own class
- own subjects
- own grades
- regular weighted average

### Superadmin

Login:

```text
superadmin@school.edu / superadmin123
```

Show:

- admin management
- superadmin management

## Mobile Client

The repository includes a separate Expo mobile client in `mobile/`.

Current mobile coverage:

- login
- student dashboard, subjects, grades
- teacher subjects and grade entry
- admin/superadmin fallback screen directing management work to the web portal

### Start the mobile client

Keep the backend and database running first:

```bash
docker compose up -d
pnpm dev
```

Then in another terminal:

```bash
pnpm mobile
```

Useful mobile commands:

```bash
pnpm mobile
pnpm mobile:android
pnpm mobile:ios
pnpm mobile:typecheck
```

### Mobile API URL

Default mobile API URL:

```text
http://10.0.2.2:4000
```

This is correct for the Android emulator.

For a physical device, create `mobile/.env` from `mobile/.env.example` and set:

```text
EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:4000
```

Example:

```text
EXPO_PUBLIC_API_URL=http://192.168.1.20:4000
```

## End-to-End Tests

Playwright tests are included in `tests/e2e/`.

Run all tests:

```bash
pnpm test:e2e
```

Run only the student flow:

```bash
pnpm test:e2e:student
```

Run the student flow with a visible browser:

```bash
pnpm test:e2e:student:headed
```

## Useful Commands

```bash
pnpm dev
pnpm build
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:studio
pnpm mobile
pnpm mobile:android
pnpm mobile:ios
pnpm mobile:typecheck
pnpm test:e2e
docker compose up -d
docker compose down
```

## Clean Reset

If the database gets into a bad state and you are okay with deleting local PostgreSQL data:

```bash
docker compose down -v
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Build Check

To verify both backend and frontend production builds:

```bash
pnpm build
```

## Windows pnpm / Corepack Troubleshooting

If `pnpm` fails on Windows with a Corepack signature error, use this fallback:

1. Install pnpm globally:

```powershell
npm install -g pnpm
```

2. Use the npm-installed pnpm directly:

```powershell
& "$env:APPDATA\npm\pnpm.cmd" install
& "$env:APPDATA\npm\pnpm.cmd" db:migrate
& "$env:APPDATA\npm\pnpm.cmd" db:seed
& "$env:APPDATA\npm\pnpm.cmd" dev
```

If needed, you can also verify the path:

```powershell
where.exe pnpm
```

## Environment Files

### Backend

`backend/.env`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/education_portal?schema=public"
PORT=4000
FRONTEND_URL="http://localhost:5173"
JWT_SECRET="change-me-in-production"
```

### Mobile

`mobile/.env`

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
```

## What Judges Need To Run

From a fresh clone, the shortest path is:

```bash
pnpm install
docker compose up -d
cp backend/.env.example backend/.env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Then open:

- `http://localhost:5173`

If testing mobile too:

```bash
pnpm mobile
```

## Known Scope

This is a competition MVP focused on:

- working local setup
- clear role-based architecture
- admin, teacher, student, and superadmin flows
- demo-ready seeded data
- responsive web app
- mobile bonus client

It is intentionally compact and designed to be extended further during the competition.
