import { useState, useEffect, useMemo } from "react";
import { Bug as ButterflyIcon, TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useLabReports, type LabReport } from "@/hooks/useLabReports";

interface ScoreBreakdown {
  labScore: number;
  trendScore: number;
  moodEnergyScore: number;
  consistencyScore: number;
}

const getStatusLabel = (score: number): { label: string; color: string; message: string } => {
  if (score >= 80) return { label: "Thriving", color: "text-green-400", message: "You're doing amazing! Your thyroid health is looking great. 🌸" };
  if (score >= 60) return { label: "Improving", color: "text-blue-400", message: "You're on the right track. Keep it up — every small step counts. 💜" };
  if (score >= 40) return { label: "Stabilizing", color: "text-yellow-400", message: "Your body is adjusting. Be patient with yourself — you're doing great. 🦋" };
  if (score >= 20) return { label: "Needs Attention", color: "text-orange-400", message: "Consider checking in with your doctor. TIA is here for you. 💛" };
  return { label: "Getting Started", color: "text-pink-300", message: "Welcome! Start tracking to see your personalized score. 🌟" };
};

const getTrendIcon = (reports: LabReport[]) => {
  if (reports.length < 2) return { icon: Minus, label: "Not enough data", color: "text-white/50" };
  const recent = reports[0];
  const prev = reports[1];
  if (!recent.tsh || !prev.tsh) return { icon: Minus, label: "Stable", color: "text-white/50" };
  
  const isImproving = (recent.tshStatus === "normal" && prev.tshStatus !== "normal") ||
    (recent.tsh < prev.tsh && prev.tshStatus === "elevated");
  const isWorsening = (recent.tshStatus !== "normal" && prev.tshStatus === "normal");
  
  if (isImproving) return { icon: TrendingUp, label: "Improving", color: "text-green-400" };
  if (isWorsening) return { icon: TrendingDown, label: "Declining", color: "text-orange-400" };
  return { icon: Minus, label: "Stable", color: "text-blue-400" };
};

const calculateScore = (
  reports: LabReport[],
  moodEntries: { mood: string | null; energy_level: number | null }[]
): { total: number; breakdown: ScoreBreakdown } => {
  // 1. Lab Score (40 points) — based on how many latest values are normal
  let labScore = 0;
  if (reports.length > 0) {
    const latest = reports[0];
    let normalCount = 0;
    let totalChecked = 0;
    if (latest.tshStatus) { totalChecked++; if (latest.tshStatus === "normal") normalCount++; }
    if (latest.t3Status) { totalChecked++; if (latest.t3Status === "normal") normalCount++; }
    if (latest.t4Status) { totalChecked++; if (latest.t4Status === "normal") normalCount++; }
    labScore = totalChecked > 0 ? Math.round((normalCount / totalChecked) * 40) : 0;
  }

  // 2. Trend Score (25 points) — improvement across last few reports
  let trendScore = 12; // neutral baseline
  if (reports.length >= 2) {
    const recent = reports[0];
    const prev = reports[1];
    if (recent.tshStatus === "normal" && prev.tshStatus === "normal") trendScore = 25;
    else if (recent.tshStatus === "normal" && prev.tshStatus !== "normal") trendScore = 22;
    else if (recent.tshStatus !== "normal" && prev.tshStatus === "normal") trendScore = 5;
    else trendScore = 10;
  }

  // 3. Mood & Energy Score (20 points)
  let moodEnergyScore = 10; // neutral
  if (moodEntries.length > 0) {
    const moodMap: Record<string, number> = { great: 5, good: 4, okay: 3, low: 2, bad: 1 };
    const recentMoods = moodEntries.slice(0, 5);
    const avgMood = recentMoods.reduce((sum, e) => sum + (moodMap[e.mood || "okay"] || 3), 0) / recentMoods.length;
    const avgEnergy = recentMoods.filter(e => e.energy_level).reduce((sum, e) => sum + (e.energy_level || 5), 0) / (recentMoods.filter(e => e.energy_level).length || 1);
    moodEnergyScore = Math.round(((avgMood / 5) * 10) + ((avgEnergy / 10) * 10));
    moodEnergyScore = Math.min(20, moodEnergyScore);
  }

  // 4. Consistency Score (15 points) — based on number of reports & entries
  const reportCount = Math.min(reports.length, 5);
  const entryCount = Math.min(moodEntries.length, 10);
  const consistencyScore = Math.round((reportCount / 5) * 8 + (entryCount / 10) * 7);

  const total = Math.min(100, labScore + trendScore + moodEnergyScore + consistencyScore);
  return { total, breakdown: { labScore, trendScore, moodEnergyScore, consistencyScore } };
};

