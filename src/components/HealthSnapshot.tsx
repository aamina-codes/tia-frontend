import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, CalendarClock, Droplets, FlaskConical, Pill, Sparkles, Sun, Sunrise, Moon,
  HeartPulse, ShieldCheck, ShieldAlert, HelpCircle, Brain, ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLabReports } from "@/hooks/useLabReports";
import { supabase } from "@/integrations/supabase/client";

interface ReminderRow {
  title: string;
  reminder_type: string;
  reminder_date: string;
  reminder_time: string | null;
}

type Tone = "green" | "yellow" | "orange" | "red" | "blue" | "muted";

const statusPenalty = (s?: string): number | null => {
  const v = (s ?? "").toLowerCase();
  if (!v || v === "unknown") return null;
  if (v === "normal") return 0;
  if (v.includes("borderline")) return 10;
  if (v.includes("very")) return 35;
  if (v.includes("high") || v.includes("low") || v.includes("elevated")) return 22;
  return 8;
};

const scoreBand = (score: number | null) => {
  if (score === null) {
    return { label: "No data yet", tone: "muted" as Tone, note: "Upload a lab report so TIA can personalise your daily guidance." };
  }
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  if (clamped >= 90) {
    return { label: "Stable", tone: "green" as Tone, note: "Your thyroid profile looks excellent." };
  }
  if (clamped >= 70) {
    return { label: "Mostly stable", tone: "green" as Tone, note: "Your thyroid profile looks stable." };
  }
  if (clamped >= 50) {
    return { label: "Needs monitoring", tone: "orange" as Tone, note: "Some markers need closer monitoring." };
  }
  return { label: "Needs attention", tone: "red" as Tone, note: "Several markers need medical attention." };
};

// ── Light-surface styling maps matching the AI Clinical Analysis card ──
const toneTextOnLight: Record<Tone, string> = {
  green: "text-emerald-700",
  yellow: "text-amber-700",
  orange: "text-orange-700",
  red: "text-red-700",
  blue: "text-sky-700",
  muted: "text-slate-500",
};

const toneBadgeOnLight: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-800 border border-emerald-300",
  yellow: "bg-amber-50 text-amber-800 border border-amber-300",
  orange: "bg-orange-50 text-orange-800 border border-orange-300",
  red: "bg-red-50 text-red-800 border border-red-300",
  blue: "bg-sky-50 text-sky-800 border border-sky-300",
  muted: "bg-slate-100 text-slate-700 border border-slate-300",
};

const toneDotOnLight: Record<Tone, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
  blue: "bg-sky-500",
  muted: "bg-slate-400",
};

const toneStroke: Record<Tone, string> = {
  green: "#059669",
  yellow: "#d97706",
  orange: "#ea580c",
  red: "#dc2626",
  blue: "#0284c7",
  muted: "#94a3b8",
};

const StatusDot = ({ tone }: { tone: Tone }) => (
  <span className={`w-2 h-2 rounded-full shrink-0 ${toneDotOnLight[tone]}`} />
);

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", Icon: Sunrise };
  if (h < 17) return { text: "Good afternoon", Icon: Sun };
  return { text: "Good evening", Icon: Moon };
};

