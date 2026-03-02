import { useState, useMemo, useEffect } from "react";
import { Leaf, Moon, Brain, Apple, Sparkles, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface CoachingTip {
  id: string;
  icon: React.ElementType;
  category: string;
  title: string;
  description: string;
  color: string;
  bg: string;
  borderColor: string;
}

const allTips: CoachingTip[] = [
  { id: "sleep-1", icon: Moon, category: "Sleep", title: "Consistent Sleep Schedule", description: "Try going to bed and waking up at the same time every day. Sleep consistency helps regulate thyroid hormones and cortisol levels.", color: "text-blue-300", bg: "from-blue-500/20 to-indigo-500/20", borderColor: "border-blue-400/30" },
  { id: "sleep-2", icon: Moon, category: "Sleep", title: "Wind Down Routine", description: "Create a calming 30-minute routine before bed — dim lights, avoid screens, and try gentle breathing exercises.", color: "text-blue-300", bg: "from-blue-500/20 to-indigo-500/20", borderColor: "border-blue-400/30" },
  { id: "stress-1", icon: Brain, category: "Stress", title: "5-Minute Mindfulness", description: "Even 5 minutes of mindful breathing can reduce cortisol. Try box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s.", color: "text-purple-300", bg: "from-purple-500/20 to-violet-500/20", borderColor: "border-purple-400/30" },
  { id: "stress-2", icon: Brain, category: "Stress", title: "Nature Break", description: "A short walk outdoors can significantly reduce stress hormones. Aim for 15 minutes in natural light daily.", color: "text-purple-300", bg: "from-purple-500/20 to-violet-500/20", borderColor: "border-purple-400/30" },
  { id: "nutrition-1", icon: Apple, category: "Nutrition", title: "Selenium-Rich Foods", description: "Brazil nuts, sunflower seeds, and fish are rich in selenium — essential for thyroid hormone conversion.", color: "text-green-300", bg: "from-green-500/20 to-emerald-500/20", borderColor: "border-green-400/30" },
  { id: "nutrition-2", icon: Apple, category: "Nutrition", title: "Iodine Awareness", description: "Iodized salt, seaweed, and dairy provide iodine. Too little or too much can affect thyroid function — balance is key.", color: "text-green-300", bg: "from-green-500/20 to-emerald-500/20", borderColor: "border-green-400/30" },
  { id: "nutrition-3", icon: Apple, category: "Nutrition", title: "Anti-Inflammatory Eating", description: "Foods rich in omega-3s (salmon, walnuts, flaxseed) help reduce inflammation that can worsen thyroid conditions.", color: "text-green-300", bg: "from-green-500/20 to-emerald-500/20", borderColor: "border-green-400/30" },
  { id: "habit-1", icon: Sparkles, category: "Habits", title: "Medication Timing", description: "Take thyroid medication on an empty stomach, 30-60 minutes before breakfast. Consistency in timing improves absorption.", color: "text-pink-300", bg: "from-pink-500/20 to-rose-500/20", borderColor: "border-pink-400/30" },
  { id: "habit-2", icon: Sparkles, category: "Habits", title: "Hydration Check", description: "Staying well-hydrated supports metabolism and energy. Aim for 8 glasses of water throughout the day.", color: "text-pink-300", bg: "from-pink-500/20 to-rose-500/20", borderColor: "border-pink-400/30" },
];

const getWeeklyTips = (healthEntries: any[]): CoachingTip[] => {
  const tips: CoachingTip[] = [];

  // Prioritize based on user data
  const lowEnergyCount = healthEntries.filter(e => e.energy_level && e.energy_level <= 4).length;
  const lowMoodCount = healthEntries.filter(e => e.mood === "bad" || e.mood === "low").length;
  const stressNotes = healthEntries.filter(e => e.notes && /stress|anxious|sleep|tired/i.test(e.notes)).length;

  if (lowEnergyCount >= 2) {
    tips.push(...allTips.filter(t => t.category === "Sleep").slice(0, 1));
  }
  if (lowMoodCount >= 2 || stressNotes >= 1) {
    tips.push(...allTips.filter(t => t.category === "Stress").slice(0, 1));
  }

  // Always include a nutrition and habit tip
  tips.push(...allTips.filter(t => t.category === "Nutrition").slice(0, 1));
  tips.push(...allTips.filter(t => t.category === "Habits").slice(0, 1));

  // If less than 3, fill with random tips
  const tipsIds = new Set(tips.map(t => t.id));
  const remaining = allTips.filter(t => !tipsIds.has(t.id));
  while (tips.length < 3 && remaining.length > 0) {
    // Use week number as seed for variety
    const weekNum = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
    const idx = (weekNum + tips.length) % remaining.length;
    tips.push(remaining.splice(idx, 1)[0]);
  }

  return tips.slice(0, 4);
};

const LifestyleCoaching = () => {
  const [healthEntries, setHealthEntries] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("health_tracker")
        .select("mood, energy_level, notes")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(14);
      if (data) setHealthEntries(data);
    };
    fetch();
  }, []);

  const weeklyTips = useMemo(() => getWeeklyTips(healthEntries), [healthEntries]);

  return (
    <section className="relative z-10 px-6 pb-8">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white/5 backdrop-blur-md border-2 border-green-400/40 hover:border-green-400/70 transition-all duration-500 hover:shadow-[0_0_60px_hsl(140,60%,50%,0.2)] overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                <Leaf className="w-6 h-6 text-green-300" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">Weekly Focus</h2>
                <p className="text-white/50 text-sm">Personalized lifestyle suggestions for this week</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {weeklyTips.map((tip) => {
                const Icon = tip.icon;
                return (
                  <div
                    key={tip.id}
                    className={`bg-white/5 rounded-xl border ${tip.borderColor} p-4 hover:bg-white/[0.07] transition-colors group cursor-default`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${tip.bg} flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${tip.color}`} />
                      </div>
                      <div className="flex-1">
                        <span className={`text-[10px] uppercase font-semibold tracking-wider ${tip.color}`}>
                          {tip.category}
                        </span>
                        <h4 className="text-sm font-semibold text-white mt-0.5">{tip.title}</h4>
                        <p className="text-white/50 text-xs mt-1 leading-relaxed">{tip.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-white/30 text-xs mt-4 text-center">
              Small changes, big impact. Take it one step at a time. 🌿
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default LifestyleCoaching;
