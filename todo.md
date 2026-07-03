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

## Shriners Special Group
- [x] Add `shriners` entry type to parade schema (parade_entries + parade_units)
- [x] Add Shriner-specific fields: temple name, unit type, member count, vehicle count, special equipment
- [x] Create /parade/shriners public signup page with Shriners branding
- [x] Create /parade/shriners/renew returning Shriner renewal page
- [x] Add Shriners CTA section to the public Parade page
- [x] Add AdminShriners management page in back-office
- [x] Auto-assign Shriner units to S Atlantic Ave staging zone
- [x] Update Live Parade Board to highlight Shriner units distinctively (fez icon / gold accent)
- [x] Add Shriners tab to Admin Parade Entries page

## Marshal PIN System & Real Lineup (Phase 8)
- [x] Add marshal_pins table to schema (checkpoint_id, pin, label, active)
- [x] Add backend: set/verify PIN procedures in routers
- [x] Add MarshalPinGate component (PIN entry screen before checkpoint/marshal pages)
- [x] Wrap /parade/marshal and /parade/checkpoint/:id with PIN gate
- [x] Admin: manage marshal PINs at /admin/marshal-pins
- [x] Clear all placeholder parade_units from DB
- [x] Seed all 103 real units from ParadeLineupVersion5.0.xlsx
- [x] Map staging zones from Excel to DB staging_zone field
- [x] Remove OPEN placeholder units (100, 102) from DB — 101 real units in parade
- [x] Push to GitHub (completed via Management UI export)

## Parade Day Reset / Test Mode
- [x] Backend: parade.reset procedure — clears checkpoint logs, resets all unit statuses to 'staged', resets session to 'setup'
- [x] Admin UI: Reset for Test button in Parade Day Control header with confirmation dialog
- [x] Admin UI: Last reset timestamp banner shown after each reset
- [x] Broadcast reset event via Socket.IO (parade:reset + parade:state) so all connected clients refresh instantly
- [x] Unit names and order preserved — only statuses and logs cleared

## 6-Station Marshal Layout (Phase 9)
- [x] Add 6th checkpoint (Howe St & Moore St) to parade_checkpoints DB table (routeOrder=2)
- [x] Renumber all checkpoints: Start=1, Howe&Moore=2, Howe&West=3, Howe&9th=4, Howe&Fodale=5, Disband=6
- [x] Update marshal PINs in DB to match all 6 stations with correct checkpointIds
- [x] Update MarshalLogin.tsx STATIONS array with all 6 stations and correct routes
- [x] Verify all 6 stations display and route correctly

## Staging Marshal Portal (Phase 10)
- [x] Add Marshal Login quick-link button to Parade Day Control Center header
- [x] Add stagingZone field to marshal_pins table (migration applied)
- [x] Create Staging Marshal Portal page at /parade/staging/:zone (view units in zone, mark no-show, confirm present, add walk-up entries)
- [x] Add tRPC procedure: paradeLive.stagingAddUnit for walk-up entries
- [x] Extend MarshalPinGate to support stagingZone validation
- [x] Update AdminMarshalPins.tsx to include stagingZone field in create/edit dialog
- [x] Update MarshalLogin.tsx to include 6 staging zone stations (S Atlantic, N Atlantic, E Moore L/R, Rhett St L/R)
- [x] Seed 6 default staging zone PINs in DB (7001-7006)
- [x] Register /parade/staging/:zone route in App.tsx
- [x] TypeScript: 0 errors, 21 tests passing

## Staging Marshal Hardening (Future)
- [ ] Protect stagingAddUnit server-side: require verified marshal PIN/session token (currently client-gated only)
- [ ] Add explicit "Confirm Present" check-in action for units not yet confirmed (beyond restore-from-scratch)
- [ ] Harden walk-up unit-number assignment with DB-level locking to prevent race conditions
- [ ] Add vitest tests for stagingAddUnit auth, validation, and duplicate handling
