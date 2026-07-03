/**
 * FindMyUnit — /parade/find
 *
 * Public page for parade participants to quickly look up:
 *  - Their unit number & parade position
 *  - Their assigned staging zone & staging spot
 *  - Their current status (Staged / Called / Marching / Completed / No-Show)
 *
 * Search by unit name, contact name, or unit number. No login required.
 */

import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  Hash,
  User,
  Phone,
  Layers,
  Star,
  AlertCircle,
  CheckCircle2,
  Clock,
  Flag,
  Loader2,
} from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();

// Human-readable staging zone labels
const ZONE_LABELS: Record<string, { short: string; color: string; bg: string }> = {
  "S Atlantic (Shriners)":    { short: "S. Atlantic — Shriners",    color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  "N Atlantic (Politicians)": { short: "N. Atlantic — Politicians", color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  "E Moore Left":             { short: "E. Moore St — Left Lane",   color: "text-green-700",  bg: "bg-green-50 border-green-200" },
  "E Moore Right":            { short: "E. Moore St — Right Lane",  color: "text-emerald-700",bg: "bg-emerald-50 border-emerald-200" },
  "Moore-L":                  { short: "E. Moore St — Left Lane",   color: "text-green-700",  bg: "bg-green-50 border-green-200" },
  "Moore-R":                  { short: "E. Moore St — Right Lane",  color: "text-emerald-700",bg: "bg-emerald-50 border-emerald-200" },
  "Rhett St Left":            { short: "Rhett St — Left Lane",      color: "text-amber-700",  bg: "bg-amber-50 border-amber-200" },
  "Rhett St Right":           { short: "Rhett St — Right Lane",     color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  "Rhett-L":                  { short: "Rhett St — Left Lane",      color: "text-amber-700",  bg: "bg-amber-50 border-amber-200" },
  "Rhett-R":                  { short: "Rhett St — Right Lane",     color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  "N.Atlantic-R":             { short: "N. Atlantic — Right Lane",  color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  "N.Atlantic-L":             { short: "N. Atlantic — Left Lane",   color: "text-sky-700",    bg: "bg-sky-50 border-sky-200" },
};

function getZoneInfo(zone: string | null) {
  if (!zone) return null;
  return ZONE_LABELS[zone] ?? { short: zone, color: "text-gray-700", bg: "bg-gray-50 border-gray-200" };
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "staged":
      return <Badge className="bg-blue-100 text-blue-800 border border-blue-200 gap-1"><Clock className="w-3 h-3" />Staged — Awaiting Call</Badge>;
    case "called":
      return <Badge className="bg-amber-100 text-amber-800 border border-amber-200 gap-1"><Flag className="w-3 h-3" />Called to Step Off</Badge>;
    case "marching":
      return <Badge className="bg-green-100 text-green-800 border border-green-200 gap-1"><CheckCircle2 className="w-3 h-3" />Marching</Badge>;
    case "completed":
      return <Badge className="bg-gray-100 text-gray-600 border border-gray-200 gap-1"><CheckCircle2 className="w-3 h-3" />Completed</Badge>;
    case "scratched":
      return <Badge className="bg-red-100 text-red-800 border border-red-200 gap-1"><AlertCircle className="w-3 h-3" />No-Show / Scratched</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

type Unit = {
  id: number;
  unitNumber: number;
  unitName: string;
  entryType: string | null;
  contactName: string | null;
  contactPhone: string | null;
  stagingZone: string | null;
  stagingSpot: string | null;
  status: string;
};

function UnitCard({ unit }: { unit: Unit }) {
  const zone = getZoneInfo(unit.stagingZone);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Unit number header */}
      <div className="bg-gradient-to-r from-navy-800 to-navy-900 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center flex-shrink-0">
            <span className="text-navy-950 font-bold text-sm">{unit.unitNumber}</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-base leading-tight">{unit.unitName}</h3>
            {unit.entryType && (
              <p className="text-white/50 text-xs capitalize mt-0.5">
                {unit.entryType.replace(/_/g, " ")}
              </p>
            )}
          </div>
        </div>
        <StatusBadge status={unit.status} />
      </div>

      {/* Details */}
      <div className="px-5 py-4 space-y-3">
        {/* Staging zone */}
        {zone && (
          <div className={`flex items-start gap-3 p-3 rounded-xl border ${zone.bg}`}>
            <Layers className={`w-4 h-4 mt-0.5 flex-shrink-0 ${zone.color}`} />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Staging Zone</p>
              <p className={`font-semibold text-sm ${zone.color}`}>{zone.short}</p>
              {unit.stagingSpot && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Spot: <span className="font-medium text-gray-700">{unit.stagingSpot}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Parade position */}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>
            Parade Position: <span className="font-semibold text-gray-900">#{unit.unitNumber}</span>
          </span>
        </div>

        {/* Contact */}
        {unit.contactName && (
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{unit.contactName}</span>
          </div>
        )}
        {unit.contactPhone && (
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <a href={`tel:${unit.contactPhone}`} className="text-navy-700 hover:underline">
              {unit.contactPhone}
            </a>
          </div>
        )}

        {/* No staging zone fallback */}
        {!zone && (
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>Staging zone not yet assigned — check with your coordinator.</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FindMyUnit() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce: wait 350ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isFetching, isError } = trpc.paradeLive.searchUnits.useQuery(
    { year: CURRENT_YEAR, query: debouncedQuery },
    {
      enabled: debouncedQuery.length >= 1,
      staleTime: 10_000,
    }
  );

  // Auto-focus on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const hasResults = results && results.length > 0;
  const noResults = debouncedQuery.length >= 1 && !isFetching && results && results.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-[#0a0e1a]">
      {/* Hero header */}
      <div className="pt-12 pb-8 px-4 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold-500/20 border border-gold-500/40 mb-4">
          <Search className="w-6 h-6 text-gold-400" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-white mb-2">Find My Unit</h1>
        <p className="text-white/50 text-sm max-w-sm mx-auto">
          Search by your name, unit name, or unit number to find your staging zone and parade position.
        </p>
        <div className="flex items-center justify-center gap-1.5 text-white/25 text-xs mt-3">
          <Star className="w-3 h-3 fill-current" />
          <span>NC 4th of July Festival {CURRENT_YEAR} · Southport, NC</span>
          <Star className="w-3 h-3 fill-current" />
        </div>
      </div>

      {/* Search box */}
      <div className="max-w-lg mx-auto px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" />
          {isFetching && debouncedQuery.length >= 2 && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400 animate-spin" />
          )}
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your name, unit name, or unit #…"
            className="
              w-full pl-12 pr-12 py-4 rounded-2xl text-base
              bg-white/10 border border-white/20 text-white
              placeholder:text-white/30
              focus:outline-none focus:border-gold-400 focus:bg-white/15
              transition-all duration-200
            "
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>

      </div>

      {/* Results */}
      <div className="max-w-lg mx-auto px-4 pb-16 space-y-4">
        {/* Error state */}
        {isError && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm text-center">
            <AlertCircle className="w-4 h-4 inline mr-2" />
            Unable to search right now. Please try again in a moment.
          </div>
        )}

        {/* No results */}
        {noResults && (
          <div className="bg-white/5 border border-white/10 rounded-2xl py-10 text-center">
            <Search className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 font-medium">No units found for "{debouncedQuery}"</p>
            <p className="text-white/25 text-sm mt-1">
              Try searching by your last name, organization name, or unit number.
            </p>
          </div>
        )}

        {/* Results list */}
        {hasResults && results.map((unit) => (
          <UnitCard key={unit.id} unit={unit as Unit} />
        ))}

        {/* Prompt state (before search) */}
        {!debouncedQuery && (
          <div className="text-center py-8 space-y-4">
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              {[
                { icon: Hash, label: "Unit #", example: "e.g. 42" },
                { icon: User, label: "Your Name", example: "e.g. Smith" },
                { icon: Layers, label: "Float Name", example: "e.g. Fire Dept" },
              ].map(({ icon: Icon, label, example }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <Icon className="w-5 h-5 text-gold-400 mx-auto mb-1.5" />
                  <p className="text-white/60 text-xs font-medium">{label}</p>
                  <p className="text-white/25 text-xs mt-0.5">{example}</p>
                </div>
              ))}
            </div>
            <p className="text-white/25 text-xs">
              Results show staging zone, spot assignment, and current parade status.
            </p>
          </div>
        )}

        {/* Result count */}
        {hasResults && (
          <p className="text-center text-white/30 text-xs">
            {results.length} result{results.length !== 1 ? "s" : ""} for "{debouncedQuery}"
            {results.length === 25 && " — try a more specific search"}
          </p>
        )}

        {/* Footer links */}
        <div className="flex gap-4 justify-center pt-4 text-xs text-white/25">
          <a href="/parade" className="hover:text-white/50 underline">Parade Info</a>
          <a href="/parade/live" className="hover:text-white/50 underline">Live Board</a>
          <a href="/parade/tracker" className="hover:text-white/50 underline">Unit Tracker</a>
        </div>
      </div>
    </div>
  );
}
