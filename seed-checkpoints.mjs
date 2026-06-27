/**
 * Seed the Southport NC parade route checkpoints.
 *
 * Route:
 *   START:  E Moore St & Atlantic Ave (Staging area)
 *   CP 1:   Moore St & Howe St (turn right onto Howe)
 *   CP 2:   Howe St & Fodale Ave (turn right into nursing home / disbanding)
 *   END:    Fodale Ave / Nursing Home (disband)
 *
 * Staging zones (not checkpoints, but referenced in unit data):
 *   - S Atlantic Ave (Shriners)
 *   - N Atlantic Ave (Politicians)
 *   - E Moore St Left lane
 *   - E Moore St Right lane
 *   - Rhett St Left / Right
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const checkpoints = [
  {
    name: "Start Line — E Moore & Atlantic",
    shortName: "START",
    description: "Parade start line. Marshal confirms each unit begins marching.",
    streetAddress: "E Moore St & Atlantic Ave, Southport NC",
    lat: "33.9185",
    lng: "-78.0158",
    routeOrder: 1,
  },
  {
    name: "Moore & Howe — Right Turn",
    shortName: "HOWE",
    description: "Units turn right onto Howe St. Marshal logs each unit passing.",
    streetAddress: "Moore St & Howe St, Southport NC",
    lat: "33.9185",
    lng: "-78.0175",
    routeOrder: 2,
  },
  {
    name: "Howe & Fodale — Right Turn",
    shortName: "FODALE",
    description: "Units turn right onto Fodale Ave toward the nursing home.",
    streetAddress: "Howe St & Fodale Ave, Southport NC",
    lat: "33.9162",
    lng: "-78.0175",
    routeOrder: 3,
  },
  {
    name: "Disbanding — Nursing Home",
    shortName: "DISBAND",
    description: "Final checkpoint. Units disband here. Logging a unit at this checkpoint marks it completed.",
    streetAddress: "Fodale Ave / Nursing Home, Southport NC",
    lat: "33.9155",
    lng: "-78.0175",
    routeOrder: 4,
  },
];

// Check if already seeded
const [existing] = await conn.execute("SELECT COUNT(*) as cnt FROM parade_checkpoints");
if (existing[0].cnt > 0) {
  console.log(`Checkpoints already seeded (${existing[0].cnt} found). Skipping.`);
  await conn.end();
  process.exit(0);
}

for (const cp of checkpoints) {
  await conn.execute(
    `INSERT INTO parade_checkpoints (name, shortName, description, streetAddress, lat, lng, routeOrder, isActive, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
    [cp.name, cp.shortName, cp.description, cp.streetAddress, cp.lat, cp.lng, cp.routeOrder]
  );
  console.log(`✓ Checkpoint seeded: ${cp.shortName} — ${cp.name}`);
}

// Also seed a default parade session for the current year
const year = new Date().getFullYear();
const [sessionCheck] = await conn.execute(
  "SELECT COUNT(*) as cnt FROM parade_session WHERE year = ?",
  [year]
);
if (sessionCheck[0].cnt === 0) {
  await conn.execute(
    `INSERT INTO parade_session (year, status, averageGapSeconds, createdAt, updatedAt)
     VALUES (?, 'setup', 90, NOW(), NOW())`,
    [year]
  );
  console.log(`✓ Parade session seeded for ${year} (status: setup, gap: 90s)`);
}

await conn.end();
console.log("\n✅ Checkpoint seed complete!");
