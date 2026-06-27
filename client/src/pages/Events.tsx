import { useState } from "react";
import { Link } from "wouter";
import { Calendar, MapPin, Users, ChevronRight, Filter, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";


const CATEGORY_LABELS: Record<string, string> = {
  parade: "Parade",
  ceremony: "Ceremony",
  entertainment: "Entertainment",
  arts: "Arts & Crafts",
  sports: "Sports",
  family: "Family",
  ball: "Gala",
  fireworks: "Fireworks",
  other: "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  parade:        "bg-patriot-100 text-patriot-700 border-patriot-200",
  ceremony:      "bg-navy-100 text-navy-700 border-navy-200",
  entertainment: "bg-gold-100 text-gold-700 border-gold-200",
  arts:          "bg-purple-100 text-purple-700 border-purple-200",
  sports:        "bg-green-100 text-green-700 border-green-200",
  family:        "bg-orange-100 text-orange-700 border-orange-200",
  ball:          "bg-pink-100 text-pink-700 border-pink-200",
  fireworks:     "bg-red-100 text-red-700 border-red-200",
  other:         "bg-gray-100 text-gray-700 border-gray-200",
};

const STATIC_EVENTS = [
  { id: 0, slug: "grand-parade", title: "Grand Independence Day Parade", category: "parade", shortDescription: "The centerpiece of the festival — floats, marching bands, military units, antique automobiles, Shriners, and clowns through downtown Southport.", eventDate: new Date("2026-07-04T10:00:00"), location: "Downtown Southport", allowSignup: true, allowVolunteer: true, isActive: true },
  { id: 0, slug: "fireworks", title: "Fireworks Spectacular", category: "fireworks", shortDescription: "A breathtaking fireworks display over the beautiful Cape Fear River at 9 PM, visible from the waterfront, boats, and Oak Island.", eventDate: new Date("2026-07-04T21:00:00"), location: "Cape Fear River Waterfront", allowSignup: false, allowVolunteer: false, isActive: true },
  { id: 0, slug: "patriots-ball", title: "Patriot's Ball", category: "ball", shortDescription: "An elegant evening of celebration, music, and community — one of the festival's most beloved signature events.", eventDate: new Date("2026-07-03T19:00:00"), location: "Southport Community Building", allowSignup: true, allowVolunteer: false, isActive: true },
  { id: 0, slug: "beach-day", title: "Beach Day", category: "sports", shortDescription: "Volleyball, skateboarding, and family fun on Oak Island. A beloved tradition that draws crowds of all ages.", eventDate: new Date("2026-07-02T10:00:00"), location: "Oak Island Beach", allowSignup: true, allowVolunteer: true, isActive: true },
  { id: 0, slug: "arts-crafts", title: "Arts & Crafts Festival", category: "arts", shortDescription: "Over 100 handmade arts and craft vendors in Franklin Square Park, celebrating local artisans and makers.", eventDate: new Date("2026-07-01T09:00:00"), location: "Franklin Square Park, Southport", allowSignup: true, allowVolunteer: true, isActive: true },
  { id: 0, slug: "naturalization", title: "Naturalization Ceremony", category: "ceremony", shortDescription: "Since 1996, new citizens from around the world take their Oath of Citizenship in this deeply moving patriotic ceremony.", eventDate: new Date("2026-07-04T09:00:00"), location: "Southport Community Building", allowSignup: false, allowVolunteer: true, isActive: true },
  { id: 0, slug: "childrens-games", title: "Children's Games", category: "family", shortDescription: "Old-fashioned sack races, watermelon eating contests, face painting, and children's crafts — pure summer fun for the little ones.", eventDate: new Date("2026-07-03T10:00:00"), location: "Franklin Square Park", allowSignup: true, allowVolunteer: true, isActive: true },
  { id: 0, slug: "pancake-breakfast", title: "Pancake Breakfast", category: "family", shortDescription: "Start your festival morning right with a classic community pancake breakfast — a cherished annual tradition.", eventDate: new Date("2026-07-04T07:30:00"), location: "Southport Community Building", allowSignup: true, allowVolunteer: true, isActive: true },
  { id: 0, slug: "flag-raising", title: "Flag Raising Ceremony", category: "ceremony", shortDescription: "A solemn and stirring flag raising ceremony honoring the American flag and all who have served under it.", eventDate: new Date("2026-07-04T08:00:00"), location: "Waterfront Park, Southport", allowSignup: false, allowVolunteer: true, isActive: true },
  { id: 0, slug: "veterans-recognition", title: "Veterans Recognition Ceremony", category: "ceremony", shortDescription: "Honoring the brave men and women who have served our nation with a moving recognition ceremony.", eventDate: new Date("2026-07-04T11:00:00"), location: "Waterfront Park, Southport", allowSignup: false, allowVolunteer: true, isActive: true },
  { id: 0, slug: "freedom-run", title: "Freedom Run", category: "sports", shortDescription: "Lace up your running shoes for the annual Freedom Run — a patriotic race through the streets of Southport.", eventDate: new Date("2026-07-04T07:00:00"), location: "Downtown Southport", allowSignup: true, allowVolunteer: true, isActive: true },
  { id: 0, slug: "opening-ceremony", title: "Opening Ceremony", category: "ceremony", shortDescription: "Kick off the festival with the official opening ceremony featuring dignitaries, music, and the raising of the American flag.", eventDate: new Date("2026-06-30T18:00:00"), location: "Southport & Oak Island", allowSignup: false, allowVolunteer: true, isActive: true },
];

const ALL_CATEGORIES = ["all", "parade", "ceremony", "entertainment", "arts", "sports", "family", "ball", "fireworks"];

function formatDate(d: Date | null | undefined) {
  if (!d) return "TBD";
  return new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });
}

