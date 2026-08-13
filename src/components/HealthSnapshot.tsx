import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, CalendarClock, Droplets, FlaskConical, Pill, Sparkles, Sun, Sunrise, Moon,
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

const statusPenalty = (s?: string): number | null => {
  const v = (s ?? "").toLowerCase();
  if (!v || v === "unknown") return null;
  if (v === "normal") return 0;
  if (v.includes("borderline")) return 10;
  if (v.includes("very")) return 35;
  if (v.includes("high") || v.includes("low") || v.includes("elevated")) return 22;
  return 8;
};

const toneFor = (score: number | null) => {
  if (score === null) return { label: "No data yet", dot: "bg-white/40", text: "text-white/70", ring: "from-white/30 to-white/10" };
  if (score >= 85) return { label: "Stable", dot: "bg-emerald-400", text: "text-emerald-300", ring: "from-emerald-400 to-teal-400" };
  if (score >= 70) return { label: "Mostly stable", dot: "bg-amber-300", text: "text-amber-200", ring: "from-amber-300 to-pink-400" };
  if (score >= 50) return { label: "Needs monitoring", dot: "bg-orange-400", text: "text-orange-300", ring: "from-orange-400 to-pink-500" };
  return { label: "Needs attention", dot: "bg-rose-500", text: "text-rose-300", ring: "from-rose-500 to-fuchsia-600" };
};

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

  const tone = toneFor(score);
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

  const tip = useMemo(() => {
    if (score === null) return "Upload a lab report so TIA can personalise your daily guidance.";
    if (score >= 85) return "Stay hydrated and keep your current routine — consistency is what's working.";
    if (score >= 70) return "Keep medication timing consistent and log your energy daily to spot patterns early.";
    if (score >= 50) return "Prioritise sleep and steady meals this week, and note any new symptoms in your tracker.";
    return "Share your latest report with your doctor and keep logging symptoms until you're reviewed.";
  }, [score]);

  const circumference = 2 * Math.PI * 42;

  return (
    <section className="relative z-10 px-6 pb-6">
      <div className="max-w-6xl mx-auto animate-fadeIn">
        <Card className="bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-transparent backdrop-blur-sm border border-pink-400/30 hover:border-pink-400/60 transition-all duration-300">
          <CardContent className="p-7">
            <div className="flex flex-col lg:flex-row lg:items-center gap-7">
              {/* Score ring */}
              <div className="flex items-center gap-5">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-white/10" />
                    <circle
                      cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="round"
                      stroke="url(#snapshotGrad)"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - (circumference * shownScore) / 100}
                      style={{ transition: "stroke-dashoffset 0.2s linear" }}
                    />
                    <defs>
                      <linearGradient id="snapshotGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" className="[stop-color:hsl(330_80%_65%)]" />
                        <stop offset="100%" className="[stop-color:hsl(280_80%_65%)]" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-semibold text-white leading-none">
                      {score === null ? "--" : shownScore}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-white/45 mt-1">/ 100</span>
                  </div>
                </div>

                <div className="lg:hidden">
                  <p className="text-white/60 text-sm flex items-center gap-2">
                    <GreetIcon className="w-4 h-4 text-pink-300" />
                    {greetText}{name ? `, ${name}` : ""}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="hidden lg:flex items-center gap-2 text-white/60 text-sm">
                  <GreetIcon className="w-4 h-4 text-pink-300" />
                  {greetText}{name ? `, ${name}` : ""}
                </p>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mt-1 tracking-tight">
                  Today's Health Snapshot
                </h2>
                <p className={`mt-1 text-sm flex items-center gap-2 ${tone.text}`}>
                  <span className={`w-2 h-2 rounded-full ${tone.dot}`} />
                  {score === null
                    ? "No lab data yet — upload a report to see your status."
                    : `Your thyroid profile is ${tone.label.toLowerCase()} today.`}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-pink-300" /> Health score
                    </p>
                    <p className="text-white font-semibold mt-1">
                      {score === null ? "Not available" : `${score}/100`}
                      {score !== null && <span className={`ml-2 text-xs font-normal ${tone.text}`}>{tone.label}</span>}
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-purple-300" /> TSH
                    </p>
                    <p className="text-white font-semibold mt-1">
                      {latestReport?.tsh != null ? `${latestReport.tsh} mIU/L` : "No reading"}
                      {tshStatus && <span className="ml-2 text-xs font-normal text-white/60 capitalize">{tshStatus}</span>}
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-pink-300" /> Next medication
                    </p>
                    <p className="text-white font-semibold mt-1">
                      {nextMedication
                        ? formatTime(nextMedication.reminder_time) ??
                          new Date(nextMedication.reminder_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "Not scheduled"}
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                      <CalendarClock className="w-3.5 h-3.5 text-purple-300" /> Next lab test
                    </p>
                    <p className="text-white font-semibold mt-1">
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
                  <div className="flex items-start gap-2.5 bg-gradient-to-r from-pink-500/15 to-purple-500/10 border border-pink-400/25 rounded-xl px-4 py-3 flex-1">
                    <Sparkles className="w-4 h-4 text-pink-300 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-white/85">
                      <span className="text-white/50">AI tip — </span>{tip}
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
                      className="rounded-full text-white/75 hover:text-white hover:bg-white/10 border border-white/10"
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
