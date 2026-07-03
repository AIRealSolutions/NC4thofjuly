/**
 * Seed the 5 Southport parade route checkpoints for the NC 4th of July Festival.
 * Run: node seed-checkpoints.mjs
 *
 * Route: Atlantic Ave & E Moore St → west on Moore → right (north) on Howe St
 *        → Howe & West St → Howe & 9th St → right on Fodale Ave
 *        → Nursing Home Parking Lot (disband)
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const CHECKPOINTS = [
  {
    name: "Parade Start — Atlantic Ave & E Moore St",
    shortName: "START",
    description:
      "Parade begins heading west on Moore St. Marshal confirms each unit as it steps off.",
    streetAddress: "Atlantic Ave & E Moore St, Southport NC 28461",
    lat: "33.9185",
    lng: "-78.0158",
    routeOrder: 1,
  },
  {
    name: "Howe St & West St",
    shortName: "HOWE/WEST",
    description:
      "Units turning north on Howe St pass West Street. Marshal logs each unit as it passes.",
    streetAddress: "Howe St & West St, Southport NC 28461",
    lat: "33.9185",
    lng: "-78.0175",
    routeOrder: 2,
  },
  {
    name: "Howe St & 9th St",
    shortName: "HOWE/9TH",
    description:
      "Mid-route checkpoint on Howe St at 9th Street. Marshal logs each unit as it passes.",
    streetAddress: "Howe St & 9th St, Southport NC 28461",
    lat: "33.9170",
    lng: "-78.0175",
    routeOrder: 3,
  },
  {
    name: "Howe St & Fodale Ave — Turn Point",
    shortName: "HOWE/FODALE",
    description:
      "Units turn right onto Fodale Ave here. Marshal logs each unit making the turn.",
    streetAddress: "Howe St & Fodale Ave, Southport NC 28461",
    lat: "33.9162",
    lng: "-78.0175",
    routeOrder: 4,
  },
  {
    name: "Nursing Home Parking Lot — Parade End",
    shortName: "DISBAND",
    description:
      "Parade disbands in the nursing home parking lot off Fodale Ave. Final checkpoint — units are marked complete here.",
    streetAddress: "Nursing Home Parking Lot, Fodale Ave, Southport NC 28461",
    lat: "33.9155",
    lng: "-78.0175",
    routeOrder: 5,
  },
];

const conn = await mysql.createConnection(process.env.DATABASE_URL);

try {
  // Clear and re-seed all checkpoints
  const [existing] = await conn.execute("SELECT COUNT(*) as cnt FROM parade_checkpoints");
  console.log(`Existing checkpoints: ${existing[0].cnt} — clearing and re-seeding...`);

  await conn.execute("DELETE FROM parade_checkpoints");

  for (const cp of CHECKPOINTS) {
    await conn.execute(
      `INSERT INTO parade_checkpoints (name, shortName, description, streetAddress, lat, lng, routeOrder, isActive, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
      [cp.name, cp.shortName, cp.description, cp.streetAddress, cp.lat, cp.lng, cp.routeOrder]
    );
    console.log(`  ✅ [${cp.shortName}] ${cp.name}`);
  }

  // Seed the 2026 parade session if it doesn't exist
  const year = new Date().getFullYear();
  const [sessions] = await conn.execute(
    "SELECT id FROM parade_session WHERE year = ? LIMIT 1",
    [year]
  );
  if (sessions.length === 0) {
    await conn.execute(
      `INSERT INTO parade_session (year, status, totalUnits, averageGapSeconds, notes, createdAt, updatedAt)
       VALUES (?, 'setup', 101, 90, 'NC 4th of July Parade — Southport NC', NOW(), NOW())`,
      [year]
    );
    console.log(`\n✅ Created ${year} parade session (setup mode, 90s gap)`);
  } else {
    console.log(`\nℹ️  ${year} parade session already exists — skipped.`);
  }

  console.log("\n🎉 Checkpoint seed complete!");
  console.log("\nParade Route:");
  CHECKPOINTS.forEach((cp) =>
    console.log(`  ${cp.routeOrder}. [${cp.shortName}] ${cp.streetAddress}`)
  );
} finally {
  await conn.end();
  process.exit(0);
}
