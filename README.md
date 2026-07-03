# NC 4th of July Festival — All-in-One Management Platform

**Southport, North Carolina · Est. 1795 · 501(c)(3)**

A full-stack web application serving as the public portal, committee management system, and real-time parade operations center for the NC 4th of July Festival.

---

## Live Features

### Public Site
- **Homepage** — Festival overview, live countdown to July 4th, event highlights
- **Contact** — P.O. Box 11247, Southport NC 28461 | patriot@nc4thofjuly.com | +1 910-457-5578
- **Events** — Full listing of all 18 annual events with dates, descriptions, and signup CTAs
- **Parade** — Route details, entry types, rules, and registration links
- **Heritage** — Visual timeline 1795–present, past presidents, committee history
- **Festival Queens** — Gallery of past queens organized by year
- **History** — Full 230+ year narrative
- **Volunteer** — Volunteer signup form
- **Committees** — Public directory of all 80 committee members across 9 divisions

### Parade Registration
- **New Participant** — 4-step registration form
- **Returning Participant** — Streamlined renewal flow
- **Shriners Special Group** — Dedicated signup; auto-assigned to S Atlantic Ave staging zone
- **Shriners Renewal** — Returning temple renewal flow

### Back-Office Admin Portal (login required, admin role)
- Dashboard, Events, Signups, Parade Entries, Shriner Units
- Parade Day Control Center, Queens, Committees, Heritage, Marshal PINs

### Live Parade Manager (Real-Time, Socket.IO)

| URL | Who uses it |
|-----|-------------|
| `/parade/live` | Live Board — dark display for command center / spectators |
| `/parade/marshal` | Start Line Marshal — confirm each unit is marching (PIN required) |
| `/parade/checkpoint/1` | Howe St checkpoint — Moore & Howe (PIN required) |
| `/parade/checkpoint/2` | Fodale Ave checkpoint — Howe & Fodale (PIN required) |
| `/parade/checkpoint/3` | Nursing Home lot checkpoint (PIN required) |
| `/parade/checkpoint/4` | Disband point — Fodale Ave near cemetery (PIN required) |
| `/parade/tracker` | Unit Tracker — participants search their unit for ETA |
| `/admin/parade-day` | Admin Parade Day Control Center |

**Parade Day Reset** — Orange "Reset for Test" button in admin header resets all 101 units to Staged, clears checkpoint logs, and broadcasts the reset to all connected clients instantly. Last reset time is persisted in the database.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend | Node.js, Express 4, tRPC 11 |
| Real-time | Socket.IO |
| Database ORM | Drizzle ORM (MySQL dialect) |
| Auth | JWT session cookies |
| Testing | Vitest (21 tests passing) |

---

## Database Setup

### Step 1 — Choose a MySQL Provider

| Provider | Free Tier | Notes |
|----------|-----------|-------|
| **PlanetScale** | Yes | Easiest setup, serverless MySQL |
| **Railway** | ~$5/mo | Best for full hosting (supports Socket.IO) |
| **Local MySQL** | Free | Development only |

> **Note on Supabase:** Supabase uses PostgreSQL. This project uses the MySQL dialect of Drizzle ORM. PlanetScale or Railway are the simpler path to get started.

### Step 2 — Get Your Connection String

