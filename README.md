# Meeting Room Booking System

A full-stack meeting room booking application with role-based access control, booking conflict prevention, user management, usage reporting, and responsive desktop/mobile interfaces.

This project was built as a coding test.

## Live Demo

| Service      | URL                                                       |
| ------------ | --------------------------------------------------------- |
| Frontend     | https://meeting-room-booking-web.onrender.com             |
| API          | https://meeting-room-booking-api-x068.onrender.com        |
| Health Check | https://meeting-room-booking-api-x068.onrender.com/health |

## Demo Accounts

All seeded demo accounts use the same password.

| Role  | Email               | Password       |
| ----- | ------------------- | -------------- |
| Admin | `admin@example.com` | `Password123!` |
| Owner | `owner@example.com` | `Password123!` |
| User  | `user@example.com`  | `Password123!` |

## Features

### Authentication

- Email/password login
- JWT authentication using HTTP-only cookies
- Auth session restoration using `GET /api/auth/me`
- Logout
- Protected routes

### Booking Management

- Create meeting room bookings
- View bookings in a weekly calendar
- Responsive mobile agenda view
- Upcoming bookings
- Delete bookings according to permissions
- Custom date and time picker
- Cross-day bookings
- Maximum booking duration of 8 hours
- Conflict/overlap prevention
- Back-to-back bookings allowed
- UTC storage with local-time display

### User Management

- Admin-only user management
- Create users
- Change roles
- Delete users
- Prevent deleting the last Admin
- Prevent downgrading the last Admin

### Reports

- Admin and Owner access
- Total bookings
- Total booked time
- Active users
- Usage grouped by user
- Booking details grouped by user

### Responsive UI

- Collapsible desktop sidebar
- Mobile navigation
- Responsive bookings view
- Mobile user cards
- Mobile reports layout

## Roles and Permissions

| Feature                      | USER | OWNER | ADMIN |
| ---------------------------- | ---- | ----- | ----- |
| View bookings                | Yes  | Yes   | Yes   |
| Create booking               | Yes  | Yes   | Yes   |
| Delete own booking           | Yes  | Yes   | Yes   |
| Delete other users' bookings | No   | Yes   | Yes   |
| View reports                 | No   | Yes   | Yes   |
| Manage users                 | No   | No    | Yes   |

Backend authorization is the source of truth. Frontend role checks are used for UX only.

## Booking Rules

Backend booking validation enforces:

- Start time must be before end time
- Start time must be in the future
- Maximum duration is 8 hours
- Bookings cannot overlap
- Identical time ranges are rejected
- Partial overlaps are rejected
- Contained overlaps are rejected
- Back-to-back bookings are allowed
- Cross-day bookings are allowed if duration is within the limit
- Times are stored/transmitted consistently using UTC ISO timestamps
- Frontend displays dates and times in the browser's local timezone

A booking overlaps when:

```text
existing.startTime < new.endTime
AND
existing.endTime > new.startTime
```

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- React Hook Form
- Zod
- Axios
- date-fns
- Lucide React

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Zod
- JWT
- bcryptjs
- Helmet
- CORS
- cookie-parser

### Testing

- Vitest
- Supertest

### Tooling

- pnpm workspaces
- Prettier
- Docker for local PostgreSQL

## Project Structure

```text
meeting-room-booking/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   ├── migrations/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── config/
│   │       ├── controllers/
│   │       ├── errors/
│   │       ├── lib/
│   │       ├── middleware/
│   │       ├── routes/
│   │       ├── schemas/
│   │       ├── services/
│   │       ├── types/
│   │       ├── app.ts
│   │       └── server.ts
│   └── web/
│       ├── public/
│       └── src/
│           ├── api/
│           ├── assets/
│           ├── components/
│           ├── layouts/
│           ├── lib/
│           ├── pages/
│           └── schemas/
├── packages/
│   └── shared/
├── docker-compose.yml
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

## Backend Architecture

The API follows this flow:

```text
Route -> Middleware -> Controller -> Service -> Prisma -> PostgreSQL
```

- Zod handles request validation.
- Authentication middleware verifies the HTTP-only JWT cookie.
- Role middleware enforces server-side permissions.
- Services contain business rules such as booking conflict validation and last-admin protection.

## Local Setup

### Prerequisites

- Node.js
- pnpm
- Docker

### Clone

```bash
git clone <repository-url>
cd meeting-room-booking
```

### Install Dependencies

```bash
pnpm install
```

### Start PostgreSQL

The repository includes `docker-compose.yml` for local PostgreSQL.

```bash
docker compose up -d postgres
```

### Configure Environment Variables

Create `apps/api/.env` from `apps/api/.env.example`.

```bash
cp apps/api/.env.example apps/api/.env
```

Create `apps/web/.env`.

```env
VITE_API_URL=http://localhost:3000/api
```

Update `apps/api/.env` for local development:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/meeting_room_booking
JWT_SECRET=your-secure-secret-at-least-32-characters
FRONTEND_URL=http://localhost:5173
```

### Generate Prisma Client

```bash
pnpm --filter api exec prisma generate
```

### Run Migrations

```bash
pnpm --filter api exec prisma migrate dev
```

### Seed Demo Users

```bash
pnpm --filter api db:seed
```

### Start Development Servers

Run the API:

```bash
pnpm --filter api dev
```

Run the frontend in a second terminal:

```bash
pnpm --filter web dev
```

