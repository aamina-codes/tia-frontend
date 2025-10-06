import { Brain, Heart, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import butterflyLogo from "@/assets/tia-butterfly-logo.png";

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleGetStarted = () => {
    navigate("/explore");
  };

  const features = [
    {
      title: "Intelligent",
      description: "AI-powered analysis of thyroid health data",
      icon: Brain,
    },
    {
      title: "Supportive",
      description: "24/7 guidance for thyroid care",
      icon: Heart,
    },
    {
      title: "Personalized",
      description: "Tailored insights for unique needs",
      icon: Sparkles,
    }
  ];

  return (
    <div className="min-h-screen bg-[hsl(270,60%,20%)] relative overflow-hidden">
      {/* Animated Background Effects - matching landing page */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-400/15 to-purple-400/15 rounded-full blur-3xl animate-float-reverse"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: '5s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 animate-wave"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with Logo */}
        <header className="pt-8 pb-4 px-6 flex justify-center">
          <img 
            src={butterflyLogo} 
            alt="TIA Butterfly Logo" 
            onClick={handleLogoClick}
            className="w-16 h-16 drop-shadow-glow-butterfly cursor-pointer hover:scale-110 transition-transform duration-300"
          />
        </header>

        {/* About TIA Section */}
        <section className="py-12 px-6">
          <div className="max-w-3xl mx-auto">
            {/* Pink Fill with White Border */}
            <div className="p-[2px] rounded-3xl bg-pink-400 border-2 border-white transition-all duration-300 hover:shadow-[0_0_50px_hsl(280,80%,50%,0.6)]">
              {/* Glassmorphic Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12">
                {/* Heading */}
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center relative inline-block w-full">
                  About TIA
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-pink-400 rounded-full"></span>
                </h2>
                
                {/* Description with Keywords */}
                <p className="text-white text-lg leading-relaxed text-center mt-8">
                  TIA (Thyroid Intelligent Assistant) is designed to bridge the gap between patients and healthcare providers in thyroid care. Our{' '}
                  <span className="font-semibold text-purple-900">
                    AI-powered platform
                  </span>{' '}
                  helps you understand your{' '}
                  <span className="font-semibold text-purple-900">
                    thyroid health
                  </span>
                  , track{' '}
                  <span className="font-semibold text-purple-900">
                    progress
                  </span>
                  , and make informed decisions with personalized{' '}
                  <span className="font-semibold text-purple-900">
                    insights
                  </span>{' '}
                  and{' '}
                  <span className="font-semibold text-purple-900">
                    support
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Features Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            {/* Section Title */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Our Features
              </h2>
            </div>
            
            {/* Feature Cards - Horizontal Layout */}
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className="group bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_40px_hsl(280,80%,50%,0.4)] hover:scale-105 hover:border-pink-400/30"
                  >
                    {/* Gradient Circular Icon */}
                    <div className="mb-6 flex justify-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-[0_0_30px_hsl(280,80%,50%,0.6)] transition-all duration-300">
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    
                    {/* Feature Title */}
                    <h3 className="text-2xl font-bold text-white mb-3 text-center">
                      {feature.title}
                    </h3>
                    
                    {/* Feature Description */}
                    <p className="text-gray-300 text-center leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Call-to-Action Section */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-relaxed">
              Ready to take charge of your thyroid health?
            </h2>
            
            <button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-pink-400 to-pink-300 text-purple-900 font-semibold px-12 py-4 text-lg rounded-full shadow-glow-button transition-all duration-300 hover:shadow-glow-button-hover hover:scale-110 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-white/60 text-sm">
              TIA - Your partner in thyroid health and wellness
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;