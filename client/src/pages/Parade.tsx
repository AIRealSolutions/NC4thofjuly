import { Link } from "wouter";
import { Flag, MapPin, Clock, Users, Star, ChevronRight, Info, Truck, Music, Car, Shield, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";

const ENTRY_TYPES = [
  { icon: Truck, label: "Floats", desc: "Decorated floats of any size — the heart of the parade." },
  { icon: Music, label: "Marching Bands", desc: "School and community bands welcome." },
  { icon: Car, label: "Antique Vehicles", desc: "Classic cars, trucks, and antique automobiles." },
  { icon: Users, label: "Walking Groups", desc: "Civic organizations, clubs, and community groups." },
  { icon: Flag, label: "Military Units", desc: "Active duty, reserve, and veteran organizations." },
  { icon: Star, label: "Equestrian", desc: "Horses and equestrian groups — a crowd favorite." },
];

const PARADE_RULES = [
  "All entries must be registered and approved prior to the parade.",
  "Floats may not exceed 65 feet in length including towing vehicle.",
  "No candy, beads, or items may be thrown from moving vehicles — only handed to spectators by walkers.",
  "All entries must maintain a consistent pace and keep up with the parade flow.",
  "Music must be appropriate for a family audience.",
  "Political campaign entries are not permitted.",
  "Animals must be under control at all times with handlers.",
  "Staging areas will be assigned upon registration approval.",
  "Check-in begins at 7:00 AM on July 4th at the designated staging area.",
  "The parade steps off at 10:00 AM sharp from Atlantic Ave & E Moore St.",
];

export default function Parade() {
  const { data: count } = trpc.parade.count.useQuery({ year: 2026 });

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-navy-900 text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-stars opacity-20" />
        <div className="relative container text-center">
          <p className="font-display text-xs tracking-widest text-gold-400 mb-3 uppercase">July 4th, 2026 · 10:00 AM</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-5">Grand Independence Day Parade</h1>
          <div className="section-divider w-16 mx-auto mb-5" />
          <p className="text-navy-300 max-w-xl mx-auto text-lg leading-relaxed">
            The centerpiece of the NC 4th of July Festival — floats, bands, military units, and thousands of spectators lining the streets of historic downtown Southport.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 flex-wrap">
            <Link href="/parade/register">
              <Button size="lg" className="bg-patriot-600 hover:bg-patriot-700 text-white btn-press gap-2">
                <Star className="w-4 h-4" /> New Participant Registration
              </Button>
            </Link>
            <Link href="/parade/renew">
              <Button size="lg" variant="outline" className="border-white/40 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm btn-press gap-2">
                <ChevronRight className="w-4 h-4" /> Returning Participant Renewal
              </Button>
            </Link>
            <Link href="/parade/find">
              <Button size="lg" variant="outline" className="border-gold-400/60 text-gold-300 bg-gold-500/10 hover:bg-gold-500/20 backdrop-blur-sm btn-press gap-2">
                <Search className="w-4 h-4" /> Find My Unit
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Facts */}
      <section className="bg-white border-b border-border">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-border">
            {[
              { icon: Clock, label: "Step-Off Time", value: "10:00 AM" },
              { icon: MapPin, label: "Start Location", value: "Lord Street, Southport" },
              { icon: Flag, label: "Route Length", value: "~1.5 Miles" },
              { icon: Users, label: "2026 Entries", value: count ? `${count} Registered` : "Registration Open" },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="text-center px-6">
                  <Icon className="w-5 h-5 text-patriot-500 mx-auto mb-2" />
                  <div className="font-semibold text-navy-900 text-sm">{f.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{f.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Parade Route Map */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="font-display text-xs tracking-widest text-patriot-500 mb-3 uppercase">Parade Route</p>
              <h2 className="text-3xl font-serif text-navy-900 mb-4">Route & Staging</h2>
              <div className="section-divider w-16 mb-6" />
              <p className="text-muted-foreground leading-relaxed mb-6">
                The parade begins at the intersection of Atlantic Avenue and East Moore Street, travels <strong>west on Moore Street</strong>, turns <strong>right (north) onto Howe Street</strong>, then turns <strong>right onto Fodale Avenue</strong> — passing through the nursing home parking lot before disbanding near the cemetery on Fodale Avenue.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { step: "1", label: "Parade Start — Atlantic Ave & E Moore St", desc: "Units step off heading WEST on E Moore Street. Check-in begins at 7:00 AM; parade steps off at 10:00 AM.", color: "bg-gold-400" },
                  { step: "2", label: "Turn Right — Moore St & Howe St", desc: "Units turn RIGHT (north) onto Howe Street. Marshal stationed at this intersection.", color: "bg-patriot-500" },
                  { step: "3", label: "Turn Right — Howe St & Fodale Ave", desc: "Units turn RIGHT onto Fodale Avenue toward the nursing home. Marshal stationed here.", color: "bg-navy-600" },
                  { step: "4", label: "Disband — Fodale Ave near Cemetery", desc: "Units pass through the nursing home parking lot and disband on Fodale Ave near the cemetery.", color: "bg-green-600" },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full ${s.color} text-white flex items-center justify-center text-sm font-bold shrink-0`}>
                      {s.step}
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900 text-sm">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-navy-50 rounded-xl p-5 border border-navy-100">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-navy-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-navy-900 text-sm mb-1">Parking for Participants</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Staging assignments are provided with your registration confirmation. Shriners stage on <strong>S Atlantic Ave</strong>; politicians on <strong>N Atlantic Ave</strong>. Remaining entries stage on <strong>E Moore St</strong> in double lanes (left and right) extending toward Rhett Street. Specific staging spots are assigned by the parade marshal.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden shadow-xl border border-border">
              <div className="bg-navy-800 text-white px-5 py-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold-400" />
                <span className="text-sm font-medium">Parade Route — Downtown Southport, NC</span>
              </div>
              <iframe
                title="Parade Route Map — Southport NC"
                width="100%"
                height="420"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m58!1m12!1m3!1d1641.9!2d-78.0210!3d33.9195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m43!3e2!4m5!1s0x89aa0e1a2b3c4d5e%3A0x1!2sAtlantic+Ave+%26+E+Moore+St%2C+Southport%2C+NC+28461!3m2!1d33.9185!2d-78.0158!4m5!1s0x89aa0e1a2b3c4d5e%3A0x2!2sMoore+St+%26+Howe+St%2C+Southport%2C+NC+28461!3m2!1d33.9185!2d-78.0210!4m5!1s0x89aa0e1a2b3c4d5e%3A0x3!2sHowe+St+%26+Fodale+Ave%2C+Southport%2C+NC+28461!3m2!1d33.9215!2d-78.0210!4m5!1s0x89aa0e1a2b3c4d5e%3A0x4!2sFodale+Ave%2C+Southport%2C+NC+28461!3m2!1d33.9225!2d-78.0195!5e0!3m2!1sen!2sus!4v1751060000000"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Entry Types */}
      <section className="py-16 bg-navy-50">
        <div className="container">
          <div className="text-center mb-12">
            <p className="font-display text-xs tracking-widest text-patriot-500 mb-3 uppercase">Who Can Participate</p>
            <h2 className="text-3xl font-serif text-navy-900 mb-4">Parade Entry Types</h2>
            <div className="section-divider w-16 mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ENTRY_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.label} className="bg-white rounded-xl border border-border p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-patriot-50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-patriot-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy-900 text-sm">{type.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Shriners Special Group CTA */}
      <section className="py-16 bg-gradient-to-br from-gold-50 to-amber-50 border-y border-gold-200">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center shadow-md">
                    <Star className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div>
                    <p className="font-display text-xs tracking-widest text-gold-700 uppercase">Special Group</p>
                    <h2 className="text-2xl font-serif text-navy-900">Shriners International</h2>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Shriner units are honored guests of the NC 4th of July Parade and receive a <strong>dedicated staging area on S Atlantic Ave</strong>, reserved exclusively for Shriners International temple units. Mini cars, motorcycles, clown units, marching units, color guards, and bands are all welcome.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/parade/shriners">
                    <Button className="bg-gold-500 hover:bg-gold-600 text-white gap-2 btn-press">
                      <Star className="w-4 h-4 fill-white" />
                      New Shriner Registration
                    </Button>
                  </Link>
                  <Link href="/parade/shriners/renew">
                    <Button variant="outline" className="border-gold-400 text-gold-700 hover:bg-gold-50 gap-2 btn-press">
                      <ChevronRight className="w-4 h-4" />
                      Returning Shriner Renewal
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Mini Cars", icon: Car },
                  { label: "Motorcycles", icon: Car },
                  { label: "Clown Units", icon: Users },
                  { label: "Marching Units", icon: Flag },
                  { label: "Color Guard", icon: Flag },
                  { label: "Bands", icon: Music },
                ].map(({ label, icon: Icon }) => (
                  <div key={label} className="bg-white rounded-xl border border-gold-200 p-3 flex items-center gap-2 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-gold-600" />
                    </div>
                    <span className="text-sm font-medium text-navy-900">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <p className="font-display text-xs tracking-widest text-patriot-500 mb-3 uppercase">Before You Register</p>
            <h2 className="text-3xl font-serif text-navy-900 mb-4">Parade Rules & Guidelines</h2>
            <div className="section-divider w-16 mx-auto" />
          </div>
          <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
            <ul className="space-y-3">
              {PARADE_RULES.map((rule, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-patriot-100 text-patriot-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Registration CTA */}
      <section className="bg-patriot-600 text-white py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-serif mb-4">Ready to Join the Parade?</h2>
          <p className="text-patriot-100 max-w-lg mx-auto mb-8 text-lg">
            New participants complete the full registration form. Returning participants from previous years can use the streamlined renewal flow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/parade/register">
              <Button size="lg" className="bg-white text-patriot-700 hover:bg-patriot-50 btn-press gap-2 px-8">
                <Star className="w-4 h-4" />
                New Participant Registration
              </Button>
            </Link>
            <Link href="/parade/renew">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 btn-press gap-2 px-8">
                <ChevronRight className="w-4 h-4" />
                Returning Participant Renewal
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-patriot-200">
            Questions? Contact the Parade Division: <a href="mailto:patriot@nc4thofjuly.com" className="underline hover:text-white">patriot@nc4thofjuly.com</a>
          </p>
          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-patriot-200 text-sm mb-3">Are you a parade marshal?</p>
            <Link href="/parade/login">
              <Button size="sm" variant="outline" className="border-white/40 text-white hover:bg-white/10 gap-2">
                <Shield className="w-4 h-4" />
                Marshal Station Login
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