The frontend runs on Vite's default local server, usually `http://localhost:5173`.

## Environment Variables

### API (`apps/api/.env`)

| Variable       | Required | Description                                                        |
| -------------- | -------: | ------------------------------------------------------------------ |
| `NODE_ENV`     |       No | `development`, `test`, or `production`. Defaults to `development`. |
| `PORT`         |       No | API port. Defaults to `3000`.                                      |
| `DATABASE_URL` |      Yes | PostgreSQL connection string.                                      |
| `JWT_SECRET`   |      Yes | Secret used to sign JWTs. Must be at least 32 characters.          |
| `FRONTEND_URL` |      Yes | Allowed CORS origin for the frontend.                              |

Example:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/meeting_room_booking
JWT_SECRET=your-secure-secret-at-least-32-characters
FRONTEND_URL=http://localhost:5173
```

### Web (`apps/web/.env`)

| Variable       | Required | Description                 |
| -------------- | -------: | --------------------------- |
| `VITE_API_URL` |      Yes | API base URL used by Axios. |

Example:

```env
VITE_API_URL=http://localhost:3000/api
```

## Database Migration and Seeding

Use these Prisma commands from the repository root:

```bash
pnpm --filter api exec prisma generate
pnpm --filter api exec prisma migrate dev
pnpm --filter api exec prisma migrate deploy
pnpm --filter api exec prisma db seed
```

- `migrate dev` is for local development.
- `migrate deploy` is for production deployments.
- `db seed` creates the demo Admin, Owner, and User accounts.

The API package also provides:

```bash
pnpm --filter api db:seed
```

## Available Scripts

| Command                        | Description                                   |
| ------------------------------ | --------------------------------------------- |
| `pnpm format`                  | Format the repository with Prettier.          |
| `pnpm format:check`            | Check Prettier formatting.                    |
| `pnpm --filter web dev`        | Start the Vite frontend dev server.           |
| `pnpm --filter web build`      | Build the frontend.                           |
| `pnpm --filter web lint`       | Run frontend ESLint.                          |
| `pnpm --filter web preview`    | Preview the frontend production build.        |
| `pnpm --filter api dev`        | Start the API in watch mode.                  |
| `pnpm --filter api build`      | Compile the API TypeScript project.           |
| `pnpm --filter api start`      | Start the compiled API from `dist/server.js`. |
| `pnpm --filter api db:seed`    | Seed demo users.                              |
| `pnpm --filter api test`       | Run backend tests.                            |
| `pnpm --filter api test:watch` | Run backend tests in watch mode.              |

## API Endpoints

### Health

| Method | Path      | Access |
| ------ | --------- | ------ |
| `GET`  | `/health` | Public |

### Authentication

| Method | Path               | Access        |
| ------ | ------------------ | ------------- |
| `POST` | `/api/auth/login`  | Public        |
| `POST` | `/api/auth/logout` | Public        |
| `GET`  | `/api/auth/me`     | Authenticated |

### Bookings

| Method   | Path                | Access                                      |
| -------- | ------------------- | ------------------------------------------- |
| `GET`    | `/api/bookings`     | Authenticated users                         |
| `POST`   | `/api/bookings`     | Authenticated users                         |
| `DELETE` | `/api/bookings/:id` | Owner of booking, Owner role, or Admin role |

### Users

| Method   | Path                  | Access |
| -------- | --------------------- | ------ |
| `GET`    | `/api/users`          | Admin  |
| `POST`   | `/api/users`          | Admin  |
| `PATCH`  | `/api/users/:id/role` | Admin  |
| `DELETE` | `/api/users/:id`      | Admin  |

### Reports

| Method | Path                 | Access         |
| ------ | -------------------- | -------------- |
| `GET`  | `/api/reports/usage` | Admin or Owner |

## Testing

Run backend tests:

```bash
pnpm --filter api test
```

Current test suite: 23 backend tests.

Tests cover:

- Booking validation
- Overlap prevention
- Delete permissions
- Last-admin protection
- Authentication API behavior
- HTTP-only cookie behavior

There are no frontend tests in the current repository.

## Deployment

The intended deployment architecture is:

| Layer    | Platform           |
| -------- | ------------------ |
| Frontend | Render Static Site |
| Backend  | Render Web Service |
| Database | Render PostgreSQL  |

Deployment notes:

- Prisma migrations should run during production deployment using `prisma migrate deploy`.
- Production frontend uses `VITE_API_URL`.
- API CORS uses `FRONTEND_URL`.
- JWT authentication is stored in an HTTP-only cookie.
- Do not expose internal Render database URLs in frontend or public documentation.

## Screenshots

### Login

![Login Page](./docs/screenshots/login.png)

### Desktop Booking Calendar

![Desktop Booking Calendar](./docs/screenshots/bookings-desktop.png)

### Mobile Booking Agenda

![Mobile Booking Agenda](./docs/screenshots/bookings-mobile.png)

### User Management

![User Management](./docs/screenshots/users.png)

### Reports

![Reports](./docs/screenshots/reports.png)

## Design / Implementation Decisions

- HTTP-only cookie auth is used instead of storing tokens in localStorage.
- Backend RBAC is the source of truth for authorization.
- Dates are sent and stored as UTC ISO timestamps, then displayed in local time on the frontend.
- Booking overlap validation is strict and handled server-side.
- The frontend uses a desktop weekly calendar and a separate mobile agenda for responsive booking views.
- TanStack Query manages server state and cache updates.
