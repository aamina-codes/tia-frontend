import { useState, useEffect } from "react";
import { Clock, FileText, Pill, AlertTriangle, Award, Heart, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLabReports, type LabReport } from "@/hooks/useLabReports";

interface TimelineEvent {
  id: string;
  date: string;
  type: "lab_report" | "symptom" | "medication" | "milestone" | "consultation";
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  borderColor: string;
  data?: Record<string, any>;
}

const typeConfig = {
  lab_report: { icon: FileText, color: "text-pink-300", borderColor: "border-pink-400/30", bg: "from-pink-500/20 to-rose-500/20" },
  symptom: { icon: AlertTriangle, color: "text-yellow-300", borderColor: "border-yellow-400/30", bg: "from-yellow-500/20 to-amber-500/20" },
  medication: { icon: Pill, color: "text-blue-300", borderColor: "border-blue-400/30", bg: "from-blue-500/20 to-cyan-500/20" },
  milestone: { icon: Award, color: "text-green-300", borderColor: "border-green-400/30", bg: "from-green-500/20 to-emerald-500/20" },
  consultation: { icon: Heart, color: "text-purple-300", borderColor: "border-purple-400/30", bg: "from-purple-500/20 to-violet-500/20" },
};

const ThyroidTimeline = () => {
  const { reports } = useLabReports();
  const [healthEntries, setHealthEntries] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("health_tracker")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(50);
      if (data) setHealthEntries(data);
    };
    fetch();
  }, []);

  // Build timeline events from multiple data sources
  const events: TimelineEvent[] = [];

  // Lab reports
  reports.forEach((r) => {
    events.push({
      id: `lab-${r.id}`,
      date: r.uploadDate,
      type: "lab_report",
      title: "Lab Report Uploaded",
      description: `TSH: ${r.tsh ?? "N/A"} (${r.tshStatus || "pending"}) · T3: ${r.t3 ?? "N/A"} · T4: ${r.t4 ?? "N/A"}`,
      icon: typeConfig.lab_report.icon,
      color: typeConfig.lab_report.color,
      borderColor: typeConfig.lab_report.borderColor,
    });
  });

  // Health tracker entries (mood/energy spikes)
  healthEntries.forEach((e) => {
    if (e.mood === "bad" || e.mood === "low" || (e.energy_level && e.energy_level <= 3)) {
      events.push({
        id: `symptom-${e.id}`,
        date: e.date,
        type: "symptom",
        title: "Symptom Logged",
        description: `Mood: ${e.mood || "—"} · Energy: ${e.energy_level ?? "—"}/10${e.notes ? ` · "${e.notes}"` : ""}`,
        icon: typeConfig.symptom.icon,
        color: typeConfig.symptom.color,
        borderColor: typeConfig.symptom.borderColor,
      });
    } else if (e.mood === "great" || (e.energy_level && e.energy_level >= 8)) {
      events.push({
        id: `milestone-${e.id}`,
        date: e.date,
        type: "milestone",
        title: "Feeling Great! 🌟",
        description: `Mood: ${e.mood || "—"} · Energy: ${e.energy_level ?? "—"}/10 — Keep it up!`,
        icon: typeConfig.milestone.icon,
        color: typeConfig.milestone.color,
        borderColor: typeConfig.milestone.borderColor,
      });
    }
  });

  // Milestones based on report count
  if (reports.length >= 1) {
    events.push({
      id: "milestone-first-report",
      date: reports[reports.length - 1]?.uploadDate || new Date().toISOString(),
      type: "milestone",
      title: "First Lab Report! 🦋",
      description: "You started your thyroid health journey. Every step matters.",
      icon: typeConfig.milestone.icon,
      color: typeConfig.milestone.color,
      borderColor: typeConfig.milestone.borderColor,
    });
  }
  if (reports.length >= 5) {
    events.push({
      id: "milestone-five-reports",
      date: reports[4]?.uploadDate || new Date().toISOString(),
      type: "milestone",
      title: "5 Reports Milestone! 🏆",
      description: "You've been consistently tracking. Your dedication is inspiring.",
      icon: typeConfig.milestone.icon,
      color: typeConfig.milestone.color,
      borderColor: typeConfig.milestone.borderColor,
    });
  }

  // Sort by date descending
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const visibleEvents = showAll ? events : events.slice(0, 8);

  return (
    <section className="relative z-10 px-6 pb-8">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white/5 backdrop-blur-md border-2 border-pink-400/40 hover:border-pink-400/70 transition-all duration-500 hover:shadow-[0_0_60px_hsl(330,80%,60%,0.3)] overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <Clock className="w-6 h-6 text-pink-300" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">Your Thyroid Journey</h2>
                <p className="text-white/50 text-sm">A timeline of your health milestones</p>
              </div>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-10 h-10 text-pink-300/50 mx-auto mb-3" />
                <p className="text-white/50 text-sm">Start tracking to build your health timeline.</p>
              </div>
            ) : (
              <>
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-pink-400/40 via-purple-400/30 to-transparent" />

                  <div className="space-y-4">
                    {visibleEvents.map((event, i) => {
                      const Icon = event.icon;
                      const cfg = typeConfig[event.type];
                      return (
                        <div key={event.id} className="relative pl-14" style={{ animationDelay: `${i * 50}ms` }}>
                          {/* Dot on line */}
                          <div className={`absolute left-3 top-4 w-4 h-4 rounded-full bg-gradient-to-br ${cfg.bg} border-2 ${cfg.borderColor} z-10`} />
                          
                          <div className={`bg-white/5 rounded-xl border ${cfg.borderColor} p-4 hover:bg-white/[0.07] transition-colors`}>
                            <div className="flex items-start gap-3">
                              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${cfg.bg} flex-shrink-0`}>
                                <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[10px] uppercase font-semibold tracking-wider ${cfg.color}`}>
                                    {event.type.replace("_", " ")}
                                  </span>
                                  <span className="text-white/25 text-[10px]">
                                    {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  </span>
                                </div>
                                <h4 className="text-sm font-semibold text-white">{event.title}</h4>
                                <p className="text-white/60 text-xs mt-0.5">{event.description}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {events.length > 8 && (
                  <div className="text-center mt-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAll(!showAll)}
                      className="text-white/50 hover:text-white hover:bg-white/10"
                    >
                      <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${showAll ? "rotate-180" : ""}`} />
                      {showAll ? "Show Less" : `Show All (${events.length})`}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ThyroidTimeline;
