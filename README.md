# NC 4th of July Festival — All-in-One Platform

The official management platform for the **NC 4th of July Festival**, Southport, North Carolina — America's oldest 4th of July celebration, held continuously since 1795.

**P.O. Box 11247, Southport NC 28461**

---

## Features

### Public Site
- **Homepage** — Live countdown to July 4th, festival overview, event highlights
- **Events** — Full listing of all annual events with signup CTAs
- **Parade** — Route details, new participant registration, returning participant renewal
- **Shriners** — Dedicated signup and renewal for Shriners International units (auto-assigned to S Atlantic Ave staging)
- **Heritage** — Visual timeline 1795–present, past presidents, committee members
- **Festival Queens** — Gallery of past queens organized by year
- **History** — Full narrative of 230+ years of festival history
- **Volunteer** — Volunteer signup form
- **Committees** — Public directory of all 80+ committee members

### Back-Office Admin Portal (`/admin`)
- Dashboard with live stats and activity feed
- Event management (create, edit, delete)
- Parade entries management with Shriners tab (approve/reject)
- Event signups viewer
- Heritage content editor (presidents, timeline, committee members)
- Festival Queens gallery editor
- Committee directory management
- Shriners unit management

### Live Parade Manager (Real-Time via Socket.IO)
- **Parade Day Control** (`/admin/parade-day`) — Import units, set session status
- **Live Board** (`/parade/live`) — Real-time dark-mode board with Shriner gold highlighting
- **Marshal Start Line** (`/parade/marshal`) — Confirm units marching
- **Checkpoint Stations** (`/parade/checkpoint/1-4`) — Log unit pass-throughs along the route
- **Unit Tracker** (`/parade/tracker`) — Participants check their position and ETA

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS 4, shadcn/ui |
| API | tRPC 11, Zod validation |
| Backend | Node.js, Express 4 |
| Real-time | Socket.IO |
| Database | MySQL (PlanetScale / Railway / local) |
| ORM | Drizzle ORM |
| Auth | JWT session cookies + role-based access (admin/user) |
| Tests | Vitest — 21 tests passing |

---

## Database Setup

### Option A — PlanetScale (Easiest, Recommended)

