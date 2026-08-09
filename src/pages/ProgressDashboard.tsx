import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { useLabReports } from "@/hooks/useLabReports";
import ThyroidStabilityScore from "@/components/ThyroidStabilityScore";
import SmartInsights from "@/components/SmartInsights";
import RedFlagSystem from "@/components/RedFlagSystem";
import RootCauseAnalyzer from "@/components/RootCauseAnalyzer";
import ThyroidTimeline from "@/components/ThyroidTimeline";
import ConsultationSummary from "@/components/ConsultationSummary";
import LifestyleCoaching from "@/components/LifestyleCoaching";
import PremiumGate from "@/components/PremiumGate";
import TodaysStatusCard from "@/components/TodaysStatusCard";
import ProgressOverview from "@/components/dashboard/ProgressOverview";

const SectionHeading = ({ label, hint }: { label: string; hint?: string }) => (
  <div className="relative z-10 px-6 pt-4 pb-3">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/45">{label}</h2>
      {hint && <p className="text-xs text-white/35 mt-1">{hint}</p>}
    </div>
  </div>
);

const ProgressDashboard = () => {
  const navigate = useNavigate();
  const { latestReport } = useLabReports();

  const lastUpdated = latestReport
    ? new Date(latestReport.uploadDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-deep-dark-purple relative overflow-hidden">
      <Navigation />
      <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 pt-24 px-6">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/explore')} className="text-white hover:bg-white/10 transition-colors mb-6 focus:outline-none focus:ring-0">
            <ArrowLeft className="w-5 h-5 mr-2" />Back
          </Button>
        </div>
      </div>

      {/* Page header */}
      <section className="relative z-10 px-6 pb-8">
        <div className="max-w-6xl mx-auto animate-fadeIn">
          <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">Health Progress</h1>
          <p className="text-white/60 mt-2 max-w-2xl">
            A complete view of your thyroid health — scores, trends, adherence and what needs attention next.
          </p>
          <p className="text-xs text-white/35 mt-3">
            {lastUpdated ? `Last report analysed on ${lastUpdated}` : "No lab reports analysed yet"}
          </p>
        </div>
      </section>

      {/* Overview: KPIs, score trend, adherence, symptoms, reminders */}
      <ProgressOverview />

      {/* Today's snapshot */}
      <SectionHeading label="Today" hint="Your current status and next actions" />
      <TodaysStatusCard variant="full" />

      {/* Attention */}
      {(latestReport?.redFlags?.length ?? 0) > 0 && <SectionHeading label="Needs attention" />}
      <RedFlagSystem />

      {/* AI intelligence */}
      <SectionHeading label="AI insights" hint="Generated from your reports, logs and history" />
      <PremiumGate feature="smartInsights" fallbackMessage="Get AI-powered correlations between your labs, mood, and lifestyle.">
        <SmartInsights />
      </PremiumGate>

      <PremiumGate feature="stabilityScore" fallbackMessage="Unlock your personalized Thyroid Stability Score with TIA Plus.">
        <ThyroidStabilityScore />
      </PremiumGate>

      <PremiumGate feature="rootCauseAnalyzer" fallbackMessage="See what changed between your lab reports with intelligent analysis.">
        <RootCauseAnalyzer />
      </PremiumGate>

      {/* History */}
      <SectionHeading label="Your journey" />
      <ThyroidTimeline />

      {/* Care */}
      <SectionHeading label="Care & lifestyle" />
      <PremiumGate feature="consultationSummary" fallbackMessage="Generate professional doctor-ready summaries of your health data.">
        <ConsultationSummary />
      </PremiumGate>

      <div className="pb-20">
        <PremiumGate feature="lifestyleCoaching" fallbackMessage="Get personalized weekly health tips tailored to your thyroid patterns.">
          <LifestyleCoaching />
        </PremiumGate>
      </div>
    </div>
  );
};

export default ProgressDashboard;
