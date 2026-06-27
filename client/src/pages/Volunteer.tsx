import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, Heart, CheckCircle, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const VOLUNTEER_AREAS = [
  { id: "parade", label: "Parade Operations" },
  { id: "setup", label: "Event Setup & Teardown" },
  { id: "information", label: "Information Booths" },
  { id: "arts_crafts", label: "Arts & Crafts Festival" },
  { id: "childrens", label: "Children's Activities" },
  { id: "security", label: "Crowd Management / Security Assist" },
  { id: "naturalization", label: "Naturalization Ceremony" },
  { id: "fireworks", label: "Fireworks Event Coordination" },
  { id: "beach_day", label: "Beach Day (Oak Island)" },
  { id: "general", label: "General Assistance" },
];

const schema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  areas: z.array(z.string()).min(1, "Please select at least one area"),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function Volunteer() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { areas: [] },
  });

  // We use the event signup endpoint for volunteer signups (type: volunteer)
  // For a general volunteer signup, we use a placeholder event ID of 0
  const signupMutation = trpc.signups.create.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err) => toast.error(err.message || "Signup failed. Please try again."),
  });

  const toggleArea = (id: string) => {
    const updated = selectedAreas.includes(id)
      ? selectedAreas.filter((a) => a !== id)
      : [...selectedAreas, id];
    setSelectedAreas(updated);
    setValue("areas", updated);
  };

  const onSubmit = (data: any) => {
    signupMutation.mutate({
      eventId: 1, // General volunteer pool
      type: "volunteer",
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      notes: `Areas: ${data.areas.join(", ")}. ${data.notes ?? ""}`.trim(),
    });
  };

  if (submitted) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center py-20">
          <div className="container max-w-lg text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-serif text-navy-900 mb-3">Thank You for Volunteering!</h1>
            <p className="text-muted-foreground mb-8">
              Your volunteer signup has been received. Our volunteer coordinator will be in touch with details about your assignment and schedule.
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline" className="border-navy-300 text-navy-700">
              Sign Up Another Volunteer
            </Button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-navy-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-stars opacity-20" />
        <div className="relative container text-center">
          <p className="font-display text-xs tracking-widest text-gold-400 mb-3 uppercase">Make a Difference</p>
          <h1 className="text-4xl md:text-5xl font-serif mb-5">Volunteer with Us</h1>
          <div className="section-divider w-16 mx-auto mb-5" />
          <p className="text-navy-300 max-w-xl mx-auto text-lg leading-relaxed">
            The NC 4th of July Festival is powered by hundreds of dedicated volunteers. Join us and help make this year's celebration unforgettable.
          </p>
        </div>
      </section>

      {/* Why Volunteer */}
      <section className="py-14 bg-patriot-50 border-b border-patriot-100">
        <div className="container">
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Heart, title: "Community Impact", desc: "Help create memories for 50,000+ festival attendees." },
              { icon: Star, title: "Festival Perks", desc: "Volunteers receive exclusive festival merchandise and recognition." },
              { icon: Users, title: "Meet Your Community", desc: "Work alongside fellow Southport residents and patriots." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-patriot-100 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-patriot-600" />
                  </div>
                  <h3 className="font-serif font-semibold text-navy-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-14">
        <div className="container max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-serif text-navy-900 mb-2">Volunteer Sign-Up</h2>
            <p className="text-muted-foreground text-sm">Fill out the form below and our volunteer coordinator will contact you.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
              <h3 className="font-serif text-lg text-navy-900 mb-4">Your Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-navy-800">First Name <span className="text-patriot-600">*</span></Label>
                    <Input {...register("firstName")} className="mt-1.5" />
                    {errors.firstName && <p className="text-xs text-patriot-600 mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-navy-800">Last Name <span className="text-patriot-600">*</span></Label>
                    <Input {...register("lastName")} className="mt-1.5" />
                    {errors.lastName && <p className="text-xs text-patriot-600 mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-navy-800">Email <span className="text-patriot-600">*</span></Label>
                  <Input type="email" {...register("email")} className="mt-1.5" />
                  {errors.email && <p className="text-xs text-patriot-600 mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium text-navy-800">Phone</Label>
                  <Input type="tel" {...register("phone")} className="mt-1.5" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
              <h3 className="font-serif text-lg text-navy-900 mb-2">Areas of Interest <span className="text-patriot-600">*</span></h3>
              <p className="text-sm text-muted-foreground mb-4">Select all areas where you'd like to volunteer.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {VOLUNTEER_AREAS.map((area) => (
                  <div key={area.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-navy-50 transition-colors cursor-pointer"
                    onClick={() => toggleArea(area.id)}>
                    <Checkbox
                      id={area.id}
                      checked={selectedAreas.includes(area.id)}
                      onCheckedChange={() => toggleArea(area.id)}
                    />
                    <Label htmlFor={area.id} className="text-sm text-navy-800 cursor-pointer">{area.label}</Label>
                  </div>
                ))}
              </div>
              {errors.areas && <p className="text-xs text-patriot-600 mt-2">{errors.areas.message}</p>}
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
              <Label className="text-sm font-medium text-navy-800">Additional Notes</Label>
              <Textarea {...register("notes")} placeholder="Any special skills, availability constraints, or questions..." className="mt-1.5 resize-none" rows={3} />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-patriot-600 hover:bg-patriot-700 text-white btn-press gap-2 py-6"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
              ) : (
                <><Heart className="w-5 h-5" /> Sign Up to Volunteer</>
              )}
            </Button>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}
