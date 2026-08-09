import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarClock,
  FileText,
  Minus,
  Pill,
  Smile,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLabReports, type LabReport } from "@/hooks/useLabReports";

/* ------------------------------------------------------------------ */
/* Small presentational primitives                                     */
/* ------------------------------------------------------------------ */

type Tone = "normal" | "borderline" | "moderate" | "high" | "info" | "na";

const toneText: Record<Tone, string> = {
  normal: "text-health-normal",
  borderline: "text-health-borderline",
  moderate: "text-health-moderate",
  high: "text-health-high",
  info: "text-health-info",
  na: "text-health-na",
};

const SectionCard = ({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) => (
  <Card
    className="bg-white/[0.04] backdrop-blur-md border border-white/10 hover:border-pink-400/40 transition-all duration-300 animate-fadeIn"
    style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
  >
    <CardContent className="p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-400/25 flex items-center justify-center">
            <Icon className="w-4 h-4 text-pink-200" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-white leading-tight">{title}</h3>
            {subtitle && <p className="text-xs text-white/50 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </CardContent>
  </Card>
);

const EmptyState = ({ text, cta, onClick }: { text: string; cta?: string; onClick?: () => void }) => (
  <div className="py-8 text-center">
    <p className="text-sm text-white/50">{text}</p>
    {cta && (
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        className="mt-3 bg-transparent border-pink-400/40 text-pink-200 hover:bg-pink-500/10 hover:text-white"
      >
        {cta}
      </Button>
    )}
  </div>
);

const useCountUp = (target: number | null, duration = 900) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === null || Number.isNaN(target)) return;
    let frame = 0;
    const total = Math.max(1, Math.round(duration / 16));
    const id = setInterval(() => {
      frame += 1;
      const progress = Math.min(1, frame / total);
      setValue(target * (1 - Math.pow(1 - progress, 3)));
      if (progress === 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return value;
};

const KpiCard = ({
  label,
  value,
  unit,
  caption,
  icon: Icon,
  tone = "info",
  delta,
  delay = 0,
}: {
  label: string;
  value: string | number | null;
  unit?: string;
  caption?: string;
  icon: React.ElementType;
  tone?: Tone;
  delta?: number | null;
  delay?: number;
}) => {
  const numeric = typeof value === "number" ? value : null;
  const animated = useCountUp(numeric);
  const display =
    numeric !== null
      ? (Number.isInteger(numeric) ? Math.round(animated) : animated.toFixed(2))
      : (value ?? "—");

  const DeltaIcon = delta == null ? Minus : delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;

  return (
    <Card
      className="bg-white/[0.05] backdrop-blur-md border border-white/10 hover:border-pink-400/50 hover:-translate-y-0.5 transition-all duration-300 animate-fadeIn"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs uppercase tracking-wider text-white/45">{label}</span>
          <Icon className="w-4 h-4 text-white/35" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-4xl font-semibold tabular-nums ${toneText[tone]}`}>{display}</span>
          {unit && <span className="text-sm text-white/45">{unit}</span>}
        </div>
        <div className="mt-2 flex items-center gap-2">
          {delta != null && (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                delta === 0 ? "text-white/45" : delta > 0 ? "text-health-high" : "text-health-normal"
              }`}
            >
              <DeltaIcon className="w-3 h-3" />
              {delta === 0 ? "stable" : `${delta > 0 ? "+" : ""}${delta.toFixed(2)}`}
            </span>
          )}
          {caption && <span className="text-xs text-white/45">{caption}</span>}
        </div>
      </CardContent>
    </Card>
  );
};

/* ------------------------------------------------------------------ */
/* Data types                                                          */
/* ------------------------------------------------------------------ */

interface TrackerRow {
  date: string;
  mood: string | null;
  energy_level: number | null;
}

interface ReminderRow {
  id: string;
  title: string;
  reminder_type: string;
  reminder_date: string;
  reminder_time: string | null;
  is_active: boolean;
}

const scoreOf = (r: LabReport): number | null => {
  const raw = r.risk?.score ?? r.risk?.health_score;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.round(n) : null;
};

const MOOD_SCALE: Record<string, number> = {
  terrible: 1,
  bad: 2,
  low: 2,
  okay: 3,
  neutral: 3,
  good: 4,
  great: 5,
  excellent: 5,
};

