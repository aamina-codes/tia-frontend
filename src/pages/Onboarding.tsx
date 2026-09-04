import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import tiaLogo from "@/assets/tia-butterfly-logo.png";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  FileText,
  Activity,
  HeartPulse,
  BellRing,
  TrendingUp,
  Stethoscope,
  BookOpen,
} from "lucide-react";

const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"];
const DIAGNOSIS_TYPES = [
  "Hypothyroidism",
  "Hyperthyroidism",
  "Hashimoto's",
  "Thyroid nodules",
  "Other",
  "Not sure",
];
const GOALS = [
  { label: "Understand my lab reports", icon: FileText },
  { label: "Track my thyroid health", icon: Activity },
  { label: "Monitor my symptoms", icon: HeartPulse },
  { label: "Remember medication & tests", icon: BellRing },
  { label: "Understand my trends", icon: TrendingUp },
  { label: "Prepare for doctor visits", icon: Stethoscope },
  { label: "Learn more about thyroid health", icon: BookOpen },
];

const STEPS = ["Welcome", "About You", "Your Thyroid Journey", "Your Goals", "All Set"];

const ageFromDob = (dob: string) => {
  if (!dob) return "";
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age >= 0 && age < 130 ? String(age) : "";
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    diagnosis_type: "",
    diagnosis_date: "",
    doctor_name: "",
    health_goals: [] as string[],
  });

  // Supabase profile is the source of truth — hydrate whenever it loads/changes.
  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      date_of_birth: profile.date_of_birth ?? "",
      gender: profile.gender ?? "",
      diagnosis_type: profile.diagnosis_type ?? "",
      diagnosis_date: profile.diagnosis_date ?? "",
      doctor_name: profile.doctor_name ?? "",
      health_goals: (profile.health_goals as string[] | null) ?? [],
    });
  }, [profile]);

  const toggleGoal = (goal: string) =>
    setForm((f) => ({
      ...f,
      health_goals: f.health_goals.includes(goal)
        ? f.health_goals.filter((g) => g !== goal)
        : [...f.health_goals, goal],
    }));

  const persist = async (extra: Record<string, unknown> = {}) => {
    if (!user) return true;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim() || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        diagnosis_type: form.diagnosis_type || null,
        diagnosis_date: form.diagnosis_date || null,
        doctor_name: form.doctor_name.trim() || null,
        health_goals: form.health_goals,
        ...extra,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Couldn't save your details",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const next = async () => {
    // Light validation on the About You step.
    if (step === 1 && !form.full_name.trim()) {
      toast({
        title: "Your name, please",
        description: "TIA uses your name to personalise your space.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const isFinalData = step === 3;
    const ok = await persist(
      isFinalData
        ? {
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
          }
        : {}
    );
    setSaving(false);
    if (!ok) return;

    if (isFinalData) await refreshProfile();
    setStep((s) => s + 1);
  };

  const chip = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm border transition-all ${
      active
        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-[0_0_20px_rgba(236,72,153,0.35)]"
        : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
    }`;

  const inputClass =
    "bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-2xl py-6 px-4 focus:ring-2 focus:ring-pink-400";

  const age = ageFromDob(form.date_of_birth);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8 relative"
      style={{ backgroundColor: "#1E003D" }}
    >
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float"></div>
      <div
        className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="w-full max-w-xl relative z-10">
        <div className="flex flex-col items-center gap-3 mb-8">
          <img
            src={tiaLogo}
            alt="TIA logo"
            className="w-16 h-16 drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]"
          />
          <h1 className="text-white text-2xl font-bold">
            {step === 0 ? "Welcome to TIA" : STEPS[step]}
          </h1>
          <p className="text-white/70 text-sm text-center">
            A few gentle questions so TIA can personalise your thyroid care.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
          {/* Stepper */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    i <= step
                      ? "bg-gradient-to-r from-purple-500 to-pink-500"
                      : "bg-white/15"
                  }`}
                />
                <p
                  className={`mt-2 text-[11px] ${
                    i <= step ? "text-white" : "text-white/50"
                  }`}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className="space-y-5 text-center">
              <Sparkles className="w-10 h-10 mx-auto text-pink-400" />
              <h2 className="text-white text-xl font-semibold">
                Your personal thyroid-health companion
              </h2>
              <p className="text-white/75 text-sm leading-relaxed">
                TIA helps you understand your lab reports, follow your trends,
                remember your medication and feel prepared for every doctor
                visit. Answering a few short questions lets TIA tailor all of
                this to you. You can skip anything you're unsure about.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-white/90">Your name</Label>
                <Input
                  type="text"
                  placeholder="How should TIA address you?"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/90">Date of birth</Label>
                <Input
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  value={form.date_of_birth}
                  onChange={(e) =>
                    setForm({ ...form, date_of_birth: e.target.value })
                  }
                  className={inputClass}
                />
                {age && (
                  <p className="text-white/60 text-xs pl-1">You are {age} years old</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-white/90">Gender</Label>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm({ ...form, gender: g })}
                      className={chip(form.gender === g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-white/90">Your thyroid condition</Label>
                <div className="flex flex-wrap gap-2">
                  {DIAGNOSIS_TYPES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm({ ...form, diagnosis_type: d })}
                      className={chip(form.diagnosis_type === d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/90">
                  Approximate diagnosis date{" "}
                  <span className="text-white/50">(optional)</span>
                </Label>
                <Input
                  type="date"
                  value={form.diagnosis_date}
                  onChange={(e) =>
                    setForm({ ...form, diagnosis_date: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/90">
                  Doctor's name <span className="text-white/50">(optional)</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Dr. ..."
                  value={form.doctor_name}
                  onChange={(e) =>
                    setForm({ ...form, doctor_name: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <p className="text-white/50 text-xs">
                Not sure about something? Leave it blank — you can add it later
                from your profile.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label className="text-white/90">
                What would you like TIA to help you with?
              </Label>
              <div className="grid sm:grid-cols-2 gap-3">
                {GOALS.map(({ label, icon: Icon }) => {
                  const active = form.health_goals.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleGoal(label)}
                      className={`flex items-center gap-3 text-left p-4 rounded-2xl border transition-all ${
                        active
                          ? "bg-gradient-to-r from-purple-600/80 to-pink-600/80 border-transparent text-white shadow-[0_0_25px_rgba(236,72,153,0.3)]"
                          : "bg-white/5 border-white/15 text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="text-sm">{label}</span>
                      {active && <Check className="w-4 h-4 ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.45)]">
                <Check className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-white text-xl font-semibold">
                {form.full_name ? `Welcome, ${form.full_name.split(" ")[0]}!` : "Welcome to TIA!"}
              </h2>
              <p className="text-white/75 text-sm leading-relaxed">
                Your personalised thyroid-health space is ready. Upload a lab
                report, track how you feel, and ask TIA anything about your
                results whenever you need support.
              </p>
              <Button
                type="button"
                onClick={() => navigate("/explore", { replace: true })}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full py-6 shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-all"
              >
                Enter TIA
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step < 4 && (
            <div className="flex items-center justify-between mt-8 gap-3">
              <Button
                type="button"
                variant="ghost"
                disabled={step === 0 || saving}
                onClick={() => setStep((s) => s - 1)}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full disabled:opacity-40"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button
                type="button"
                onClick={step === 0 ? () => setStep(1) : next}
                disabled={saving}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-8 py-6 shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-all"
              >
                {saving ? "Saving..." : step === 3 ? "Finish setup" : "Continue"}
                {!saving && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
