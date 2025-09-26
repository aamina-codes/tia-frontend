import { Activity, TrendingUp, MessageCircle, Bell } from "lucide-react";
import Navigation from "./Navigation";
import FeatureCard from "./FeatureCard";
import butterflyLogo from "@/assets/tia-butterfly-logo.png";

const HomePage = () => {
  const features = [
    {
      title: "Lab Report Analysis",
      description: "Upload and analyze your thyroid lab results with AI-powered insights and personalized recommendations.",
      icon: Activity,
      gradientClass: "bg-gradient-card"
    },
    {
      title: "Trend Tracking",
      description: "Monitor your thyroid health journey with smart tracking of symptoms, medications, and lab values over time.",
      icon: TrendingUp,
      gradientClass: "bg-gradient-card"
    },
    {
      title: "Chat Support",
      description: "Get instant answers to your thyroid questions from our intelligent assistant, available 24/7.",
      icon: MessageCircle,
      gradientClass: "bg-gradient-card"
    },
    {
      title: "Smart Reminders",
      description: "Never miss your medication or appointments with personalized reminders and health tips.",
      icon: Bell,
      gradientClass: "bg-gradient-card"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <img 
              src={butterflyLogo} 
              alt="TIA Butterfly Logo" 
              className="w-20 h-20 mx-auto drop-shadow-butterfly"
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Welcome to <span className="bg-gradient-primary bg-clip-text text-transparent">TIA</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your intelligent companion for thyroid health management. Empowering patients and supporting healthcare professionals with AI-driven insights.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">About TIA</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              TIA (Thyroid Intelligent Assistant) is designed to bridge the gap between patients and healthcare providers in thyroid care. 
              Our AI-powered platform helps you understand your thyroid health, track your progress, and make informed decisions about your wellness journey.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-primary mb-2">Intelligent</h3>
              <p className="text-muted-foreground">AI-powered analysis of your health data</p>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-primary mb-2">Supportive</h3>
              <p className="text-muted-foreground">24/7 guidance for your thyroid care</p>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-primary mb-2">Personalized</h3>
              <p className="text-muted-foreground">Tailored insights for your unique needs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover how TIA can transform your thyroid health management experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                gradientClass={feature.gradientClass}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-muted/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-4">
            <img 
              src={butterflyLogo} 
              alt="TIA Logo" 
              className="w-12 h-12 mx-auto opacity-60"
            />
          </div>
          <p className="text-muted-foreground">
            TIA - Your partner in thyroid health and wellness
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;