const ProgressOverview = () => {
  const navigate = useNavigate();
  const { reports, latestReport } = useLabReports();
  const [tracker, setTracker] = useState<TrackerRow[]>([]);
  const [reminders, setReminders] = useState<ReminderRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (active) setLoaded(true);
          return;
        }
        const [trackerRes, remindersRes] = await Promise.all([
          supabase
            .from("health_tracker")
            .select("date, mood, energy_level")
            .eq("user_id", user.id)
            .order("date", { ascending: false })
            .limit(14),
          supabase
            .from("reminders")
            .select("id, title, reminder_type, reminder_date, reminder_time, is_active")
            .eq("user_id", user.id)
            .order("reminder_date", { ascending: true })
            .limit(60),
        ]);
        if (!active) return;
        setTracker((trackerRes.data ?? []) as TrackerRow[]);
        setReminders((remindersRes.data ?? []) as ReminderRow[]);
      } catch (e) {
        console.warn("Dashboard data load failed", e);
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  /* ---------------- KPIs ---------------- */
  const sorted = useMemo(
    () => [...reports].sort((a, b) => +new Date(a.uploadDate) - +new Date(b.uploadDate)),
    [reports]
  );
  const previousReport = sorted.length > 1 ? sorted[sorted.length - 2] : null;

  const latestTSH = latestReport?.tsh ?? null;
  const tshDelta =
    latestTSH != null && previousReport?.tsh != null ? Number((latestTSH - previousReport.tsh).toFixed(2)) : null;

  const currentScore = latestReport ? scoreOf(latestReport) : null;
  const prevScore = previousReport ? scoreOf(previousReport) : null;
  const scoreDelta = currentScore != null && prevScore != null ? currentScore - prevScore : null;

  const avgEnergy = useMemo(() => {
    const vals = tracker.map((t) => t.energy_level).filter((v): v is number => v != null);
    return vals.length ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : null;
  }, [tracker]);

  /* ---------------- Health score trend ---------------- */
  const scoreTrend = useMemo(
    () =>
      sorted
        .map((r) => ({
          date: new Date(r.uploadDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          score: scoreOf(r),
        }))
        .filter((d) => d.score != null),
    [sorted]
  );

  /* ---------------- Medication adherence ---------------- */
  const adherence = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const meds = reminders.filter(
      (r) => /medic|pill|dose|tablet/i.test(r.reminder_type) && r.reminder_date <= today
    );
    if (!meds.length) return null;
    const taken = meds.filter((m) => !m.is_active).length;
    return { taken, total: meds.length, percent: Math.round((taken / meds.length) * 100) };
  }, [reminders]);

  /* ---------------- Symptom / wellbeing trend ---------------- */
  const symptomTrend = useMemo(
    () =>
      [...tracker]
        .reverse()
        .map((t) => ({
          date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          energy: t.energy_level ?? null,
          mood: t.mood ? (MOOD_SCALE[t.mood.toLowerCase()] ?? null) : null,
        })),
    [tracker]
  );

  /* ---------------- Upcoming reminders ---------------- */
  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return reminders.filter((r) => r.is_active && r.reminder_date >= today).slice(0, 4);
  }, [reminders]);

  const chartTooltip = {
    contentStyle: {
      background: "rgba(30, 0, 61, 0.95)",
      border: "1px solid rgba(236,72,153,0.35)",
      borderRadius: "0.75rem",
      color: "#fff",
      fontSize: "0.8rem",
    },
    labelStyle: { color: "rgba(255,255,255,0.6)" },
  };

  return (
    <section className="relative z-10 px-6 pb-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KpiCard
            label="Health score"
            value={currentScore}
            unit={currentScore != null ? "/100" : undefined}
            icon={Activity}
            tone={currentScore == null ? "na" : currentScore >= 75 ? "normal" : currentScore >= 50 ? "borderline" : "high"}
            caption={scoreDelta != null ? `${scoreDelta > 0 ? "+" : ""}${scoreDelta} vs last report` : "From latest report"}
            delay={0}
          />
          <KpiCard
            label="Latest TSH"
            value={latestTSH}
            unit="µIU/mL"
            icon={TrendingUp}
            tone={latestTSH == null ? "na" : "info"}
            delta={tshDelta}
            caption={latestReport?.tshStatus ? `Status: ${latestReport.tshStatus}` : undefined}
            delay={60}
          />
          <KpiCard
            label="Reports analyzed"
            value={reports.length}
            icon={FileText}
            tone="info"
            caption={
              latestReport ? `Last ${new Date(latestReport.uploadDate).toLocaleDateString()}` : "No uploads yet"
            }
            delay={120}
          />
          <KpiCard
            label="Avg energy"
            value={avgEnergy}
            unit={avgEnergy != null ? "/10" : undefined}
            icon={Smile}
            tone={avgEnergy == null ? "na" : avgEnergy >= 7 ? "normal" : avgEnergy >= 4 ? "borderline" : "moderate"}
            caption={tracker.length ? `Across ${tracker.length} log${tracker.length > 1 ? "s" : ""}` : "No logs yet"}
            delay={180}
          />
        </div>

        {/* Trend + adherence */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SectionCard
              title="Health score trend"
              subtitle="Overall thyroid score across your reports"
              icon={TrendingUp}
              delay={220}
            >
              {scoreTrend.length > 1 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={scoreTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(330 80% 65%)" stopOpacity={0.45} />
                          <stop offset="100%" stopColor="hsl(280 80% 60%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip {...chartTooltip} />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(330 80% 70%)"
                        strokeWidth={2.5}
                        fill="url(#scoreFill)"
                        dot={{ r: 3, fill: "hsl(330 80% 70%)", strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                        animationDuration={900}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  text="Upload at least two lab reports to see how your score moves over time."
                  cta="Upload a report"
                  onClick={() => navigate("/lab-report")}
                />
              )}
            </SectionCard>
          </div>

          <SectionCard title="Medication adherence" subtitle="Based on your reminders" icon={Pill} delay={280}>
            {adherence ? (
              <div className="flex flex-col items-center py-2">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="url(#adherenceGrad)"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray={`${(adherence.percent / 100) * 264} 264`}
                      className="transition-[stroke-dasharray] duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="adherenceGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="hsl(330 80% 65%)" />
                        <stop offset="100%" stopColor="hsl(280 80% 60%)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-semibold text-white tabular-nums">{adherence.percent}%</span>
                    <span className="text-[0.65rem] text-white/45">on track</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-white/60 text-center">
                  {adherence.taken} of {adherence.total} scheduled doses completed
                </p>
              </div>
            ) : (
              <EmptyState
                text="No medication reminders logged yet."
                cta="Add a reminder"
                onClick={() => navigate("/reminders")}
              />
            )}
          </SectionCard>
        </div>

        {/* Symptoms + reminders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SectionCard
              title="Symptom & wellbeing trend"
              subtitle="Energy and mood from your health logs"
              icon={Smile}
              delay={320}
            >
              {symptomTrend.length > 1 ? (
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={symptomTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 10]} stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip {...chartTooltip} />
                      <Line
                        type="monotone"
                        dataKey="energy"
                        name="Energy"
                        stroke="hsl(217 91% 65%)"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "hsl(217 91% 65%)", strokeWidth: 0 }}
                        connectNulls
                        animationDuration={900}
                      />
                      <Line
                        type="monotone"
                        dataKey="mood"
                        name="Mood"
                        stroke="hsl(330 80% 70%)"
                        strokeWidth={2.5}
                        strokeDasharray="5 4"
                        dot={{ r: 3, fill: "hsl(330 80% 70%)", strokeWidth: 0 }}
                        connectNulls
                        animationDuration={1100}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  text={loaded ? "Log your mood and energy to reveal patterns over time." : "Loading your logs..."}
                  cta="Open health tracker"
                  onClick={() => navigate("/health-tracker")}
                />
              )}
              {symptomTrend.length > 1 && (
                <div className="mt-4 flex items-center gap-4 text-xs text-white/55">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-0.5 rounded bg-[hsl(217_91%_65%)]" /> Energy
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-0.5 rounded bg-[hsl(330_80%_70%)]" /> Mood
                  </span>
                </div>
              )}
            </SectionCard>
          </div>

          <SectionCard
            title="Upcoming reminders"
            subtitle="Next scheduled actions"
            icon={Bell}
            delay={380}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/reminders")}
                className="text-xs text-pink-200 hover:text-white hover:bg-white/10"
              >
                View all
              </Button>
            }
          >
            {upcoming.length ? (
              <div className="space-y-3">
                {upcoming.map((r, i) => (
                  <div
                    key={r.id}
                    className="flex items-start gap-3 rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-3 hover:border-pink-400/40 transition-all animate-fadeIn"
                    style={{ animationDelay: `${400 + i * 60}ms`, animationFillMode: "backwards" }}
                  >
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-400/20 flex items-center justify-center flex-shrink-0">
                      {/medic|pill|dose/i.test(r.reminder_type) ? (
                        <Pill className="w-3.5 h-3.5 text-pink-200" />
                      ) : (
                        <CalendarClock className="w-3.5 h-3.5 text-pink-200" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-white/90 truncate">{r.title}</p>
                      <p className="text-xs text-white/45">
                        {new Date(r.reminder_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {r.reminder_time ? ` · ${r.reminder_time.slice(0, 5)}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                text={loaded ? "Nothing scheduled. You're all caught up." : "Loading reminders..."}
                cta="Add a reminder"
                onClick={() => navigate("/reminders")}
              />
            )}
          </SectionCard>
        </div>
      </div>
    </section>
  );
};

export default ProgressOverview;
