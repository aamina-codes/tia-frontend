import { useNavigate } from "react-router-dom";
import { CalendarCheck, Plus, Target, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useReminders } from "@/hooks/useReminders";
import { useAuth } from "@/contexts/AuthContext";

const CarePlan = () => {
  const navigate = useNavigate();
  const { upcoming, past, loading, error } = useReminders();
  const { profile } = useAuth();
  const goals = profile?.health_goals ?? [];

  const formatDate = (d: string, t: string | null) => {
    const date = new Date(`${d}T${t ?? "00:00"}`);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) +
      (t ? ` · ${t.slice(0, 5)}` : "");
  };

  return (
    <div className="min-h-screen bg-deep-dark-purple relative overflow-hidden">
      <Navigation />
      <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <main className="relative z-10 pt-24 pb-28 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">My care plan</h1>
              <p className="text-white/60 mt-2">Your reminders and the goals you set during onboarding.</p>
            </div>
            <Button
              onClick={() => navigate("/reminders")}
              className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" /> Add a reminder
            </Button>
          </header>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/45 mb-3">Coming up</h2>
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardContent className="p-5">
                {loading ? (
                  <div className="flex items-center gap-2 text-white/60 py-6 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading your care plan…
                  </div>
                ) : error ? (
                  <p className="text-white/70 py-6 text-center">{error}</p>
                ) : upcoming.length === 0 ? (
                  <div className="py-10 text-center">
                    <CalendarCheck className="w-8 h-8 text-pink-300 mx-auto mb-3" />
                    <p className="text-white font-medium">Nothing scheduled yet</p>
                    <p className="text-white/60 text-sm mt-1 max-w-md mx-auto">
                      Add reminders for medication, lab tests or doctor visits and they'll appear here.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-white/10">
                    {upcoming.map((r) => (
                      <li key={r.id} className="py-3 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-white">{r.title}</p>
                          {r.description && <p className="text-white/55 text-sm">{r.description}</p>}
                        </div>
                        <p className="text-white/60 text-sm whitespace-nowrap">
                          {formatDate(r.reminder_date, r.reminder_time)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/45 mb-3">My health goals</h2>
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardContent className="p-5">
                {goals.length === 0 ? (
                  <div className="py-8 text-center">
                    <Target className="w-8 h-8 text-pink-300 mx-auto mb-3" />
                    <p className="text-white/70">You haven't set any goals yet.</p>
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/profile")}
                      className="text-pink-300 hover:text-white hover:bg-white/10 mt-2 rounded-full"
                    >
                      Add goals in your profile
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {goals.map((g) => (
                      <span key={g} className="px-3 py-1.5 rounded-full bg-white/10 text-white/85 text-sm">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {past.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/45 mb-3">Past</h2>
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                <CardContent className="p-5">
                  <ul className="divide-y divide-white/10">
                    {past.slice(0, 10).map((r) => (
                      <li key={r.id} className="py-3 flex items-center justify-between gap-4">
                        <p className="text-white/70">{r.title}</p>
                        <p className="text-white/45 text-sm whitespace-nowrap">
                          {formatDate(r.reminder_date, r.reminder_time)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default CarePlan;
