import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowDown, ArrowUp, Minus, Sparkles, Stethoscope, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLabReports } from "@/hooks/useLabReports";

type Status = "stable" | "mild" | "critical" | "unknown";

interface Props {
  variant?: "compact" | "full";
}

const statusMeta: Record<Status, { label: string; ring: string; chip: string; bar: string; dot: string; text: string }> = {
  stable: {
    label: "Stable",
    ring: "from-pink-400 to-purple-500",
    chip: "bg-pink-500/15 text-pink-200 border-pink-400/40",
    bar: "from-pink-400 to-purple-500",
    dot: "bg-pink-300",
    text: "text-pink-200",
  },
  mild: {
    label: "Mild Imbalance",
    ring: "from-purple-400 to-pink-500",
    chip: "bg-purple-500/15 text-purple-200 border-purple-400/40",
    bar: "from-purple-400 to-pink-500",
    dot: "bg-purple-300",
    text: "text-purple-200",
  },
  critical: {
    label: "Needs Attention",
    ring: "from-pink-500 to-fuchsia-600",
    chip: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/40",
    bar: "from-pink-500 to-fuchsia-600",
    dot: "bg-fuchsia-300",
    text: "text-fuchsia-200",
  },
  unknown: {
    label: "No Data",
    ring: "from-white/30 to-white/10",
    chip: "bg-white/10 text-white/70 border-white/20",
    bar: "from-white/30 to-white/10",
    dot: "bg-white/40",
    text: "text-white/70",
  },
};

const statusToPenalty = (s?: string) => {
  if (!s) return 0;
  const v = s.toLowerCase();
  if (v === "normal") return 0;
  if (v === "borderline") return 10;
  if (v === "elevated" || v === "low") return 20;
  if (v === "high" || v === "very low" || v === "very high") return 35;
  return 5;
};

const pctChange = (curr: number | null | undefined, prev: number | null | undefined) => {
  if (curr == null || prev == null || prev === 0) return null;
  return ((curr - prev) / prev) * 100;
};

const TrendPill = ({ label, change }: { label: string; change: number | null }) => {
  if (change === null) {
    return (
      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
        <span className="text-white/70 text-xs font-medium">{label}</span>
        <div className="flex items-center gap-1 text-white/40 text-xs">
          <Minus className="w-3 h-3" /> —
        </div>
      </div>
    );
  }
  const up = change > 0.5;
  const down = change < -0.5;
  const color = Math.abs(change) < 1 ? "text-white/60" : up ? "text-fuchsia-300" : "text-pink-300";
  const Icon = up ? ArrowUp : down ? ArrowDown : Minus;
  return (
    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
      <span className="text-white/70 text-xs font-medium">{label}</span>
      <div className={`flex items-center gap-1 text-xs font-semibold ${color}`}>
        <Icon className="w-3 h-3" />
        {Math.abs(change).toFixed(1)}%
      </div>
    </div>
  );
};