const formatTime = (t: string | null) => {
  if (!t) return null;
  const [hh, mm] = t.split(":");
  const d = new Date();
  d.setHours(Number(hh), Number(mm ?? 0), 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

const daysUntil = (date: string) => {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const target = new Date(date); target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
};

// Circular progress ring for the health score.
const HealthRing = ({ score, shown }: { score: number; shown: number }) => {
  const { tone } = scoreBand(score);
  const R = 42;
  const C = 2 * Math.PI * R;
  const offset = C - (shown / 100) * C;
  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={R} fill="none" strokeWidth="8" stroke="#e9edf3" />
        <circle
          cx="50" cy="50" r={R} fill="none" strokeWidth="8" strokeLinecap="round"
          stroke={toneStroke[tone]}
          strokeDasharray={C}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.2s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold text-slate-900 leading-none">
          {score === null ? "--" : shown}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">/ 100</span>
      </div>
    </div>
  );
};

const HealthSnapshot = () => {
  const navigate = useNavigate();
  const { latestReport } = useLabReports();
  const [name, setName] = useState<string>("");
  const [reminders, setReminders] = useState<ReminderRow[]>([]);
  const [shownScore, setShownScore] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: profile }, { data: rows }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("reminders")
          .select("title, reminder_type, reminder_date, reminder_time")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .gte("reminder_date", new Date().toISOString().slice(0, 10))
          .order("reminder_date", { ascending: true }),
      ]);
      const full = profile?.full_name || user.email?.split("@")[0] || "";
      setName(full.split(" ")[0] || "");
      setReminders(rows ?? []);
    };
    load();
  }, []);

  const score = useMemo(() => {
    const risk = latestReport?.risk ?? {};
    const raw = risk.health_score ?? risk.score ?? risk.healthScore;
    if (typeof raw === "number") return Math.max(0, Math.min(100, Math.round(raw)));
    if (!latestReport) return null;
    const penalties = [
      latestReport.tshStatus, latestReport.t3Status, latestReport.t4Status,
      latestReport.ft3Status, latestReport.ft4Status,
    ].map(statusPenalty).filter((p): p is number => p !== null);
    if (!penalties.length) return null;
    return Math.max(0, Math.min(100, 100 - penalties.reduce((a, b) => a + b, 0)));
  }, [latestReport]);

  useEffect(() => {
    if (score === null) { setShownScore(0); return; }
    let frame = 0;
    const steps = 32;
    const id = setInterval(() => {
      frame += 1;
      setShownScore(Math.round((score * frame) / steps));
      if (frame >= steps) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [score]);

  const band = scoreBand(score);
  const { text: greetText, Icon: GreetIcon } = greeting();

  const nextMedication = useMemo(
    () => reminders.find((r) => (r.reminder_type || "").toLowerCase().includes("medic")),
    [reminders]
  );
  const nextLabTest = useMemo(
    () => reminders.find((r) => {
      const t = `${r.reminder_type} ${r.title}`.toLowerCase();
      return t.includes("lab") || t.includes("test") || t.includes("blood");
    }),
    [reminders]
  );

  const tshStatus = latestReport?.tshStatus && latestReport.tshStatus !== "unknown"
    ? latestReport.tshStatus
    : null;

  const tshTone: Tone = useMemo(() => {
    const s = (tshStatus || "").toLowerCase();
    if (s.includes("normal") || s.includes("stable")) return "green";
    if (s.includes("borderline") || s.includes("mild")) return "yellow";
    if (s.includes("low")) return "blue";
    if (s.includes("high") || s.includes("elevated") || s.includes("very")) return "red";
    return "muted";
  }, [tshStatus]);

  const tip = useMemo(() => {
    if (score === null) return "Upload a lab report so TIA can personalise your daily guidance.";
    if (score >= 85) return "Stay hydrated and keep your current routine — consistency is what's working.";
    if (score >= 70) return "Keep medication timing consistent and log your energy daily to spot patterns early.";
    if (score >= 50) return "Prioritise sleep and steady meals this week, and note any new symptoms in your tracker.";
    return "Share your latest report with your doctor and keep logging symptoms until you're reviewed.";
  }, [score]);

  return (
    <section className="relative z-10 px-6 pb-6">
      <div className="max-w-6xl mx-auto animate-fadeIn">
        <Card className="bg-white border border-purple-200/60 rounded-3xl overflow-hidden shadow-[0_18px_50px_-18px_rgba(30,0,61,0.55)]">
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 px-6 py-5 flex flex-wrap items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white">Today's Health Snapshot</h3>
            <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-[11px] font-semibold backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              Personalised for you
            </span>
          </div>

          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Left: score ring */}
              <div className="flex flex-col items-center text-center lg:border-r lg:border-slate-200 lg:pr-12">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-5">
                  <Activity className="w-3.5 h-3.5 text-pink-500" />
                  AI Health Score
                </p>
                <HealthRing score={score ?? 0} shown={shownScore} />

                <span
                  className={`mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold animate-fade-in transition-transform duration-200 hover:scale-[1.03] ${toneBadgeOnLight[band.tone]}`}
                >
                  <StatusDot tone={band.tone} />
                  {band.label}
                </span>

                <p className="mt-4 text-sm text-slate-600 leading-relaxed max-w-[250px]">
                  {band.note}
                </p>
              </div>

              {/* Right: content */}
              <div className="flex-1 min-w-0">
                <p className="flex items-center gap-2 text-slate-500 text-sm">
                  <GreetIcon className="w-4 h-4 text-pink-500" />
                  {greetText}{name ? `, ${name}` : ""}
                </p>
                <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mt-1 tracking-tight">
                  Your thyroid profile is {band.label.toLowerCase()} today.
                </h2>
                <p className={`mt-1 text-sm flex items-center gap-2 ${toneTextOnLight[band.tone]}`}>
                  <StatusDot tone={band.tone} />
                  {score === null
                    ? "No lab data yet — upload a report to see your status."
                    : band.note}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-pink-500" /> Health score
                    </p>
                    <p className="text-slate-900 font-semibold mt-1">
                      {score === null ? "Not available" : `${score}/100`}
                      {score !== null && (
                        <span className={`ml-2 text-xs font-normal ${toneTextOnLight[band.tone]}`}>
                          {band.label}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-purple-600" /> TSH
                    </p>
                    <p className="text-slate-900 font-semibold mt-1">
                      {latestReport?.tsh != null ? `${latestReport.tsh} mIU/L` : "No reading"}
                      {tshStatus && (
                        <span className={`ml-2 text-xs font-normal capitalize ${toneTextOnLight[tshTone]}`}>
                          {tshStatus}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-pink-500" /> Next medication
                    </p>
                    <p className="text-slate-900 font-semibold mt-1">
                      {nextMedication
                        ? formatTime(nextMedication.reminder_time) ??
                          new Date(nextMedication.reminder_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "Not scheduled"}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <CalendarClock className="w-3.5 h-3.5 text-purple-600" /> Next lab test
                    </p>
                    <p className="text-slate-900 font-semibold mt-1">
                      {nextLabTest
                        ? (() => {
                            const d = daysUntil(nextLabTest.reminder_date);
                            return d <= 0 ? "Due today" : `${d} day${d === 1 ? "" : "s"} remaining`;
                          })()
                        : "Not scheduled"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-start gap-2.5 bg-purple-50/70 border border-purple-100 rounded-xl px-4 py-3 flex-1">
                    <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700">
                      <span className="text-slate-500">AI tip — </span>{tip}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate("/lab-report")}
                      className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                    >
                      <Droplets className="w-4 h-4 mr-2" /> View report
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/reminders")}
                      className="rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                    >
                      Reminders
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HealthSnapshot;
