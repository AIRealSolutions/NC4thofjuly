import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Star, ChevronRight, Calendar, Users, Flag, Music, Waves, Flame, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";

// ── Countdown ─────────────────────────────────────────────────────────────────
function useCountdown() {
  const getTarget = () => {
    const now = new Date();
    const year = now.getMonth() > 5 || (now.getMonth() === 6 && now.getDate() > 4)
      ? now.getFullYear() + 1
      : now.getFullYear();
    return new Date(`${year}-07-04T00:00:00`);
  };

  const calc = () => {
    const diff = getTarget().getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000)  / 60000),
      seconds: Math.floor((diff % 60000)    / 1000),
    };
  };

  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-20 h-20 md:w-28 md:h-28 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center shadow-2xl">
          <span className="countdown-digit text-3xl md:text-5xl font-bold text-white tabular-nums">
            {String(value).padStart(2, "0")}
          </span>
        </div>
      </div>
      <span className="mt-2 text-xs md:text-sm font-display tracking-widest text-gold-300 uppercase">{label}</span>
    </div>
  );
}

// ── Feature Cards ─────────────────────────────────────────────────────────────
const HIGHLIGHTS = [
  {
    icon: Flag,
    title: "Grand Parade",
    desc: "The centerpiece of our festival — floats, bands, military units, and thousands of spectators lining the streets of Southport.",
    href: "/parade",
    color: "text-patriot-500",
    bg: "bg-patriot-50",
  },
  {
    icon: Flame,
    title: "Fireworks Spectacular",
    desc: "A breathtaking display over the Cape Fear River at 9 PM on July 4th, visible from the waterfront, boats, and Oak Island.",
    href: "/events",
    color: "text-gold-500",
    bg: "bg-gold-100",
  },
  {
    icon: Music,
    title: "Patriot's Ball",
    desc: "An elegant evening of celebration, music, and community at one of the festival's most beloved signature events.",
    href: "/events",
    color: "text-navy-600",
    bg: "bg-navy-50",
  },
  {
    icon: Waves,
    title: "Beach Day",
    desc: "Volleyball, skateboarding, and family fun on Oak Island — a beloved tradition that draws crowds of all ages.",
    href: "/events",
    color: "text-patriot-500",
    bg: "bg-patriot-50",
  },
  {
    icon: Award,
    title: "Naturalization Ceremony",
    desc: "Since 1996, new citizens from around the world take their Oath of Citizenship in this moving patriotic ceremony.",
    href: "/events",
    color: "text-gold-500",
    bg: "bg-gold-100",
  },
  {
    icon: Users,
    title: "Arts & Crafts",
    desc: "Over 100 handmade arts and craft vendors set up in Franklin Square Park, celebrating local artisans and makers.",
    href: "/events",
    color: "text-navy-600",
    bg: "bg-navy-50",
  },
];

const STATS = [
  { value: "230+", label: "Years of Tradition" },
  { value: "50K+", label: "Annual Attendees" },
  { value: "100+", label: "Arts & Craft Vendors" },
  { value: "1795", label: "First Recorded Festival" },
];