const TodaysStatusCard = ({ variant = "full" }: Props) => {
  const navigate = useNavigate();
  const { reports, latestReport } = useLabReports();
  const previousReport = reports[1] ?? null;

  const { score, status, summary, retestDays } = useMemo(() => {
    if (!latestReport) {
      return {
        score: null as number | null,
        status: "unknown" as Status,
        summary: "Upload your first lab report to see your personalized thyroid health score.",
        retestDays: null as number | null,
      };
    }
    const penalty =
      statusToPenalty(latestReport.tshStatus) +
      statusToPenalty(latestReport.t3Status) +
      statusToPenalty(latestReport.t4Status);
    const raw = Math.max(0, Math.min(100, 100 - penalty));
    let s: Status = "stable";
    if (raw < 55) s = "critical";
    else if (raw < 80) s = "mild";

    const tshLabel = latestReport.tshStatus?.toLowerCase();
    let summary = "Your thyroid markers look stable. Keep up your routine.";
    if (s === "mild") {
      summary =
        tshLabel === "elevated"
          ? `Your score is ${raw} — mild hypothyroidism pattern. Stay consistent with medication.`
          : tshLabel === "low"
          ? `Your score is ${raw} — mild hyperthyroidism pattern. Track symptoms closely.`
          : `Your score is ${raw} — mild imbalance detected. Small adjustments can help.`;
    } else if (s === "critical") {
      summary = `Your score is ${raw}. We recommend discussing your latest results with your doctor soon.`;
    } else {
      summary = `Your score is ${raw} — your thyroid markers are within a healthy range.`;
    }

    const days = Math.floor(
      (Date.now() - new Date(latestReport.uploadDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const retest = Math.max(0, 90 - days);

    return { score: raw, status: s, summary, retestDays: retest };
  }, [latestReport]);

  const meta = statusMeta[status];

  const tshChange = pctChange(latestReport?.tsh, previousReport?.tsh);
  const t3Change = pctChange(latestReport?.t3, previousReport?.t3);
  const t4Change = pctChange(latestReport?.t4, previousReport?.t4);

  const isCompact = variant === "compact";

  return (
    <section className={`relative z-10 px-6 ${isCompact ? "py-6" : "pb-8"}`}>
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 hover:border-pink-400 transition-all duration-300 hover:shadow-[0_0_40px_hsl(330,80%,60%,0.4)] overflow-hidden">
          <CardContent className={isCompact ? "p-6" : "p-8"}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                  <Activity className="w-5 h-5 text-pink-300" />
                </div>
                <div>
                  <h2 className={`font-bold text-white ${isCompact ? "text-lg" : "text-xl md:text-2xl"}`}>
                    Today's Status
                  </h2>
                  <p className="text-white/50 text-xs">
                    {latestReport
                      ? `Based on report from ${new Date(latestReport.uploadDate).toLocaleDateString()}`
                      : "Awaiting your first report"}
                  </p>
                </div>
              </div>
              <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${meta.chip}`}>
                <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
            </div>

            {/* Score + Summary */}
            <div className={`grid gap-6 ${isCompact ? "grid-cols-1" : "md:grid-cols-[auto,1fr]"} items-center`}>
              {/* Score ring */}
              <div className="flex justify-center md:justify-start">
                <div className="relative">
                  <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${meta.ring} p-[3px]`}>
                    <div className="w-full h-full rounded-full bg-deep-dark-purple flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-white leading-none">
                        {score ?? "—"}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-white/50 mt-1">
                        / 100
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className={`sm:hidden inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${meta.chip}`}>
                  <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                  {meta.label}
                </span>
                <p className="text-white/85 text-sm md:text-base leading-relaxed">{summary}</p>

                {/* Trend pills (full only) */}
                {!isCompact && latestReport && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <TrendPill label="TSH" change={tshChange} />
                    <TrendPill label="T3" change={t3Change} />
                    <TrendPill label="T4" change={t4Change} />
                  </div>
                )}
              </div>
            </div>

            {/* Next actions */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Next actions</p>
              <div className="flex flex-wrap gap-2">
                {!latestReport ? (
                  <Button
                    size="sm"
                    onClick={() => navigate("/lab-analysis")}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload report
                  </Button>
                ) : (
                  <>
                    {retestDays !== null && retestDays <= 7 && (
                      <Button
                        size="sm"
                        onClick={() => navigate("/reminders")}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white"
                      >
                        Time to retest ({retestDays === 0 ? "now" : `in ${retestDays}d`})
                      </Button>
                    )}
                    {status === "critical" && (
                      <Button
                        size="sm"
                        onClick={() => navigate("/doctor-connect")}
                        className="bg-gradient-to-r from-rose-500 to-red-500 hover:opacity-90 text-white"
                      >
                        <Stethoscope className="w-3.5 h-3.5 mr-1.5" /> Talk to doctor
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(isCompact ? "/progress" : "/chatbot")}
                      className="text-white border border-white/20 hover:bg-white/10"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      {isCompact ? "View full insights" : "Ask TIA"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default TodaysStatusCard;
