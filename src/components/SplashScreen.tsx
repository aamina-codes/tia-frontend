import { useNavigate } from "react-router-dom";
import butterflyLogo from "@/assets/tia-butterfly-logo.png";

const SplashScreen = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gradient-splash flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        {/* Butterfly Logo with Glow */}
        <div className="mb-8 animate-[fadeIn_1s_ease-out]">
          <img 
            src={butterflyLogo} 
            alt="TIA Butterfly Logo" 
            className="w-32 h-32 mx-auto drop-shadow-glow-butterfly animate-[float_6s_ease-in-out_infinite]"
          />
        </div>
        
        {/* App Title */}
        <div className="mb-3 animate-[fadeIn_1.2s_ease-out]">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-3 tracking-tight">
            TIA
          </h1>
          <p className="text-2xl md:text-3xl text-white/95 font-light tracking-wide">
            Thyroid Intelligent Assistant
          </p>
        </div>
        
        {/* Tagline */}
        <div className="mb-12 animate-[fadeIn_1.4s_ease-out]">
          <p className="text-white/90 text-lg md:text-xl max-w-md mx-auto leading-relaxed font-medium">
            Track. Understand. Manage your thyroid health smarter.
          </p>
        </div>
        
        {/* Get Started Button with Gradient */}
        <div className="animate-[fadeIn_1.6s_ease-out]">
          <button 
            onClick={handleGetStarted}
            className="bg-gradient-button text-white font-semibold px-12 py-4 text-lg rounded-full shadow-soft transition-all duration-300 hover:shadow-glow-button hover:scale-105 active:scale-95"
          >
            Get Started
          </button>
        </div>
      </div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-3 h-3 bg-white/30 rounded-full animate-[float_6s_ease-in-out_infinite] blur-sm"></div>
        <div className="absolute top-40 right-16 w-2 h-2 bg-white/40 rounded-full animate-[float_8s_ease-in-out_infinite_2s] blur-sm"></div>
        <div className="absolute bottom-32 left-20 w-2.5 h-2.5 bg-white/35 rounded-full animate-[float_7s_ease-in-out_infinite_4s] blur-sm"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-white/25 rounded-full animate-[float_9s_ease-in-out_infinite_1s] blur-sm"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-white/20 rounded-full animate-[float_10s_ease-in-out_infinite_3s] blur-sm"></div>
      </div>
    </div>
  );
};

export default SplashScreen;