export default function Home() {
  const countdown = useCountdown();
  const { data: upcomingEvents } = trpc.events.list.useQuery({ limit: 6, activeOnly: true });

  return (
    <PublicLayout>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/manus-storage/hero_fireworks_09ec57b2.jpg')" }}
        />
        <div className="hero-overlay absolute inset-0" />

        {/* Stars pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-stars" />

        {/* Content */}
        <div className="relative z-10 container text-center py-24 md:py-32">
          <div className="animate-fade-up">
            <Badge className="mb-6 bg-patriot-600/80 text-white border-patriot-400 backdrop-blur-sm text-xs font-display tracking-widest px-4 py-1.5">
              Southport, North Carolina
            </Badge>
          </div>

          <h1 className="animate-fade-up delay-100 font-display text-4xl md:text-6xl lg:text-7xl xl:text-8xl text-white mb-4 leading-tight">
            NC 4th of July
            <br />
            <span className="text-gradient-gold">Festival</span>
          </h1>

          <p className="animate-fade-up delay-200 text-lg md:text-xl text-navy-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            Celebrating American independence and patriotism in Southport since 1795.
            Over 230 years of tradition, community, and the spirit of freedom.
          </p>

          {/* Countdown */}
          <div className="animate-fade-up delay-300 mb-10">
            <p className="font-display text-xs tracking-widest text-gold-300 mb-4 uppercase">
              Countdown to July 4th
            </p>
            <div className="flex items-start justify-center gap-3 md:gap-6">
              <CountdownUnit value={countdown.days}    label="Days" />
              <span className="text-3xl md:text-5xl text-white/50 font-light mt-5 md:mt-8">:</span>
              <CountdownUnit value={countdown.hours}   label="Hours" />
              <span className="text-3xl md:text-5xl text-white/50 font-light mt-5 md:mt-8">:</span>
              <CountdownUnit value={countdown.minutes} label="Minutes" />
              <span className="text-3xl md:text-5xl text-white/50 font-light mt-5 md:mt-8">:</span>
              <CountdownUnit value={countdown.seconds} label="Seconds" />
            </div>
          </div>

          {/* CTAs */}
          <div className="animate-fade-up delay-400 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/events">
              <Button size="lg" className="bg-patriot-600 hover:bg-patriot-700 text-white shadow-xl px-8 btn-press gap-2 text-base">
                <Calendar className="w-4 h-4" />
                View All Events
              </Button>
            </Link>
            <Link href="/parade/register">
              <Button size="lg" variant="outline" className="border-white/40 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-8 btn-press gap-2 text-base">
                <Star className="w-4 h-4" />
                Join the Parade
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-60">
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-white/60" />
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <section className="bg-navy-900 text-white py-10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-navy-700">
            {STATS.map((s) => (
              <div key={s.label} className="text-center px-6">
                <div className="font-display text-3xl md:text-4xl text-gold-400 mb-1">{s.value}</div>
                <div className="text-xs text-navy-400 tracking-wide uppercase font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="font-display text-xs tracking-widest text-patriot-500 mb-3 uppercase">About the Festival</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-navy-900 mb-6 leading-tight">
                America's Longest-Running<br />
                <span className="text-patriot-600">Independence Celebration</span>
              </h2>
              <div className="section-divider w-16 mb-8" />
              <p className="text-muted-foreground leading-relaxed mb-5">
                The history of Southport's Fourth of July Festival was first recorded in a newspaper in 1795, when ship crews anchored in the harbor would discharge cannon salutes at daybreak in what was known as the "Festival of Free Men."
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Incorporated in 1972 as the North Carolina Fourth of July Festival, Inc., this beloved three-to-four day celebration now draws 40,000 to 50,000 visitors from every state in the nation, honoring our nation's birthday with parades, ceremonies, fireworks, arts, music, and community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/history">
                  <Button variant="outline" className="gap-2 border-navy-300 text-navy-700 hover:bg-navy-50 btn-press">
                    Read Our History
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/heritage">
                  <Button variant="ghost" className="gap-2 text-patriot-600 hover:text-patriot-700 hover:bg-patriot-50 btn-press">
                    Heritage & Timeline
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/manus-storage/hero_parade_dc600b1d.jpg"
                  alt="NC 4th of July Festival Parade"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 bg-patriot-600 text-white rounded-2xl p-5 shadow-xl">
                <div className="font-display text-3xl font-bold">230+</div>
                <div className="text-xs text-patriot-200 tracking-wide">Years of Tradition</div>
              </div>
              <div className="absolute -top-4 -right-4 bg-gold-400 text-navy-900 rounded-xl p-4 shadow-lg">
                <div className="font-display text-lg font-bold">Est. 1795</div>
                <div className="text-xs text-navy-700">Southport, NC</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Signature Events ──────────────────────────────────────────────── */}
      <section className="py-20 bg-navy-50">
        <div className="container">
          <div className="text-center mb-14">
            <p className="font-display text-xs tracking-widest text-patriot-500 mb-3 uppercase">What to Expect</p>
            <h2 className="text-3xl md:text-4xl font-serif text-navy-900 mb-4">Signature Festival Events</h2>
            <div className="section-divider w-16 mx-auto mb-4" />
            <p className="text-muted-foreground max-w-xl mx-auto">
              From patriotic ceremonies to family fun, the NC 4th of July Festival offers something for everyone across Southport and Oak Island.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href}>
                  <div className="group bg-white rounded-2xl p-6 shadow-sm border border-border hover:shadow-lg transition-all duration-200 card-lift h-full flex flex-col">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", item.bg)}>
                      <Icon className={cn("w-6 h-6", item.color)} />
                    </div>
                    <h3 className="text-lg font-serif font-semibold text-navy-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.desc}</p>
                    <div className={cn("mt-4 flex items-center gap-1 text-sm font-medium", item.color)}>
                      Learn more <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link href="/events">
              <Button size="lg" className="bg-navy-900 hover:bg-navy-800 text-white gap-2 btn-press">
                <Calendar className="w-4 h-4" />
                View Full Event Calendar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Parade CTA ────────────────────────────────────────────────────── */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/manus-storage/hero_festival_e815b315.jpg')" }}
        />
        <div className="absolute inset-0 bg-navy-900/80" />
        <div className="relative z-10 container text-center">
          <p className="font-display text-xs tracking-widest text-gold-400 mb-3 uppercase">Parade Registration</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white mb-5 leading-tight">
            Be Part of the Parade
          </h2>
          <p className="text-navy-200 max-w-xl mx-auto mb-8 text-lg leading-relaxed">
            Whether you're a first-time participant or a returning marcher, we'd love to have you in our annual parade through downtown Southport on July 4th.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/parade/register">
              <Button size="lg" className="bg-patriot-600 hover:bg-patriot-700 text-white shadow-xl px-8 btn-press gap-2">
                <Star className="w-4 h-4" />
                New Participant Registration
              </Button>
            </Link>
            <Link href="/parade/renew">
              <Button size="lg" variant="outline" className="border-white/40 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-8 btn-press">
                Returning Participant Renewal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Heritage Preview ──────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Heritage */}
            <div className="lg:col-span-1 bg-navy-900 text-white rounded-2xl p-8 flex flex-col">
              <Flag className="w-10 h-10 text-gold-400 mb-5" />
              <h3 className="text-2xl font-serif mb-3">Festival Heritage</h3>
              <p className="text-navy-300 text-sm leading-relaxed flex-1 mb-6">
                Explore our rich history through an interactive timeline, meet past presidents, and honor the committee members who have shaped this beloved tradition.
              </p>
              <Link href="/heritage">
                <Button variant="outline" className="border-navy-600 text-navy-200 hover:bg-navy-800 w-full btn-press gap-2">
                  Explore Heritage
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Queens */}
            <div className="lg:col-span-1 bg-patriot-600 text-white rounded-2xl p-8 flex flex-col">
              <Award className="w-10 h-10 text-gold-300 mb-5" />
              <h3 className="text-2xl font-serif mb-3">Festival Queens</h3>
              <p className="text-patriot-100 text-sm leading-relaxed flex-1 mb-6">
                A gallery celebrating the young women who have represented our festival with grace and patriotism throughout the decades.
              </p>
              <Link href="/queens">
                <Button variant="outline" className="border-patriot-400 text-white hover:bg-patriot-700 w-full btn-press gap-2">
                  View Queens Gallery
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Volunteer */}
            <div className="lg:col-span-1 bg-gold-400 text-navy-900 rounded-2xl p-8 flex flex-col">
              <Users className="w-10 h-10 text-navy-700 mb-5" />
              <h3 className="text-2xl font-serif mb-3">Volunteer with Us</h3>
              <p className="text-navy-700 text-sm leading-relaxed flex-1 mb-6">
                The festival is powered by hundreds of dedicated volunteers. Join us and help make this year's celebration the best yet.
              </p>
              <Link href="/volunteer">
                <Button className="bg-navy-900 hover:bg-navy-800 text-white w-full btn-press gap-2">
                  Sign Up to Volunteer
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact Strip ─────────────────────────────────────────────────── */}
      <section className="bg-navy-50 border-t border-border py-12">
        <div className="container text-center">
          <p className="font-display text-xs tracking-widest text-patriot-500 mb-3 uppercase">Get in Touch</p>
          <h2 className="text-2xl font-serif text-navy-900 mb-2">NC 4th of July Festival</h2>
          <p className="text-muted-foreground mb-1">P.O. Box 11247, Southport NC 28461</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 text-sm">
            <a href="tel:+19104575578" className="flex items-center gap-2 text-navy-700 hover:text-patriot-600 transition-colors">
              <span className="font-medium">+1 910-457-5578</span>
            </a>
            <span className="hidden sm:block text-border">|</span>
            <a href="mailto:patriot@nc4thofjuly.com" className="flex items-center gap-2 text-navy-700 hover:text-patriot-600 transition-colors">
              <span className="font-medium">patriot@nc4thofjuly.com</span>
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