1. Create a free account at [planetscale.com](https://planetscale.com)
2. Click **New database** → name it `nc4july-festival` → select **US East (N. Virginia)**
3. Once created, click **Connect** → **Connect with: Node.js**
4. Copy the connection string — it looks like:
   ```
   mysql://username:password@host.us-east.psdb.cloud/nc4july-festival?ssl={"rejectUnauthorized":true}
   ```
5. Set this as `DATABASE_URL` in your environment

### Option B — Railway MySQL

1. Go to [railway.app](https://railway.app) → **New Project → Provision MySQL**
2. Click the MySQL service → **Connect** tab
3. Copy the `DATABASE_URL` (MySQL format)

### Option C — Supabase

> **Note:** This codebase uses the **MySQL dialect** of Drizzle ORM. Supabase uses PostgreSQL.
> To use Supabase you must switch the Drizzle dialect from `mysql2` to `postgres` in `drizzle/schema.ts` and `server/db.ts`.

If you want to use Supabase PostgreSQL:
1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database → Connection string → URI**
3. Copy the `postgresql://...` string
4. Update `drizzle.config.ts` to use `dialect: "postgresql"` and update schema imports to `drizzle-orm/pg-core`

### Option D — Local MySQL (Development Only)

```bash
# macOS
brew install mysql && brew services start mysql

# Ubuntu/Debian
sudo apt install mysql-server && sudo systemctl start mysql

# Create the database
mysql -u root -e "CREATE DATABASE nc4july_festival CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Use this as DATABASE_URL:
# mysql://root:@localhost:3306/nc4july_festival
```

---

## Local Development Setup

### Prerequisites
- Node.js 22+
- pnpm (`npm install -g pnpm`)
- A MySQL database (see above)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/AIRealSolutions/NC4thofjuly.git
cd NC4thofjuly

# 2. Install dependencies
pnpm install

# 3. Set your environment variables (see section below)

# 4. Run database migrations — creates all 14 tables
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# 5. Seed the database with real 2026 data
node seed.mjs              # 80 committee members, 18 events, heritage timeline, presidents
node seed-checkpoints.mjs  # 4 Southport parade route checkpoints + 2026 parade session

# 6. Start the development server
pnpm dev
# App runs at http://localhost:3000
```

---

## Required Environment Variables

Set these in your hosting platform's environment settings (Railway, Vercel, etc.) or in a local `.env` file:

```
DATABASE_URL=mysql://user:password@host:3306/nc4july_festival

JWT_SECRET=your-64-character-random-secret-here
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

VITE_APP_ID=your-oauth-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im
```

---

## Making Your Account an Admin

After your first login, run this SQL to grant yourself full admin access:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

**Where to run it:**

| Platform | How |
|---|---|
| PlanetScale | Console tab in your database dashboard |
| Railway | Query tab in your MySQL service |
| Supabase | SQL Editor in the Supabase dashboard |
| Local | `mysql -u root nc4july_festival -e "UPDATE users SET role = 'admin' WHERE email = 'your@email.com';"` |

---

## Database Schema — 14 Tables

| Table | Purpose |
|---|---|
| `users` | Admin and staff accounts (role: admin / user) |
| `events` | Festival events with dates, descriptions, capacity |
| `event_signups` | Attendee and volunteer signups per event |
| `parade_participants` | All parade registrations (new, returning, Shriners) |
| `volunteers` | General volunteer applications |
| `past_presidents` | Heritage: past festival presidents |
| `committee_members` | All committee members by division and year |
| `heritage_timeline` | Timeline entries (1795–present) |
| `festival_queens` | Past Festival Queens gallery |
| `activity_log` | Admin activity feed |
| `parade_sessions` | Live parade day session state |
| `parade_units` | Live parade units with real-time status |
| `parade_checkpoints` | Route checkpoints (START / HOWE / FODALE / DISBAND) |
| `parade_checkpoint_logs` | Unit pass-through log per checkpoint |

### Running Migrations Manually

```bash
# Generate migration SQL from schema changes
pnpm drizzle-kit generate

# Apply all pending migrations
pnpm drizzle-kit migrate

# Or apply a specific migration file directly
mysql -u root nc4july_festival < drizzle/0001_initial.sql
```

---

## Deployment

### Railway (Recommended — supports Socket.IO)

Railway supports long-lived Node.js processes, which is required for the real-time Socket.IO parade manager.

1. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**
2. Select `AIRealSolutions/NC4thofjuly`
3. Add a **MySQL** plugin to the same project
4. Set all environment variables in the Railway dashboard
5. Railway auto-detects `pnpm start` as the start command and deploys automatically

### Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import `AIRealSolutions/NC4thofjuly`
2. Set **Framework Preset**: `Other`
3. Set **Build Command**: `pnpm build`
4. Set **Output Directory**: `dist`
5. Add all environment variables in the **Environment Variables** section
6. Click **Deploy**

> **Important:** Vercel's serverless functions do not support persistent WebSocket connections.
> The Live Parade Manager (Socket.IO) will not function on Vercel's free/hobby plan.
> For full Socket.IO support, use **Railway** or **Render** instead.

---

## Parade Route — Southport, NC

**Start:** E Moore St & Atlantic Ave

```
E Moore St & Atlantic Ave  (START — marshal confirms each unit)
        ↓
   West on Moore St
        ↓
  Right (north) on Howe St  (CHECKPOINT — marshal logs unit passing)
        ↓
     Right on Fodale Ave     (CHECKPOINT — marshal logs unit passing)
        ↓
  Nursing home parking lot
        ↓
  Fodale Ave near cemetery   (DISBAND — unit marked complete)
```

### Staging Areas

| Zone | Assigned Units |
|---|---|
| S Atlantic Ave | Shriners International (all temples) — auto-assigned |
| N Atlantic Ave | Politicians and elected officials |
| E Moore St — Left lane | Floats and large vehicles |
| E Moore St — Right lane | Marching bands and walking groups |
| Rhett St — Left | Equestrian units |
| Rhett St — Right | Overflow / miscellaneous |

---

## Running Tests

```bash
pnpm test
# 21 tests: auth, events, parade, signups, heritage, admin
```

---

## Project Structure

```
client/src/
  pages/              All page components
    admin/            Back-office admin portal pages
    parade/           Live parade manager pages
  components/         Shared UI components (AdminLayout, PublicLayout, AdminGuard)
  hooks/              Custom hooks (useParadeSocket, useAuth)
server/
  routers.ts          All tRPC API procedures
  db.ts               Database query helpers
  paradeSocket.ts     Socket.IO real-time parade server
drizzle/
  schema.ts           Full database schema (14 tables)
  migrations/         Generated SQL migration files
seed.mjs              Seeds committee data, events, heritage content
seed-checkpoints.mjs  Seeds Southport parade route checkpoints
```

---

## License

Copyright © 2026 NC 4th of July Festival Committee. All rights reserved.
