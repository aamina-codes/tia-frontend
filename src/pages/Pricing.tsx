import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { 
  ArrowLeft, Crown, Check, Sparkles, Activity, FileText, 
  Brain, BarChart3, Stethoscope, Heart, Zap, Shield
} from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const monthlyPrice = "₹299";
  const yearlyPrice = "₹2,499";
  const yearlyMonthly = "₹208";
  const yearlySaving = "Save 30%";

  const freeFeatures = [
    { icon: FileText, text: "Smart Lab Report Analysis (basic)" },
    { icon: BarChart3, text: "Progress Dashboard with basic charts" },
    { icon: Activity, text: "Thyroid Health Tracker" },
    { icon: Brain, text: "TIA Chatbot for general questions" },
    { icon: Shield, text: "Medication reminders & alerts" },
    { icon: Stethoscope, text: "Doctor Connect directory" },
    { icon: Heart, text: "Profile & health management" },
    { icon: FileText, text: "Store up to 5 lab reports" },
  ];

  const premiumFeatures = [
    { icon: Sparkles, text: "Everything in TIA Essential, plus:" },
    { icon: Crown, text: "Thyroid Stability Score" },
    { icon: Brain, text: "Smart trend & pattern insights" },
    { icon: Zap, text: '"What Changed?" root cause analysis' },
    { icon: BarChart3, text: "Unlimited lab report storage" },
    { icon: Activity, text: "Long-term trend & correlation analysis" },
    { icon: Stethoscope, text: "Doctor consultation summary generator" },
    { icon: FileText, text: "Downloadable doctor-ready reports" },
    { icon: Heart, text: "Personalized lifestyle coaching" },
    { icon: Shield, text: "Adaptive smart reminders" },
    { icon: Sparkles, text: "Faster AI report analysis" },
    { icon: Crown, text: "Early access to new features" },
  ];

  return (
    <div className="min-h-screen bg-deep-dark-purple relative overflow-hidden">
      <Navigation />
      <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 pt-24 px-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-white hover:bg-white/10 mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />Back
        </Button>
      </div>

      {/* Header */}
      <section className="relative z-10 px-6 pb-8 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/15 border border-pink-400/30 mb-6">
            <Crown className="w-4 h-4 text-pink-300" />
            <span className="text-sm font-medium text-pink-200">Choose Your Plan</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Your Thyroid Health, Your Way
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Start free with essential thyroid support. Upgrade when you're ready for deeper intelligence.
          </p>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="relative z-10 flex justify-center mb-10">
        <div className="inline-flex bg-white/5 rounded-full p-1 border border-white/10">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              billingCycle === "monthly" ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white" : "text-white/60 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              billingCycle === "yearly" ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white" : "text-white/60 hover:text-white"
            }`}
          >
            Yearly
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">{yearlySaving}</span>
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Tier */}
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-white/10 hover:border-white/20 transition-all">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-1">TIA Essential</h2>
              <p className="text-white/60 text-sm mb-6">Core thyroid support, always free</p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-white">Free</span>
                <span className="text-white/50 ml-2">forever</span>
              </div>
              <Button
                variant="outline"
                className="w-full mb-8 rounded-full border-white/20 text-white hover:bg-white/10"
                onClick={() => navigate("/explore")}
              >
                Get Started
              </Button>
              <ul className="space-y-3">
                {freeFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    {f.text}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Premium Tier */}
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 hover:border-pink-400 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-pink-500 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
              RECOMMENDED
            </div>
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-white">TIA Plus</h2>
                <Crown className="w-5 h-5 text-pink-300" />
              </div>
              <p className="text-white/60 text-sm mb-6">Advanced intelligence & personalization</p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-white">
                  {billingCycle === "monthly" ? monthlyPrice : yearlyPrice}
                </span>
                <span className="text-white/50 ml-2">
                  /{billingCycle === "monthly" ? "month" : "year"}
                </span>
                {billingCycle === "yearly" && (
                  <p className="text-sm text-pink-300 mt-1">{yearlyMonthly}/month billed annually</p>
                )}
              </div>
              <Button
                className="w-full mb-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                onClick={() => {
                  // Placeholder — will integrate payment later
                  navigate("/explore");
                }}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to TIA Plus
              </Button>
              <ul className="space-y-3">
                {premiumFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                    <Check className="w-4 h-4 text-pink-400 mt-0.5 shrink-0" />
                    {f.text}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative z-10 px-6 pb-20 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-white/50 text-sm">
            🦋 TIA is built with love for thyroid patients. Critical health understanding is never paywalled. 
            Premium enhances your experience — it never limits your care.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
