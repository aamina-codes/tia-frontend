import { ShieldAlert, Phone, Heart, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLabReports } from "@/hooks/useLabReports";

const RedFlagSystem = () => {
  const { latestReport } = useLabReports();

  const flags = latestReport?.redFlags ?? [];

  if (flags.length === 0) return null;

  return (
    <section className="relative z-10 px-6 pb-8">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white/5 backdrop-blur-md border-2 border-red-400/30 transition-all duration-500 overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20">
                <ShieldAlert className="w-6 h-6 text-red-300" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">Health Check-In</h2>
                <p className="text-white/50 text-sm">Gentle reminders based on your latest results</p>
              </div>
            </div>

            <div className="space-y-3">
              {flags.map((flag, i) => {
                const urgency = flag.urgency;
                const isHigh = urgency === "High";
                const isModerate = urgency === "Moderate";

                const cardClasses = isHigh
                  ? "bg-red-500/5 border-red-400/30"
                  : isModerate
                  ? "bg-yellow-500/5 border-yellow-400/30"
                  : "bg-blue-500/5 border-blue-400/30";

                const iconWrapClasses = isHigh
                  ? "bg-gradient-to-br from-red-500/20 to-orange-500/20"
                  : isModerate
                  ? "bg-gradient-to-br from-yellow-500/20 to-amber-500/20"
                  : "bg-gradient-to-br from-blue-500/20 to-cyan-500/20";

                const titleClasses = isHigh
                  ? "text-red-300"
                  : isModerate
                  ? "text-yellow-300"
                  : "text-blue-300";

                const Icon = isHigh ? Phone : isModerate ? Heart : Info;
                const iconColor = isHigh
                  ? "text-red-300"
                  : isModerate
                  ? "text-yellow-300"
                  : "text-blue-300";

                return (
                  <div key={i} className={`rounded-xl p-4 border ${cardClasses}`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${iconWrapClasses}`}>
                        <Icon className={`w-4 h-4 ${iconColor}`} />
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold ${titleClasses}`}>{flag.title}</h4>
                        <p className="text-white/60 text-xs mt-1 leading-relaxed">{flag.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-white/30 text-xs mt-4 text-center italic">
              TIA is not a substitute for medical advice. These are supportive check-ins to help you stay informed. 💜
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default RedFlagSystem;
