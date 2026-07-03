import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Star, Phone, Mail, MapPin, Facebook, Instagram, Youtube, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/parade", label: "Parade" },
  { href: "/heritage", label: "Heritage" },
  { href: "/queens", label: "Festival Queens" },
  { href: "/history", label: "History" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/committees", label: "Committees" },
];

const PARADE_QUICK_LINKS = [
  { href: "/parade/find", label: "Find My Unit", icon: Search },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const isHome = location === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="bg-navy-900 text-navy-100 text-xs py-2 hidden md:block">
        <div className="container flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a href="tel:+19104575578" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-3 h-3" />
              +1 910-457-5578
            </a>
            <a href="mailto:patriot@nc4thofjuly.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail className="w-3 h-3" />
              patriot@nc4thofjuly.com
            </a>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              P.O. Box 11247, Southport NC 28461
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://www.facebook.com/nc4thofjulyfestival" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Facebook">
              <Facebook className="w-3.5 h-3.5" />
            </a>
            <a href="https://www.instagram.com/nc4thofjulyfest/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
              <Instagram className="w-3.5 h-3.5" />
            </a>
            <a href="https://www.youtube.com/@nc4thofjulyfestival" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="YouTube">
              <Youtube className="w-3.5 h-3.5" />
            </a>
            <Link href="/admin" className="ml-2 px-3 py-0.5 rounded-full border border-navy-600 text-navy-300 hover:bg-navy-800 hover:text-white transition-colors text-xs">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Navigation ─────────────────────────────────────────────────── */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled || !isHome
            ? "bg-white/95 backdrop-blur-md shadow-md border-b border-border"
            : "bg-transparent"
        )}
      >
        <div className="container flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img
              src="/manus-storage/nc4july_logo_1aa2c11c.png"
              alt="NC 4th of July Festival"
              className="h-10 md:h-14 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-2.5 py-2 rounded-md text-xs font-medium transition-colors duration-150 whitespace-nowrap",
                  location === link.href
                    ? "text-patriot-600 bg-patriot-50"
                    : scrolled || !isHome
                    ? "text-navy-800 hover:text-patriot-600 hover:bg-patriot-50"
                    : "text-white hover:text-gold-300 hover:bg-white/10"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* Find My Unit quick-access */}
            <Link
              href="/parade/find"
              title="Find My Unit — look up your staging zone"
              className={cn(
                "hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 btn-press",
                scrolled || !isHome
                  ? "text-navy-700 border border-navy-200 hover:bg-navy-50"
                  : "text-white/80 border border-white/30 hover:bg-white/10"
              )}
            >
              <Search className="w-3.5 h-3.5" />
              Find My Unit
            </Link>
            <Link
              href="/parade/register"
              className={cn(
                "hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-150 btn-press",
                scrolled || !isHome
                  ? "bg-patriot-600 text-white hover:bg-patriot-700"
                  : "bg-white text-navy-900 hover:bg-gold-100"
              )}
            >
              <Star className="w-3.5 h-3.5" />
              Join the Parade
            </Link>
            <button
              className={cn(
                "lg:hidden p-2 rounded-md transition-colors",
                scrolled || !isHome ? "text-navy-800 hover:bg-navy-100" : "text-white hover:bg-white/10"
              )}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-border shadow-lg animate-fade-up">
            <nav className="container py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-3 rounded-md text-sm font-medium transition-colors",
                    location === link.href
                      ? "bg-patriot-50 text-patriot-600"
                      : "text-navy-800 hover:bg-navy-50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
                <Link href="/parade/find" className="px-4 py-3 bg-navy-800 text-white rounded-md text-sm font-semibold text-center hover:bg-navy-700 transition-colors flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" /> Find My Unit
                </Link>
                <Link href="/parade/register" className="px-4 py-3 bg-patriot-600 text-white rounded-md text-sm font-semibold text-center hover:bg-patriot-700 transition-colors">
                  Join the Parade
                </Link>
                <Link href="/admin" className="px-4 py-3 border border-navy-200 text-navy-700 rounded-md text-sm font-medium text-center hover:bg-navy-50 transition-colors">
                  Staff Portal
                </Link>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2 text-xs text-muted-foreground">
                <a href="tel:+19104575578" className="flex items-center gap-2">
                  <Phone className="w-3 h-3" /> +1 910-457-5578
                </a>
                <a href="mailto:patriot@nc4thofjuly.com" className="flex items-center gap-2">
                  <Mail className="w-3 h-3" /> patriot@nc4thofjuly.com
                </a>
                <span className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> P.O. Box 11247, Southport NC 28461
                </span>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ── Page Content ────────────────────────────────────────────────────── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-navy-950 text-navy-200">
        {/* Stripe accent */}
        <div className="h-1 stripe-accent" />

        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="lg:col-span-1">
              <img
                src="/manus-storage/nc4july_logo_1aa2c11c.png"
                alt="NC 4th of July Festival"
                className="h-16 w-auto object-contain mb-4 brightness-0 invert opacity-90"
              />
              <p className="text-sm text-navy-400 leading-relaxed">
                Celebrating American independence and patriotism in Southport, NC since 1795. A proud 501(c)(3) non-profit organization.
              </p>
              <div className="flex items-center gap-3 mt-5">
                <a href="https://www.facebook.com/nc4thofjulyfestival" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center hover:bg-patriot-600 transition-colors" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://www.instagram.com/nc4thofjulyfest/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center hover:bg-patriot-600 transition-colors" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://www.youtube.com/@nc4thofjulyfestival" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center hover:bg-patriot-600 transition-colors" aria-label="YouTube">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display text-xs text-gold-400 mb-4 tracking-widest">Festival</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { href: "/events", label: "All Events" },
                  { href: "/parade", label: "Parade Information" },
                  { href: "/parade/register", label: "Parade Registration" },
                  { href: "/volunteer", label: "Volunteer" },
                  { href: "/committees", label: "Committee Directory" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-navy-400 hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Heritage */}
            <div>
              <h4 className="font-display text-xs text-gold-400 mb-4 tracking-widest">Heritage</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { href: "/heritage", label: "Heritage & Timeline" },
                  { href: "/queens", label: "Festival Queens" },
                  { href: "/history", label: "Festival History" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-navy-400 hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display text-xs text-gold-400 mb-4 tracking-widest">Contact</h4>
              <ul className="space-y-3 text-sm text-navy-400">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-patriot-400" />
                  <span>P.O. Box 11247<br />Southport NC 28461</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0 text-patriot-400" />
                  <a href="tel:+19104575578" className="hover:text-white transition-colors">+1 910-457-5578</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0 text-patriot-400" />
                  <a href="mailto:patriot@nc4thofjuly.com" className="hover:text-white transition-colors">patriot@nc4thofjuly.com</a>
                </li>
              </ul>
              <div className="mt-5">
                <Link href="/admin" className="text-xs text-navy-500 hover:text-navy-300 transition-colors">
                  Staff / Committee Portal →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-navy-800">
          <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-navy-500">
            <p>© {new Date().getFullYear()} NC 4th of July Festival, Inc. All rights reserved. A 501(c)(3) non-profit organization.</p>
            <p>Southport, NC — Celebrating America Since 1795</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
