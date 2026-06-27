import { useState } from "react";
import { Users, Mail, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";

// Static fallback from the 2026 PDF
const STATIC_DIVISIONS = [
  { division: "2026 Officers", members: [
    { name: "Hugh Fosbury", role: "President", email: "hugh.fosbury@itrip.net" },
    { name: "Brett McKeithan", role: "Vice President", email: "r87201@yahoo.com" },
    { name: "Melissa Goff", role: "Secretary", email: "melissagoff1@gmail.com" },
    { name: "Duncan Hilburn", role: "Treasurer", email: "duncan@bpccpas.com" },
    { name: "Lucinda Arnold", role: "Past President", email: "coastalpaintingnc@yahoo.com" },
    { name: "Ali Travis", role: "At Large", email: "atravis@rrvet.com" },
    { name: "Karl Elken", role: "At Large", email: "karl@salesgeekcsg.com" },
    { name: "Andrew Broshe", role: "At Large", email: "andrew@madenewinteriors.com" },
    { name: "Cindy Nimmich", role: "Publicity Division Chair", email: "cjnim@yahoo.com" },
    { name: "Charles Drew", role: "Finance Division Chair", email: "cdrew@cityofsouthport.gov" },
    { name: "Keesha Starr", role: "Events Division Chair", email: "keesha@kstarrcoaching.com" },
    { name: "Todd Coring", role: "Security", email: "tcoring@cityofsouthport.gov" },
    { name: "Peter Shannon", role: "Logistics Division Chair", email: "pete.shannon@comcast.net" },
  ]},
  { division: "Ex-Officio Members", members: [
    { name: "Allayna Taylor", role: "Administrator", email: "ataylor@cityofsouthport.gov" },
    { name: "Morgan Harper", role: "Advisor", email: "morgan@stateportpilot.com" },
    { name: "Stephen Kane", role: "Advisor", email: "stephenkanenc@gmail.com" },
    { name: "Chris Cadman", role: "Advisor", email: "chrisc@capefearradio.com" },
    { name: "Rebecca Kelley", role: "City of Southport", email: "rkelley@cityofsouthport.com" },
    { name: "Heather O'Brien", role: "Town of Oak Island", email: "hobrien@oakislandnc.com" },
  ]},
  { division: "Government Division", members: [
    { name: "Elizabeth Neumann", role: "Sunny Point" },
    { name: "Sen Chief Adkisson", role: "Coast Guard" },
    { name: "Capt. Angela Kreuser", role: "Civil Air Patrol" },
  ]},
  { division: "Security Division", members: [
    { name: "Todd Coring", role: "Division Chair", email: "tcoring@cityofsouthport.gov" },
    { name: "Thomas Moore", role: "Southport Police Department" },
    { name: "Richard Merritt", role: "GRL Security and Staffing" },
  ]},
  { division: "Publicity Division", members: [
    { name: "Cindy Nimmich", role: "Division Chair", email: "cjnim@yahoo.com" },
    { name: "Allayna Taylor", role: "Media & Public Relations / Events Calendar" },
    { name: "Chris Cadman", role: "Cape Fear Radio" },
  ]},
  { division: "Finance Division", members: [
    { name: "Charles Drew", role: "Division Chair", email: "cdrew@cityofsouthport.gov" },
    { name: "Marion Martin", role: "Arts & Crafts" },
    { name: "Brett McKeithan", role: "Patriots Ball" },
    { name: "Sarah Hunter", role: "Sponsorships" },
  ]},
  { division: "Logistics Division", members: [
    { name: "Peter Shannon", role: "Division Chair", email: "pete.shannon@comcast.net" },
    { name: "Jessie Labell", role: "Accommodations / Non-profit Coordinator" },
    { name: "Karen Martin", role: "Festival Signage / Necessity Stations" },
    { name: "Andrew Broshe", role: "Volunteer Coordinator" },
  ]},
  { division: "Events Division", members: [
    { name: "Keesha Starr", role: "Division Chair", email: "keesha@kstarrcoaching.com" },
    { name: "Mary Beth Livers", role: "Children's Entertainment / Kid Zone" },
    { name: "Ryan Gordon", role: "Beach Day" },
    { name: "Duncan Hilburn", role: "Parade" },
    { name: "Lucinda Arnold", role: "Fireworks" },
    { name: "George Fryer", role: "Parade Book" },
    { name: "Rachel Hilburn", role: "Parade Book" },
    { name: "Ali Travis", role: "Salute to Veterans" },
    { name: "Todd Coring", role: "Safety Vehicle Display" },
    { name: "Charles Drew", role: "Safety Vehicle Display / World's Largest Ice Cream" },
    { name: "Ginger Harper", role: "Welcoming Reception" },
  ]},
];

export default function Committees() {
  const [search, setSearch] = useState("");
  const { data: dbMembers } = trpc.committees.list.useQuery({ activeOnly: true });

  // Build display data
  let divisions = STATIC_DIVISIONS;
  if (dbMembers && dbMembers.length > 0) {
    const grouped = dbMembers.reduce((acc, m) => {
      const key = m.committee ?? "General";
      if (!acc[key]) acc[key] = [];
      acc[key].push({ name: m.name, role: m.role, email: m.email ?? undefined });
      return acc;
    }, {} as Record<string, { name: string; role: string; email?: string }[]>);
    divisions = Object.entries(grouped).map(([division, members]) => ({ division, members }));
  }

  const filtered = search.trim()
    ? divisions.map((d) => ({
        ...d,
        members: d.members.filter(
          (m) =>
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.role.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((d) => d.members.length > 0)
    : divisions;

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-navy-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-stars opacity-20" />
        <div className="relative container text-center">
          <p className="font-display text-xs tracking-widest text-gold-400 mb-3 uppercase">2026 Festival</p>
          <h1 className="text-4xl md:text-5xl font-serif mb-5">Committee Directory</h1>
          <div className="section-divider w-16 mx-auto mb-5" />
          <p className="text-navy-300 max-w-xl mx-auto text-lg leading-relaxed">
            Meet the dedicated volunteers and professionals who make the NC 4th of July Festival possible. As of May 19, 2026.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-border shadow-sm py-3">
        <div className="container max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </section>

      {/* Directory */}
      <section className="py-14">
        <div className="container">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No committee members found matching "{search}"</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((div) => (
                <div key={div.division} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="bg-navy-900 text-white px-6 py-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gold-400" />
                    <h3 className="font-serif text-base">{div.division}</h3>
                    <Badge className="ml-auto bg-navy-700 text-navy-200 border-navy-600 text-xs">{div.members.length}</Badge>
                  </div>
                  <div className="divide-y divide-border">
                    {div.members.map((m) => (
                      <div key={m.name + m.role} className="px-5 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-navy-900 text-sm truncate">{m.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{m.role}</p>
                        </div>
                        {m.email && (
                          <a
                            href={`mailto:${m.email}`}
                            className="text-patriot-500 hover:text-patriot-700 transition-colors shrink-0"
                            title={m.email}
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
