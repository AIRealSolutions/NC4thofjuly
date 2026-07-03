/**
 * Seed the 2026 parade lineup from ParadeLineupVersion5.0.xlsx (real data)
 * Clears existing 2026 parade_units and inserts the real 103-unit lineup.
 */
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

// Real data extracted from ParadeLineupVersion5.0.xlsx (sheet: 6_30_2025)
// [unitNumber, entryType, unitName, stagingZone]
const LINEUP = [
  [1, "vehicle", "Southport Police Department", "Moore-R"],
  [2, "vehicle", "Brunswick County Sheriff's Office", "N.Atlantic-R"],
  [3, "vehicle", "Southport Police- Salute to Veterans Car", "Moore-R"],
  [4, "walking_group", "South Brunswick High School JROTC Color Guard", "Moore-R"],
  [5, "marching_band", "South Brunswick High School Marching Band", "Moore-R"],
  [6, "vehicle", "Southport Fire Department", "Moore-R"],
  [7, "vehicle", "NC State Highway Patrol", "N.Atlantic-R"],
  [8, "vehicle", "Brunswick County Commissioner - Randy Thompson", "N.Atlantic-R"],
  [9, "vehicle", "Brunswick County Commissioner - Pat Sykes", "N.Atlantic-R"],
  [10, "vehicle", "Brunswick County Commissioner - Frank Williams", "N.Atlantic-R"],
  [11, "vehicle", "Brunswick County Commissioner - Mike Forte", "N.Atlantic-R"],
  [12, "vehicle", "Brunswick County Commissioner - Brian Watts", "N.Atlantic-R"],
  [13, "vehicle", "Southport Mayor - Joseph E. Hatem Jr.", "N.Atlantic-R"],
  [14, "vehicle", "NC 4th of July Festival Queen - Ella Sasser", "N.Atlantic-R"],
  [15, "vehicle", "NC 4th of July Festival Queen - Mia Sasser", "N.Atlantic-R"],
  [16, "vehicle", "NC 4th of July Festival Queen - Avery Sasser", "N.Atlantic-R"],
  [17, "vehicle", "NC 4th of July Festival Queen - Khloe Sasser", "N.Atlantic-R"],
  [18, "vehicle", "NC 4th of July Festival Queen - Lily Sasser", "N.Atlantic-R"],
  [19, "vehicle", "NC 4th of July Festival Queen - Mila Sasser", "N.Atlantic-R"],
  [20, "vehicle", "NC 4th of July Festival Queen - Savannah Sasser", "N.Atlantic-R"],
  [21, "vehicle", "NC 4th of July Festival Queen - Sophia Sasser", "N.Atlantic-R"],
  [22, "vehicle", "NC 4th of July Festival Queen - Zoe Sasser", "N.Atlantic-R"],
  [23, "vehicle", "NC 4th of July Festival Queen - Ava Sasser", "N.Atlantic-R"],
  [24, "shriners", "Sudan Shriners - Patrol Unit", "S.Atlantic-R"],
  [25, "shriners", "Sudan Shriners - Clowns", "S.Atlantic-R"],
  [26, "shriners", "Sudan Shriners - Mini Cars", "S.Atlantic-R"],
  [27, "shriners", "Sudan Shriners - Motorcycles", "S.Atlantic-R"],
  [28, "shriners", "Sudan Shriners - Color Guard", "S.Atlantic-R"],
  [29, "float", "Town of Boiling Spring Lakes - Mayor Jeff Winecoff", "N.Rhett-R"],
  [30, "vehicle", "Oak Island Police Department - Chief Wally Walters", "N.Atlantic-L"],
  [31, "float", "Town of Leland - Mayor Brenda Bozeman", "N.Rhett-R"],
  [32, "float", "Town of Oak Island - Mayor Ken Thomas", "N.Rhett-R"],
  [33, "float", "Town of Bolivia - Mayor Cynthia Erickson", "N.Rhett-R"],
  [34, "float", "Town of Belville - Mayor Mike Allen", "N.Rhett-R"],
  [35, "float", "Town of Navassa - Mayor Eulis Willis", "N.Rhett-R"],
  [36, "float", "Town of Calabash - Mayor Rodney Hucks", "N.Rhett-R"],
  [37, "float", "Town of Sunset Beach - Mayor Tracey Doulas", "N.Rhett-R"],
  [38, "float", "Town of Northwest - Mayor Chadwick Benton", "N.Rhett-R"],
  [39, "float", "Town of Boiling Spring Lakes - Mayor Jeff Winecoff", "N.Rhett-R"],
  [40, "float", "Cape Fear Fitness", "N.Rhett-R"],
  [41, "vehicle", "Port City Rollerz", "Moore-R"],
  [42, "vehicle", "Town of Caswell Beach - Mayor George Kassler", "N.Atlantic-L"],
  [43, "vehicle", "Oak Island Police Department - Officer Randy Shepherd", "N.Atlantic-L"],
  [44, "shriners", "Sudan Dare Devils", "S.Atlantic-R"],
  [45, "vehicle", "NC 4th of July Festival Chairman - Hugh Fosbury", "N.Atlantic-L"],
  [46, "float", "Southport Lion's Club", "N.Rhett-R"],
  [47, "vehicle", "Tree House Customs", "N.Rhett-L"],
  [48, "vehicle", "Jamerson Garage Doors", "N.Rhett-L"],
  [49, "shriners", "Sudan Drum & Bugle Corps", "S.Atlantic-L"],
  [50, "vehicle", "Brunswick Community College", "N.Rhett-L"],
  [51, "vehicle", "Brunswick County Habitat for Humanity", "Moore-L"],
  [52, "float", "Brunswick Arts Council", "N.Rhett-R"],
  [53, "walking_group", "F3 BruCo", "Moore-L"],
  [54, "float", "Rotary District 7730", "N.Rhett-R"],
  [55, "vehicle", "Brunswick Electric", "Moore-L"],
  [56, "vehicle", "Sunspace by Eastern Sunrooms", "Moore-R"],
  [57, "shriners", "Sudan Hillbillies", "S.Atlantic-R"],
  [58, "vehicle", "Lower Cape Fear Lifecare", "N.Rhett-L"],
  [59, "vehicle", "Southport Yacht Club", "Kingsley"],
  [60, "shriners", "Sudan Van Patrol", "S.Atlantic-L"],
  [61, "vehicle", "Copper By George", "N.Rhett-L"],
  [62, "vehicle", "Colonel Sherrill Stevens, US Army Retired / Donatelli Group", "Nash-L"],
  [63, "float", "Southport Baptist Church", "N.Rhett-R"],
  [64, "float", "Intracoastal Realty - Bald Head Island Limited", "N.Rhett-R"],
  [65, "vehicle", "Brooklynne Hewett - Mount Pleasant Independence Day Jr Miss", "N.Atlantic-L"],
  [66, "vehicle", "World on the Fly Travel", "N.Rhett-L"],
  [67, "vehicle", "Chelle's Pageant Queens", "Moore-L"],
  [68, "vehicle", "Travel with Chy", "N.Rhett-L"],
  [69, "float", "Cape Fear Radio", "N.Rhett-R"],
  [70, "float", "Downtown Southport Inc", "N.Rhett-R"],
  [71, "vehicle", "St James Fire Department", "S.Rhett-R"],
  [72, "float", "Murphys Boutique", "N.Rhett-R"],
  [73, "float", "Brunswick County Republican Women & NC Office of the State Auditor - Dave Boliek", "N.Rhett-R"],
  [74, "shriners", "Sudan Pirates Parade Unit", "S.Atlantic-R"],
  [75, "vehicle", "Fire Department City of New York Retiree's Association of NC/SC", "S.Rhett-R"],
  [76, "vehicle", "Manning's Pest Control", "Kingsley"],
  [77, "vehicle", "The Local Pro LLC", "Moore-R"],
  [78, "vehicle", "Willis Roofing", "Moore-R"],
  [79, "vehicle", "Southport Imports LLC", "Moore-L"],
  [80, "vehicle", "North Carolina Forest Service", "N.Rhett-L"],
  [81, "vehicle", "Puroclean of the Cape Fear", "N.Rhett-L"],
  [82, "vehicle", "Southport Woman's Club", "N.Rhett-L"],
  [83, "vehicle", "Childcare Network", "Moore-L"],
  [84, "vehicle", "Flip Tide Cleaning", "N.Rhett-L"],
  [85, "vehicle", "Christian Recovery Centers", "N.Rhett-L"],
  [86, "vehicle", "St. James Remodeling", "N.Rhett-L"],
  [87, "vehicle", "Brooke Lewis - Miss Princess of Carolina Beach", "N.Atlantic-L"],
  [88, "vehicle", "Kozy Bean Cafe", "N.Rhett-L"],
  [89, "vehicle", "Tin Can Sailors", "Moore-L"],
  [90, "vehicle", "Patrick Young - personal entry", "Moore-R"],
  [91, "vehicle", "Curators of the Seven", "N.Rhett-L"],
  [92, "vehicle", "Faith Baptist Church", "Moore-R"],
  [93, "vehicle", "Saylor Young - Carolina Beauty Elite Pageant", "N.Atlantic-L"],
  [94, "vehicle", "Cape Fear Yacht Club Junior Sailing", "Kingsley"],
  [95, "vehicle", "Mike Stidham Yachts & Brokerage", "Kingsley"],
  [96, "vehicle", "Botero carts", "Moore-R"],
  [97, "vehicle", "Emma Steele - North Carolina Azalea Festival", "N.Atlantic-L"],
  [98, "vehicle", "Oak Island Fitness", "Kingsley"],
  [99, "vehicle", "Town Creek Dixie Youth Softball", "Moore-R"],
  // [100, "other", "OPEN", "Open"],  // Placeholder — skipped
  [101, "vehicle", "UPWA Wrestling", "N.Atlantic-L"],
  // [102, "other", "OPEN", "Open"],  // Placeholder — skipped
  [103, "float", "N.C. Fourth of July Festival Volunteers", "N.Rhett-R"],
];

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const conn = await mysql.createConnection(DB_URL);