const AnimatedRing = ({ score, size = 200 }: { score: number; size?: number }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const getGradientId = "stability-gradient";
  const glowColor = score >= 60 ? "rgba(134, 239, 172, 0.4)" : score >= 40 ? "rgba(250, 204, 21, 0.3)" : "rgba(244, 114, 182, 0.4)";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={getGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background ring */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} fill="none"
        />
        {/* Animated progress ring */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={`url(#${getGradientId})`}
          strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#glow)"
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-white drop-shadow-[0_0_20px_rgba(244,114,182,0.5)]" style={{ fontVariantNumeric: "tabular-nums" }}>
          {animatedScore}
        </span>
        <span className="text-white/50 text-sm font-medium tracking-wider mt-1">/ 100</span>
      </div>
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ boxShadow: `0 0 40px ${glowColor}, inset 0 0 40px ${glowColor}` }}
      />
    </div>
  );
};

const ThyroidStabilityScore = () => {
  const { reports } = useLabReports();
  const [healthEntries, setHealthEntries] = useState<{ mood: string | null; energy_level: number | null }[]>([]);

  useEffect(() => {
    const fetchHealthData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("health_tracker")
        .select("mood, energy_level")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(10);
      if (data) setHealthEntries(data);
    };
    fetchHealthData();
  }, []);

  const { total: score, breakdown } = useMemo(
    () => calculateScore(reports, healthEntries),
    [reports, healthEntries]
  );

  const status = getStatusLabel(score);
  const trend = getTrendIcon(reports);
  const TrendIcon = trend.icon;

  return (
    <section className="relative z-10 px-6 pb-8">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white/5 backdrop-blur-md border-2 border-pink-400/40 hover:border-pink-400/70 transition-all duration-500 hover:shadow-[0_0_60px_hsl(330,80%,60%,0.3)] overflow-hidden relative">
          {/* Subtle sparkle accent */}
          <div className="absolute top-4 right-4 opacity-30 animate-pulse">
            <Sparkles className="w-6 h-6 text-pink-300" />
          </div>

          <CardContent className="p-8 md:p-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <ButterflyIcon className="w-6 h-6 text-pink-300" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">Thyroid Stability Score</h2>
                <p className="text-white/50 text-sm">Your personalized health summary</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              {/* Ring */}
              <div className="flex-shrink-0">
                <AnimatedRing score={score} size={200} />
              </div>

              {/* Details */}
              <div className="flex-1 space-y-5 text-center md:text-left">
                {/* Status + Trend */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <span className={`text-2xl font-bold ${status.color}`}>{status.label}</span>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 ${trend.color}`}>
                    <TrendIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">{trend.label}</span>
                  </div>
                </div>

                {/* Supportive message */}
                <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-md">
                  {status.message}
                </p>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3 border border-pink-400/20">
                    <p className="text-white/50 text-xs mb-1">Lab Values</p>
                    <p className="text-pink-300 font-bold text-lg">{breakdown.labScore}<span className="text-white/30 text-xs font-normal">/40</span></p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-purple-400/20">
                    <p className="text-white/50 text-xs mb-1">Trends</p>
                    <p className="text-purple-300 font-bold text-lg">{breakdown.trendScore}<span className="text-white/30 text-xs font-normal">/25</span></p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-blue-400/20">
                    <p className="text-white/50 text-xs mb-1">Mood & Energy</p>
                    <p className="text-blue-300 font-bold text-lg">{breakdown.moodEnergyScore}<span className="text-white/30 text-xs font-normal">/20</span></p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-green-400/20">
                    <p className="text-white/50 text-xs mb-1">Consistency</p>
                    <p className="text-green-300 font-bold text-lg">{breakdown.consistencyScore}<span className="text-white/30 text-xs font-normal">/15</span></p>
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

export default ThyroidStabilityScore;
