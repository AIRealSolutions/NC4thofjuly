import { useState } from "react";
import { Award, Crown, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";

// Static placeholder queens data — admin can add real entries via back office
const QUEENS_STATIC = [
  { id: 1, year: 2025, name: "TBD", title: "Festival Queen", hometown: "Southport, NC", bio: "To be announced for the 2025 festival." },
  { id: 2, year: 2024, name: "TBD", title: "Festival Queen", hometown: "Brunswick County, NC", bio: "To be announced." },
  { id: 3, year: 2023, name: "TBD", title: "Festival Queen", hometown: "Southport, NC", bio: "Represented the 228th annual NC 4th of July Festival." },
];

export default function Queens() {
  const { data: queens } = trpc.queens.list.useQuery();
  type QueenEntry = { id: number; year: number; name: string; title?: string | null; hometown?: string | null; bio?: string | null; photoUrl?: string | null };
  const displayQueens: QueenEntry[] = (queens && queens.length > 0) ? queens : QUEENS_STATIC;

  // Group by year
  const byYear = displayQueens.reduce((acc, q) => {
    if (!acc[q.year]) acc[q.year] = [];
    acc[q.year].push(q);
    return acc;
  }, {} as Record<number, QueenEntry[]>);
  const sortedYears = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-navy-900 text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-stars opacity-20" />
        <div className="relative container text-center">
          <p className="font-display text-xs tracking-widest text-gold-400 mb-3 uppercase">A Legacy of Grace</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-5">Festival Queens</h1>
          <div className="section-divider w-16 mx-auto mb-5" />
          <p className="text-navy-300 max-w-xl mx-auto text-lg leading-relaxed">
            Celebrating the young women who have represented the NC 4th of July Festival with grace, patriotism, and community spirit throughout the decades.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 md:py-24">
        <div className="container">
          {sortedYears.map((year) => (
            <div key={year} className="mb-16">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-gold-500" />
                  <h2 className="text-2xl font-serif text-navy-900">{year} Festival Queen{byYear[year].length > 1 ? "s" : ""}</h2>
                </div>
                <div className="flex-1 h-px bg-border" />
                <Badge className="bg-gold-100 text-gold-700 border-gold-200 font-display text-xs">{year}</Badge>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {byYear[year].map((queen) => (
                  <div key={queen.id} className="group bg-white rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all duration-200 card-lift overflow-hidden">
                    {/* Photo */}
                    <div className="aspect-[3/4] bg-gradient-to-br from-navy-100 to-patriot-100 flex items-center justify-center relative overflow-hidden">
                      {(queen as any).photoUrl ? (
                        <img
                          src={(queen as any).photoUrl}
                          alt={queen.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-navy-400">
                          <Crown className="w-16 h-16 opacity-30" />
                          <span className="text-xs font-medium opacity-50">Photo Coming Soon</span>
                        </div>
                      )}
                      {/* Year badge */}
                      <div className="absolute top-3 right-3 bg-gold-400 text-navy-900 rounded-full px-2.5 py-1 text-xs font-display font-bold shadow">
                        {year}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-serif text-lg font-semibold text-navy-900 leading-tight">{queen.name}</h3>
                        <Star className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                      </div>
                      {(queen as any).title && (
                        <p className="text-xs text-patriot-600 font-medium mb-1">{(queen as any).title}</p>
                      )}
                      {(queen as any).hometown && (
                        <p className="text-xs text-muted-foreground mb-3">{(queen as any).hometown}</p>
                      )}
                      {queen.bio && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{queen.bio}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {sortedYears.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <Crown className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-serif">Festival Queens gallery coming soon.</p>
              <p className="text-sm mt-2">Contact us to submit historical queen records.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-patriot-50 border-t border-patriot-100 py-14">
        <div className="container text-center">
          <Award className="w-10 h-10 text-patriot-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-navy-900 mb-3">Know a Past Festival Queen?</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Help us build our complete historical gallery. If you have photos or information about past Festival Queens, please reach out.
          </p>
          <a
            href="mailto:patriot@nc4thofjuly.com?subject=Festival Queen History"
            className="inline-flex items-center gap-2 px-6 py-3 bg-patriot-600 text-white rounded-lg font-medium hover:bg-patriot-700 transition-colors btn-press text-sm"
          >
            <Star className="w-4 h-4" />
            Submit Queen Information
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