try {
  // Clear existing 2026 parade units
  const [deleted] = await conn.execute("DELETE FROM parade_units WHERE year = 2026");
  console.log(`Cleared existing 2026 units: ${deleted.affectedRows} rows deleted`);

  // Insert all real lineup units
  let inserted = 0;
  for (const [unitNumber, entryType, unitName, stagingZone] of LINEUP) {
    const notes = entryType === "shriners" ? "Shriners International" : null;
    await conn.execute(
      `INSERT INTO parade_units (year, unitNumber, unitName, entryType, stagingZone, notes, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 'staged', NOW(), NOW())`,
      [2026, unitNumber, unitName, entryType, stagingZone || null, notes]
    );
    inserted++;
    if (inserted % 20 === 0) process.stdout.write(`  ${inserted}/${LINEUP.length} inserted...\n`);
  }

  // Update session total units
  await conn.execute(
    "UPDATE parade_session SET totalUnits = ? WHERE year = 2026",
    [LINEUP.length]
  );

  console.log(`\n✅ Seeded ${inserted} real parade units for 2026`);
  const shriners = LINEUP.filter(u => u[1] === 'shriners').length;
  const bands = LINEUP.filter(u => u[1] === 'marching_band').length;
  const floats = LINEUP.filter(u => u[1] === 'float').length;
  const vehicles = LINEUP.filter(u => u[1] === 'vehicle').length;
  const walking = LINEUP.filter(u => u[1] === 'walking_group').length;
  const open = LINEUP.filter(u => u[2] === 'OPEN').length;
  console.log(`   🎪 Shriners: ${shriners} units (S Atlantic staging)`);
  console.log(`   🎺 Marching Bands: ${bands} units`);
  console.log(`   🎠 Floats: ${floats} units`);
  console.log(`   🚗 Vehicles: ${vehicles} units`);
  console.log(`   🚶 Walking Groups: ${walking} units`);
  console.log(`   📋 Open Slots: ${open}`);

} finally {
  await conn.end();
}
