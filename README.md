# NC 4th of July Festival — All-in-One Management Platform

> The official management platform for the **NC 4th of July Festival** in Southport, North Carolina — one of America's oldest Independence Day celebrations, dating to 1795.

**P.O. Box 11247, Southport NC 28461**

---

## Overview

This is a full-stack web application serving as the public portal, committee back-office, and live parade operations center for the NC 4th of July Festival (a 501(c)(3) organization).

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Tailwind CSS 4 |
| Backend | Node.js + Express + tRPC 11 |
| Database | MySQL (via Drizzle ORM) |
| Real-time | Socket.IO WebSockets |
| Auth | JWT session cookies + role-based access |
| Build | Vite 7 |
| Testing | Vitest |

---

## Features

### Public Site
- **Homepage** — Live countdown to July 4th, festival overview, quick links
- **Events Page** — All 18+ annual events with descriptions and signup CTAs
- **Parade Page** — Route info, new participant registration, returning participant renewal
- **Heritage Page** — Visual timeline (1795–present), past presidents, committee members
- **Festival Queens Gallery** — Historical queens organized by year
- **General History** — Full narrative of 230+ years of festival history
- **Volunteer Signup** — Public volunteer registration form
- **Committee Directory** — Public listing of all 80+ committee members by division

### Back-Office Admin Portal (`/admin`)
- **Dashboard** — Live stats: signups, parade entries, upcoming events, activity feed
- **Events Management** — Create, edit, delete festival events
- **Parade Entries** — Review new and returning parade participant applications
- **🎺 Parade Day Control Center** — Live parade operations (see below)
- **Event Signups** — View all registrations per event
- **Festival Queens Editor** — Add/edit historical queens with photos and bios
- **Committees Editor** — Manage all committee member records
- **Heritage Editor** — Edit timeline entries, presidents, and committee history

### 🎺 Live Parade Manager (Real-Time)
The parade operations system uses Socket.IO for real-time coordination across all marshal devices simultaneously.

| View | URL | Who Uses It |
|---|---|---|
| Live Board | `/parade/live` | All marshals — full unit status display |
| Start Line Marshal | `/parade/marshal` | Marshal at E Moore & Atlantic — confirms each unit |
| Checkpoint Stations | `/parade/checkpoint/1-4` | Marshals at Howe, Fodale, Disband — log unit passes |
| Unit Tracker | `/parade/tracker` | Participants — search their unit, see ETA |
| Admin Control Center | `/admin/parade-day` | Admin — session control, unit management, import |

**Southport Parade Route Checkpoints:**
1. **START** — E Moore St & Atlantic Ave *(parade begins)*
2. **HOWE** — Moore St & Howe St *(right turn)*
3. **FODALE** — Howe St & Fodale Ave *(right turn)*
4. **DISBAND** — Fodale Ave / Nursing Home *(units complete)*

**Staging Areas:**
- S Atlantic Ave — Shriners
- N Atlantic Ave — Politicians
- E Moore St — Double lanes (left & right)
- Rhett St — Left & right staging

---

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm 10+
- MySQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/AIRealSolutions/NC4thofjuly.git
cd NC4thofjuly

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Run database migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Seed initial data
node seed.mjs
node seed-checkpoints.mjs

# Start development server
pnpm dev
```

### Environment Variables

```env
DATABASE_URL=mysql://user:password@host:3306/nc4july
JWT_SECRET=your-secret-key
```

---

## Project Structure

```
client/
  src/
    pages/          ← All page components
      admin/        ← Back-office admin pages
      parade/       ← Live parade manager views
    components/     ← Reusable UI components
    hooks/          ← Custom React hooks (incl. useParadeSocket)
drizzle/
  schema.ts         ← Full database schema
server/
  routers.ts        ← All tRPC API procedures
  db.ts             ← Database query helpers
  paradeSocket.ts   ← Socket.IO live parade server
shared/             ← Shared types and constants
seed.mjs            ← Database seed (events, committees, heritage)
seed-checkpoints.mjs ← Parade route checkpoint seed
```

---

## Running Tests

```bash
pnpm test
```

21 tests covering auth, events, parade, heritage, queens, committees, and admin procedures.

---

## Deployment

This application is deployed on [Manus](https://manus.im) with built-in hosting, database, and CI/CD. For self-hosting, the application builds to a single Node.js process:

```bash
pnpm build
pnpm start
```

---

## License

© NC 4th of July Festival Committee. All rights reserved.

This software is proprietary and maintained by [AI Real Solutions](https://github.com/AIRealSolutions) for the NC 4th of July Festival, a 501(c)(3) nonprofit organization.
