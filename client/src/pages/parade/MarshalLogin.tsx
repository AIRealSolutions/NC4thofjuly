/**
 * Marshal Login Portal — /parade/login
 *
 * A single bookmarkable URL for all marshals. They select their station
 * from the list, enter their 4-digit PIN, and are redirected to the
 * correct checkpoint or start-line page.
 */
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Shield,
  Star,
  Lock,
  ChevronRight,
  MapPin,
  Flag,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const YEAR = 2026;
const SESSION_KEY = "marshal_pin_session";

// Station definitions — matches checkpoint routeOrder in DB (6 stations)
const STATIONS = [
  {
    id: "start",
    label: "Station 1 — Start Line",
    subtitle: "Atlantic Ave & E Moore St",
    icon: Flag,
    route: "/parade/marshal",
    checkpointId: null,
    color: "from-emerald-900/60 to-emerald-950/60 border-emerald-500/30",
    iconColor: "text-emerald-400",
  },
  {
    id: "cp1",
    label: "Station 2 — Howe & Moore",
    subtitle: "Howe St & Moore St",
    icon: MapPin,
    route: "/parade/checkpoint/60001",
    checkpointId: 60001,
    color: "from-sky-900/60 to-sky-950/60 border-sky-500/30",
    iconColor: "text-sky-400",
  },
  {
    id: "cp2",
    label: "Station 3 — Howe & West",
    subtitle: "Howe St & West St",
    icon: MapPin,
    route: "/parade/checkpoint/2",
    checkpointId: 2,
    color: "from-blue-900/60 to-blue-950/60 border-blue-500/30",
    iconColor: "text-blue-400",
  },
  {
    id: "cp3",
    label: "Station 4 — Howe & 9th",
    subtitle: "Howe St & 9th St",
    icon: MapPin,
    route: "/parade/checkpoint/3",
    checkpointId: 3,
    color: "from-purple-900/60 to-purple-950/60 border-purple-500/30",
    iconColor: "text-purple-400",
  },
  {
    id: "cp4",
    label: "Station 5 — Howe & Fodale",
    subtitle: "Howe St & Fodale Ave — Turn",
    icon: MapPin,
    route: "/parade/checkpoint/4",
    checkpointId: 4,
    color: "from-amber-900/60 to-amber-950/60 border-amber-500/30",
    iconColor: "text-amber-400",
  },
  {
    id: "disband",
    label: "Station 6 — Disband",
    subtitle: "Nursing Home Parking Lot, Fodale Ave",
    icon: MapPin,
    route: "/parade/checkpoint/30001",
    checkpointId: 30001,
    color: "from-red-900/60 to-red-950/60 border-red-500/30",
    iconColor: "text-red-400",
  },
];

