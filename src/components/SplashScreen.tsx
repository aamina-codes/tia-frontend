import { useNavigate } from "react-router-dom";
import butterflyLogo from "@/assets/tia-butterfly-logo.png";

const SplashScreen = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-[hsl(270,60%,20%)] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-400/15 to-purple-400/15 rounded-full blur-3xl animate-float-reverse"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: '5s' }}></div>
        
        {/* Slow Gradient Waves */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 animate-wave"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-400/5 via-transparent to-pink-400/5 animate-wave" style={{ animationDelay: '7s' }}></div>
      </div>

      {/* 3D Pink Edge Effect - Rounded soft highlights around screen */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_80px_40px_hsl(330,100%,75%,0.15)]"></div>
        <div className="absolute top-4 left-4 right-4 bottom-4 rounded-3xl border-2 border-pink-400/20"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        {/* Butterfly Logo with Soft Glow */}
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
        
        {/* Get Started Button with White-Pink Gradient & Purple Glow */}
        <div className="animate-[fadeIn_1.6s_ease-out]">
          <button 
            onClick={handleGetStarted}
            className="bg-gradient-button text-purple-900 font-semibold px-12 py-4 text-lg rounded-full shadow-glow-button transition-all duration-300 hover:shadow-glow-button-hover hover:scale-110 active:scale-95"
          >
            Get Started
          </button>
        </div>
      </div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-3 h-3 bg-pink-300/30 rounded-full animate-[float_6s_ease-in-out_infinite] blur-sm"></div>
        <div className="absolute top-40 right-16 w-2 h-2 bg-pink-200/40 rounded-full animate-[float_8s_ease-in-out_infinite_2s] blur-sm"></div>
        <div className="absolute bottom-32 left-20 w-2.5 h-2.5 bg-pink-300/35 rounded-full animate-[float_7s_ease-in-out_infinite_4s] blur-sm"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-pink-200/25 rounded-full animate-[float_9s_ease-in-out_infinite_1s] blur-sm"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-pink-300/20 rounded-full animate-[float_10s_ease-in-out_infinite_3s] blur-sm"></div>
      </div>
    </div>
  );
};

export default SplashScreen;