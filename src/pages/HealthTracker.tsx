import { ArrowLeft, TrendingUp, Plus, Heart, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";

const HealthTracker = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 relative overflow-hidden">
      <Navigation />
      
      {/* Floating Background Shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

      {/* Back Button */}
      <div className="relative z-10 pt-24 px-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/explore')}
          className="text-white hover:text-pink-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      </div>

      {/* Header Section */}
      <section className="relative z-10 px-6 pb-12">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Thyroid Health Tracker
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Monitor your thyroid health trends and track your wellness journey.
          </p>
        </div>
      </section>

      {/* Graph Section */}
      <section className="relative z-10 px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 hover:border-pink-400 transition-all duration-300 hover:shadow-[0_0_40px_hsl(330,80%,60%,0.5)]">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Health Trends</h3>
                <Button 
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full shadow-[0_0_20px_hsl(330,80%,50%,0.4)] hover:shadow-[0_0_30px_hsl(330,80%,50%,0.6)] transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              </div>
              
              {/* Placeholder Graph */}
              <div className="bg-white/5 rounded-xl border border-purple-400/30 p-8 h-80 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 text-pink-300 mx-auto mb-4" />
                  <p className="text-white/70 text-lg">Your health trends will appear here</p>
                  <p className="text-white/50 text-sm mt-2">Start by adding your first entry</p>
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex justify-center space-x-8 mt-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-pink-400"></div>
                  <span className="text-white/80 text-sm">TSH</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-purple-400"></div>
                  <span className="text-white/80 text-sm">T3</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-blue-400"></div>
                  <span className="text-white/80 text-sm">T4</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mood Log & Health Notes */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mood Log */}
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 hover:border-pink-400 transition-all duration-300 hover:shadow-[0_0_30px_hsl(330,80%,60%,0.4)]">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                  <Heart className="w-6 h-6 text-pink-300" />
                </div>
                <h3 className="text-xl font-bold text-white">Mood Log</h3>
              </div>
              
              <p className="text-white/70 mb-4">Track how you're feeling each day</p>
              
              <div className="space-y-2">
                <div className="p-3 bg-white/5 rounded-lg border border-pink-400/20 hover:border-pink-400/50 transition-all cursor-pointer">
                  <p className="text-white/80 text-sm">😊 Feeling great today</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-pink-400/20 hover:border-pink-400/50 transition-all cursor-pointer">
                  <p className="text-white/80 text-sm">😐 Normal energy levels</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Notes */}
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-purple-400/50 hover:border-purple-400 transition-all duration-300 hover:shadow-[0_0_30px_hsl(280,80%,60%,0.4)]">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                  <FileText className="w-6 h-6 text-purple-300" />
                </div>
                <h3 className="text-xl font-bold text-white">Health Notes</h3>
              </div>
              
              <p className="text-white/70 mb-4">Record symptoms and observations</p>
              
              <div className="space-y-2">
                <div className="p-3 bg-white/5 rounded-lg border border-purple-400/20 hover:border-purple-400/50 transition-all cursor-pointer">
                  <p className="text-white/80 text-sm">📝 Slight fatigue in morning</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-purple-400/20 hover:border-purple-400/50 transition-all cursor-pointer">
                  <p className="text-white/80 text-sm">💊 Started new medication</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HealthTracker;
