import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, Crown, Check, X, Sparkles, Activity, FileText,
  Brain, BarChart3, Stethoscope, Heart, Zap, Shield, TrendingUp,
  Calendar, Download, Share2, Lock,
} from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  const featureGroups = [
    {
      title: "Smart Health Intelligence",
      icon: Brain,
      features: [
        { icon: Activity, title: "Thyroid Stability Score", desc: "A personalized score tracking your thyroid health stability over time." },
        { icon: TrendingUp, title: "AI Trend Insights", desc: "Intelligent analysis of your lab trends and what they mean for you." },
        { icon: Sparkles, title: "Pattern Detection", desc: "Discover hidden connections between your symptoms and lab values." },
        { icon: Zap, title: '"What Changed?" Analysis', desc: "Understand exactly what shifted between your lab reports." },
      ],
    },
    {
      title: "Advanced Health Analytics",
      icon: BarChart3,
      features: [
        { icon: FileText, title: "Unlimited Lab Reports", desc: "Store and track every report without limits." },
        { icon: TrendingUp, title: "Long-term Trend Tracking", desc: "Visualize your thyroid journey over months and years." },
        { icon: BarChart3, title: "Lab Comparison Mode", desc: "Side-by-side comparison of any two lab reports." },
        { icon: Activity, title: "Correlation Analysis", desc: "See how lifestyle changes impact your thyroid markers." },
      ],
    },
    {
      title: "Doctor-Ready Tools",
      icon: Stethoscope,
      features: [
        { icon: FileText, title: "Consultation Summary Generator", desc: "Auto-generate clear summaries for your doctor visits." },
        { icon: Download, title: "Downloadable Reports", desc: "Export doctor-ready health reports in a professional format." },
        { icon: Share2, title: "Easy Doctor Sharing", desc: "Share your health summaries securely with your healthcare team." },
      ],
    },
    {
      title: "Personalized Health Support",
      icon: Heart,
      features: [
        { icon: Calendar, title: "Adaptive Reminders", desc: "Smart reminders that adjust to your health patterns." },
        { icon: Sparkles, title: "Lifestyle Insights", desc: "Personalized weekly recommendations for your thyroid wellness." },
        { icon: Activity, title: "Symptom Correlation Analysis", desc: "Track and correlate symptoms with your thyroid levels." },
      ],
    },
  ];

  const comparisonRows = [
    { feature: "Lab Report Analysis", free: "Basic", premium: "Advanced AI" },
    { feature: "Progress Dashboard", free: true, premium: true },
    { feature: "Thyroid Health Tracker", free: true, premium: true },
    { feature: "TIA Chatbot", free: true, premium: true },
    { feature: "Medication Reminders", free: true, premium: "Adaptive" },
    { feature: "Doctor Connect Directory", free: true, premium: true },
    { feature: "Lab Report Storage", free: "Up to 5", premium: "Unlimited" },
    { feature: "Thyroid Stability Score", free: false, premium: true },
    { feature: "AI Trend Insights", free: false, premium: true },
    { feature: "Pattern Detection", free: false, premium: true },
    { feature: "Root Cause Analysis", free: false, premium: true },
    { feature: "Long-term Trend Tracking", free: false, premium: true },
    { feature: "Lab Comparison Mode", free: false, premium: true },
    { feature: "Consultation Summary", free: false, premium: true },
    { feature: "Downloadable Reports", free: false, premium: true },
    { feature: "Lifestyle Coaching", free: false, premium: true },
    { feature: "Priority AI Processing", free: false, premium: true },
    { feature: "Early Access Features", free: false, premium: true },
  ];

  const renderCellValue = (value: boolean | string) => {
    if (value === true) return <Check className="w-5 h-5 text-green-400 mx-auto" />;
    if (value === false) return <X className="w-5 h-5 text-white/20 mx-auto" />;
    return <span className="text-sm text-white/80">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-deep-dark-purple relative overflow-hidden">
      <Navigation />

      {/* Background orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-reverse" />
      <div className="absolute bottom-40 left-1/4 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl animate-float" />

      {/* Back button */}
      <div className="relative z-10 pt-24 px-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-white/70 hover:text-white hover:bg-white/10 mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />Back
        </Button>
      </div>

      {/* ─── Hero Section ─── */}
      <section className="relative z-10 px-6 pb-12 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-400/20 mb-6 animate-fadeIn">
            <Crown className="w-4 h-4 text-pink-300" />
            <span className="text-sm font-medium text-pink-200">TIA Plus</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 bg-gradient-to-r from-pink-300 via-purple-200 to-pink-400 bg-clip-text text-transparent leading-tight animate-fadeIn">
            Unlock the Full Power of Your Thyroid Health
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed animate-fadeIn" style={{ animationDelay: "0.15s" }}>
            Deeper insights. Advanced analytics. Doctor-ready summaries. Everything you need to truly understand and manage your thyroid health journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn" style={{ animationDelay: "0.3s" }}>
            <Button
              className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-6 text-base shadow-glow-button hover:shadow-glow-button-hover transition-all"
              onClick={() => {
                const el = document.getElementById("pricing-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to TIA Plus
            </Button>
            <Button
              variant="ghost"
              className="rounded-full border border-white/15 text-white/70 hover:text-white hover:bg-white/5 px-8 py-6 text-base"
              onClick={() => navigate("/explore")}
            >
              Continue with Free Plan
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Feature Highlights ─── */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              What You Unlock with <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">TIA Plus</span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">Advanced tools designed specifically for thyroid patients who want deeper understanding.</p>
          </div>

          <div className="space-y-16">
            {featureGroups.map((group, gi) => (
              <div key={gi}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-pink-400/20">
                    <group.icon className="w-5 h-5 text-pink-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{group.title}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {group.features.map((feat, fi) => (
                    <Card
                      key={fi}
                      className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] hover:border-pink-400/30 transition-all group"
                    >
                      <CardContent className="p-5">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500/15 to-purple-500/15 flex items-center justify-center mb-3 group-hover:from-pink-500/25 group-hover:to-purple-500/25 transition-all">
                          <feat.icon className="w-4.5 h-4.5 text-pink-300" />
                        </div>
                        <h4 className="text-sm font-semibold text-white mb-1.5">{feat.title}</h4>
                        <p className="text-xs text-white/50 leading-relaxed">{feat.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Comparison Table ─── */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Free vs <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">TIA Plus</span>
            </h2>
            <p className="text-white/60">See exactly what you get with each plan.</p>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-white/80 font-semibold py-4 pl-6">Feature</TableHead>
                  <TableHead className="text-center text-white/80 font-semibold py-4 w-28">Essential</TableHead>
                  <TableHead className="text-center py-4 w-28">
                    <span className="inline-flex items-center gap-1 text-pink-300 font-semibold">
                      <Crown className="w-3.5 h-3.5" /> Plus
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonRows.map((row, i) => (
                  <TableRow key={i} className="border-white/5 hover:bg-white/[0.02]">
                    <TableCell className="text-sm text-white/70 pl-6 py-3">{row.feature}</TableCell>
                    <TableCell className="text-center py-3">{renderCellValue(row.free)}</TableCell>
                    <TableCell className="text-center py-3">{renderCellValue(row.premium)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* ─── Pricing Section ─── */}
      <section id="pricing-section" className="relative z-10 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Choose Your Plan</h2>
            <p className="text-white/60">Start free, upgrade when you're ready for deeper intelligence.</p>
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-white/5 rounded-full p-1 border border-white/10">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  billingCycle === "monthly"
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-glow-button"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billingCycle === "yearly"
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-glow-button"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                Yearly
                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">Save 17%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <Card className="bg-white/[0.04] backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-white mb-1">TIA Essential</h3>
                <p className="text-white/50 text-sm mb-6">Core thyroid support, always free</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">Free</span>
                  <span className="text-white/40 ml-2">forever</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-full border-white/15 text-white hover:bg-white/10 mb-6"
                  onClick={() => navigate("/explore")}
                >
                  Get Started
                </Button>
                <ul className="space-y-2.5">
                  {[
                    "Basic Lab Report Analysis",
                    "Progress Dashboard",
                    "Thyroid Health Tracker",
                    "TIA Chatbot",
                    "Medication Reminders",
                    "Doctor Connect Directory",
                    "Store up to 5 Reports",
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-white/70">
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Premium */}
            <Card className="bg-white/[0.04] backdrop-blur-sm border-2 border-pink-400/40 hover:border-pink-400/60 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-pink-500 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                BEST VALUE
              </div>
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">TIA Plus</h3>
                  <Crown className="w-5 h-5 text-pink-300" />
                </div>
                <p className="text-white/50 text-sm mb-6">Advanced intelligence & personalization</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">
                    {billingCycle === "monthly" ? "₹299" : "₹2,999"}
                  </span>
                  <span className="text-white/40 ml-2">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                  {billingCycle === "yearly" && (
                    <p className="text-sm text-pink-300/80 mt-1">₹250/mo billed annually</p>
                  )}
                </div>
                <Button
                  className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-glow-button hover:shadow-glow-button-hover transition-all mb-6"
                  onClick={() => navigate("/explore")}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to TIA Plus
                </Button>
                <ul className="space-y-2.5">
                  {[
                    "Everything in Essential, plus:",
                    "Thyroid Stability Score",
                    "AI Trend & Pattern Insights",
                    "Root Cause Analysis",
                    "Unlimited Lab Reports",
                    "Consultation Summary Generator",
                    "Downloadable Doctor Reports",
                    "Personalized Lifestyle Coaching",
                    "Adaptive Smart Reminders",
                    "Priority AI Processing",
                    "Early Access to New Features",
                  ].map((f, i) => (
                    <li key={i} className={`flex items-center gap-2.5 text-sm ${i === 0 ? "text-pink-300 font-medium" : "text-white/70"}`}>
                      {i === 0 ? <Sparkles className="w-4 h-4 text-pink-300 shrink-0" /> : <Check className="w-4 h-4 text-pink-400 shrink-0" />}
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── Trust & Privacy ─── */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Your Health, Your Privacy</h2>
            <p className="text-white/60">TIA is built with trust and care for thyroid patients.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: "Data Privacy First", desc: "Your health data is encrypted and remains completely private." },
              { icon: Stethoscope, title: "Doctor-Supportive", desc: "TIA complements your doctor visits — never replaces them." },
              { icon: Brain, title: "Thyroid-Focused AI", desc: "AI insights tailored specifically for thyroid health conditions." },
            ].map((item, i) => (
              <Card key={i} className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08]">
                <CardContent className="p-6 text-center">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500/15 to-purple-500/15 flex items-center justify-center mx-auto mb-3 border border-pink-400/10">
                    <item.icon className="w-5 h-5 text-pink-300" />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1.5">{item.title}</h4>
                  <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative z-10 px-6 pt-8 pb-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 border border-pink-400/15 rounded-2xl p-10 backdrop-blur-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Take Control of Your Thyroid Health
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto leading-relaxed">
              Join thousands of thyroid patients who trust TIA for deeper understanding, smarter tracking, and better doctor conversations.
            </p>
            <Button
              className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-10 py-6 text-base shadow-glow-button hover:shadow-glow-button-hover transition-all"
              onClick={() => {
                const el = document.getElementById("pricing-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to TIA Plus
            </Button>
            <p className="text-white/40 text-xs mt-4">
              Critical health understanding is never paywalled. Premium enhances your experience — it never limits your care.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
