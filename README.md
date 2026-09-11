# Training Management Platform

A full-stack platform for running a 12-week self-learning software development
training program. A trainer manages the curriculum, trainees and their progress;
trainees work through weekly material, submit tasks backed by GitHub
repositories/pull requests, and receive structured review, feedback and scores.

The goal isn't to track whether someone watched a video — it's to answer:
**can this trainee actually work as a junior full-stack developer?** The
platform is built around real tasks, GitHub workflow, code review, research
questions, problem solving and project delivery.

## Table of Contents

- [Overview](#overview)
- [Roles](#roles)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Database Design](#database-design)
- [Requirements](#requirements)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [GitHub Integration](#github-integration)
- [Swagger / API Docs](#swagger--api-docs)
- [Testing](#testing)
- [Build](#build)
- [Deployment](#deployment)
- [Demo Accounts](#demo-accounts)
- [Business Rules](#business-rules)
- [Known Limitations / Next Steps](#known-limitations--next-steps)

## Overview

The platform manages a 12-week `TrainingProgram` made up of `Week`s. Each week
has topics, resources, tasks, a weekly project and research questions. Trainers
create trainee accounts, assign and manage that curriculum, and review
submitted work. Trainees work through their current week, submit tasks backed
by a GitHub repository/branch/PR, and track their own progress, feedback and
scores.

### Feature highlights

- JWT authentication with bcrypt-hashed passwords and role-based authorization
  (`TRAINER` / `TRAINEE`), enforced server-side on every protected route
- Trainer dashboard: KPIs, trainee progress table, pending reviews, recent
  activity, and charts (weekly completion, score distribution, task status,
  task-difficulty performance)
- Full trainee management: create, search, filter, activate/deactivate, and a
  detail view with progress, submissions, reviews and activity history
- Program management: 12 weeks seeded from real curriculum data, fully
  editable from the UI (topics, resources, tasks, research questions) — the
  curriculum is data-driven, never hardcoded in the frontend
- Task system with types (`LEARNING`, `CODING`, `PROBLEM_SOLVING`, `RESEARCH`,
  `PROJECT`), priorities, difficulty, points, deadlines and acceptance criteria
- Submission workflow with attempt history: a trainee submits a repo/branch/PR
  URL, a trainer approves or requests changes, and every attempt is retained
  (nothing is ever overwritten)
- GitHub integration: repository and pull request metadata fetched from the
  public GitHub API (optional token for higher rate limits), with graceful
  degradation — GitHub being down never blocks a submission
- Evaluation: 9-category scoring (task completion, functionality, code
  quality, architecture, git usage, problem solving, documentation, testing,
  technical understanding) rolled into a weighted total score
- Progress tracking at task/week/program level, computed strictly from
  `APPROVED` task assignments (never from "opened" or "started")
- Notifications and an activity log feeding both the trainer dashboard and
  each trainee's own history
- i18n with English and Arabic (RTL), backed by structured JSON translation
  files, not inline strings
- Swagger/OpenAPI docs at `/api/docs`, a consistent API response envelope,
  and pagination on every list endpoint

## Roles

| Role | Can |
|---|---|
| `TRAINER` | Manage the program, weeks, tasks, resources; create/manage trainee accounts; review and score submissions; view all analytics |
| `TRAINEE` | View their own program/tasks/submissions/progress/feedback; submit work; answer research questions; edit their own profile |

A trainee can never reach a trainer-only endpoint or another trainee's data —
this is enforced by backend middleware (`authenticate` + `authorize`), not
just hidden in the UI.

## Tech Stack

**Frontend** — React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui-style
components (Radix primitives + CVA), React Router, TanStack Query, Axios,
React Hook Form + Zod, Zustand, Lucide icons, Recharts, i18next.

**Backend** — Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Zod,
JWT (`jsonwebtoken`), bcrypt, Helmet, CORS, express-rate-limit,
Swagger (`swagger-jsdoc` + `swagger-ui-express`).

**Database** — PostgreSQL hosted on [Neon](https://neon.tech).

**Testing** — Vitest + Supertest (backend).

## Architecture

The backend follows a strict layered architecture — no business logic lives in
routes:

```
Route → Controller → Service → Prisma → PostgreSQL
```

- **Routes** (`server/src/routes`) wire up middleware (auth, validation) and
  map HTTP verbs/paths to controllers. No logic.
- **Controllers** (`server/src/controllers`) parse the request, call one
  service function, and shape the response via `sendSuccess`/`asyncHandler`.
- **Services** (`server/src/services`) hold all business logic and Prisma
  queries.
- **Schemas** (`server/src/schemas`) are Zod request-validation schemas.

The frontend is feature/page-based: `api/` (typed Axios calls), `hooks/`
(TanStack Query wrappers around `api/`), `pages/` (route-level screens),
`components/ui` (design-system primitives), `components/common` (shared
domain-agnostic pieces), `layouts/`, `store/` (Zustand), `schemas/` (Zod form
schemas), `locales/` (i18n JSON).

## Folder Structure

```
training-management-platform/
  client/
    src/
      api/            Axios calls per resource
      components/
        ui/            shadcn-style primitives (button, dialog, table, ...)
        common/         Shared pieces (EmptyState, StatCard, StatusBadge, ...)
      hooks/            TanStack Query hooks per resource
      layouts/          Sidebar, Navbar, DashboardLayout
      locales/          en/ and ar/ translation JSON
      pages/
        auth/
        trainer/
        trainee/
      routes/           AppRouter, ProtectedRoute
      schemas/          Zod schemas for forms
      store/            Zustand stores (auth, ui)
      types/            Shared TypeScript types mirroring the API
  server/
    prisma/
      schema.prisma
      seed.ts
      seedData.ts       12-week curriculum content
    src/
      config/           env, prisma client, swagger
      controllers/
      middleware/        auth, error handling, validation, rate limiting
      routes/
      schemas/          Zod request-validation schemas
      services/         All business logic + Prisma queries
      utils/
    tests/              Vitest + Supertest
  README.md
```

## Database Design

Normalized PostgreSQL schema via Prisma (`server/prisma/schema.prisma`).
Key models and relations:

```
User 1—N ProgramEnrollment, TaskAssignment, Submission, Notification, ActivityLog
TrainingProgram 1—N Week
Week 1—N Topic, Resource, Task, ResearchQuestion
Task 1—N TaskAssignment, Submission
Submission 1—N SubmissionReview
Submission 1—1 Evaluation, GitHubRepository, GitHubPullRequest
ResearchQuestion 1—N ResearchAnswer
```

Notable design decisions:

- **`TaskAssignment`** is the per-trainee status of a `Task` (`NOT_STARTED` →
  `IN_PROGRESS` → `SUBMITTED`/`CHANGES_REQUESTED` → `APPROVED`/`OVERDUE`). A
  task only counts toward progress once its assignment is `APPROVED`.
- **`Submission`** is append-only per task/trainee: every resubmission creates
  a new row with an incrementing `attemptNumber`, so history and prior
  reviews are never lost. A unique constraint doesn't block resubmission —
  business logic instead rejects creating a *new* submission while one is
  still `SUBMITTED`/`UNDER_REVIEW` (`SUBMISSION_PENDING`), directing the
  trainee to update the pending one instead.
- **`GitHubRepository`/`GitHubPullRequest`** cache public GitHub API metadata
  per submission with a `fetchStatus` (`PENDING`/`OK`/`FAILED`/`NOT_FOUND`) so
  the UI can show "metadata unavailable" without ever blocking the submission
  itself.
- Enums are used throughout (`Role`, `TaskStatus`-equivalents, `TaskType`,
  `TaskPriority`, `TaskDifficulty`, `SubmissionStatus`, `ReviewDecision`,
  `NotificationType`, `ActivityType`, `ResourceType`, `WeekUnlockStrategy`).
- Indexes and `@@unique` constraints back the query patterns that matter:
  `Task.code`, `(programId, weekNumber)`, `(taskId, userId)` on
  `TaskAssignment`, `(questionId, userId)` on `ResearchAnswer`, etc.

## Requirements

- Node.js 18+ (developed on Node 24)
- npm 9+
- A PostgreSQL database (this project targets [Neon](https://neon.tech))

## Installation

```bash
git clone <repository-url>
cd training-management-platform
```

The client and server have independent `package.json` files — install each
separately (see [Backend Setup](#backend-setup) and
[Frontend Setup](#frontend-setup)).

## Environment Variables

### `server/.env`

Copy `server/.env.example` to `server/.env` and fill in your own values.
**Never commit `.env`** — it's already in `.gitignore`.

```bash
# PostgreSQL connection string (Neon). Use the pooled connection for the app.
DATABASE_URL=""
# Uncomment if using Prisma < 5.10 or running migrations against Neon's pooler
# DATABASE_URL_UNPOOLED=""

# Secret used to sign JWTs. Generate one with:
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
JWT_SECRET=""
JWT_EXPIRES_IN="7d"

# Optional. Raises GitHub public API rate limits. Not required for basic use.
GITHUB_TOKEN=""

CLIENT_URL="http://localhost:5173"
PORT=5000
NODE_ENV=development
```

### `client/.env`

```bash
VITE_API_URL=http://localhost:5000/api
```

## Database Setup

This project is configured for a PostgreSQL database on [Neon](https://neon.tech).
Create a free Neon project, grab its pooled connection string, and put it in
`server/.env` as `DATABASE_URL`. Any standard PostgreSQL instance works too —
just point `DATABASE_URL` at it.

## Backend Setup

```bash
cd server
npm install

npx prisma generate
npx prisma migrate dev

npm run seed

npm run dev
```

- API: http://localhost:5000
- Health check: http://localhost:5000/health
- Swagger docs: http://localhost:5000/api/docs

Other useful scripts:

```bash
npm run build          # tsc build to dist/
npm run start           # run the compiled build
npm run typecheck       # tsc --noEmit
npm run lint             # eslint
npm test                 # vitest run
npm run prisma:studio    # browse the database
```

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

- App: http://localhost:5173 (Vite will pick the next free port if busy)

Other useful scripts:

```bash
npm run build       # tsc -b && vite build
npm run typecheck    # tsc -b --noEmit
npm run lint          # eslint
npm run preview       # preview the production build
```

## GitHub Integration

Each trainee can link a GitHub username; each submission can carry a
repository URL, branch, pull request URL and live demo URL. The backend's
`services/github.service.ts`:

- Parses `https://github.com/<owner>/<repo>` and
  `https://github.com/<owner>/<repo>/pull/<number>` URLs
- Fetches repository metadata (description, default branch, last push,
  stars, forks, language) and PR metadata (title, state, author, timestamps)
  from GitHub's public REST API
- Uses `GITHUB_TOKEN` if present (for higher rate limits) — **it is never
  required** for basic public-repo usage
- Runs as a best-effort background enrichment step: a submission is created
  and stored regardless of GitHub API availability, and metadata
  fetch failures are recorded as a `fetchStatus` (`FAILED`/`NOT_FOUND`)
  rather than surfaced as an error to the trainee

The design intentionally leaves room to add GitHub OAuth, private repository
access, webhooks, automatic PR/commit tracking and GitHub Checks later
without a rewrite — those are out of scope for this version by design.

## Swagger / API Docs

Interactive OpenAPI docs are served at `/api/docs`
(http://localhost:5000/api/docs) once the backend is running, documenting
authentication, request bodies, parameters and responses for the key
endpoints.

## Testing

Backend tests (Vitest + Supertest) run against a real database connection and
cover the required business-critical paths:

```bash
cd server
npm test
```

Covered: login success/failure, protected-route rejection, role-based
authorization, paginated task listing (with per-trainee status), creating a
submission, rejecting a duplicate pending submission, blocking a trainee from
reviewing their own work, requesting changes, resubmission creating a new
attempt, and approval with an evaluation score.

## Build

```bash
# Backend
cd server && npm run build && npm start

# Frontend
cd client && npm run build && npm run preview
```

Both `npm run build` commands run a full TypeScript check before emitting —
the project has zero TypeScript errors across both packages.

## Deployment

- **Backend**: deploy `server/` to any Node host (Render, Railway, Fly.io,
  a VPS, etc). Run `npx prisma migrate deploy` against production
  `DATABASE_URL` before starting, then `npm run build && npm start`. Set all
  variables from `.env.example` in the host's environment/secrets manager.
- **Frontend**: `npm run build` produces a static `client/dist/` bundle —
  deploy it to any static host (Vercel, Netlify, Cloudflare Pages, S3 +
  CDN, etc), setting `VITE_API_URL` to the deployed backend's URL at build
  time.
- **Database**: Neon is already a managed, production-ready Postgres host;
  no migration is needed to go from dev to prod beyond pointing at a
  separate Neon branch/project and running `prisma migrate deploy`.
- Set `CLIENT_URL` on the backend to the deployed frontend origin (CORS is
  locked to this single origin) and use a fresh, high-entropy `JWT_SECRET`
  in production — never reuse a development secret.

## Demo Accounts

Seeded by `server/prisma/seed.ts` (development-only credentials):

| Role | Email | Password |
|---|---|---|
| Trainer | `trainer@example.com` | `Password123!` |
| Trainee | `trainee1@example.com` (Ahmad, week 4) | `Password123!` |
| Trainee | `trainee2@example.com` (Sara, week 2) | `Password123!` |

The seed populates the full 12-week curriculum (topics, resources, tasks,
problem-solving tasks, research questions, weekly projects), enrollments,
a realistic mix of approved/pending/in-progress task assignments and
submissions with reviews and evaluations, notifications, and activity log
entries — the app looks populated immediately after seeding.

Re-seed at any time (this clears and repopulates the database):

```bash
cd server
npm run seed
```

## Business Rules

These are enforced in the service layer, not just the UI:

1. Only trainers can manage the training program (weeks/tasks/resources).
2. Only trainers can create trainee accounts.
3. Trainees can only access their own submissions, evaluations and progress.
4. Trainers can access all trainee information.
5. Trainees cannot modify task requirements.
6. A submitted task retains its full submission history (append-only
   attempts, never overwritten).
7. Requesting changes never deletes the prior submission or review.
8. Scores can only be created or modified by trainers (`Evaluation` is only
   ever written from the trainer-only review endpoint).
9. Only `APPROVED` task assignments count toward completed progress.
10. Overdue status is computed from `dueDate` vs. completion state, not
    manually set.
11. Deactivated (`isActive: false`) trainees cannot log in.
12. The curriculum UI is entirely data-driven from the database — nothing is
    hardcoded in frontend components.
13. Progress is never inferred from a task merely being opened/started.
14. GitHub API failures never crash or block submission functionality.
15. Every protected backend route verifies authentication and role
    server-side (`authenticate`/`authorize` middleware) — frontend route
    guards are a UX convenience, not the security boundary.

## Known Limitations / Next Steps

Built in phases per the original brief; the following are intentionally
lighter-weight given scope, and are the natural next steps:

- **i18n coverage**: the i18next + RTL infrastructure is fully wired and
  validated (language switcher, `<html dir>` flip, structured JSON
  namespaces), with full translation coverage for auth, navigation and
  global chrome. Deeper page-level copy (task/program detail text, form
  labels on every page) is still English-only and can be moved into the
  existing `locales/*/*.json` namespace files incrementally.
- **Frontend automated tests**: backend business logic has full Vitest
  coverage; frontend testing was deprioritized in favor of manual
  browser-verified coverage of every golden-path flow (auth, program/task
  management, submission + review workflow, analytics) per the brief's
  guidance to prioritize business-critical behavior over coverage percentage.
- **GitHub OAuth / webhooks / automatic status sync**: intentionally not
  implemented (see [GitHub Integration](#github-integration)) — the schema
  and service boundary are designed so these can be added later without
  restructuring existing code.
