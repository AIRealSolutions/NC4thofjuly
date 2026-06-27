# NC 4th of July Festival — Project TODO

## Phase 2: Schema, Design System, Assets
- [x] Upload festival logo to static assets
- [x] Configure global design system (colors, fonts, CSS variables)
- [x] Define and apply full database schema (events, parade, signups, heritage, queens)
- [x] Run drizzle migration and apply SQL

## Phase 3: Public Pages
- [x] Public layout with top navigation and footer
- [x] Homepage with hero, countdown to July 4th, quick links, contact info (P.O. Box 11247, Southport NC 28461)
- [x] Festival Events page with full event listing and signup CTAs
- [x] Heritage page with visual timeline (1795–present), past presidents, committee members
- [x] Festival Queens page with gallery organized by year
- [x] General History page with full narrative

## Phase 4: Registration Pages
- [x] Parade page with new participant signup form
- [x] Parade page with returning participant renewal flow
- [x] Individual event signup pages (Beach Day, Children's Games, Arts & Crafts, Patriot's Ball, Naturalization, Fireworks, etc.)
- [x] Volunteer registration form
- [x] Committee Directory public page

## Phase 5: Back-Office Admin Portal
- [x] Admin login / auth guard on all /admin routes
- [x] Admin dashboard with stats (signups, parade entries, upcoming events, activity feed)
- [x] Event management (create, edit, delete events)
- [x] Parade entries management (view new + returning, approve/reject)
- [x] Event signups viewer per event
- [x] Heritage content editor (presidents, committee members, timeline)
- [x] Festival Queens content editor (add/edit queens)
- [x] Committee members directory management

## Phase 6: Polish & Tests
- [x] tRPC routers for all features
- [x] Vitest unit tests (21 tests passing)
- [x] Full navigation wiring across all pages
- [x] Seed 2026 committee data (80 members from official PDF)
- [x] Seed 18 festival events
- [x] Seed heritage timeline (15 entries, 1795–2026)
- [x] React deduplication fix (vite.config.ts)
- [x] Final checkpoint

## Live Parade Manager (Real-Time)
- [x] Extend DB schema: parade_units, parade_checkpoints, parade_checkpoint_logs, parade_session
- [x] WebSocket server (socket.io) wired into Express on /api/parade-socket
- [x] Seed 4 Southport route checkpoints (START/HOWE/FODALE/DISBAND)
- [x] Seed 2026 parade session (setup mode, 90s gap)
- [x] Admin: Parade Day Control Center (/admin/parade-day)
- [x] Marshal Start Line View (/parade/marshal) - confirm units marching
- [x] Marshal Checkpoint Station (/parade/checkpoint/:id) - log unit passes
- [x] Live Parade Board (/parade/live) - dark theme real-time board
- [x] Unit Participant Tracker (/parade/tracker) - search unit, see ETA
- [x] Real-time push via Socket.IO rooms (parade:year)
- [x] Auto-complete unit at final checkpoint (DISBAND)
- [x] Bulk import approved participants as units
- [x] Admin sidebar Live Parade Links section
- [x] Run tests and save checkpoint
