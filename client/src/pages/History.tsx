import { BookOpen, Flag, Star, Users, Calendar } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const HISTORY_SECTIONS = [
  {
    era: "1795 — The Beginning",
    icon: Flag,
    color: "text-patriot-600",
    bg: "bg-patriot-50",
    content: `The history of Southport's Fourth of July Festival was first recorded in a newspaper in 1795. Ship crews anchored in the harbor would discharge cannon salutes at daybreak, celebrating the young nation's independence in what was known as the "Festival of Free Men." This tradition of maritime celebration reflected Southport's deep connection to the sea and its role as a vital port community in North Carolina.

The early celebrations were informal gatherings of sailors, merchants, and townspeople who shared a common pride in the new American republic. The cannon salutes echoed across the Cape Fear River, announcing to all who could hear that freedom was worth celebrating — loudly and with great enthusiasm.`
  },
  {
    era: "The Live Oak Festival Era",
    icon: Star,
    color: "text-gold-600",
    bg: "bg-gold-50",
    content: `By the 1950s, the celebration had evolved significantly and was renamed the "Live Oak Festival," celebrated with parades, balls, and the crowning of festival queens — establishing traditions that endure to this day. The festival became a beloved community institution, drawing families from across Brunswick County and beyond.

In 1962, the newly organized Southport Jaycees held a boat raffle on July 4th at the historic "Cedar Bench" (now known as Whittler's Bench) on the waterfront. The following year, the Southport Junior Woman's Club started the "Arts Festival" tradition, adding a cultural dimension to the patriotic festivities. By 1964, the community's patriotic spirit had coalesced into a recognized Fourth of July parade through the streets of downtown Southport.`
  },
  {
    era: "1972 — Official Incorporation",
    icon: BookOpen,
    color: "text-navy-600",
    bg: "bg-navy-50",
    content: `The Secretary of State officially incorporated the festival as the "North Carolina Fourth of July Festival, Inc." in 1972 — a non-profit organization with a board of directors and professional staff. This formal structure allowed the festival to grow from a local celebration into a major regional event, attracting visitors from across the state and the nation.

The incorporation marked a turning point in the festival's history. With a dedicated organizational structure, the festival could plan further in advance, secure sponsorships, and coordinate the complex logistics of a multi-day event drawing tens of thousands of visitors to the small coastal town of Southport.`
  },
  {
    era: "1996 — The Naturalization Ceremony",
    icon: Users,
    color: "text-patriot-600",
    bg: "bg-patriot-50",
    content: `One of the most moving additions to the festival came in 1996 when a Naturalization Ceremony was incorporated into the festivities, administered by what is now the U.S. Department of Homeland Security. New citizens from around the world take their Oath of Citizenship in this deeply moving patriotic ceremony — a perfect embodiment of the festival's spirit.

Since 2007, the festival has welcomed 723 new citizens — including 533 during July ceremonies and 190 during special Mid-Winter Naturalization Ceremonies held in January. Each ceremony is a reminder of what July 4th truly means: the promise of freedom and opportunity for all who call America home.`
  },
  {
    era: "Growth and Expansion",
    icon: Calendar,
    color: "text-gold-600",
    bg: "bg-gold-50",
    content: `Over the decades, the festival grew from a one-day celebration to a three-to-four day extravaganza drawing 40,000 to 50,000 visitors from every state in the nation. The festival expanded to include Oak Island as a major venue in 2021, hosting Arts & Crafts, Professional Wrestling, Car & Truck Shows, and Main Stage Entertainment at Middleton Park.

The festival's signature events include the Grand Independence Day Parade — featuring floats, marching bands, military units, Shriners, antique automobiles, and clowns — along with the Fireworks Spectacular over the Cape Fear River, the Patriot's Ball, Beach Day on Oak Island, Children's Games, the Pancake Breakfast, and the Arts & Crafts Festival in Franklin Square Park.`
  },
  {
    era: "2022 — A New Chapter",
    icon: Flag,
    color: "text-navy-600",
    bg: "bg-navy-50",
    content: `In 2022, the NC Fourth of July Festival became a non-profit administered through the City of Southport, NC, marking a new chapter in the festival's governance. This partnership with the City ensures the festival's long-term sustainability while maintaining the community spirit that has defined it for over two centuries.

The 2023 festival (the 228th) brought new innovations including "Clicks of Confidence," a shuttle service connecting venues, and a new headquarters at 113 West Moore Street (the historic Indian Trail Meeting Hall). The festival continues to evolve while honoring its deep roots in Southport's history and identity.`
  },
  {
    era: "Today — 230+ Years of Tradition",
    icon: Star,
    color: "text-patriot-600",
    bg: "bg-patriot-50",
    content: `Today, the NC 4th of July Festival stands as one of the oldest and most beloved Independence Day celebrations in the United States. What began as cannon salutes from ships in a harbor has grown into a multi-day festival that brings together tens of thousands of Americans to celebrate freedom, community, and the enduring promise of the American dream.

The festival is organized by dedicated volunteers and committee members across multiple divisions — Government, Security, Publicity, Finance, Logistics, and Events — all working together to create an experience that honors the past while embracing the future. The 2026 festival marks the 231st year of this extraordinary tradition, and the spirit of celebration remains as strong as ever.`
  },
];

