/**
 * ShrinersSignup — Dedicated registration page for Shriner units.
 * Collects temple name, unit type, vehicle/member counts, and special equipment.
 * Auto-assigns staging zone to "S Atlantic Ave".
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  MapPin,
  Users,
  Car,
  CheckCircle2,
  ChevronRight,
  Phone,
  Mail,
  Building2,
  Wrench,
  Info,
} from "lucide-react";

const UNIT_TYPES = [
  { value: "mini_cars", label: "Mini Cars", desc: "The classic Shriner mini car units" },
  { value: "motorcycles", label: "Motorcycles", desc: "Shriner motorcycle drill teams" },
  { value: "clown_unit", label: "Clown Unit", desc: "Shriner clown corps" },
  { value: "marching", label: "Marching Unit", desc: "Marching Shriners on foot" },
  { value: "color_guard", label: "Color Guard", desc: "Flag and color guard unit" },
  { value: "band", label: "Band", desc: "Shriner marching band" },
  { value: "go_karts", label: "Go-Karts / ATVs", desc: "Go-karts or ATV units" },
  { value: "other", label: "Other", desc: "Other Shriner unit type" },
];

const schema = z.object({
  // Temple info
  shrinersTempleName: z.string().min(2, "Temple name is required"),
  shrinersUnitType: z.enum([
    "mini_cars", "motorcycles", "clown_unit", "marching",
    "color_guard", "band", "go_karts", "other",
  ]),
  entryName: z.string().min(2, "Entry name is required"),
  description: z.string().optional(),
  numberOfPeople: z.coerce.number().min(1, "At least 1 member required"),
  shrinersVehicleCount: z.coerce.number().min(0).optional(),
  shrinersSpecialEquipment: z.string().optional(),
  estimatedLength: z.string().optional(),
  requiresElectricity: z.boolean().default(false),
  // Contact
  contactFirstName: z.string().min(1, "First name required"),
  contactLastName: z.string().min(1, "Last name required"),
  contactEmail: z.string().email("Valid email required"),
  contactPhone: z.string().optional(),
  organization: z.string().optional(),
  specialRequirements: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const STEPS = ["Temple Info", "Unit Details", "Contact", "Review"];

export default function ShrinersSignup() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [confirmationId, setConfirmationId] = useState<number | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      shrinersUnitType: "mini_cars",
      numberOfPeople: 1,
      shrinersVehicleCount: 0,
      requiresElectricity: false,
    },
  });

  const register = trpc.parade.register.useMutation({
    onSuccess: (data) => {
      setConfirmationId(data.id);
      setSubmitted(true);
      toast.success("Shriner unit registration submitted!");
    },
    onError: (err) => {
      toast.error(err.message || "Registration failed. Please try again.");
    },
  });

  const { watch, setValue, trigger, formState: { errors } } = form;
  const values = watch();

  const STEP_FIELDS: (keyof FormData)[][] = [
    ["shrinersTempleName", "shrinersUnitType", "entryName"],
    ["numberOfPeople", "shrinersVehicleCount", "estimatedLength"],
    ["contactFirstName", "contactLastName", "contactEmail", "contactPhone"],
    [],
  ];

  async function nextStep() {
    const valid = await trigger(STEP_FIELDS[step] as any);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function onSubmit(data: FormData) {
    register.mutate({
      year: 2026,
      entryName: data.entryName,
      entryType: "shriners",
      description: data.description,
      contactFirstName: data.contactFirstName,
      contactLastName: data.contactLastName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      organization: data.shrinersTempleName,
      numberOfPeople: data.numberOfPeople,
      estimatedLength: data.estimatedLength,
      requiresElectricity: data.requiresElectricity,
      specialRequirements: data.specialRequirements,
      shrinersTempleName: data.shrinersTempleName,
      shrinersUnitType: data.shrinersUnitType,
      shrinersVehicleCount: data.shrinersVehicleCount,
      shrinersSpecialEquipment: data.shrinersSpecialEquipment,
      stagingZone: "S Atlantic Ave",
    } as any);
  }

  if (submitted) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center py-20 px-4">
          <div className="max-w-lg w-full text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-gold-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-gold-600" />
            </div>
            <div>
              <h1 className="text-3xl font-serif text-navy-900 mb-2">Registration Received!</h1>
              <p className="text-muted-foreground">
                Thank you for registering your Shriner unit for the 2026 NC 4th of July Parade.
              </p>
            </div>
            {confirmationId && (
              <div className="bg-gold-50 border border-gold-200 rounded-xl p-4">
                <p className="text-sm text-gold-800 font-medium">Confirmation #</p>
                <p className="text-2xl font-bold text-gold-700">SHR-{String(confirmationId).padStart(4, "0")}</p>
              </div>
            )}
            <div className="bg-navy-50 rounded-xl p-5 text-left space-y-2 text-sm text-navy-700">
              <p className="font-semibold text-navy-900">What happens next?</p>
              <p>• The Parade Committee will review your registration and contact you within 5 business days.</p>
              <p>• Your staging assignment on <strong>S Atlantic Ave</strong> will be confirmed with your approval letter.</p>
              <p>• Check-in begins at <strong>7:00 AM on July 4th</strong>.</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/parade">
                <Button variant="outline" className="border-navy-200 text-navy-700">
                  Back to Parade Info
                </Button>
              </Link>
              <Link href="/">
                <Button className="bg-patriot-600 hover:bg-patriot-700 text-white">
                  Return Home
                </Button>
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
          {/* Fez icon */}
          <div className="w-16 h-16 rounded-full bg-gold-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Star className="w-8 h-8 text-white fill-white" />
          </div>
          <p className="font-display text-xs tracking-widest text-gold-400 mb-2 uppercase">
            Shriners International — Special Group Registration
          </p>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">
            Shriner Unit Registration
          </h1>
          <div className="section-divider w-16 mx-auto mb-4" />
          <p className="text-navy-300 max-w-xl mx-auto text-base leading-relaxed">
            Shriners are honored guests of the NC 4th of July Parade. Your unit will stage on
            <strong className="text-gold-300"> S Atlantic Ave</strong> — a dedicated area reserved
            exclusively for Shriner units.
          </p>
        </div>
      </section>

      {/* Staging info banner */}
      <div className="bg-gold-50 border-b border-gold-200 py-3">
        <div className="container flex flex-wrap items-center justify-center gap-6 text-sm text-gold-800">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gold-600" />
            <strong>Staging:</strong> S Atlantic Ave (Shriners Only)
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-gold-600" />
            <strong>Special Group</strong> — Priority placement
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-gold-600" />
            Check-in at 7:00 AM · Parade steps off 10:00 AM
          </span>
        </div>
      </div>

      {/* Form */}
      <section className="py-14 md:py-20">
        <div className="container max-w-2xl">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-10">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                    i < step
                      ? "bg-gold-500 border-gold-500 text-white"
                      : i === step
                      ? "bg-navy-900 border-navy-900 text-white"
                      : "bg-white border-border text-muted-foreground"
                  }`}>
                    {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-navy-900" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-5 mx-1 ${i < step ? "bg-gold-400" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={form.handleSubmit(onSubmit as any)}>
            {/* Step 0: Temple Info */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 flex items-start gap-3">
                  <Star className="w-5 h-5 text-gold-600 shrink-0 mt-0.5 fill-gold-600" />
                  <div>
                    <p className="font-semibold text-gold-900 text-sm">Shriner Unit Registration</p>
                    <p className="text-xs text-gold-700 mt-0.5">
                      This form is exclusively for Shriners International temple units. Returning participants
                      can use the <Link href="/parade/shriners/renew" className="underline font-medium">renewal form</Link>.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templeName" className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    Temple Name <span className="text-patriot-600">*</span>
                  </Label>
                  <Input
                    id="templeName"
                    {...form.register("shrinersTempleName")}
                    placeholder="e.g. Sudan Shriners, Oasis Shriners…"
                  />
                  {errors.shrinersTempleName && (
                    <p className="text-xs text-red-500">{errors.shrinersTempleName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    Unit Type <span className="text-patriot-600">*</span>
                  </Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {UNIT_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setValue("shrinersUnitType", type.value as any)}
                        className={`text-left p-3 rounded-xl border-2 transition-all ${
                          values.shrinersUnitType === type.value
                            ? "border-gold-500 bg-gold-50"
                            : "border-border hover:border-gold-300 bg-white"
                        }`}
                      >
                        <p className="font-semibold text-sm text-navy-900">{type.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
                      </button>
                    ))}
                  </div>
                  {errors.shrinersUnitType && (
                    <p className="text-xs text-red-500">{errors.shrinersUnitType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entryName">
                    Entry / Unit Display Name <span className="text-patriot-600">*</span>
                  </Label>
                  <Input
                    id="entryName"
                    {...form.register("entryName")}
                    placeholder="e.g. Sudan Shriners Mini Cars, Oasis Clown Unit…"
                  />
                  <p className="text-xs text-muted-foreground">This name will appear in the official parade program.</p>
                  {errors.entryName && (
                    <p className="text-xs text-red-500">{errors.entryName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Unit Description (optional)</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Brief description of your unit for the parade announcer…"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 1: Unit Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="numberOfPeople" className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      Number of Members <span className="text-patriot-600">*</span>
                    </Label>
                    <Input
                      id="numberOfPeople"
                      type="number"
                      min={1}
                      {...form.register("numberOfPeople")}
                    />
                    {errors.numberOfPeople && (
                      <p className="text-xs text-red-500">{errors.numberOfPeople.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleCount" className="flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-muted-foreground" />
                      Number of Vehicles
                    </Label>
                    <Input
                      id="vehicleCount"
                      type="number"
                      min={0}
                      {...form.register("shrinersVehicleCount")}
                      placeholder="0 if marching only"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedLength" className="flex items-center gap-1.5">
                    Estimated Unit Length
                  </Label>
                  <Input
                    id="estimatedLength"
                    {...form.register("estimatedLength")}
                    placeholder="e.g. 50 feet, 100 feet…"
                  />
                  <p className="text-xs text-muted-foreground">
                    Total length of your unit including all vehicles and walkers.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialEquipment" className="flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-muted-foreground" />
                    Special Equipment / Notes
                  </Label>
                  <Textarea
                    id="specialEquipment"
                    {...form.register("shrinersSpecialEquipment")}
                    placeholder="Describe any special equipment, trailers, generators, sound systems, or other logistics needs…"
                    rows={4}
                  />
                </div>

                <div className="bg-navy-50 rounded-xl p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-navy-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-navy-700">
                    <p className="font-semibold mb-1">Staging Assignment</p>
                    <p>All Shriner units are automatically assigned to <strong>S Atlantic Ave</strong> — the dedicated Shriners staging area. Your specific spot number will be confirmed with your approval letter.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-patriot-600">*</span>
                    </Label>
                    <Input id="firstName" {...form.register("contactFirstName")} />
                    {errors.contactFirstName && (
                      <p className="text-xs text-red-500">{errors.contactFirstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-patriot-600">*</span>
                    </Label>
                    <Input id="lastName" {...form.register("contactLastName")} />
                    {errors.contactLastName && (
                      <p className="text-xs text-red-500">{errors.contactLastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email Address <span className="text-patriot-600">*</span>
                  </Label>
                  <Input id="email" type="email" {...form.register("contactEmail")} />
                  {errors.contactEmail && (
                    <p className="text-xs text-red-500">{errors.contactEmail.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Phone Number
                  </Label>
                  <Input id="phone" type="tel" {...form.register("contactPhone")} placeholder="(910) 555-0100" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequirements">Additional Requirements or Notes</Label>
                  <Textarea
                    id="specialRequirements"
                    {...form.register("specialRequirements")}
                    placeholder="Any additional information for the Parade Committee…"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="bg-gold-50 border border-gold-200 rounded-xl p-5 space-y-4">
                  <h3 className="font-semibold text-gold-900 flex items-center gap-2">
                    <Star className="w-4 h-4 fill-gold-600 text-gold-600" />
                    Shriner Unit Registration Summary
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    {[
                      { label: "Temple", value: values.shrinersTempleName },
                      { label: "Unit Type", value: UNIT_TYPES.find(t => t.value === values.shrinersUnitType)?.label },
                      { label: "Entry Name", value: values.entryName },
                      { label: "Members", value: values.numberOfPeople },
                      { label: "Vehicles", value: values.shrinersVehicleCount || "None" },
                      { label: "Est. Length", value: values.estimatedLength || "Not specified" },
                      { label: "Staging Zone", value: "S Atlantic Ave (Shriners Only)" },
                      { label: "Contact", value: `${values.contactFirstName} ${values.contactLastName}` },
                      { label: "Email", value: values.contactEmail },
                      { label: "Phone", value: values.contactPhone || "Not provided" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
                        <span className="font-medium text-navy-900">{value}</span>
                      </div>
                    ))}
                  </div>
                  {values.shrinersSpecialEquipment && (
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">Special Equipment</span>
                      <p className="text-sm text-navy-900 mt-0.5">{values.shrinersSpecialEquipment}</p>
                    </div>
                  )}
                </div>

                <div className="bg-navy-50 border border-navy-100 rounded-xl p-4 text-sm text-navy-700">
                  <p>By submitting this form, you confirm that your unit is affiliated with Shriners International and agree to abide by all parade rules and guidelines. Your registration is subject to approval by the Parade Committee.</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={step === 0}
                className="border-navy-200 text-navy-700"
              >
                Back
              </Button>

              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-gold-500 hover:bg-gold-600 text-white gap-2"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={register.isPending}
                  className="bg-patriot-600 hover:bg-patriot-700 text-white gap-2"
                >
                  {register.isPending ? "Submitting…" : "Submit Registration"}
                  <Star className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}
