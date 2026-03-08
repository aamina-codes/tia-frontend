import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Activity, 
  MessageCircle, 
  Bell, 
  BarChart3, 
  UserPlus,
  ArrowLeft,
  Crown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PremiumBadge } from "@/components/PremiumGate";

const features = [
  {
    icon: FileText,
    title: "Smart Lab Report Analysis",
    description: "Upload your thyroid test results and get instant AI-powered insights and explanations in simple terms.",
    path: "/lab-report",
    premium: false,
  },
  {
    icon: Activity,
    title: "Thyroid Health Tracker",
    description: "Monitor your symptoms, medications, and lifestyle factors all in one intelligent dashboard.",
    path: "/health-tracker",
    premium: false,
  },
  {
    icon: MessageCircle,
    title: "TIA Chatbot",
    description: "Ask questions anytime and get personalized answers about your thyroid health journey.",
    path: "/chatbot",
    premium: false,
  },
  {
    icon: Bell,
    title: "Reminders & Alerts",
    description: "Never miss a medication dose or follow-up appointment with smart notifications.",
    path: "/reminders",
    premium: false,
  },
  {
    icon: BarChart3,
    title: "Progress Dashboard",
    description: "Visualize your health trends with stability scores, smart insights, and doctor-ready summaries.",
    path: "/progress",
    premium: true,
  },
  {
    icon: UserPlus,
    title: "Doctor Connect",
    description: "Share your health data seamlessly with your healthcare provider for better collaboration.",
    path: "/doctor-connect",
    premium: false,
  }
];

const ExploreFeatures = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-deep-dark-purple relative overflow-hidden">
      <Navigation />
      
      {/* Floating Background Shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-56 h-56 bg-pink-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      {/* Back Button */}
      <div className="relative z-10 pt-24 px-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/home')}
          className="text-white hover:bg-white/10 transition-colors mb-8 focus:outline-none focus:ring-0"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-400 bg-clip-text text-transparent leading-tight">
            Discover What TIA Can Do for You
          </h1>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Experience AI-powered thyroid management that combines cutting-edge technology 
            with compassionate care to support your wellness journey.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                onClick={() => navigate(feature.path)}
                className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 hover:border-pink-400 transition-all duration-300 hover:shadow-[0_0_40px_hsl(330,80%,60%,0.5)] hover:scale-105 cursor-pointer group"
              >
                <CardContent className="p-8 text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="p-4 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 group-hover:from-blue-500/30 group-hover:via-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300">
                      <feature.icon className="w-10 h-10 text-pink-300" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-white/80 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Spacing */}
      <div className="h-16"></div>
    </div>
  );
};

export default ExploreFeatures;
