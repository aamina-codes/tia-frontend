import { useState, useEffect, useMemo } from "react";
import { Search, AlertCircle, Moon, Pill, Activity, Weight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useLabReports, type LabReport } from "@/hooks/useLabReports";

interface ChangeItem {
  icon: React.ElementType;
  label: string;
  detail: string;
  severity: "info" | "warning" | "concern";
}

const severityColors = {
  info: { border: "border-blue-400/30", text: "text-blue-300", bg: "from-blue-500/20 to-cyan-500/20" },
  warning: { border: "border-yellow-400/30", text: "text-yellow-300", bg: "from-yellow-500/20 to-amber-500/20" },
  concern: { border: "border-orange-400/30", text: "text-orange-300", bg: "from-orange-500/20 to-red-500/20" },
};

const RootCauseAnalyzer = () => {
  const { reports } = useLabReports();
  const [healthEntries, setHealthEntries] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("health_tracker")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(30);
      if (data) setHealthEntries(data);
    };
    fetch();
  }, []);

  const analysis = useMemo(() => {
    if (reports.length < 2) return null;

    const current = reports[0];
    const previous = reports[1];

    // Check if there's a significant shift
    const tshShift = current.tsh && previous.tsh ? Math.abs(current.tsh - previous.tsh) : 0;
    const statusChanged = current.tshStatus !== previous.tshStatus;

    if (tshShift < 0.5 && !statusChanged) return null; // No significant change

    const changes: ChangeItem[] = [];

    // Check mood patterns
    const recentMoods = healthEntries.slice(0, 10);
    const lowMoodCount = recentMoods.filter(e => e.mood === "bad" || e.mood === "low").length;
    if (lowMoodCount >= 3) {
      changes.push({
        icon: Activity,
        label: "Mood Patterns",
        detail: `${lowMoodCount} of your last ${recentMoods.length} entries show low mood. Stress and mood can influence thyroid function.`,
        severity: "warning",
      });
    }

    // Check energy drops
    const lowEnergyCount = recentMoods.filter(e => e.energy_level && e.energy_level <= 3).length;
    if (lowEnergyCount >= 3) {
      changes.push({
        icon: Moon,
        label: "Energy Levels",
        detail: `Low energy logged ${lowEnergyCount} times recently. Fatigue may correlate with your lab changes.`,
        severity: "warning",
      });
    }

    // Check tracking consistency (proxy for medication adherence)
    const daysSinceLastEntry = healthEntries.length > 0
      ? Math.floor((Date.now() - new Date(healthEntries[0].date).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    if (daysSinceLastEntry > 7) {
      changes.push({
        icon: Pill,
        label: "Tracking Gap",
        detail: `${daysSinceLastEntry} days since your last health log. Gaps in tracking may mask important patterns.`,
        severity: "concern",
      });
    }

    // Check notes for stress keywords
    const stressNotes = healthEntries.filter(e =>
      e.notes && /stress|anxious|worried|sleep|insomnia|tired/i.test(e.notes)
    ).length;
    if (stressNotes >= 2) {
      changes.push({
        icon: Weight,
        label: "Lifestyle Factors",
        detail: `${stressNotes} entries mention stress or sleep issues. These can significantly impact thyroid levels.`,
        severity: "info",
      });
    }

    // Add general shift info
    if (tshShift > 0) {
      const direction = (current.tsh || 0) > (previous.tsh || 0) ? "increased" : "decreased";
      changes.unshift({
        icon: AlertCircle,
        label: "TSH Shift Detected",
        detail: `TSH ${direction} from ${previous.tsh} to ${current.tsh} (${previous.tshStatus} → ${current.tshStatus}).`,
        severity: statusChanged ? "concern" : "info",
      });
    }

    return changes;
  }, [reports, healthEntries]);

  if (!analysis || analysis.length === 0) return null;

  return (
    <section className="relative z-10 px-6 pb-8">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white/5 backdrop-blur-md border-2 border-orange-400/40 hover:border-orange-400/70 transition-all duration-500 hover:shadow-[0_0_60px_hsl(30,80%,60%,0.3)] overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                <Search className="w-6 h-6 text-orange-300" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">What Changed?</h2>
                <p className="text-white/50 text-sm">Factors that may explain your recent lab shift</p>
              </div>
            </div>

            <div className="space-y-3">
              {analysis.map((item, i) => {
                const Icon = item.icon;
                const style = severityColors[item.severity];
                return (
                  <div key={i} className={`bg-white/5 rounded-xl border ${style.border} p-4 hover:bg-white/[0.07] transition-colors`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${style.bg} flex-shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${style.text}`} />
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold ${style.text}`}>{item.label}</h4>
                        <p className="text-white/60 text-xs mt-1">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-white/30 text-xs mt-4 text-center">
              These are patterns, not diagnoses. Discuss significant changes with your doctor. 💜
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default RootCauseAnalyzer;
