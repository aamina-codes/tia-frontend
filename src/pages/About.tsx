import Navigation from "@/components/Navigation";
import { ArrowLeft, Shield, FlaskConical, Heart, Info, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(270,60%,20%)] relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-400/15 to-purple-400/15 rounded-full blur-3xl animate-float-reverse"></div>
      </div>

      <Navigation />

      <div className="relative z-10 pt-20 pb-12 px-4 md:px-8 max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">
          About TIA
        </h1>

        {/* Mission & Vision */}
        <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-pink-400" />
            <h2 className="text-2xl font-bold text-white">Mission & Vision</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            TIA (Thyroid Intelligent Assistant) exists to empower individuals managing thyroid conditions with accessible, personalized health insights. Our mission is to bridge the gap between medical consultations — helping patients understand their lab results, track their progress over time, and feel confident in conversations with their healthcare providers.
          </p>
          <p className="text-gray-300 leading-relaxed mt-4">
            We envision a world where every thyroid patient has an intelligent companion that simplifies complex medical data into clear, actionable guidance — anytime, anywhere.
          </p>
        </section>

        {/* How Smart Lab Analysis Works */}
        <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FlaskConical className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">How Smart Lab Analysis Works</h2>
          </div>
          <ol className="space-y-4 text-gray-300">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">1</span>
              <div>
                <p className="font-semibold text-white">Upload Your Report</p>
                <p>Submit your thyroid lab report as a PDF or image directly through the app.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">2</span>
              <div>
                <p className="font-semibold text-white">AI Extracts Thyroid Values</p>
                <p>Our AI reads and identifies key markers — TSH, T3, and T4 — from your report automatically.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">3</span>
              <div>
                <p className="font-semibold text-white">Interpretation Based on Reference Ranges</p>
                <p>Values are compared against standard medical reference ranges to determine if they fall within normal, low, or high categories.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">4</span>
              <div>
                <p className="font-semibold text-white">Personalized Insights</p>
                <p>You receive a clear summary, health recommendations, and suggested follow-up actions tailored to your results.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Medical Disclaimer */}
        <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Medical Disclaimer</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            TIA is designed to provide general health information and educational insights based on your thyroid lab values. It is <span className="font-semibold text-white">not a substitute for professional medical advice, diagnosis, or treatment</span>. Always consult a licensed healthcare provider for any medical concerns or before making changes to your medication or health routine.
          </p>
        </section>

        {/* Data Privacy & Security */}
        <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Data Privacy & Security</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            Your health data and lab reports are private and handled with the highest level of security. All data is encrypted in transit and at rest. We do not share your medical information with third parties. Your reports and personal details are accessible only to you and are used solely to provide personalized health insights within the app.
          </p>
        </section>

        {/* Version Information */}
        <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Version Information</h2>
          </div>
          <div className="space-y-2 text-gray-300">
            <p><span className="font-semibold text-white">App Version:</span> 1.0.0</p>
            <p><span className="font-semibold text-white">Last Updated:</span> February 2026</p>
            <p><span className="font-semibold text-white">Contact:</span> support@tia-health.app</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
