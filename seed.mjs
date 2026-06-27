import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// ── Import tables ──────────────────────────────────────────────────────────────
// We use raw SQL inserts to avoid importing TS schema in ESM context
async function run() {
  console.log("🌱 Seeding NC 4th of July Festival database...");

  // ── Committee Members ────────────────────────────────────────────────────────
  const members = [
    // Executive Officers
    { name: "Hugh Fosbury", role: "President", committee: "Executive Officers", email: "hugh.fosbury@itrip.net", phone: "919-522-7590", yearStart: 2026, isActive: true, sortOrder: 1 },
    { name: "Brett McKeithan", role: "Vice President", committee: "Executive Officers", email: "r87201@yahoo.com", phone: "910-470-6280", yearStart: 2026, isActive: true, sortOrder: 2 },
    { name: "Lucinda Arnold", role: "Past President", committee: "Executive Officers", email: "coastalpaintingnc@yahoo.com", phone: "716-474-0016", yearStart: 2026, isActive: true, sortOrder: 3 },
    // Government Division
    { name: "Rebecca Kelley", role: "City of Southport Liaison", committee: "Government Division", email: "rkelley@cityofsouthport.gov", phone: "910-443-0371", yearStart: 2026, isActive: true, sortOrder: 10 },
    { name: "Heather O'Brien", role: "Town of Oak Island Liaison", committee: "Government Division", email: "hobrien@oakislandnc.com", phone: "910-201-8067", yearStart: 2026, isActive: true, sortOrder: 11 },
    { name: "Elizabeth Neumann", role: "Sunny Point Liaison", committee: "Government Division", email: "elizabeth.a.neumann5.civ@army.mil", phone: "910-457-8003", yearStart: 2026, isActive: true, sortOrder: 12 },
    { name: "Sen Chief Adkisson", role: "Coast Guard Liaison", committee: "Government Division", email: "Logan.T.Adkisson@uscg.mil", phone: "304-952-1212", yearStart: 2026, isActive: true, sortOrder: 13 },
    { name: "Capt. Angela Kreuser", role: "Civil Air Patrol Liaison", committee: "Government Division", email: "Angela.Kreuser@ncwgcap.org", phone: "262-914-6078", yearStart: 2026, isActive: true, sortOrder: 14 },
    // Security Division
    { name: "Todd Coring", role: "Security Division Chair", committee: "Security Division", email: "tcoring@cityofsouthport.gov", phone: "910-880-4939", yearStart: 2026, isActive: true, sortOrder: 20 },
    { name: "Thomas Moore", role: "Southport Police Department", committee: "Security Division", email: "tmoore@cityofsouthport.gov", phone: "910-367-0871", yearStart: 2026, isActive: true, sortOrder: 21 },
    { name: "Richard Merritt", role: "GRL Security and Staffing", committee: "Security Division", email: "rmerritt@grlmgmt.com", phone: "828-553-8179", yearStart: 2026, isActive: true, sortOrder: 22 },
    // Publicity Division
    { name: "Cindy Nimmich", role: "Publicity Division Chair", committee: "Publicity Division", email: "cjnim@yahoo.com", phone: "305-849-0749", yearStart: 2026, isActive: true, sortOrder: 30 },
    { name: "Allayna Taylor", role: "Media & Public Relations / Events Calendar", committee: "Publicity Division", email: "ataylor@cityofsouthport.gov", phone: "910-368-5055", yearStart: 2026, isActive: true, sortOrder: 31 },
    { name: "Zeb Starnes", role: "Media & Public Relations", committee: "Publicity Division", email: "zebstarnes11@gmail.com", phone: "", yearStart: 2026, isActive: true, sortOrder: 32 },
    { name: "Gretchen Kari", role: "Media & Public Relations", committee: "Publicity Division", email: "gretayvette@gmail.com", phone: "", yearStart: 2026, isActive: true, sortOrder: 33 },
    { name: "Kathy Blazek", role: "Media & Public Relations", committee: "Publicity Division", email: "Kmblazz@gmail.com", phone: "", yearStart: 2026, isActive: true, sortOrder: 34 },
    { name: "Mark Vallaster", role: "Media & Public Relations", committee: "Publicity Division", email: "markvallaster@gmail.com", phone: "", yearStart: 2026, isActive: true, sortOrder: 35 },
    { name: "Trisha Howarth", role: "Media & Public Relations", committee: "Publicity Division", email: "thowarth@intracoastalrealty.com", phone: "", yearStart: 2026, isActive: true, sortOrder: 36 },
    { name: "Lisa Fosbury", role: "Media & Public Relations", committee: "Publicity Division", email: "Lmfosbury@aol.com", phone: "", yearStart: 2026, isActive: true, sortOrder: 37 },
    { name: "Linda Pukenas", role: "Media & Public Relations", committee: "Publicity Division", email: "Linda@SeaGlassRealty.com", phone: "", yearStart: 2026, isActive: true, sortOrder: 38 },
    { name: "Chris Cadman", role: "Cape Fear Radio", committee: "Publicity Division", email: "ChrisC@capefearradio.com", phone: "910-269-8688", yearStart: 2026, isActive: true, sortOrder: 39 },
    { name: "Gianna Vassallo", role: "Events Calendar / Map", committee: "Publicity Division", email: "gvassallo@cityofsouthport.gov", phone: "910-457-7927", yearStart: 2026, isActive: true, sortOrder: 40 },
    { name: "Harper Sedlock", role: "Events Calendar / Map", committee: "Publicity Division", email: "hsedlock@cityofsouthport.gov", phone: "910-457-7927", yearStart: 2026, isActive: true, sortOrder: 41 },
    // Finance Division
    { name: "Charles Drew", role: "Finance Division Chair", committee: "Finance Division", email: "cdrew@cityofsouthport.gov", phone: "910-457-7915", yearStart: 2026, isActive: true, sortOrder: 50 },
    { name: "Marion Martin", role: "Arts & Crafts / Pancake Breakfast", committee: "Finance Division", email: "mmartin0339@yahoo.com", phone: "910-620-2308", yearStart: 2026, isActive: true, sortOrder: 51 },
    { name: "Karl Eiken", role: "Concessions & Ice", committee: "Finance Division", email: "karl@salesgeekcsg.com", phone: "917-345-3405", yearStart: 2026, isActive: true, sortOrder: 52 },
    { name: "Karen Reid", role: "Dog Marshal Contest", committee: "Finance Division", email: "dtrriders6@bellsouth.net", phone: "", yearStart: 2026, isActive: true, sortOrder: 53 },
    { name: "Mimi Vargo", role: "Dog Marshal Contest", committee: "Finance Division", email: "mimi.vargo@gmail.com", phone: "", yearStart: 2026, isActive: true, sortOrder: 54 },
    { name: "Seth Robbins", role: "Freedom Run", committee: "Finance Division", email: "sethrobbinsrealtor@gmail.com", phone: "910-279-1934", yearStart: 2026, isActive: true, sortOrder: 55 },
    { name: "Jill Stenson", role: "Shrimparoo", committee: "Finance Division", email: "stensonj29@gmail.com", phone: "", yearStart: 2026, isActive: true, sortOrder: 56 },
    { name: "Kiki Herr", role: "Patriots Ball", committee: "Finance Division", email: "kikileeherr@gmail.com", phone: "", yearStart: 2026, isActive: true, sortOrder: 57 },
    { name: "Karen Martin", role: "Patriots Ball / Festival Signage / VIP Dignitary List", committee: "Finance Division", email: "kmartin@cityofsouthport.gov", phone: "910-457-0665", yearStart: 2026, isActive: true, sortOrder: 58 },
    { name: "Alice Gardiner", role: "Independence Eve Colonial Dinner", committee: "Finance Division", email: "awlgardiner@gmail.com", phone: "", yearStart: 2026, isActive: true, sortOrder: 59 },
    { name: "Mike Bearden", role: "Lion's Club Boat Raffle", committee: "Finance Division", email: "mandmbearden@gmail.com", phone: "", yearStart: 2026, isActive: true, sortOrder: 60 },
    { name: "Andrew Broshe", role: "Merchandise / Volunteer Coordinator", committee: "Finance Division", email: "andrew@madenewinteriors.com", phone: "949-429-9921", yearStart: 2026, isActive: true, sortOrder: 61 },
    { name: "Ricky Evans", role: "Artwork", committee: "Finance Division", email: "ricky@rickyevansgallery.com", phone: "910-457-1129", yearStart: 2026, isActive: true, sortOrder: 62 },
    { name: "James Boatwright", role: "OKI Loggerheads Baseball", committee: "Finance Division", email: "jgboatwright3@gmail.com", phone: "702-888-0014", yearStart: 2026, isActive: true, sortOrder: 63 },
    { name: "Sarah Hunter", role: "Sponsorships / Parade Floats / VIP Cars", committee: "Finance Division", email: "shunter@intracoastalrealty.com", phone: "336-971-9294", yearStart: 2026, isActive: true, sortOrder: 64 },
    { name: "Rachel Obermeier", role: "VIP Sponsor Breakfast / Hospitality HQ", committee: "Finance Division", email: "kisber.obermeier@gmail.com", phone: "615-630-9942", yearStart: 2026, isActive: true, sortOrder: 65 },
    // Logistics Division
    { name: "Peter Shannon", role: "Logistics Division Chair", committee: "Logistics Division", email: "pete.shannon@comcast.net", phone: "410-474-6762", yearStart: 2026, isActive: true, sortOrder: 70 },
    { name: "Jessie Labell", role: "Accommodations / Non-profit Coordinator", committee: "Logistics Division", email: "jlabell@cityofsouthport.gov", phone: "910-457-7927", yearStart: 2026, isActive: true, sortOrder: 71 },
    { name: "Janice Shannon", role: "Hospitality Headquarters", committee: "Logistics Division", email: "janice_shannon@comcast.net", phone: "", yearStart: 2026, isActive: true, sortOrder: 72 },
    { name: "Jean Sessa", role: "Hospitality Headquarters", committee: "Logistics Division", email: "jeansessa1234@gmail.com", phone: "", yearStart: 2026, isActive: true, sortOrder: 73 },
    { name: "Rick Sessa", role: "Transportation (Shuttling)", committee: "Logistics Division", email: "rick.jeanss@gmail.com", phone: "973-714-5253", yearStart: 2026, isActive: true, sortOrder: 74 },
    { name: "Keesha Starr", role: "VIP Reviewing Stand / Events Division Chair", committee: "Logistics Division", email: "keesha@kstarrcoaching.com", phone: "910-795-5664", yearStart: 2026, isActive: true, sortOrder: 75 },
    { name: "Tish Hatem", role: "Decorations / Southport Garden Club", committee: "Logistics Division", email: "tishhatem@yahoo.com", phone: "910-367-8839", yearStart: 2026, isActive: true, sortOrder: 76 },
    // Events Division
    { name: "Peggy Lilly", role: "Car Show", committee: "Events Division", email: "peggy.lily@gmail.com", phone: "703-409-6444", yearStart: 2026, isActive: true, sortOrder: 80 },
    { name: "Mary Beth Livers", role: "Children's Entertainment / A Pirates Life for Me / Kid Zone", committee: "Events Division", email: "mblivers@gmail.com", phone: "910-448-1016", yearStart: 2026, isActive: true, sortOrder: 81 },
    { name: "Amy Neeley", role: "American Red Cross", committee: "Events Division", email: "arcn30@yahoo.com", phone: "423-321-2572", yearStart: 2026, isActive: true, sortOrder: 82 },
    { name: "Ryan Gordon", role: "Beach Day", committee: "Events Division", email: "gordon@oakislandnc.com", phone: "910-278-4747", yearStart: 2026, isActive: true, sortOrder: 83 },
    { name: "Maria Horton", role: "Bellamy Joyner Post 213", committee: "Events Division", email: "mchornton@yahoo.com", phone: "703-969-2382", yearStart: 2026, isActive: true, sortOrder: 84 },
    { name: "Deb Alt", role: "Chapel of the Cross Tours / Freedom Flotilla", committee: "Events Division", email: "debann.alt@gmail.com", phone: "703-314-8986", yearStart: 2026, isActive: true, sortOrder: 85 },
    { name: "Heather Hemphill", role: "Children's Games", committee: "Events Division", email: "hhemphill@cityofsouthport.gov", phone: "910-457-7810", yearStart: 2026, isActive: true, sortOrder: 86 },
    { name: "Shannon Walker", role: "Maritime Museum / Reenactment of 1st 4th", committee: "Events Division", email: "shannon.walker@ncdcr.gov", phone: "910-477-5153", yearStart: 2026, isActive: true, sortOrder: 87 },
    { name: "Mary Ellen Poole", role: "Old Jail Tours / Naturalization Ceremony", committee: "Events Division", email: "mssouthport@aol.com", phone: "910-523-1361", yearStart: 2026, isActive: true, sortOrder: 88 },
    { name: "Chris Sutherland", role: "Summer Regional Art Show", committee: "Events Division", email: "FSGQuestions@gmail.com", phone: "910-457-5450", yearStart: 2026, isActive: true, sortOrder: 89 },
    { name: "Lauryn Zepeda", role: "Clicks of Confidence", committee: "Events Division", email: "laurynz@live.com", phone: "910-269-9369", yearStart: 2026, isActive: true, sortOrder: 90 },
    { name: "Brittney Humphrey", role: "Humphrey Petting Zoo", committee: "Events Division", email: "humphreyhoneybunnyfarm@gmail.com", phone: "910-548-1540", yearStart: 2026, isActive: true, sortOrder: 91 },
    { name: "Donald Brower", role: "Wrestling", committee: "Events Division", email: "upwa_owner@yahoo.com", phone: "973-796-0141", yearStart: 2026, isActive: true, sortOrder: 92 },
    { name: "John Keiffer", role: "Entertainment, Main Stage", committee: "Events Division", email: "osakeifi@gmail.com", phone: "240-401-7191", yearStart: 2026, isActive: true, sortOrder: 93 },
    { name: "Cameron Smith", role: "Entertainment, Main Stage", committee: "Events Division", email: "", phone: "910-443-5080", yearStart: 2026, isActive: true, sortOrder: 94 },
    // Ceremonies, Parade & Fireworks
    { name: "Lucinda Arnold", role: "Fireworks Chair", committee: "Ceremonies, Parade & Fireworks", email: "coastalpaintingnc@yahoo.com", phone: "716-474-0016", yearStart: 2026, isActive: true, sortOrder: 100 },
    { name: "Joe Nimmich", role: "Barge", committee: "Ceremonies, Parade & Fireworks", email: "jlnuscy@yahoo.com", phone: "443-995-7481", yearStart: 2026, isActive: true, sortOrder: 101 },
    { name: "Sandy Kennedy", role: "Flag Raising Ceremony", committee: "Ceremonies, Parade & Fireworks", email: "sandyannek@ec.rr.com", phone: "910-547-6200", yearStart: 2026, isActive: true, sortOrder: 102 },
    { name: "Dave Holly", role: "Flag Retirement Ceremony", committee: "Ceremonies, Parade & Fireworks", email: "daveholly9@ymail.com", phone: "908-601-2089", yearStart: 2026, isActive: true, sortOrder: 103 },
    { name: "John Bates", role: "Freedom Flotilla", committee: "Ceremonies, Parade & Fireworks", email: "straycadf713@gmail.com", phone: "", yearStart: 2026, isActive: true, sortOrder: 104 },
    { name: "Madison Drew", role: "We the People Gospel Fest", committee: "Ceremonies, Parade & Fireworks", email: "mdrew@cityofsouthport.gov", phone: "910-368-6712", yearStart: 2026, isActive: true, sortOrder: 105 },
    { name: "Lora Sharkey", role: "Kayak/SUP Parade", committee: "Ceremonies, Parade & Fireworks", email: "lsharkey63@gmail.com", phone: "703-946-5333", yearStart: 2026, isActive: true, sortOrder: 106 },
    { name: "Rick Mitchell", role: "Military Static Display", committee: "Ceremonies, Parade & Fireworks", email: "Rickmitchell49@gmail.com", phone: "919-810-4535", yearStart: 2026, isActive: true, sortOrder: 107 },
    { name: "Randy Jones", role: "Naturalization Ceremony", committee: "Ceremonies, Parade & Fireworks", email: "drj1964@att.net", phone: "", yearStart: 2026, isActive: true, sortOrder: 108 },
    { name: "Tom Rabon", role: "Naturalization Ceremony", committee: "Ceremonies, Parade & Fireworks", email: "tomrabon@ne.com", phone: "", yearStart: 2026, isActive: true, sortOrder: 109 },
    { name: "Mary Sands", role: "D.A.R. Refreshments", committee: "Ceremonies, Parade & Fireworks", email: "sandsdarmary@gmail.com", phone: "910-933-3413", yearStart: 2026, isActive: true, sortOrder: 110 },
    { name: "Duncan Hilburn", role: "Parade Chair", committee: "Ceremonies, Parade & Fireworks", email: "duncan@bpcpas.com", phone: "910-457-9455", yearStart: 2026, isActive: true, sortOrder: 111 },
    { name: "Marc Spencer", role: "School Bands / Shriners", committee: "Ceremonies, Parade & Fireworks", email: "marcspencer28461@gmail.com", phone: "910-363-6147", yearStart: 2026, isActive: true, sortOrder: 112 },
    { name: "Dave Lippincott", role: "Radio Operators", committee: "Ceremonies, Parade & Fireworks", email: "davidvl@sprynet.com", phone: "910-253-9913", yearStart: 2026, isActive: true, sortOrder: 113 },
    // Miss 4th of July Pageant
    { name: "Trisha Howarth", role: "Miss 4th of July Pageant", committee: "Miss 4th of July Pageant", email: "thowarth@intracoastalrealty.com", phone: "", yearStart: 2026, isActive: true, sortOrder: 120 },
    { name: "Sarah Hunter", role: "Miss 4th of July Pageant", committee: "Miss 4th of July Pageant", email: "shunter@intracoastalrealty.com", phone: "", yearStart: 2026, isActive: true, sortOrder: 121 },
    { name: "Jwantana Frink", role: "Miss 4th of July Pageant", committee: "Miss 4th of July Pageant", email: "jgfrink@att.net", phone: "", yearStart: 2026, isActive: true, sortOrder: 122 },
    { name: "Jalyssa McRae", role: "Miss 4th of July Pageant", committee: "Miss 4th of July Pageant", email: "j.mcrae.photography@gmail.com", phone: "", yearStart: 2026, isActive: true, sortOrder: 123 },
    { name: "Maria Moore", role: "Miss 4th of July Pageant", committee: "Miss 4th of July Pageant", email: "maria@belladiningnc.com", phone: "", yearStart: 2026, isActive: true, sortOrder: 124 },
  ];

  console.log(`  Inserting ${members.length} committee members...`);
  for (const m of members) {
    await connection.execute(
      `INSERT IGNORE INTO committee_members (name, role, committee, email, yearStart, isActive, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [m.name, m.role, m.committee, m.email || null, m.yearStart, m.isActive ? 1 : 0]
    );
  }

  // ── Festival Events ──────────────────────────────────────────────────────────
  const events = [
    { slug: "parade", title: "Grand Independence Day Parade", shortDescription: "The centerpiece of the festival — the largest Independence Day parade in North Carolina.", description: "The Grand Independence Day Parade is the crown jewel of the NC 4th of July Festival. Winding through the historic streets of Southport, the parade features marching bands, floats, military units, civic organizations, and elected officials. Spectators line the streets for miles to celebrate America's birthday in grand style.", category: "parade", location: "Downtown Southport, NC", allowSignup: false, allowVolunteer: true, isActive: true, sortOrder: 1 },
    { slug: "fireworks", title: "Fireworks Spectacular", shortDescription: "A breathtaking fireworks display over the Cape Fear River.", description: "Watch the night sky over the Cape Fear River light up with a spectacular fireworks display. The show is visible from multiple vantage points along the waterfront and is the grand finale of the day's celebrations.", category: "fireworks", location: "Cape Fear River Waterfront, Southport", allowSignup: false, allowVolunteer: false, isActive: true, sortOrder: 2 },
    { slug: "patriots-ball", title: "Patriot's Ball", shortDescription: "An elegant evening gala celebrating the spirit of independence.", description: "The Patriot's Ball is a formal evening celebration bringing together community leaders, festival supporters, and guests for an elegant evening of dinner, dancing, and patriotic tribute. Tickets are required.", category: "ball", location: "Southport Community Building", allowSignup: true, allowVolunteer: false, isActive: true, sortOrder: 3 },
    { slug: "beach-day", title: "Beach Day", shortDescription: "A fun-filled day of sun, sand, and patriotic celebration on Oak Island.", description: "Join us on the beautiful shores of Oak Island for a day of beach games, live music, food vendors, and family fun. Beach Day is a beloved tradition that brings the festival to the coast.", category: "family", location: "Oak Island Beach, NC", allowSignup: true, allowVolunteer: true, isActive: true, sortOrder: 4 },
    { slug: "arts-crafts", title: "Arts & Crafts Festival", shortDescription: "A juried showcase of fine arts and handcrafted goods.", description: "Browse the work of talented artisans and craftspeople from across the region. The Arts & Crafts Festival features paintings, sculptures, jewelry, pottery, woodwork, and more — all available for purchase.", category: "arts", location: "Waterfront Park, Southport", allowSignup: true, allowVolunteer: true, isActive: true, sortOrder: 5 },
    { slug: "childrens-games", title: "Children's Games", shortDescription: "Classic outdoor games and activities for kids of all ages.", description: "A beloved tradition for families, Children's Games features sack races, egg-and-spoon contests, tug-of-war, and more. Free and open to all children attending the festival.", category: "family", location: "Franklin Square Park, Southport", allowSignup: true, allowVolunteer: true, isActive: true, sortOrder: 6 },
    { slug: "naturalization-ceremony", title: "Naturalization Ceremony", shortDescription: "Welcome new American citizens in a moving patriotic ceremony.", description: "One of the most meaningful events of the festival, the Naturalization Ceremony welcomes new citizens of the United States in a formal and moving ceremony. The public is invited to witness and celebrate this milestone.", category: "ceremony", location: "Southport Community Building", allowSignup: false, allowVolunteer: true, isActive: true, sortOrder: 7 },
    { slug: "freedom-run", title: "Freedom Run", shortDescription: "A 5K race through the historic streets of Southport.", description: "Lace up your running shoes for the annual Freedom Run 5K. The race winds through the historic streets and waterfront of Southport, finishing near the festival grounds. All fitness levels welcome.", category: "sports", location: "Downtown Southport", allowSignup: true, allowVolunteer: true, isActive: true, sortOrder: 8 },
    { slug: "patriots-concert", title: "Patriotic Concert", shortDescription: "Live patriotic music performed by the Seasons Choral Society.", description: "The Seasons Choral Society presents a stirring patriotic concert featuring beloved American classics, hymns, and rousing anthems. A perfect way to begin the Independence Day festivities.", category: "entertainment", location: "Waterfront Park, Southport", allowSignup: false, allowVolunteer: false, isActive: true, sortOrder: 9 },
    { slug: "pancake-breakfast", title: "Pancake Breakfast", shortDescription: "Start your 4th of July with a classic community pancake breakfast.", description: "Fuel up for a full day of festivities with the annual Pancake Breakfast. Enjoy stacks of fluffy pancakes, sausage, and coffee in a friendly community atmosphere.", category: "family", location: "Southport Community Building", allowSignup: true, allowVolunteer: true, isActive: true, sortOrder: 10 },
    { slug: "independence-eve-dinner", title: "Independence Eve: A Colonial Food & History Dinner", shortDescription: "An immersive colonial-era dinner experience on the eve of July 4th.", description: "Step back in time to the founding era with this unique colonial food and history dinner. Enjoy period-appropriate cuisine while learning about the history of American independence and Southport's role in it.", category: "entertainment", location: "Southport, NC", allowSignup: true, allowVolunteer: false, isActive: true, sortOrder: 11 },
    { slug: "kayak-parade", title: "Kayak & SUP Parade", shortDescription: "A festive waterborne parade on the Cape Fear River.", description: "Decorate your kayak or stand-up paddleboard and join the festive flotilla on the Cape Fear River. A unique and beloved tradition that adds a colorful dimension to the waterfront celebrations.", category: "sports", location: "Cape Fear River, Southport", allowSignup: true, allowVolunteer: false, isActive: true, sortOrder: 12 },
    { slug: "car-show", title: "Car Show", shortDescription: "A showcase of classic and custom automobiles.", description: "Admire a stunning collection of classic, vintage, and custom automobiles on display throughout the festival grounds. Open to all car enthusiasts and spectators.", category: "entertainment", location: "Downtown Southport", allowSignup: true, allowVolunteer: false, isActive: true, sortOrder: 13 },
    { slug: "maritime-museum", title: "Maritime Museum Tours", shortDescription: "Explore Southport's rich maritime heritage.", description: "The North Carolina Maritime Museum at Southport offers special tours and exhibits during the festival, celebrating the region's deep connection to the sea and its role in American history.", category: "entertainment", location: "NC Maritime Museum, Southport", allowSignup: false, allowVolunteer: false, isActive: true, sortOrder: 14 },
    { slug: "old-jail-tours", title: "Old Jail Tours", shortDescription: "Historic tours of Southport's famous old jail.", description: "Step inside one of Southport's most historic landmarks and learn about the city's colorful past. Guided tours available throughout the festival weekend.", category: "entertainment", location: "Old Jail, Southport", allowSignup: false, allowVolunteer: true, isActive: true, sortOrder: 15 },
    { slug: "gospel-fest", title: "We the People Gospel Fest", shortDescription: "A joyful celebration of gospel music and community spirit.", description: "We the People Gospel Fest brings together local choirs and gospel artists for an uplifting afternoon of music, faith, and patriotic spirit.", category: "entertainment", location: "Southport, NC", allowSignup: false, allowVolunteer: true, isActive: true, sortOrder: 16 },
    { slug: "miss-4th-pageant", title: "Miss 4th of July Pageant", shortDescription: "The annual crowning of the NC 4th of July Festival Queen.", description: "The Miss 4th of July Pageant is a cherished tradition crowning the festival's queen and her court. The pageant celebrates poise, talent, and community spirit among young women from the region.", category: "ceremony", location: "Southport Community Building", allowSignup: true, allowVolunteer: false, isActive: true, sortOrder: 17 },
    { slug: "freedom-flotilla", title: "Freedom Flotilla", shortDescription: "A patriotic boat parade on the Cape Fear River.", description: "Decorate your vessel and join the Freedom Flotilla — a patriotic boat parade on the Cape Fear River. Spectators line the waterfront to cheer on the colorful procession of decorated boats.", category: "entertainment", location: "Cape Fear River, Southport", allowSignup: true, allowVolunteer: false, isActive: true, sortOrder: 18 },
  ];

  console.log(`  Inserting ${events.length} festival events...`);
  for (const e of events) {
    await connection.execute(
      `INSERT IGNORE INTO events (slug, title, shortDescription, description, category, location, allowSignup, allowVolunteer, isActive, sortOrder, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [e.slug, e.title, e.shortDescription, e.description, e.category, e.location, e.allowSignup ? 1 : 0, e.allowVolunteer ? 1 : 0, e.isActive ? 1 : 0, e.sortOrder]
    );
  }

  // ── Heritage Timeline ────────────────────────────────────────────────────────
  const timeline = [
    { year: 1795, title: "First Celebration", description: "The first recorded Independence Day celebration in Southport (then known as Smithville) takes place, making it one of the oldest continuous Fourth of July celebrations in the United States.", isMilestone: true, sortOrder: 1 },
    { year: 1808, title: "Town Renamed Southport", description: "Smithville is officially renamed Southport, and the Independence Day tradition continues under the new name.", isMilestone: false, sortOrder: 2 },
    { year: 1861, title: "Civil War Interruption", description: "The Civil War brings a pause to the public celebrations, though private observances continue among residents.", isMilestone: false, sortOrder: 3 },
    { year: 1865, title: "Celebration Resumes", description: "With the end of the Civil War, the public Independence Day celebration resumes in Southport with renewed patriotic fervor.", isMilestone: true, sortOrder: 4 },
    { year: 1900, title: "Growing Tradition", description: "The celebration grows to include a formal parade through downtown Southport, attracting visitors from across Brunswick County.", isMilestone: false, sortOrder: 5 },
    { year: 1950, title: "Festival Expands", description: "The festival expands significantly with the addition of arts and crafts vendors, live entertainment, and organized sporting events.", isMilestone: true, sortOrder: 6 },
    { year: 1972, title: "Formal Organization", description: "The NC 4th of July Festival is formally organized as a nonprofit entity, establishing the committee structure that continues today.", isMilestone: true, sortOrder: 7 },
    { year: 1980, title: "First Miss 4th of July Pageant", description: "The Miss 4th of July Pageant is established, adding a new tradition to the festival and celebrating the young women of the community.", isMilestone: true, sortOrder: 8 },
    { year: 1990, title: "Naturalization Ceremony Added", description: "A formal Naturalization Ceremony is added to the festival program, welcoming new American citizens in a moving public ceremony.", isMilestone: true, sortOrder: 9 },
    { year: 1995, title: "Bicentennial Celebration", description: "The festival marks its 200th anniversary with a grand bicentennial celebration, drawing record crowds and national media attention.", isMilestone: true, sortOrder: 10 },
    { year: 2000, title: "Patriot's Ball Established", description: "The Patriot's Ball is established as an elegant evening gala, adding a formal dimension to the festival's programming.", isMilestone: false, sortOrder: 11 },
    { year: 2010, title: "Beach Day Added", description: "Beach Day on Oak Island is added to the festival calendar, extending the celebration to the barrier island communities.", isMilestone: false, sortOrder: 12 },
    { year: 2020, title: "Virtual Festival", description: "Due to the COVID-19 pandemic, the festival adapts with virtual events and a scaled-down in-person celebration, demonstrating the community's resilience.", isMilestone: false, sortOrder: 13 },
    { year: 2021, title: "Full Return", description: "The festival returns to full programming following the pandemic, with record attendance celebrating both Independence Day and the community's resilience.", isMilestone: true, sortOrder: 14 },
    { year: 2026, title: "231st Annual Festival", description: "The NC 4th of July Festival celebrates its 231st anniversary, continuing the proud tradition of America's oldest continuous Independence Day celebration.", isMilestone: true, sortOrder: 15 },
  ];

  console.log(`  Inserting ${timeline.length} heritage timeline events...`);
  for (const t of timeline) {
    await connection.execute(
      `INSERT IGNORE INTO timeline_entries (year, title, description, isMilestone, sortOrder, createdAt)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [t.year, t.title, t.description, t.isMilestone ? 1 : 0, t.sortOrder]
    );
  }

  // ── Past Presidents ──────────────────────────────────────────────────────────
  const presidents = [
    { name: "Lucinda Arnold", yearStart: 2024, yearEnd: 2025, bio: "Lucinda Arnold served as President of the NC 4th of July Festival, bringing strong organizational leadership and a passion for community celebration.", sortOrder: 1 },
    { name: "Hugh Fosbury", yearStart: 2026, yearEnd: null, bio: "Hugh Fosbury currently serves as President of the NC 4th of July Festival, leading the organization's 231st annual celebration.", sortOrder: 2 },
  ];

  console.log(`  Inserting ${presidents.length} past presidents...`);
  for (const p of presidents) {
    await connection.execute(
      `INSERT IGNORE INTO past_presidents (name, yearStart, yearEnd, bio, createdAt)
       VALUES (?, ?, ?, ?, NOW())`,
      [p.name, p.yearStart, p.yearEnd ?? null, p.bio]
    );
  }

  console.log("✅ Seed complete!");
  await connection.end();
}

run().catch((err) => { console.error("Seed failed:", err); process.exit(1); });
