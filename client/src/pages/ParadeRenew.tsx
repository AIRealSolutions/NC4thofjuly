import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { ChevronLeft, CheckCircle, Loader2, Search, RefreshCw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const lookupSchema = z.object({ email: z.string().email("Valid email required") });
type LookupData = z.infer<typeof lookupSchema>;

const renewSchema = z.object({
  entryName: z.string().min(2, "Entry name is required"),
  entryType: z.enum(["float", "marching_band", "vehicle", "walking_group", "equestrian", "other"]),
  description: z.string().optional(),
  organization: z.string().optional(),
  contactFirstName: z.string().min(1, "First name is required"),
  contactLastName: z.string().min(1, "Last name is required"),
  contactEmail: z.string().email("Valid email required"),
  contactPhone: z.string().optional(),
  estimatedLength: z.string().optional(),
  numberOfPeople: z.coerce.number().min(1).optional(),
  requiresElectricity: z.boolean().default(false),
  parkingSpots: z.coerce.number().min(0).optional(),
  specialRequirements: z.string().optional(),
  agreeToRules: z.boolean().refine((v) => v === true, "You must agree to the parade rules"),
});
type RenewData = z.infer<typeof renewSchema>;

const ENTRY_TYPE_LABELS: Record<string, string> = {
  float: "Decorated Float",
  marching_band: "Marching Band",
  vehicle: "Antique / Special Vehicle",
  walking_group: "Walking Group / Organization",
  equestrian: "Equestrian",
  other: "Other",
};

export default function ParadeRenew() {
  const [step, setStep] = useState<"lookup" | "select" | "renew" | "done">("lookup");
  const [lookupEmail, setLookupEmail] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const currentYear = new Date().getFullYear();

  const lookupForm = useForm<LookupData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(lookupSchema) as any,
  });

  const renewForm = useForm<RenewData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(renewSchema) as any,
    defaultValues: { requiresElectricity: false, agreeToRules: false },
  });

  const { data: previousEntries, isLoading: isLooking, refetch } = trpc.parade.checkReturning.useQuery(
    { email: lookupEmail },
    { enabled: !!lookupEmail && step === "select" }
  );

  const registerMutation = trpc.parade.register.useMutation({
    onSuccess: () => setStep("done"),
    onError: (err) => toast.error(err.message || "Renewal failed. Please try again."),
  });

  const handleLookup = (data: LookupData) => {
    setLookupEmail(data.email);
    setStep("select");
  };

  const handleSelectEntry = (entry: any) => {
    setSelectedEntry(entry);
    renewForm.reset({
      entryName: entry.entryName,
      entryType: entry.entryType,
      description: entry.description ?? "",
      organization: entry.organization ?? "",
      contactFirstName: entry.contactFirstName,
      contactLastName: entry.contactLastName,
      contactEmail: entry.contactEmail,
      contactPhone: entry.contactPhone ?? "",
      estimatedLength: entry.estimatedLength ?? "",
      numberOfPeople: entry.numberOfPeople ?? undefined,
      requiresElectricity: entry.requiresElectricity ?? false,
      parkingSpots: entry.parkingSpots ?? undefined,
      specialRequirements: "",
      agreeToRules: false,
    });
    setStep("renew");
  };

  const onRenew = (data: any) => {
    const { agreeToRules, ...rest } = data;
    registerMutation.mutate({ ...rest, year: currentYear, isReturning: true });
  };

  return (
    <PublicLayout>
      {/* Header */}
      <section className="bg-navy-900 text-white py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-stars opacity-20" />
        <div className="relative container">
          <Link href="/parade" className="inline-flex items-center gap-2 text-navy-300 hover:text-white text-sm mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Parade Information
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <div>
              <Badge className="mb-2 bg-gold-500/80 text-white border-gold-400 text-xs font-display tracking-widest">Returning Participant</Badge>
              <h1 className="text-3xl md:text-4xl font-serif">{currentYear} Parade Renewal</h1>
              <p className="text-navy-300 mt-2">Welcome back! Look up your previous entry to renew for {currentYear}.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-2xl">

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {["lookup", "select", "renew"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                  step === s ? "bg-patriot-600 text-white" :
                  ["select", "renew", "done"].indexOf(step) > i ? "bg-green-500 text-white" :
                  "bg-navy-100 text-navy-400"
                )}>
                  {["select", "renew", "done"].indexOf(step) > i ? "✓" : i + 1}
                </div>
                <span className={cn("text-xs font-medium hidden sm:block", step === s ? "text-navy-900" : "text-muted-foreground")}>
                  {s === "lookup" ? "Find Your Entry" : s === "select" ? "Select Entry" : "Confirm & Renew"}
                </span>
                {i < 2 && <div className="w-8 h-px bg-border" />}
              </div>
            ))}
          </div>

          {/* Step 1: Lookup */}
          {step === "lookup" && (
            <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
              <h2 className="text-xl font-serif text-navy-900 mb-2">Find Your Previous Entry</h2>
              <p className="text-sm text-muted-foreground mb-6">Enter the email address used in your previous parade registration to look up your entry.</p>
              <form onSubmit={lookupForm.handleSubmit(handleLookup)} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-navy-800">Email Address <span className="text-patriot-600">*</span></Label>
                  <Input id="email" type="email" {...lookupForm.register("email")} placeholder="your@email.com" className="mt-1.5" />
                  {lookupForm.formState.errors.email && (
                    <p className="text-xs text-patriot-600 mt-1">{lookupForm.formState.errors.email.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full bg-navy-900 hover:bg-navy-800 text-white btn-press gap-2">
                  <Search className="w-4 h-4" /> Look Up My Entry
                </Button>
              </form>
              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">
                  First time participating?{" "}
                  <Link href="/parade/register" className="text-patriot-600 hover:underline font-medium">
                    Register as a new participant →
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Select Entry */}
          {step === "select" && (
            <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
              <h2 className="text-xl font-serif text-navy-900 mb-2">Select Your Entry</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Previous entries found for <strong>{lookupEmail}</strong>. Select the entry you'd like to renew for {currentYear}.
              </p>

              {isLooking && (
                <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Looking up your entries...</span>
                </div>
              )}

              {!isLooking && previousEntries && previousEntries.length > 0 && (
                <div className="space-y-3">
                  {previousEntries.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => handleSelectEntry(entry)}
                      className="w-full text-left p-5 rounded-xl border-2 border-border hover:border-patriot-400 hover:bg-patriot-50 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-navy-900">{entry.entryName}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{ENTRY_TYPE_LABELS[entry.entryType]}</p>
                          <p className="text-xs text-muted-foreground mt-1">{entry.year} Festival</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={cn("text-xs", entry.status === "approved" ? "bg-green-100 text-green-700" : "bg-navy-100 text-navy-700")}>
                            {entry.status}
                          </Badge>
                          <span className="text-xs text-patriot-600 font-medium group-hover:underline">Select →</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!isLooking && (!previousEntries || previousEntries.length === 0) && (
                <div className="text-center py-10">
                  <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="font-medium text-navy-900 mb-2">No previous entries found</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    No parade registrations were found for <strong>{lookupEmail}</strong>. Please check the email address or register as a new participant.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" onClick={() => setStep("lookup")} className="gap-2 border-navy-300 text-navy-700">
                      <ChevronLeft className="w-4 h-4" /> Try Different Email
                    </Button>
                    <Link href="/parade/register">
                      <Button className="bg-patriot-600 hover:bg-patriot-700 text-white gap-2">
                        <Star className="w-4 h-4" /> New Registration
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {!isLooking && previousEntries && previousEntries.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Button variant="ghost" onClick={() => setStep("lookup")} className="text-sm text-muted-foreground gap-2">
                    <ChevronLeft className="w-4 h-4" /> Use a different email
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Renew Form */}
          {step === "renew" && selectedEntry && (
            <form onSubmit={renewForm.handleSubmit(onRenew)} className="space-y-6">
              <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-navy-900">Renewing: {selectedEntry.entryName}</p>
                  <p className="text-xs text-muted-foreground">Previous entry from {selectedEntry.year}. Please review and update your information below.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                <h3 className="font-serif text-lg text-navy-900 mb-4">Entry Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-navy-800">Entry Name <span className="text-patriot-600">*</span></Label>
                    <Input {...renewForm.register("entryName")} className="mt-1.5" />
                    {renewForm.formState.errors.entryName && <p className="text-xs text-patriot-600 mt-1">{renewForm.formState.errors.entryName.message}</p>}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-navy-800">Entry Type <span className="text-patriot-600">*</span></Label>
                    <Select defaultValue={selectedEntry.entryType} onValueChange={(v) => renewForm.setValue("entryType", v as any)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(ENTRY_TYPE_LABELS).map(([val, label]) => (
                          <SelectItem key={val} value={val}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-navy-800">Description</Label>
                    <Textarea {...renewForm.register("description")} className="mt-1.5 resize-none" rows={3} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                <h3 className="font-serif text-lg text-navy-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-navy-800">First Name <span className="text-patriot-600">*</span></Label>
                      <Input {...renewForm.register("contactFirstName")} className="mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-navy-800">Last Name <span className="text-patriot-600">*</span></Label>
                      <Input {...renewForm.register("contactLastName")} className="mt-1.5" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-navy-800">Email <span className="text-patriot-600">*</span></Label>
                    <Input type="email" {...renewForm.register("contactEmail")} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-navy-800">Phone</Label>
                    <Input type="tel" {...renewForm.register("contactPhone")} className="mt-1.5" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                <h3 className="font-serif text-lg text-navy-900 mb-4">Changes for {currentYear}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-navy-800">Estimated Length</Label>
                      <Input {...renewForm.register("estimatedLength")} placeholder="e.g., 30 feet" className="mt-1.5" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-navy-800">Number of People</Label>
                      <Input type="number" min={1} {...renewForm.register("numberOfPeople")} className="mt-1.5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-navy-50 rounded-xl border border-navy-100">
                    <Checkbox
                      id="requiresElectricity"
                      checked={renewForm.watch("requiresElectricity")}
                      onCheckedChange={(v) => renewForm.setValue("requiresElectricity", v === true)}
                    />
                    <Label htmlFor="requiresElectricity" className="text-sm text-navy-800 cursor-pointer">
                      Requires electrical power during staging
                    </Label>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-navy-800">Notes / Changes from Previous Year</Label>
                    <Textarea {...renewForm.register("specialRequirements")} placeholder="Any changes or special requirements for this year..." className="mt-1.5 resize-none" rows={3} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agreeToRules"
                    checked={renewForm.watch("agreeToRules")}
                    onCheckedChange={(v) => renewForm.setValue("agreeToRules", v === true)}
                  />
                  <Label htmlFor="agreeToRules" className="text-sm text-navy-800 cursor-pointer leading-relaxed">
                    I confirm my entry information is accurate and I agree to all parade rules and guidelines for the {currentYear} festival.
                  </Label>
                </div>
                {renewForm.formState.errors.agreeToRules && (
                  <p className="text-xs text-patriot-600 mt-2">{renewForm.formState.errors.agreeToRules.message}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 btn-press gap-2 text-base py-6 font-semibold"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Renewal...</>
                ) : (
                  <><RefreshCw className="w-5 h-5" /> Confirm {currentYear} Renewal</>
                )}
              </Button>
            </form>
          )}

          {/* Done */}
          {step === "done" && (
            <div className="bg-white rounded-2xl border border-border shadow-sm p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-serif text-navy-900 mb-3">Renewal Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Your {currentYear} parade renewal has been submitted. You'll receive a confirmation email shortly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/parade">
                  <Button variant="outline" className="gap-2 border-navy-300 text-navy-700">
                    <ChevronLeft className="w-4 h-4" /> Parade Information
                  </Button>
                </Link>
                <Link href="/events">
                  <Button className="bg-patriot-600 hover:bg-patriot-700 text-white gap-2">View All Events</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