export default function MarshalLogin() {
  const [, navigate] = useLocation();
  const [selectedStation, setSelectedStation] = useState<(typeof STATIONS)[0] | null>(null);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Check if already logged in for a station
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const data = JSON.parse(raw) as { expires: number; checkpointId: number | null; year: number };
        if (Date.now() < data.expires && data.year === YEAR) {
          // Already authenticated — find matching station and redirect
          const match = STATIONS.find((s) => s.checkpointId === data.checkpointId);
          if (match) {
            navigate(match.route);
          }
        }
      }
    } catch {
      // ignore
    }
  }, [navigate]);

  const verifyMutation = trpc.marshalPins.verify.useMutation({
    onSuccess: (result) => {
      if (!selectedStation) return;
      // Validate checkpoint match
      if (result.checkpointId !== selectedStation.checkpointId) {
        setError("This PIN is not assigned to the selected station.");
        setPin(["", "", "", ""]);
        setTimeout(() => inputRefs[0].current?.focus(), 50);
        return;
      }
      // Store session for 12 hours
      const session = { ...result, expires: Date.now() + 12 * 60 * 60 * 1000 };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      toast.success(`Welcome, ${result.marshalName ?? result.label}! Redirecting to your station…`);
      setTimeout(() => navigate(selectedStation.route), 800);
    },
    onError: () => {
      setError("Incorrect PIN. Please try again.");
      setPin(["", "", "", ""]);
      setTimeout(() => inputRefs[0].current?.focus(), 50);
    },
  });

  const handleDigit = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError("");
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
    if (value && index === 3) {
      const fullPin = [...newPin.slice(0, 3), value].join("");
      if (fullPin.length === 4) {
        verifyMutation.mutate({ pin: fullPin, year: YEAR });
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    if (e.key === "Enter") {
      const fullPin = pin.join("");
      if (fullPin.length === 4) verifyMutation.mutate({ pin: fullPin, year: YEAR });
    }
  };

  const handleSelectStation = (station: (typeof STATIONS)[0]) => {
    setSelectedStation(station);
    setPin(["", "", "", ""]);
    setError("");
    setTimeout(() => inputRefs[0].current?.focus(), 100);
  };

  const handleBack = () => {
    setSelectedStation(null);
    setPin(["", "", "", ""]);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-yellow-500/30 mb-4">
            <Shield className="w-7 h-7 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-1">
            Marshal Login
          </h1>
          <p className="text-white/50 text-sm">
            NC 4th of July Festival {YEAR} · Southport, NC
          </p>
        </div>

        {!selectedStation ? (
          /* Station Selection */
          <div className="space-y-3">
            <p className="text-white/40 text-xs text-center uppercase tracking-widest mb-4">
              Select your station
            </p>
            {STATIONS.map((station) => {
              const Icon = station.icon;
              return (
                <button
                  key={station.id}
                  onClick={() => handleSelectStation(station)}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-2xl border bg-gradient-to-r
                    ${station.color}
                    hover:brightness-125 active:scale-[0.98]
                    transition-all duration-150 text-left
                  `}
                >
                  <div className={`flex-shrink-0 ${station.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{station.label}</p>
                    <p className="text-white/50 text-xs truncate">{station.subtitle}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                </button>
              );
            })}

            <div className="pt-4 text-center">
              <p className="text-white/20 text-xs">
                PINs are assigned by the Parade Director.
              </p>
              <p className="text-white/20 text-xs">
                Contact admin at{" "}
                <a href="/admin/marshal-pins" className="text-yellow-500/50 hover:text-yellow-400 underline">
                  /admin/marshal-pins
                </a>{" "}
                if you need access.
              </p>
            </div>
          </div>
        ) : (
          /* PIN Entry */
          <div>
            {/* Selected station banner */}
            <button
              onClick={handleBack}
              className={`
                w-full flex items-center gap-3 p-4 rounded-2xl border bg-gradient-to-r mb-4
                ${selectedStation.color}
                hover:brightness-110 transition-all duration-150 text-left
              `}
            >
              <ArrowLeft className="w-4 h-4 text-white/50 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{selectedStation.label}</p>
                <p className="text-white/50 text-xs">{selectedStation.subtitle}</p>
              </div>
              <span className="text-white/30 text-xs">Change</span>
            </button>

            {/* PIN input card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
              <p className="text-white/50 text-sm text-center mb-6">
                Enter your 4-digit marshal PIN
              </p>

              <div className="flex gap-3 justify-center mb-6">
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    ref={inputRefs[i]}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`
                      w-14 h-16 text-center text-2xl font-bold rounded-xl border-2
                      bg-white/5 text-white outline-none transition-all duration-150
                      ${digit ? "border-yellow-400 bg-white/10" : "border-white/20"}
                      ${error ? "border-red-500" : ""}
                      focus:border-yellow-400 focus:bg-white/10
                    `}
                    aria-label={`PIN digit ${i + 1}`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center mb-4">{error}</p>
              )}

              <Button
                onClick={() => {
                  const fullPin = pin.join("");
                  if (fullPin.length === 4) verifyMutation.mutate({ pin: fullPin, year: YEAR });
                }}
                disabled={pin.join("").length < 4 || verifyMutation.isPending}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-12 rounded-xl text-base"
              >
                {verifyMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Verifying…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Unlock Station
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-1.5 text-white/20 text-xs">
            <Star className="w-3 h-3 fill-current" />
            <span>NC 4th of July Festival · Southport, NC</span>
            <Star className="w-3 h-3 fill-current" />
          </div>
        </div>
      </div>
    </div>
  );
}