**PlanetScale:**
1. Go to [planetscale.com](https://planetscale.com) → New database → name it `nc4july-festival` → region US East
2. Click **Connect** → **Connect with: Node.js**
3. Copy the connection string (format: `mysql://username:password@host.us-east.psdb.cloud/nc4july-festival?ssl={"rejectUnauthorized":true}`)

**Railway:**
1. [railway.app](https://railway.app) → New Project → Provision MySQL
2. Click the MySQL service → Connect tab → copy `DATABASE_URL`

**Local MySQL:**
```bash
mysql -u root -e "CREATE DATABASE nc4july_festival CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
# DATABASE_URL=mysql://root:@localhost:3306/nc4july_festival
```

### Step 3 — Configure Environment

Create a `.env` file in the project root (never commit this file):

```env
DATABASE_URL=mysql://username:password@host/nc4july_festival?ssl={"rejectUnauthorized":true}
JWT_SECRET=generate-a-random-64-character-string-here
NODE_ENV=development
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4 — Install Dependencies

```bash
pnpm install
```

### Step 5 — Run Database Migrations

```bash
# Generate migration files from the schema
pnpm drizzle-kit generate

# Apply all migrations to your database
pnpm drizzle-kit migrate
```

This creates 5 migration sets covering:
1. Core users table
2. Full festival schema (events, parade entries, heritage, queens, committees, volunteers)
3. Live parade manager (parade_units, parade_checkpoints, parade_checkpoint_logs, parade_session)
4. Shriners fields (shriners entry type + temple-specific columns)
5. Marshal PINs table + lastResetAt on parade_session

### Step 6 — Seed Real Data

```bash
# Loads 80 committee members, 18 events, heritage timeline, 2 presidents
node seed.mjs

# Loads 4 Southport route checkpoints + 2026 parade session
node seed-checkpoints.mjs

# Loads all 101 real 2026 parade units from the official lineup
node seed-lineup.mjs
```

### Step 7 — Start the Development Server

```bash
pnpm dev
# → http://localhost:3000
```

### Step 8 — Make Yourself an Admin

After logging in for the first time via the Staff Portal, run this SQL in your database console:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Deployment

### Railway (Recommended — full Socket.IO support)
1. New Project → Deploy from GitHub → select `AIRealSolutions/NC4thofjuly`
2. Add MySQL plugin to the same project (Railway auto-sets `DATABASE_URL`)
3. Add environment variable: `JWT_SECRET` (generate with the command above)
4. Set `NODE_ENV=production`
5. Railway auto-detects `pnpm start` as the start command

### Vercel
- Works for the public site and admin portal
- **The Live Parade Manager (Socket.IO) requires Railway or Render** — Vercel serverless functions do not support persistent WebSocket connections
- Build command: `pnpm build`
- Start command: `pnpm start`
- Output directory: `dist`

---

## Parade Route (Southport, NC)

**Start:** Atlantic Ave & E Moore St
→ **West** on Moore St
→ **Right (North)** on Howe St
→ **Right** on Fodale Ave
→ Through nursing home parking lot
→ **Disband** near cemetery on Fodale Ave

**Staging Areas:**
| Zone | Who stages here |
|------|----------------|
| S Atlantic Ave | Shriners International units |
| N Atlantic Ave | Politicians / elected officials |
| E Moore St Left lane | General parade units |
| E Moore St Right lane | General parade units |
| Rhett St Left | Overflow / additional units |
| Rhett St Right | Overflow / additional units |

---

## Marshal PIN Setup (Before Parade Day)

1. Log in as admin → `/admin/marshal-pins`
2. Create a 4-digit PIN for each checkpoint station
3. Distribute PINs to assigned marshals before July 4th
4. On parade day, marshals open their station URL on their phone and enter the PIN to unlock the interface

---

## Running Tests

```bash
pnpm test
# 21 tests passing across 2 test files
```

---

## Project Structure

```
client/src/
  pages/           ← All page components
    admin/         ← Back-office admin portal pages
    parade/        ← Live parade manager pages
  components/      ← Shared UI components (AdminLayout, PublicLayout, MarshalPinGate)
  hooks/           ← useParadeSocket, useAuth
server/
  routers.ts       ← All tRPC procedures (events, parade, heritage, queens, admin, live, pins)
  db.ts            ← Database query helpers
  paradeSocket.ts  ← Socket.IO live parade server
drizzle/
  schema.ts        ← Full database schema
seed.mjs           ← Committee members, events, heritage data
seed-checkpoints.mjs ← Southport route checkpoints + parade session
seed-lineup.mjs    ← 101 real 2026 parade units
```

---

## Contact

**NC 4th of July Festival**
P.O. Box 11247, Southport NC 28461
patriot@nc4thofjuly.com · +1 910-457-5578
[nc4thofjuly.com](https://nc4thofjuly.com)
