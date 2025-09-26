import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import butterflyLogo from "@/assets/tia-butterfly-logo.png";

const SplashScreen = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col items-center justify-center px-6 text-center">
      {/* Butterfly Logo */}
      <div className="mb-8 animate-[fadeIn_1s_ease-out]">
        <img 
          src={butterflyLogo} 
          alt="TIA Butterfly Logo" 
          className="w-32 h-32 mx-auto drop-shadow-butterfly"
        />
      </div>
      
      {/* App Title */}
      <div className="mb-2 animate-[fadeIn_1.2s_ease-out]">
        <h1 className="text-5xl font-bold text-primary-foreground mb-2">
          TIA
        </h1>
        <p className="text-xl text-primary-foreground/90 font-medium">
          Thyroid Intelligent Assistant
        </p>
      </div>
      
      {/* Tagline */}
      <div className="mb-12 animate-[fadeIn_1.4s_ease-out]">
        <p className="text-primary-foreground/80 text-lg max-w-sm">
          Your personal health companion for thyroid care and wellness
        </p>
      </div>
      
      {/* Get Started Button */}
      <div className="animate-[fadeIn_1.6s_ease-out]">
        <Button 
          onClick={handleGetStarted}
          size="lg"
          className="bg-card hover:bg-card/90 text-foreground font-semibold px-12 py-4 text-lg rounded-full shadow-soft transition-smooth hover:shadow-card hover:scale-105"
        >
          Get Started
        </Button>
      </div>
      
      {/* Floating Animation for Butterfly Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-primary-foreground/20 rounded-full animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute top-40 right-16 w-1 h-1 bg-primary-foreground/30 rounded-full animate-[float_8s_ease-in-out_infinite_2s]"></div>
        <div className="absolute bottom-32 left-20 w-1.5 h-1.5 bg-primary-foreground/25 rounded-full animate-[float_7s_ease-in-out_infinite_4s]"></div>
      </div>
    </div>
  );
};

export default SplashScreen;