function formatTime(d: Date | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function EventCard({ event }: { event: typeof STATIC_EVENTS[0] }) {
  return (
    <div className="group bg-white rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all duration-200 card-lift overflow-hidden flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge className={cn("text-xs border", CATEGORY_COLORS[event.category])}>
            {CATEGORY_LABELS[event.category]}
          </Badge>
          {event.allowSignup && (
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <Star className="w-3 h-3" /> Registration Open
            </span>
          )}
        </div>
        <h3 className="text-lg font-serif font-semibold text-navy-900 mb-2 leading-tight">{event.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">{event.shortDescription}</p>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          {event.eventDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-patriot-400 shrink-0" />
              <span>{formatDate(event.eventDate)} {formatTime(event.eventDate) && `· ${formatTime(event.eventDate)}`}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-patriot-400 shrink-0" />
              <span>{event.location}</span>
            </div>
          )}
        </div>
      </div>
      <div className="px-6 pb-6 flex gap-2">
        {event.allowSignup && (
          <Link href={`/events/${event.slug}/signup`} className="flex-1">
            <Button size="sm" className="w-full bg-patriot-600 hover:bg-patriot-700 text-white btn-press text-xs gap-1">
              <Users className="w-3 h-3" /> Sign Up
            </Button>
          </Link>
        )}
        {event.allowVolunteer && (
          <Link href={`/volunteer?event=${event.slug}`} className={event.allowSignup ? "" : "flex-1"}>
            <Button size="sm" variant="outline" className={cn("btn-press text-xs gap-1 border-navy-200 text-navy-700 hover:bg-navy-50", !event.allowSignup && "w-full")}>
              <Star className="w-3 h-3" /> Volunteer
            </Button>
          </Link>
        )}
        {!event.allowSignup && !event.allowVolunteer && (
          <span className="text-xs text-muted-foreground italic">Free admission — no registration required</span>
        )}
      </div>
    </div>
  );
}

export default function Events() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { data: dbEvents } = trpc.events.list.useQuery({ activeOnly: true });

  const allEvents = (dbEvents && dbEvents.length > 0) ? dbEvents : STATIC_EVENTS;
  const filtered = activeCategory === "all"
    ? allEvents
    : allEvents.filter((e) => e.category === activeCategory);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-navy-900 text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-stars opacity-20" />
        <div className="relative container text-center">
          <p className="font-display text-xs tracking-widest text-gold-400 mb-3 uppercase">2026 Festival</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-5">Festival Events</h1>
          <div className="section-divider w-16 mx-auto mb-5" />
          <p className="text-navy-300 max-w-xl mx-auto text-lg leading-relaxed">
            From the Grand Parade to fireworks over the Cape Fear River — explore everything the NC 4th of July Festival has to offer.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0",
                  activeCategory === cat
                    ? "bg-navy-900 text-white"
                    : "bg-navy-50 text-navy-700 hover:bg-navy-100"
                )}
              >
                {cat === "all" ? "All Events" : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-navy-900">{filtered.length}</span> events
            </p>
            <Link href="/parade/register">
              <Button size="sm" className="bg-patriot-600 hover:bg-patriot-700 text-white btn-press gap-1.5 text-xs">
                <Star className="w-3 h-3" /> Join the Parade
              </Button>
            </Link>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No events found in this category.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((event, i) => (
                <EventCard key={`${event.slug}-${i}`} event={event as any} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Parade CTA */}
      <section className="bg-patriot-600 text-white py-14">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-serif mb-3">Want to March in the Parade?</h2>
          <p className="text-patriot-100 mb-6 max-w-md mx-auto">Register your float, band, or walking group for the 2026 Grand Independence Day Parade.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/parade/register">
              <Button size="lg" className="bg-white text-patriot-700 hover:bg-patriot-50 btn-press gap-2">
                <Star className="w-4 h-4" /> New Participant Registration
              </Button>
            </Link>
            <Link href="/parade/renew">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 btn-press">
                Returning Participant Renewal
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
