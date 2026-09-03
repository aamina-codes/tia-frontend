import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import tiaLogo from "@/assets/tia-butterfly-logo.png";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"];
const DIAGNOSIS_TYPES = [
  "Hypothyroidism",
  "Hyperthyroidism",
  "Hashimoto's",
  "Graves' disease",
  "Thyroid nodules",
  "Not diagnosed yet",
];
const GOALS = [
  "Track my lab results",
  "Stabilise my TSH",
  "Remember my medication",
  "Understand my symptoms",
  "Improve energy levels",
  "Prepare for doctor visits",
];

const STEPS = ["About You", "Thyroid Journey", "Your Goals"];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date_of_birth: profile?.date_of_birth ?? "",
    gender: profile?.gender ?? "",
    diagnosis_type: profile?.diagnosis_type ?? "",
    diagnosis_date: profile?.diagnosis_date ?? "",
    doctor_name: profile?.doctor_name ?? "",
    health_goals: (profile?.health_goals as string[] | null) ?? [],
  });

  const toggleGoal = (goal: string) =>
    setForm((f) => ({
      ...f,
      health_goals: f.health_goals.includes(goal)
        ? f.health_goals.filter((g) => g !== goal)
        : [...f.health_goals, goal],
    }));

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        diagnosis_type: form.diagnosis_type || null,
        diagnosis_date: form.diagnosis_date || null,
        doctor_name: form.doctor_name.trim() || null,
        health_goals: form.health_goals,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast({
        title: "Couldn't save your details",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    await refreshProfile();
    toast({
      title: "You're all set",
      description: "Your TIA profile is ready.",
    });
    navigate("/explore", { replace: true });
  };

  const chip = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm border transition-all ${
      active
        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-[0_0_20px_rgba(236,72,153,0.35)]"
        : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
    }`;

  const inputClass =
    "bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-2xl py-6 px-4 focus:ring-2 focus:ring-pink-400";

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
          <h1 className="text-white text-2xl font-bold">Welcome to TIA</h1>
          <p className="text-white/70 text-sm text-center">
            A few quick questions so TIA can personalise your thyroid care.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
          {/* Stepper */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1">
                <div
                  className={`h-1.5 rounded-full ${
                    i <= step
                      ? "bg-gradient-to-r from-purple-500 to-pink-500"
                      : "bg-white/15"
                  }`}
                />
                <p
                  className={`mt-2 text-xs ${
                    i <= step ? "text-white" : "text-white/50"
                  }`}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-white/90">Date of birth</Label>
                <Input
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) =>
                    setForm({ ...form, date_of_birth: e.target.value })
                  }
                  className={inputClass}
                />
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

          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-white/90">Diagnosis type</Label>
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
                  Diagnosis date <span className="text-white/50">(optional)</span>
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
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label className="text-white/90">
                What would you like TIA to help you with?
              </Label>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGoal(g)}
                    className={chip(form.health_goals.includes(g))}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

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

            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-8 py-6 shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-all"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-8 py-6 shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-all"
              >
                {saving ? "Saving..." : "Finish setup"}
                {!saving && <Check className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
