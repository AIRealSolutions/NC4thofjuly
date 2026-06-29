/**
 * ShrinersRenew — Streamlined renewal form for returning Shriner units.
 * Looks up previous registration by email, pre-fills data, allows updates.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Star,
  Mail,
  CheckCircle2,
  Search,
  RefreshCw,
  MapPin,
  Users,
  Car,
} from "lucide-react";

const lookupSchema = z.object({ email: z.string().email("Enter a valid email address") });
const renewSchema = z.object({
  entryName: z.string().min(2, "Entry name required"),
  shrinersTempleName: z.string().min(2, "Temple name required"),
  numberOfPeople: z.coerce.number().min(1),
  shrinersVehicleCount: z.coerce.number().min(0).optional(),
  contactPhone: z.string().optional(),
  shrinersSpecialEquipment: z.string().optional(),
  specialRequirements: z.string().optional(),
});

type LookupData = z.infer<typeof lookupSchema>;
type RenewData = z.infer<typeof renewSchema>;

export default function ShrinersRenew() {
  const [phase, setPhase] = useState<"lookup" | "renew" | "done">("lookup");
  const [prevEntry, setPrevEntry] = useState<any>(null);
  const [confirmationId, setConfirmationId] = useState<number | null>(null);
  const [lookupEmail, setLookupEmail] = useState("");

  const lookupForm = useForm<LookupData>({ resolver: zodResolver(lookupSchema) as any });
  const renewForm = useForm<RenewData>({ resolver: zodResolver(renewSchema) as any });

  const checkReturning = trpc.parade.checkReturning.useQuery(
    { email: lookupEmail },
    { enabled: !!lookupEmail }
  );

  const register = trpc.parade.register.useMutation({
    onSuccess: (data) => {
      setConfirmationId(data.id);
      setPhase("done");
      toast.success("Renewal submitted successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Renewal failed. Please try again.");
    },
  });

  function handleLookup(data: LookupData) {
    setLookupEmail(data.email);
  }

  // When query resolves, move to renew phase
  if (lookupEmail && checkReturning.data && phase === "lookup") {
    const prev = Array.isArray(checkReturning.data) ? checkReturning.data[0] : checkReturning.data;
    if (prev && prev.entryType === "shriners") {
      setPrevEntry(prev);
      renewForm.reset({
        entryName: prev.entryName,
        shrinersTempleName: prev.shrinersTempleName ?? "",
        numberOfPeople: prev.numberOfPeople ?? 1,
        shrinersVehicleCount: prev.shrinersVehicleCount ?? 0,
        contactPhone: prev.contactPhone ?? "",
        shrinersSpecialEquipment: prev.shrinersSpecialEquipment ?? "",
      });
      setPhase("renew");
    } else if (prev && prev.entryType !== "shriners") {
      toast.error("This email is registered as a non-Shriner entry. Please use the standard renewal form.");
    } else if (checkReturning.isFetched && !prev) {
      toast.error("No previous Shriner registration found for this email. Please use the new registration form.");
    }
  }

  function onRenew(data: RenewData) {
    if (!prevEntry) return;
    register.mutate({
      isReturning: true,
      year: 2026,
      entryName: data.entryName,
      entryType: "shriners",
      contactFirstName: prevEntry.contactFirstName,
      contactLastName: prevEntry.contactLastName,
      contactEmail: lookupEmail,
      contactPhone: data.contactPhone,
      organization: data.shrinersTempleName,
      numberOfPeople: data.numberOfPeople,
      shrinersTempleName: data.shrinersTempleName,
      shrinersUnitType: prevEntry.shrinersUnitType,
      shrinersVehicleCount: data.shrinersVehicleCount,
      shrinersSpecialEquipment: data.shrinersSpecialEquipment,
      specialRequirements: data.specialRequirements,
      stagingZone: "S Atlantic Ave",
    } as any);
  }

  if (phase === "done") {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center py-20 px-4">
          <div className="max-w-lg w-full text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-gold-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-gold-600" />
            </div>
            <div>
              <h1 className="text-3xl font-serif text-navy-900 mb-2">Renewal Confirmed!</h1>
              <p className="text-muted-foreground">
                Your Shriner unit has been renewed for the 2026 NC 4th of July Parade.
              </p>
            </div>
            {confirmationId && (
              <div className="bg-gold-50 border border-gold-200 rounded-xl p-4">
                <p className="text-sm text-gold-800 font-medium">Confirmation #</p>
                <p className="text-2xl font-bold text-gold-700">SHR-{String(confirmationId).padStart(4, "0")}</p>
              </div>
            )}
            <div className="bg-navy-50 rounded-xl p-5 text-left space-y-2 text-sm text-navy-700">
              <p className="font-semibold text-navy-900">Reminder</p>
              <p>• Staging on <strong>S Atlantic Ave</strong> — your spot will be confirmed by the Parade Committee.</p>
              <p>• Check-in begins at <strong>7:00 AM on July 4th</strong>.</p>
              <p>• Parade steps off at <strong>10:00 AM</strong> from Atlantic Ave & E Moore St.</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/parade">
                <Button variant="outline" className="border-navy-200 text-navy-700">Parade Info</Button>
              </Link>
              <Link href="/">
                <Button className="bg-patriot-600 hover:bg-patriot-700 text-white">Return Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-navy-900 text-white py-14 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-stars opacity-20" />
        <div className="relative container text-center">
          <div className="w-16 h-16 rounded-full bg-gold-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <RefreshCw className="w-7 h-7 text-white" />
          </div>
          <p className="font-display text-xs tracking-widest text-gold-400 mb-2 uppercase">
            Returning Shriners — Annual Renewal
          </p>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Shriner Unit Renewal</h1>
          <div className="section-divider w-16 mx-auto mb-4" />
          <p className="text-navy-300 max-w-xl mx-auto text-base leading-relaxed">
            Welcome back! Renew your Shriner unit's participation in the NC 4th of July Parade.
            Your previous registration details will be pre-filled for quick confirmation.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container max-w-xl">
          {/* Step 1: Email lookup */}
          {phase === "lookup" && (
            <div className="space-y-6">
              <div className="bg-gold-50 border border-gold-200 rounded-xl p-5 flex items-start gap-3">
                <Star className="w-5 h-5 text-gold-600 shrink-0 mt-0.5 fill-gold-600" />
                <div>
                  <p className="font-semibold text-gold-900">Returning Shriner Units</p>
                  <p className="text-sm text-gold-700 mt-0.5">
                    Enter the email address used in your previous registration to look up your unit.
                    New to the parade? Use the{" "}
                    <Link href="/parade/shriners" className="underline font-medium">new registration form</Link>.
                  </p>
                </div>
              </div>

              <form onSubmit={lookupForm.handleSubmit(handleLookup)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lookupEmail" className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Previous Registration Email <span className="text-patriot-600">*</span>
                  </Label>
                  <Input
                    id="lookupEmail"
                    type="email"
                    {...lookupForm.register("email")}
                    placeholder="your@email.com"
                  />
                  {lookupForm.formState.errors.email && (
                    <p className="text-xs text-red-500">{lookupForm.formState.errors.email.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gold-500 hover:bg-gold-600 text-white gap-2"
                  disabled={checkReturning.isFetching}
                >
                  <Search className="w-4 h-4" />
                  {checkReturning.isFetching ? "Looking up…" : "Find My Registration"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Can't find your registration?{" "}
                <Link href="/parade/shriners" className="text-patriot-600 hover:underline font-medium">
                  Register as a new Shriner unit →
                </Link>
              </p>
            </div>
          )}

          {/* Step 2: Renewal form */}
          {phase === "renew" && prevEntry && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">Previous Registration Found</p>
                  <p className="text-sm text-green-700 mt-0.5">
                    We found your {prevEntry.entryName} registration. Review and update your details below.
                  </p>
                </div>
              </div>

              <form onSubmit={renewForm.handleSubmit(onRenew as any)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="templeName">Temple Name <span className="text-patriot-600">*</span></Label>
                  <Input id="templeName" {...renewForm.register("shrinersTempleName")} />
                  {renewForm.formState.errors.shrinersTempleName && (
                    <p className="text-xs text-red-500">{renewForm.formState.errors.shrinersTempleName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entryName">Entry / Unit Display Name <span className="text-patriot-600">*</span></Label>
                  <Input id="entryName" {...renewForm.register("entryName")} />
                  {renewForm.formState.errors.entryName && (
                    <p className="text-xs text-red-500">{renewForm.formState.errors.entryName.message}</p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="members" className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      Members <span className="text-patriot-600">*</span>
                    </Label>
                    <Input id="members" type="number" min={1} {...renewForm.register("numberOfPeople")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicles" className="flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-muted-foreground" />
                      Vehicles
                    </Label>
                    <Input id="vehicles" type="number" min={0} {...renewForm.register("shrinersVehicleCount")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input id="phone" type="tel" {...renewForm.register("contactPhone")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipment">Special Equipment / Changes</Label>
                  <Textarea
                    id="equipment"
                    {...renewForm.register("shrinersSpecialEquipment")}
                    placeholder="Any changes from last year's equipment or logistics…"
                    rows={3}
                  />
                </div>

                <div className="bg-navy-50 border border-navy-100 rounded-xl p-4 flex items-start gap-3 text-sm text-navy-700">
                  <MapPin className="w-4 h-4 text-navy-600 shrink-0 mt-0.5" />
                  <p>Your unit will again be staged on <strong>S Atlantic Ave</strong>. Specific spot assignment will be confirmed with your approval letter.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setPhase("lookup"); setLookupEmail(""); }}
                    className="border-navy-200 text-navy-700"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={register.isPending}
                    className="flex-1 bg-gold-500 hover:bg-gold-600 text-white gap-2"
                  >
                    {register.isPending ? "Submitting…" : "Confirm Renewal"}
                    <Star className="w-4 h-4 fill-white" />
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
