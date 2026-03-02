import { useMemo } from "react";
import { ShieldAlert, Phone, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLabReports } from "@/hooks/useLabReports";

interface RedFlag {
  title: string;
  message: string;
  urgency: "moderate" | "high";
}

const RedFlagSystem = () => {
  const { reports, latestReport } = useLabReports();

  const flags = useMemo((): RedFlag[] => {
    if (!latestReport) return [];
    const result: RedFlag[] = [];

    // TSH thresholds (severely abnormal)
    if (latestReport.tsh !== null) {
      if (latestReport.tsh > 10) {
        result.push({
          title: "TSH is significantly elevated",
          message: "Your TSH level is above 10 mIU/L. We'd gently recommend scheduling a consultation with your endocrinologist to discuss your results and next steps.",
          urgency: "high",
        });
      } else if (latestReport.tsh < 0.1) {
        result.push({
          title: "TSH is very low",
          message: "Your TSH level is below 0.1 mIU/L. It would be a good idea to check in with your doctor to review your medication and thyroid function.",
          urgency: "high",
        });
      } else if (latestReport.tsh > 5.5) {
        result.push({
          title: "TSH is above typical range",
          message: "Your TSH is mildly elevated. Consider discussing this trend with your healthcare provider at your next visit.",
          urgency: "moderate",
        });
      } else if (latestReport.tsh < 0.4) {
        result.push({
          title: "TSH is below typical range",
          message: "Your TSH is slightly low. It may be worth mentioning to your doctor, especially if you're experiencing any symptoms.",
          urgency: "moderate",
        });
      }
    }

    // T3 / T4 extremes
    if (latestReport.t3 !== null && (latestReport.t3 > 200 || latestReport.t3 < 60)) {
      result.push({
        title: "T3 levels need attention",
        message: `Your T3 is at ${latestReport.t3}. Discussing this with your doctor can help ensure your treatment plan is optimized.`,
        urgency: latestReport.t3 > 250 || latestReport.t3 < 40 ? "high" : "moderate",
      });
    }

    if (latestReport.t4 !== null && (latestReport.t4 > 12 || latestReport.t4 < 4)) {
      result.push({
        title: "T4 levels need attention",
        message: `Your T4 is at ${latestReport.t4}. A conversation with your healthcare provider would be helpful to review these results.`,
        urgency: latestReport.t4 > 15 || latestReport.t4 < 3 ? "high" : "moderate",
      });
    }

    return result;
  }, [latestReport]);

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
              {flags.map((flag, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-4 border ${
                    flag.urgency === "high"
                      ? "bg-red-500/5 border-red-400/30"
                      : "bg-yellow-500/5 border-yellow-400/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${
                      flag.urgency === "high"
                        ? "bg-gradient-to-br from-red-500/20 to-orange-500/20"
                        : "bg-gradient-to-br from-yellow-500/20 to-amber-500/20"
                    }`}>
                      {flag.urgency === "high" ? (
                        <Phone className="w-4 h-4 text-red-300" />
                      ) : (
                        <Heart className="w-4 h-4 text-yellow-300" />
                      )}
                    </div>
                    <div>
                      <h4 className={`text-sm font-semibold ${
                        flag.urgency === "high" ? "text-red-300" : "text-yellow-300"
                      }`}>
                        {flag.title}
                      </h4>
                      <p className="text-white/60 text-xs mt-1 leading-relaxed">{flag.message}</p>
                    </div>
                  </div>
                </div>
              ))}
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
