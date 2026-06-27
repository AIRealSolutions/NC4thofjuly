import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { Star, ChevronLeft, CheckCircle, Loader2, Info } from "lucide-react";
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

const schema = z.object({
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

type FormData = z.infer<typeof schema>;

const ENTRY_TYPE_LABELS: Record<string, string> = {
  float: "Decorated Float",
  marching_band: "Marching Band",
  vehicle: "Antique / Special Vehicle",
  walking_group: "Walking Group / Organization",
  equestrian: "Equestrian",
  other: "Other",
};

export default function ParadeRegister() {
  const [submitted, setSubmitted] = useState(false);
  const currentYear = new Date().getFullYear();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { requiresElectricity: false, agreeToRules: false },
  });

  const registerMutation = trpc.parade.register.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err) => toast.error(err.message || "Registration failed. Please try again."),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => {
    const { agreeToRules, ...rest } = data;
    registerMutation.mutate({ ...rest, year: currentYear, isReturning: false });
  };

  if (submitted) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center py-20">
          <div className="container max-w-lg text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-serif text-navy-900 mb-3">Registration Submitted!</h1>
            <p className="text-muted-foreground mb-2">
              Thank you for registering for the <strong>{currentYear} NC 4th of July Festival Parade</strong>.
            </p>
            <p className="text-muted-foreground mb-8">
              You will receive a confirmation email shortly. Our parade committee will review your application and contact you with your staging assignment and further details.
            </p>
            <div className="bg-navy-50 rounded-xl p-5 border border-navy-100 text-left mb-8">
              <p className="text-sm font-semibold text-navy-900 mb-2">What happens next?</p>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>✓ You'll receive an email confirmation within 24 hours</li>
                <li>✓ The parade committee will review your entry</li>
                <li>✓ Approval notice sent 2–3 weeks before the parade</li>
                <li>✓ Staging assignment included with approval</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/parade">
                <Button variant="outline" className="gap-2 border-navy-300 text-navy-700">
                  <ChevronLeft className="w-4 h-4" /> Back to Parade Info
                </Button>
              </Link>
              <Link href="/events">
                <Button className="bg-patriot-600 hover:bg-patriot-700 text-white gap-2">
                  View All Events
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
      {/* Header */}
      <section className="bg-navy-900 text-white py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-stars opacity-20" />
        <div className="relative container">
          <Link href="/parade" className="inline-flex items-center gap-2 text-navy-300 hover:text-white text-sm mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Parade Information
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-patriot-600 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <Badge className="mb-2 bg-patriot-600/80 text-white border-patriot-400 text-xs font-display tracking-widest">New Participant</Badge>
              <h1 className="text-3xl md:text-4xl font-serif">{currentYear} Parade Registration</h1>
              <p className="text-navy-300 mt-2">Complete the form below to register your entry in the Grand Independence Day Parade.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12">
        <div className="container max-w-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* Entry Information */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-8">
              <h2 className="text-lg font-serif font-semibold text-navy-900 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-patriot-100 text-patriot-700 flex items-center justify-center text-xs font-bold">1</span>
                Entry Information
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="entryName" className="text-sm font-medium text-navy-800">Entry Name <span className="text-patriot-600">*</span></Label>
                  <Input id="entryName" {...register("entryName")} placeholder="e.g., Southport Fire Department, Smith Family Float" className="mt-1.5" />
                  {errors.entryName && <p className="text-xs text-patriot-600 mt-1">{errors.entryName.message}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium text-navy-800">Entry Type <span className="text-patriot-600">*</span></Label>
                  <Select onValueChange={(v) => setValue("entryType", v as any)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select entry type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ENTRY_TYPE_LABELS).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.entryType && <p className="text-xs text-patriot-600 mt-1">{errors.entryType.message}</p>}
                </div>

                <div>
                  <Label htmlFor="organization" className="text-sm font-medium text-navy-800">Organization / Sponsor</Label>
                  <Input id="organization" {...register("organization")} placeholder="Sponsoring organization (if applicable)" className="mt-1.5" />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-navy-800">Entry Description</Label>
                  <Textarea id="description" {...register("description")} placeholder="Describe your entry — theme, appearance, what to expect..." className="mt-1.5 resize-none" rows={3} />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-8">
              <h2 className="text-lg font-serif font-semibold text-navy-900 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-patriot-100 text-patriot-700 flex items-center justify-center text-xs font-bold">2</span>
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactFirstName" className="text-sm font-medium text-navy-800">First Name <span className="text-patriot-600">*</span></Label>
                    <Input id="contactFirstName" {...register("contactFirstName")} className="mt-1.5" />
                    {errors.contactFirstName && <p className="text-xs text-patriot-600 mt-1">{errors.contactFirstName.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="contactLastName" className="text-sm font-medium text-navy-800">Last Name <span className="text-patriot-600">*</span></Label>
                    <Input id="contactLastName" {...register("contactLastName")} className="mt-1.5" />
                    {errors.contactLastName && <p className="text-xs text-patriot-600 mt-1">{errors.contactLastName.message}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="contactEmail" className="text-sm font-medium text-navy-800">Email Address <span className="text-patriot-600">*</span></Label>
                  <Input id="contactEmail" type="email" {...register("contactEmail")} placeholder="your@email.com" className="mt-1.5" />
                  {errors.contactEmail && <p className="text-xs text-patriot-600 mt-1">{errors.contactEmail.message}</p>}
                </div>
                <div>
                  <Label htmlFor="contactPhone" className="text-sm font-medium text-navy-800">Phone Number</Label>
                  <Input id="contactPhone" type="tel" {...register("contactPhone")} placeholder="(910) 555-0000" className="mt-1.5" />
                </div>
              </div>
            </div>

            {/* Logistics */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-8">
              <h2 className="text-lg font-serif font-semibold text-navy-900 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-patriot-100 text-patriot-700 flex items-center justify-center text-xs font-bold">3</span>
                Logistics & Requirements
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimatedLength" className="text-sm font-medium text-navy-800">Estimated Length</Label>
                    <Input id="estimatedLength" {...register("estimatedLength")} placeholder="e.g., 30 feet" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="numberOfPeople" className="text-sm font-medium text-navy-800">Number of People</Label>
                    <Input id="numberOfPeople" type="number" min={1} {...register("numberOfPeople")} className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="parkingSpots" className="text-sm font-medium text-navy-800">Parking Spots Needed</Label>
                  <Input id="parkingSpots" type="number" min={0} {...register("parkingSpots")} placeholder="0" className="mt-1.5" />
                </div>
                <div className="flex items-center gap-3 p-4 bg-navy-50 rounded-xl border border-navy-100">
                  <Checkbox
                    id="requiresElectricity"
                    checked={watch("requiresElectricity")}
                    onCheckedChange={(v) => setValue("requiresElectricity", v === true)}
                  />
                  <Label htmlFor="requiresElectricity" className="text-sm text-navy-800 cursor-pointer">
                    My entry requires electrical power during staging
                  </Label>
                </div>
                <div>
                  <Label htmlFor="specialRequirements" className="text-sm font-medium text-navy-800">Special Requirements or Notes</Label>
                  <Textarea id="specialRequirements" {...register("specialRequirements")} placeholder="Any special needs, accommodations, or information the parade committee should know..." className="mt-1.5 resize-none" rows={3} />
                </div>
              </div>
            </div>

            {/* Agreement */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-8">
              <h2 className="text-lg font-serif font-semibold text-navy-900 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-patriot-100 text-patriot-700 flex items-center justify-center text-xs font-bold">4</span>
                Rules Agreement
              </h2>
              <div className="bg-navy-50 rounded-xl p-4 border border-navy-100 mb-4 text-sm text-muted-foreground leading-relaxed">
                <p className="font-medium text-navy-800 mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> Key Rules Summary</p>
                <ul className="space-y-1 text-xs">
                  <li>• No items may be thrown from moving vehicles</li>
                  <li>• Floats may not exceed 65 feet in length</li>
                  <li>• All music must be family-appropriate</li>
                  <li>• No political campaign entries</li>
                  <li>• Check-in begins at 7:00 AM on July 4th</li>
                </ul>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agreeToRules"
                  checked={watch("agreeToRules")}
                  onCheckedChange={(v) => setValue("agreeToRules", v === true)}
                />
                <Label htmlFor="agreeToRules" className="text-sm text-navy-800 cursor-pointer leading-relaxed">
                  I have read and agree to all parade rules and guidelines. I understand that failure to comply may result in removal from the parade.
                </Label>
              </div>
              {errors.agreeToRules && <p className="text-xs text-patriot-600 mt-2">{errors.agreeToRules.message}</p>}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-patriot-600 hover:bg-patriot-700 text-white btn-press gap-2 text-base py-6"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Registration...</>
              ) : (
                <><Star className="w-5 h-5" /> Submit Parade Registration</>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Returning participant?{" "}
              <Link href="/parade/renew" className="text-patriot-600 hover:underline font-medium">
                Use the renewal form instead →
              </Link>
            </p>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}
