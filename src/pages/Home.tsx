import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  FileText,
  Activity,
  MessageCircle,
  BarChart3,
  CalendarCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useLabReports } from "@/hooks/useLabReports";
import { useReminders } from "@/hooks/useReminders";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/health/StatusBadge";
import { resolveStatus, MARKER_RANGES } from "@/components/health/statusUtils";
import tiaLogo from "@/assets/tia-butterfly-logo.png";

interface TrackerRow {
  date: string;
  mood: string | null;
  energy_level: number | null;
}

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const Home = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { reports, latestReport } = useLabReports();
  const { upcoming, loading: remindersLoading } = useReminders();
  const [checkIns, setCheckIns] = useState<TrackerRow[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase
      .from("health_tracker")
      .select("date, mood, energy_level")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (active) setCheckIns((data as TrackerRow[]) ?? []);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const firstName = (profile?.full_name || user?.email?.split("@")[0] || "").split(" ")[0];
  const lastCheckIn = checkIns?.[0] ?? null;

  const markers = useMemo(() => {
    if (!latestReport) return [];
    return ([
      ["TSH", latestReport.tsh, latestReport.tshStatus],
      ["T3", latestReport.t3, latestReport.t3Status],
      ["T4", latestReport.t4, latestReport.t4Status],
    ] as const)
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([key, value, status]) => ({
        key,
        value: value as number,
        unit: MARKER_RANGES[key].unit,
        status: resolveStatus(key, value as number, status),
      }));
  }, [latestReport]);

  const hasAnyData = reports.length > 0 || (checkIns?.length ?? 0) > 0 || upcoming.length > 0;

  const quickActions = [
    {
      title: "Upload lab report",
      description: "Let TIA read and explain your results.",
      icon: FileText,
      to: "/reports",
    },
    {
      title: "Track health",
      description: "Log how you're feeling today.",
      icon: Activity,
      to: "/health-tracker",
    },
    {
      title: "Ask TIA",
      description: "Get your thyroid questions answered.",
      icon: MessageCircle,
      to: "/assistant",
    },
  ];

  return (
    <div className="min-h-screen bg-deep-dark-purple relative overflow-hidden pb-24 md:pb-16">
      <Navigation />
      <div className="absolute top-24 -left-16 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-10 -right-16 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl" />

      <main className="relative z-10 pt-24 px-4 md:px-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header>
          <h1 className="text-2xl md:text-3xl font-semibold text-white">
            {greeting()}{firstName ? `, ${firstName}` : ""} <span aria-hidden>👋</span>
          </h1>
          <p className="text-white/60 mt-1">Here's your thyroid health snapshot.</p>
        </header>

        {/* Snapshot / welcome */}
        {!hasAnyData ? (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8 text-center">
              <img src={tiaLogo} alt="" className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white">Let's get to know your thyroid health</h2>
              <p className="text-white/65 mt-2 max-w-md mx-auto">
                Add your first lab report, track how you're feeling, or ask TIA a question.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-5 md:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/45 mb-4">
                Today's snapshot
              </h2>

              {markers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {markers.map((m) => (
                    <div key={m.key} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                      <p className="text-xs text-white/50">{m.key}</p>
                      <p className="text-2xl font-semibold text-white mt-1">
                        {m.value}
                        <span className="text-xs text-white/45 ml-1">{m.unit}</span>
                      </p>
                      <StatusBadge status={m.status} size="sm" className="mt-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/60 text-sm">
                  No lab values stored yet — upload a report and they'll appear here.
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <p className="text-xs text-white/50">Last report</p>
                  <p className="text-white mt-1">
                    {latestReport
                      ? format(new Date(latestReport.uploadDate), "d MMM yyyy")
                      : "No reports yet"}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <p className="text-xs text-white/50">Last check-in</p>
                  <p className="text-white mt-1">
                    {checkIns === null ? (
                      <Skeleton className="h-4 w-24 bg-white/10" />
                    ) : lastCheckIn ? (
                      `${format(new Date(lastCheckIn.date), "d MMM yyyy")}${
                        lastCheckIn.mood ? ` · ${lastCheckIn.mood}` : ""
                      }`
                    ) : (
                      "No check-ins yet"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
        <section aria-label="Quick actions" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((a) => (
            <button
              key={a.to}
              onClick={() => navigate(a.to)}
              className="text-left rounded-2xl border border-pink-400/30 bg-white/5 hover:bg-white/10 hover:border-pink-400/60 transition-all p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
            >
              <a.icon className="w-6 h-6 text-pink-300 mb-3" />
              <p className="text-white font-medium">{a.title}</p>
              <p className="text-white/55 text-sm mt-1">{a.description}</p>
            </button>
          ))}
        </section>

        {/* Progress preview */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-white font-medium flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-pink-300" />
                Your recent progress
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/progress")}
                className="text-pink-300 hover:text-pink-200 hover:bg-white/10"
              >
                View progress <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <p className="text-white/60 text-sm mt-3">
              {reports.length + (checkIns?.length ?? 0) >= 2
                ? `${reports.length} report${reports.length === 1 ? "" : "s"} and ${
                    checkIns?.length ?? 0
                  } check-in${(checkIns?.length ?? 0) === 1 ? "" : "s"} recorded so far.`
                : "Start tracking to see your progress over time."}
            </p>
          </CardContent>
        </Card>

        {/* Upcoming care */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-white font-medium flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-pink-300" />
                Upcoming
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/care-plan")}
                className="text-pink-300 hover:text-pink-200 hover:bg-white/10"
              >
                View care plan <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="mt-3 space-y-2">
              {remindersLoading ? (
                <Skeleton className="h-10 w-full bg-white/10" />
              ) : upcoming.length === 0 ? (
                <p className="text-white/60 text-sm">
                  You're all caught up. Create a reminder when you need help staying on track.
                </p>
              ) : (
                upcoming.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3"
                  >
                    <div>
                      <p className="text-white text-sm">{r.title}</p>
                      <p className="text-white/45 text-xs capitalize">{r.reminder_type}</p>
                    </div>
                    <p className="text-white/60 text-xs">
                      {format(new Date(r.reminder_date), "d MMM")}
                      {r.reminder_time ? ` · ${r.reminder_time.slice(0, 5)}` : ""}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* TIA insight */}
        <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-pink-400/25 backdrop-blur-sm">
          <CardContent className="p-5 md:p-6">
            <h2 className="text-white font-medium flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-300" />
              Your TIA insight
            </h2>
            <p className="text-white/75 text-sm mt-3 leading-relaxed">
              {latestReport?.summary
                ? latestReport.summary
                : "Once you add your first report, I'll help you understand what your results mean."}
            </p>
            <p className="text-white/40 text-xs mt-4">
              TIA provides educational information and does not replace advice from a qualified
              healthcare professional.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Home;
