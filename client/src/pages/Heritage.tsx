import { useState } from "react";
import { Flag, Star, Users, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";

// Static timeline data seeded from history
const TIMELINE_STATIC = [
  { year: 1795, title: "The Festival of Free Men", description: "First recorded in a newspaper — ship crews anchored in Southport harbor discharge cannon salutes at daybreak, celebrating the young nation's independence in what was known as the 'Festival of Free Men.'", isMilestone: true },
  { year: 1950, title: "The Live Oak Festival", description: "By the 1950s, the celebration had evolved and was renamed the 'Live Oak Festival,' celebrated with parades, balls, and queens — establishing traditions that endure today.", isMilestone: false },
  { year: 1962, title: "Southport Jaycees Boat Raffle", description: "The newly organized Southport Jaycees hold a boat raffle on July 4th at the historic 'Cedar Bench' (now Whittler's Bench) on the waterfront — a pivotal fundraising moment.", isMilestone: false },
  { year: 1963, title: "Arts Festival Tradition Begins", description: "The Southport Junior Woman's Club starts the 'Arts Festival' tradition, adding cultural celebration to the patriotic festivities.", isMilestone: false },
  { year: 1964, title: "The Fourth of July Parade", description: "The community's patriotic spirit comes alive with the first recognized Fourth of July parade — a tradition that continues to this day as the festival's centerpiece.", isMilestone: true },
  { year: 1972, title: "Officially Incorporated", description: "The Secretary of State incorporates the festival as the 'North Carolina Fourth of July Festival, Inc.' — a non-profit organization with a board of directors and professional staff.", isMilestone: true },
  { year: 1996, title: "Naturalization Ceremony Added", description: "A Naturalization Ceremony is incorporated into the festival, administered by what is now the U.S. Department of Homeland Security, welcoming new citizens from around the world.", isMilestone: true },
  { year: 2007, title: "723 New Citizens Welcomed", description: "Since 2007, the festival has welcomed 723 new citizens — including 533 during July ceremonies and 190 during special Mid-Winter Naturalization Ceremonies in January.", isMilestone: false },
  { year: 2020, title: "Virtual Festival", description: "Due to the COVID-19 pandemic, the festival is held virtually for the first time in its history, featuring videos of past parades, fireworks, flag folding tutorials, and citizen stories.", isMilestone: false },
  { year: 2021, title: "Oak Island Added as Venue", description: "Oak Island is added as a major venue, hosting Arts & Crafts, Professional Wrestling, Car & Truck Show, and Main Stage Entertainment at Middleton Park.", isMilestone: false },
  { year: 2022, title: "Administered by City of Southport", description: "The NC Fourth of July Festival becomes a non-profit administered through the City of Southport, NC, marking a new chapter in the festival's governance.", isMilestone: true },
  { year: 2023, title: "228th Anniversary", description: "The 228th festival brings new events including 'Clicks of Confidence,' a shuttle service, and a new headquarters at 113 West Moore Street (Indian Trail Meeting Hall).", isMilestone: false },
  { year: 2026, title: "231st Annual Festival", description: "The 231st NC 4th of July Festival continues the proud tradition of celebrating American independence in Southport, NC — with the full committee structure and expanded programming.", isMilestone: true },
];

const PRESIDENTS_STATIC = [
  { id: 1, name: "Hugh Fosbury", yearStart: 2026, yearEnd: null, bio: "Current President of the NC 4th of July Festival, serving the 2026 festival year." },
  { id: 2, name: "Lucinda Arnold", yearStart: 2024, yearEnd: 2025, bio: "Past President, currently serving on the executive committee and leading the America's 250th Fort George Liberation Event." },
];

export default function Heritage() {
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"timeline" | "presidents" | "committees">("timeline");

  const { data: presidents } = trpc.heritage.presidents.useQuery();
  const { data: timeline } = trpc.heritage.timeline.useQuery();
  const { data: members } = trpc.committees.list.useQuery({});

  const displayTimeline = (timeline && timeline.length > 0) ? timeline : TIMELINE_STATIC;
  const displayPresidents = (presidents && presidents.length > 0) ? presidents : PRESIDENTS_STATIC;

  // Group committee members by committee/division
  const committeeGroups = members?.reduce((acc, m) => {
    const key = m.committee ?? "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {} as Record<string, typeof members>) ?? {};

  const DIVISIONS_STATIC = [
    { division: "Executive Officers", members: [
      { name: "Hugh Fosbury", role: "President" },
      { name: "Brett McKeithan", role: "Vice President" },
      { name: "Melissa Goff", role: "Secretary" },
      { name: "Duncan Hilburn", role: "Treasurer" },
      { name: "Lucinda Arnold", role: "Past President" },
    ]},
    { division: "Government Division", members: [
      { name: "Rebecca Kelley", role: "City of Southport" },
      { name: "Heather O'Brien", role: "Town of Oak Island" },
      { name: "Elizabeth Neumann", role: "Sunny Point" },
      { name: "Sen Chief Adkisson", role: "Coast Guard" },
      { name: "Capt. Angela Kreuser", role: "Civil Air Patrol" },
    ]},
    { division: "Security Division", members: [
      { name: "Todd Coring", role: "Division Chair / Security" },
      { name: "Thomas Moore", role: "Southport Police Department" },
      { name: "Richard Merritt", role: "GRL Security and Staffing" },
    ]},
    { division: "Publicity Division", members: [
      { name: "Cindy Nimmich", role: "Division Chair" },
      { name: "Allayna Taylor", role: "Media & Public Relations / Events Calendar" },
      { name: "Chris Cadman", role: "Cape Fear Radio" },
    ]},
    { division: "Finance Division", members: [
      { name: "Charles Drew", role: "Division Chair" },
      { name: "Marion Martin", role: "Arts & Crafts" },
      { name: "Brett McKeithan", role: "Patriots Ball" },
      { name: "Sarah Hunter", role: "Sponsorships" },
    ]},
    { division: "Logistics Division", members: [
      { name: "Peter Shannon", role: "Division Chair" },
      { name: "Jessie Labell", role: "Accommodations / Non-profit Coordinator" },
      { name: "Karen Martin", role: "Festival Signage / Necessity Stations" },
      { name: "Andrew Broshe", role: "Volunteer Coordinator" },
    ]},
    { division: "Events Division", members: [
      { name: "Keesha Starr", role: "Division Chair" },
      { name: "Mary Beth Livers", role: "Children's Entertainment / Kid Zone" },
      { name: "Ryan Gordon", role: "Beach Day" },
      { name: "Duncan Hilburn", role: "Parade" },
      { name: "Lucinda Arnold", role: "Fireworks" },
    ]},
  ];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-navy-900 text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-stars opacity-20" />
        <div className="relative container text-center">
          <p className="font-display text-xs tracking-widest text-gold-400 mb-3 uppercase">Our Story</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-5">Festival Heritage</h1>
          <div className="section-divider w-16 mx-auto mb-5" />
          <p className="text-navy-300 max-w-xl mx-auto text-lg leading-relaxed">
            From cannon salutes in 1795 to a 50,000-person celebration today — explore the rich history of America's longest-running independence festival.
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container">
          <div className="flex">
            {(["timeline", "presidents", "committees"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-4 text-sm font-medium border-b-2 transition-colors capitalize",
                  activeTab === tab
                    ? "border-patriot-600 text-patriot-600"
                    : "border-transparent text-muted-foreground hover:text-navy-800"
                )}
              >
                {tab === "timeline" ? "Historical Timeline" : tab === "presidents" ? "Past Presidents" : "Committee Directory"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      {activeTab === "timeline" && (
        <section className="py-16 md:py-24">
          <div className="container max-w-4xl">
            <div className="relative">
              {/* Center line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-patriot-400 via-navy-400 to-patriot-400 -translate-x-1/2" />

              <div className="space-y-8">
                {displayTimeline.map((entry, i) => {
                  const isLeft = i % 2 === 0;
                  const isExpanded = expandedYear === entry.year;
                  return (
                    <div key={entry.year} className={cn("relative flex gap-6 md:gap-0", isLeft ? "md:flex-row" : "md:flex-row-reverse")}>
                      {/* Dot */}
                      <div className="absolute left-8 md:left-1/2 top-6 -translate-x-1/2 z-10">
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2 border-white shadow-md",
                          (entry as any).isMilestone ? "bg-patriot-600 w-5 h-5" : "bg-navy-400"
                        )} />
                      </div>

                      {/* Content */}
                      <div className={cn("ml-16 md:ml-0 md:w-5/12", isLeft ? "md:pr-10" : "md:pl-10")}>
                        <button
                          onClick={() => setExpandedYear(isExpanded ? null : entry.year)}
                          className="w-full text-left group"
                        >
                          <div className={cn(
                            "bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all duration-200",
                            (entry as any).isMilestone ? "border-patriot-200 bg-patriot-50/30" : "border-border"
                          )}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-display text-sm font-bold text-patriot-600">{entry.year}</span>
                                  {(entry as any).isMilestone && (
                                    <Badge className="bg-patriot-100 text-patriot-700 border-patriot-200 text-xs">Milestone</Badge>
                                  )}
                                </div>
                                <h3 className="font-serif text-base font-semibold text-navy-900">{entry.title}</h3>
                              </div>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
                            </div>
                            {isExpanded && (
                              <p className="mt-3 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                                {entry.description}
                              </p>
                            )}
                          </div>
                        </button>
                      </div>

                      {/* Spacer for opposite side */}
                      <div className="hidden md:block md:w-5/12" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Past Presidents */}
      {activeTab === "presidents" && (
        <section className="py-16">
          <div className="container max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif text-navy-900 mb-3">Past Presidents</h2>
              <div className="section-divider w-16 mx-auto mb-4" />
              <p className="text-muted-foreground max-w-lg mx-auto">The dedicated leaders who have guided the NC 4th of July Festival through the decades.</p>
            </div>
            <div className="space-y-4">
              {displayPresidents.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-border shadow-sm p-6 flex items-start gap-5">
                  <div className="w-14 h-14 rounded-full bg-navy-100 flex items-center justify-center shrink-0">
                    <Flag className="w-6 h-6 text-navy-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="font-serif text-lg font-semibold text-navy-900">{p.name}</h3>
                        <p className="text-sm text-patriot-600 font-medium">
                          {p.yearStart}{p.yearEnd ? ` – ${p.yearEnd}` : " – Present"}
                        </p>
                      </div>
                      <Badge className="bg-navy-100 text-navy-700 border-navy-200">President</Badge>
                    </div>
                    {p.bio && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Committee Directory */}
      {activeTab === "committees" && (
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif text-navy-900 mb-3">2026 Committee Directory</h2>
              <div className="section-divider w-16 mx-auto mb-4" />
              <p className="text-muted-foreground max-w-lg mx-auto">
                The dedicated volunteers and professionals who make the NC 4th of July Festival possible. As of May 19, 2026.
              </p>
            </div>

            {Object.keys(committeeGroups).length > 0 ? (
              <div className="grid md:grid-cols-2 gap-8">
                {Object.entries(committeeGroups).map(([division, divMembers]) => (
                  <div key={division} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="bg-navy-900 text-white px-6 py-4">
                      <h3 className="font-serif text-lg">{division}</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {divMembers.map((m) => (
                        <div key={m.id} className="px-6 py-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-navy-900 text-sm">{m.name}</p>
                            <p className="text-xs text-muted-foreground">{m.role}</p>
                          </div>
                          {m.isActive && <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" title="Active" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Static fallback from PDF
              <div className="grid md:grid-cols-2 gap-8">
                {DIVISIONS_STATIC.map((div) => (
                  <div key={div.division} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="bg-navy-900 text-white px-6 py-4">
                      <h3 className="font-serif text-lg">{div.division}</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {div.members.map((m) => (
                        <div key={m.name} className="px-6 py-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-navy-900 text-sm">{m.name}</p>
                            <p className="text-xs text-muted-foreground">{m.role}</p>
                          </div>
                          <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" title="Active" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
