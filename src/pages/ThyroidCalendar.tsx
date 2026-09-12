import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Bell, Activity, Plus } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useReminders } from "@/hooks/useReminders";
import { useChecklist, toDateKey } from "@/hooks/useChecklist";
import { useLabReports } from "@/hooks/useLabReports";
import { supabase } from "@/integrations/supabase/client";

interface TrackerRow {
  date: string;
  mood: string | null;
  energy_level: number | null;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const LEGEND = [
  { emoji: "💊", label: "Medication reminder" },
  { emoji: "🩺", label: "Appointment" },
  { emoji: "🔔", label: "Other reminder" },
  { emoji: "🧪", label: "Lab report" },
  { emoji: "❤️", label: "Health / mood entry" },
  { emoji: "✓", label: "Checklist activity" },
];

const ThyroidCalendar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { reminders, loading: remindersLoading, error: remindersError } = useReminders();
  const { activeDays, loading: checklistLoading } = useChecklist();
  const { reports } = useLabReports();

  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState<Date>(() => new Date());
  const [tracker, setTracker] = useState<TrackerRow[] | null>(null);
  const [trackerError, setTrackerError] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase
      .from("health_tracker")
      .select("date, mood, energy_level")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setTrackerError(true);
        setTracker((data as TrackerRow[]) ?? []);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const reportDays = useMemo(
    () => new Set(reports.map((r) => toDateKey(new Date(r.uploadDate)))),
    [reports]
  );
  const trackerDays = useMemo(
    () => new Set((tracker ?? []).map((t) => t.date.slice(0, 10))),
    [tracker]
  );
  const checklistDays = useMemo(() => new Set(activeDays), [activeDays]);

  const markersFor = (day: Date) => {
    const key = toDateKey(day);
    const marks: string[] = [];
    reminders
      .filter((r) => r.reminder_date.slice(0, 10) === key && r.is_active)
      .forEach((r) => {
        const type = (r.reminder_type || "").toLowerCase();
        if (type.includes("medic")) marks.push("💊");
        else if (type.includes("doctor") || type.includes("appoint")) marks.push("🩺");
        else marks.push("🔔");
      });
    if (reportDays.has(key)) marks.push("🧪");
    if (trackerDays.has(key)) marks.push("❤️");
    if (checklistDays.has(key)) marks.push("✓");
    return Array.from(new Set(marks)).slice(0, 4);
  };

  const selectedKey = toDateKey(selected);
  const dayReminders = reminders.filter((r) => r.reminder_date.slice(0, 10) === selectedKey);
  const dayReports = reports.filter((r) => toDateKey(new Date(r.uploadDate)) === selectedKey);
  const dayTracker = (tracker ?? []).filter((t) => t.date.slice(0, 10) === selectedKey);
  const dayChecklist = checklistDays.has(selectedKey);
  const nothingOnDay =
    dayReminders.length === 0 && dayReports.length === 0 && dayTracker.length === 0 && !dayChecklist;

  const loading = remindersLoading || checklistLoading || tracker === null;

  return (
    <div className="min-h-screen bg-deep-dark-purple relative overflow-hidden pb-24 md:pb-16">
      <Navigation />
      <div className="absolute top-24 -left-16 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-10 -right-16 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl" />

      <main className="relative z-10 pt-24 px-4 md:px-6 max-w-5xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            My Thyroid Calendar
          </h1>
          <p className="text-white/70 mt-2">Your reminders, reports and check-ins, month by month.</p>
        </header>

        <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/40">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                aria-label="Previous month"
                onClick={() => setMonth((m) => subMonths(m, 1))}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-lg font-bold text-white">{format(month, "MMMM yyyy")}</h2>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Next month"
                onClick={() => setMonth((m) => addMonths(m, 1))}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-pink-300/80 py-1">
                  {d}
                </div>
              ))}
            </div>

            {loading ? (
              <Skeleton className="h-72 w-full bg-white/10 rounded-xl" />
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                  const inMonth = isSameMonth(day, month);
                  const isSelected = isSameDay(day, selected);
                  const marks = markersFor(day);
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelected(day)}
                      aria-label={format(day, "d MMMM yyyy")}
                      aria-current={isSelected ? "date" : undefined}
                      className={`relative flex flex-col items-center justify-start gap-0.5 rounded-xl h-14 md:h-16 pt-2 text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 ${
                        inMonth ? "text-white/80 hover:bg-white/10" : "text-white/25"
                      } ${isToday(day) ? "ring-1 ring-pink-400/60 text-pink-200 font-bold" : ""} ${
                        isSelected ? "bg-gradient-to-br from-pink-500/30 to-purple-500/30 text-white font-bold" : ""
                      }`}
                    >
                      {format(day, "d")}
                      {inMonth && marks.length > 0 && (
                        <span className="text-[10px] leading-none">{marks.join("")}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 pt-4 border-t border-white/10">
              {LEGEND.map((l) => (
                <span key={l.label} className="text-white/50 text-xs">
                  <span aria-hidden>{l.emoji}</span> {l.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/40">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">{format(selected, "EEEE d MMMM")}</h3>

            {remindersError && (
              <p className="text-red-300 text-sm mb-3">We couldn't load your reminders.</p>
            )}
            {trackerError && (
              <p className="text-red-300 text-sm mb-3">We couldn't load your health entries.</p>
            )}

            {nothingOnDay ? (
              <p className="text-white/55">
                Nothing recorded on this day yet. You can add a reminder or log how you're feeling.
              </p>
            ) : (
              <div className="space-y-2">
                {dayReminders.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3"
                  >
                    <div>
                      <p className="text-white text-sm">{r.title}</p>
                      <p className="text-white/45 text-xs capitalize">
                        {r.reminder_type}
                        {r.is_active ? "" : " · paused"}
                      </p>
                    </div>
                    {r.reminder_time && (
                      <p className="text-white/60 text-xs">{r.reminder_time.slice(0, 5)}</p>
                    )}
                  </div>
                ))}
                {dayReports.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => navigate("/reports")}
                    className="w-full text-left rounded-xl bg-white/5 border border-white/10 px-4 py-3 hover:bg-white/10 transition-colors"
                  >
                    <p className="text-white text-sm">🧪 Lab report analysed</p>
                    <p className="text-white/45 text-xs">Tap to open your reports</p>
                  </button>
                ))}
                {dayTracker.map((t) => (
                  <div
                    key={t.date}
                    className="rounded-xl bg-white/5 border border-white/10 px-4 py-3"
                  >
                    <p className="text-white text-sm">❤️ Health check-in</p>
                    <p className="text-white/45 text-xs">
                      {[t.mood, t.energy_level !== null ? `energy ${t.energy_level}/10` : null]
                        .filter(Boolean)
                        .join(" · ") || "Recorded"}
                    </p>
                  </div>
                ))}
                {dayChecklist && (
                  <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                    <p className="text-white text-sm">✓ Checklist activity</p>
                    <p className="text-white/45 text-xs">You ticked off habits on this day</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-6">
              <Button
                onClick={() => navigate("/reminders")}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add reminder
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/health-tracker")}
                className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-full"
              >
                <Activity className="w-4 h-4 mr-2" />
                Log how I feel
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/care-plan")}
                className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-full"
              >
                <Bell className="w-4 h-4 mr-2" />
                My care plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ThyroidCalendar;