export default function History() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-navy-900 text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-stars opacity-20" />
        <div className="relative container text-center">
          <p className="font-display text-xs tracking-widest text-gold-400 mb-3 uppercase">Est. 1795</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-5">Festival History</h1>
          <div className="section-divider w-16 mx-auto mb-5" />
          <p className="text-navy-300 max-w-xl mx-auto text-lg leading-relaxed">
            Over 230 years of American patriotism, community celebration, and the enduring spirit of independence — all in the historic coastal town of Southport, NC.
          </p>
        </div>
      </section>

      {/* Intro Quote */}
      <section className="py-16 bg-patriot-50 border-b border-patriot-100">
        <div className="container max-w-3xl text-center">
          <blockquote className="text-xl md:text-2xl font-serif text-navy-800 italic leading-relaxed mb-4">
            "The history of Southport's Fourth of July Festival was first recorded in a newspaper in 1795, when ship crews anchored in the harbor would discharge cannon salutes at daybreak."
          </blockquote>
          <p className="text-sm text-muted-foreground font-medium">— NC 4th of July Festival Historical Records</p>
        </div>
      </section>

      {/* History Sections */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <div className="space-y-16">
            {HISTORY_SECTIONS.map((section, i) => {
              const Icon = section.icon;
              return (
                <div key={section.era} className="grid md:grid-cols-[auto_1fr] gap-8 items-start">
                  {/* Icon + Era */}
                  <div className="flex flex-col items-center gap-3 md:w-32">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${section.bg}`}>
                      <Icon className={`w-7 h-7 ${section.color}`} />
                    </div>
                    <div className="text-center">
                      <p className={`font-display text-xs font-bold tracking-wide ${section.color}`}>{section.era}</p>
                    </div>
                    {i < HISTORY_SECTIONS.length - 1 && (
                      <div className="hidden md:block w-0.5 h-12 bg-border mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
                    <h2 className="text-xl font-serif font-semibold text-navy-900 mb-4">{section.era}</h2>
                    {section.content.split("\n\n").map((para, j) => (
                      <p key={j} className="text-muted-foreground leading-relaxed mb-4 last:mb-0">{para}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Facts */}
      <section className="bg-navy-900 text-white py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif mb-3">Festival by the Numbers</h2>
            <div className="section-divider w-16 mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: "1795", label: "Year First Recorded", desc: "Cannon salutes from ships in Southport harbor" },
              { value: "230+", label: "Years of Tradition", desc: "One of America's oldest Independence Day celebrations" },
              { value: "50,000+", label: "Annual Attendees", desc: "Visitors from every state in the nation" },
              { value: "723", label: "New Citizens Welcomed", desc: "Through the Naturalization Ceremony since 2007" },
            ].map((stat) => (
              <div key={stat.label} className="bg-navy-800 rounded-2xl p-6 text-center">
                <div className="font-display text-4xl text-gold-400 mb-2">{stat.value}</div>
                <div className="font-semibold text-white text-sm mb-2">{stat.label}</div>
                <div className="text-xs text-navy-400 leading-relaxed">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-patriot-50 border-t border-patriot-100">
        <div className="container text-center">
          <h2 className="text-2xl font-serif text-navy-900 mb-3">Be Part of the History</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Join us for the 231st NC 4th of July Festival in Southport, NC — and become part of this extraordinary American tradition.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button className="bg-navy-900 hover:bg-navy-800 text-white btn-press gap-2">
                <Calendar className="w-4 h-4" /> View 2026 Events
              </Button>
            </Link>
            <Link href="/heritage">
              <Button variant="outline" className="border-navy-300 text-navy-700 hover:bg-navy-50 btn-press gap-2">
                <BookOpen className="w-4 h-4" /> Explore Heritage
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
