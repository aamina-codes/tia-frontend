import Navigation from "@/components/Navigation";
import { ArrowLeft, Shield, FlaskConical, Heart, Info, Lock, Upload, Brain, BarChart3, Sparkles, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import tiaLogo from "@/assets/tia-butterfly-logo.png";

const FadeInSection = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const steps = [
  { icon: Upload, title: "Upload Report", desc: "Submit your thyroid lab report as a PDF or image." },
  { icon: Brain, title: "AI Extraction", desc: "Our AI reads and identifies TSH, T3, and T4 values." },
  { icon: BarChart3, title: "Interpretation", desc: "Values are compared against standard reference ranges." },
  { icon: Sparkles, title: "Personalized Insights", desc: "Get a clear summary and tailored recommendations." },
];

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(270,60%,20%)] relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-gradient-to-br from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-[20%] right-[5%] w-96 h-96 bg-gradient-to-br from-pink-400/10 to-purple-400/10 rounded-full blur-3xl animate-float-reverse" />
        <div className="absolute top-[60%] left-[50%] w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: "5s" }} />
        {/* Subtle floating butterfly */}
        <img src={tiaLogo} alt="" className="absolute top-[15%] right-[8%] w-16 h-16 opacity-10 animate-float" style={{ animationDuration: "6s" }} />
        <img src={tiaLogo} alt="" className="absolute bottom-[30%] left-[5%] w-12 h-12 opacity-[0.07] animate-float" style={{ animationDuration: "8s", animationDelay: "2s" }} />
      </div>

      <Navigation />

      <div className="relative z-10 pt-20 pb-16 px-4 md:px-8 max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-10 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        {/* ═══════ Hero / Mission & Vision ═══════ */}
        <FadeInSection>
          <section className="text-center mb-20">
            <div className="inline-block mb-6">
              <img src={tiaLogo} alt="TIA" className="w-20 h-20 mx-auto drop-shadow-[0_0_24px_hsl(330,100%,75%,0.4)] animate-float" style={{ animationDuration: "4s" }} />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Meet <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">TIA</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-3 leading-relaxed">
              Your intelligent thyroid companion — anytime, anywhere.
            </p>
            <p className="text-white/40 max-w-xl mx-auto leading-relaxed text-sm md:text-base">
              Empowering you with accessible, personalized health insights so you feel confident and in control of your thyroid journey.
            </p>
          </section>
        </FadeInSection>

        {/* ═══════ Quote ═══════ */}
        <FadeInSection delay={100}>
          <div className="text-center mb-20">
            <p className="text-white/30 italic text-lg md:text-xl font-light">
              "Understanding your thyroid shouldn't feel overwhelming."
            </p>
          </div>
        </FadeInSection>

        {/* ═══════ Mission Section ═══════ */}
        <FadeInSection delay={100}>
          <section className="relative rounded-[2rem] p-8 md:p-10 mb-16 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
            <div className="absolute -top-5 left-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
                <Heart className="w-5 h-5 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mt-2 mb-4">Mission & Vision</h2>
            <p className="text-white/60 leading-relaxed mb-3">
              TIA exists to bridge the gap between medical consultations — helping patients understand their lab results, track progress, and feel confident in conversations with their healthcare providers.
            </p>
            <p className="text-white/50 leading-relaxed text-sm">
              We envision a world where every thyroid patient has an intelligent companion that simplifies complex medical data into clear, actionable guidance.
            </p>
          </section>
        </FadeInSection>

        {/* ═══════ How It Works — Step Flow ═══════ */}
        <FadeInSection delay={150}>
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-10 text-center">How Smart Lab Analysis Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Connector line (desktop) */}
              <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px bg-gradient-to-r from-pink-400/30 via-purple-400/40 to-blue-400/30" />

              {steps.map((step, i) => (
                <FadeInSection key={i} delay={200 + i * 120} className="group">
                  <div className="flex flex-col items-center text-center relative">
                    {/* Step circle */}
                    <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-4 group-hover:border-pink-400/30 group-hover:shadow-lg group-hover:shadow-pink-500/10 transition-all duration-500">
                      <step.icon className="w-8 h-8 text-white/60 group-hover:text-pink-300 transition-colors duration-500" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white text-xs font-bold flex items-center justify-center shadow-md">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold mb-1 text-sm">{step.title}</h3>
                    <p className="text-white/40 text-xs leading-relaxed max-w-[180px]">{step.desc}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </section>
        </FadeInSection>

        {/* ═══════ Medical Disclaimer ═══════ */}
        <FadeInSection delay={200}>
          <section className="relative rounded-[2rem] p-8 md:p-10 mb-16 bg-gradient-to-br from-yellow-500/[0.04] to-white/[0.02] border border-yellow-400/[0.08]">
            <div className="absolute -top-5 left-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mt-2 mb-4">Medical Disclaimer</h2>
            <p className="text-white/55 leading-relaxed">
              TIA provides general health information and educational insights based on your thyroid lab values. It is <span className="text-white/80 font-medium">not a substitute for professional medical advice, diagnosis, or treatment</span>. Always consult a licensed healthcare provider for any medical concerns.
            </p>
          </section>
        </FadeInSection>

        {/* ═══════ Data Privacy & Security ═══════ */}
        <FadeInSection delay={250}>
          <section className="relative rounded-[2rem] p-8 md:p-10 mb-16 bg-gradient-to-br from-green-500/[0.04] to-white/[0.02] border border-green-400/[0.08]">
            <div className="absolute -top-5 left-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20 animate-pulse" style={{ animationDuration: "3s" }}>
                <Lock className="w-5 h-5 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mt-2 mb-5">Data Privacy & Security</h2>
            <p className="text-white/55 leading-relaxed mb-5">
              Your health data and lab reports are private and handled with the highest level of security.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {["Encrypted in transit", "Encrypted at rest", "Never shared with third parties"].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-white/50 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400/70 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        </FadeInSection>

        {/* ═══════ Version Info ═══════ */}
        <FadeInSection delay={300}>
          <section className="text-center py-10 border-t border-white/[0.06]">
            <Info className="w-5 h-5 text-white/20 mx-auto mb-4" />
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-white/30 text-sm">
              <span>Version <span className="text-white/50">1.0.0</span></span>
              <span>Updated <span className="text-white/50">February 2026</span></span>
              <span>Contact <span className="text-white/50">support@tia-health.app</span></span>
            </div>
          </section>
        </FadeInSection>
      </div>
    </div>
  );
};

export default About;
