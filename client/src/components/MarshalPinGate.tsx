import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Shield, Star, Lock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PinResult {
  id: number;
  label: string;
  checkpointId: number | null;
  marshalName: string | null;
  year: number;
}

interface MarshalPinGateProps {
  year: number;
  children: (pin: PinResult) => React.ReactNode;
  /** Optional: if provided, only PINs linked to this checkpointId (or null for start-line) will be accepted */
  checkpointId?: number | null;
}

const SESSION_KEY = "marshal_pin_session";

function getStoredSession(year: number, checkpointId?: number | null): PinResult | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PinResult & { expires: number };
    if (Date.now() > data.expires) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    if (data.year !== year) return null;
    // If a specific checkpoint is required, validate it matches
    if (checkpointId !== undefined) {
      if (data.checkpointId !== checkpointId) return null;
    }
    return data;
  } catch {
    return null;
  }
}

export default function MarshalPinGate({ year, children, checkpointId }: MarshalPinGateProps) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [authenticated, setAuthenticated] = useState<PinResult | null>(() =>
    getStoredSession(year, checkpointId)
  );
  const [error, setError] = useState("");
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const verifyMutation = trpc.marshalPins.verify.useMutation({
    onSuccess: (result) => {
      // Validate checkpoint match if required
      if (checkpointId !== undefined && result.checkpointId !== checkpointId) {
        setError("This PIN is not valid for this checkpoint station.");
        setPin(["", "", "", ""]);
        inputRefs[0].current?.focus();
        return;
      }
      // Store session for 12 hours
      const session = { ...result, expires: Date.now() + 12 * 60 * 60 * 1000 };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setAuthenticated(result);
      toast.success(`Welcome, ${result.marshalName ?? result.label}!`);
    },
    onError: (err) => {
      setError("Incorrect PIN. Please try again.");
      setPin(["", "", "", ""]);
      inputRefs[0].current?.focus();
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
    // Auto-submit when all 4 digits entered
    if (value && index === 3) {
      const fullPin = [...newPin.slice(0, 3), value].join("");
      if (fullPin.length === 4) {
        verifyMutation.mutate({ pin: fullPin, year });
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    if (e.key === "Enter") {
      const fullPin = pin.join("");
      if (fullPin.length === 4) {
        verifyMutation.mutate({ pin: fullPin, year });
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthenticated(null);
    setPin(["", "", "", ""]);
  };

  useEffect(() => {
    if (!authenticated) {
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    }
  }, [authenticated]);

  if (authenticated) {
    return (
      <div>
        {/* Marshal badge bar */}
        <div className="bg-navy-900 text-white px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gold-400" />
            <span className="font-medium">{authenticated.label}</span>
            {authenticated.marshalName && (
              <span className="text-white/60">— {authenticated.marshalName}</span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="text-white/50 hover:text-white text-xs transition-colors"
          >
            Sign Out
          </button>
        </div>
        {children(authenticated)}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-800 border border-gold-500/30 mb-4">
            <Lock className="w-7 h-7 text-gold-400" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white mb-1">Marshal Access</h1>
          <p className="text-white/50 text-sm">
            NC 4th of July Festival {year} — Enter your 4-digit marshal PIN
          </p>
        </div>

        {/* PIN input */}
        <div className="bg-navy-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
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
                  w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 bg-navy-800 text-white
                  outline-none transition-all duration-150
                  ${digit ? "border-gold-400 bg-navy-700" : "border-white/20"}
                  ${error ? "border-red-500" : ""}
                  focus:border-gold-400 focus:bg-navy-700
                `}
                aria-label={`PIN digit ${i + 1}`}
              />
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center mb-4 animate-shake">{error}</p>
          )}

          <Button
            onClick={() => {
              const fullPin = pin.join("");
              if (fullPin.length === 4) verifyMutation.mutate({ pin: fullPin, year });
            }}
            disabled={pin.join("").length < 4 || verifyMutation.isPending}
            className="w-full bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold h-12 rounded-xl text-base"
          >
            {verifyMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
                Verifying…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Unlock Station <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-1.5 text-white/30 text-xs">
            <Star className="w-3 h-3 fill-current" />
            <span>NC 4th of July Festival · Southport, NC</span>
            <Star className="w-3 h-3 fill-current" />
          </div>
          <p className="text-white/20 text-xs mt-1">
            PINs are assigned by the Parade Director. Contact admin if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}
