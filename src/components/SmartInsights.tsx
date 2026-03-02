import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, Heart, Lightbulb, Shield, ChevronDown, RefreshCw, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Insight {
  type: "correlation" | "trend" | "encouragement" | "tip" | "info";
  title: string;
  message: string;
  icon: string;
  timestamp: string;
}

const iconMap: Record<string, React.ElementType> = {
  sparkles: Sparkles,
  "trending-up": TrendingUp,
  heart: Heart,
  lightbulb: Lightbulb,
  shield: Shield,
};

const typeStyles: Record<string, { border: string; iconBg: string; iconColor: string; badge: string; badgeText: string }> = {
  correlation: {
    border: "border-purple-400/30",
    iconBg: "from-purple-500/20 to-blue-500/20",
    iconColor: "text-purple-300",
    badge: "bg-purple-500/20",
    badgeText: "text-purple-300",
  },
  trend: {
    border: "border-blue-400/30",
    iconBg: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-300",
    badge: "bg-blue-500/20",
    badgeText: "text-blue-300",
  },
  encouragement: {
    border: "border-pink-400/30",
    iconBg: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-300",
    badge: "bg-pink-500/20",
    badgeText: "text-pink-300",
  },
  tip: {
    border: "border-green-400/30",
    iconBg: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-300",
    badge: "bg-green-500/20",
    badgeText: "text-green-300",
  },
  info: {
    border: "border-white/20",
    iconBg: "from-white/10 to-white/5",
    iconColor: "text-white/60",
    badge: "bg-white/10",
    badgeText: "text-white/60",
  },
};

const CACHE_KEY = "tia_smart_insights";
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

const loadCachedInsights = (): { insights: Insight[]; cachedAt: number } | null => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (Date.now() - parsed.cachedAt > CACHE_TTL) return null;
    return parsed;
  } catch {
    return null;
  }
};

const InsightCard = ({ insight, index }: { insight: Insight; index: number }) => {
  const [isOpen, setIsOpen] = useState(index === 0);
  const style = typeStyles[insight.type] || typeStyles.info;
  const Icon = iconMap[insight.icon] || Sparkles;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={`bg-white/5 backdrop-blur-sm rounded-xl border ${style.border} overflow-hidden transition-all duration-300 hover:bg-white/[0.07]`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <CollapsibleTrigger className="w-full p-4 flex items-center gap-3 text-left">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${style.iconBg} flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${style.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full ${style.badge} ${style.badgeText}`}>
                {insight.type}
              </span>
              <span className="text-white/30 text-[10px]">
                {new Date(insight.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white truncate">{insight.title}</h4>
          </div>
          <ChevronDown className={`w-4 h-4 text-white/30 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0">
            <p className="text-white/70 text-sm leading-relaxed pl-11">{insight.message}</p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

const SmartInsights = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchInsights = async (force = false) => {
    if (!force) {
      const cached = loadCachedInsights();
      if (cached) {
        setInsights(cached.insights);
        setHasLoaded(true);
        return;
      }
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-insights");
      if (error) throw error;
      const fetched = data?.insights || [];
      setInsights(fetched);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ insights: fetched, cachedAt: Date.now() }));
    } catch (err: any) {
      console.error("Insight fetch error:", err);
      toast.error("Could not load insights. Try again later.");
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <section className="relative z-10 px-6 pb-8">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white/5 backdrop-blur-md border-2 border-purple-400/40 hover:border-purple-400/70 transition-all duration-500 hover:shadow-[0_0_60px_hsl(280,80%,60%,0.3)] overflow-hidden relative">
          {/* Accent */}
          <div className="absolute top-4 right-4 opacity-20 animate-pulse">
            <Brain className="w-6 h-6 text-purple-300" />
          </div>

          <CardContent className="p-8 md:p-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                  <Sparkles className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">Smart Insights</h2>
                  <p className="text-white/50 text-sm">AI-powered health correlations</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchInsights(true)}
                disabled={loading}
                className="text-white/50 hover:text-white hover:bg-white/10"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {/* Insights */}
            {loading && !hasLoaded ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-20 bg-white/10 rounded" />
                        <div className="h-4 w-48 bg-white/10 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : insights.length > 0 ? (
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <InsightCard key={`${insight.title}-${i}`} insight={insight} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="w-10 h-10 text-purple-300/50 mx-auto mb-3" />
                <p className="text-white/50 text-sm">
                  Log more health data and upload reports to unlock personalized insights.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SmartInsights;
