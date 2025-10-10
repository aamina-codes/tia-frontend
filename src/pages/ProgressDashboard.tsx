import { ArrowLeft, TrendingUp, Activity, Heart, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";

const ProgressDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-deep-dark-purple relative overflow-hidden">
      <Navigation />
      
      {/* Floating Background Shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

      {/* Back Button */}
      <div className="relative z-10 pt-24 px-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/explore')}
          className="text-white hover:text-pink-300 transition-colors mb-8 focus:outline-none focus:ring-0"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      </div>

      {/* Header Section */}
      <section className="relative z-10 px-6 pb-12">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Your Health Progress
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Track your thyroid health journey with comprehensive analytics and insights.
          </p>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="relative z-10 px-6 pb-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TSH Improvement */}
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 hover:border-pink-400 transition-all duration-300 hover:shadow-[0_0_30px_hsl(330,80%,60%,0.4)] group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 group-hover:from-pink-500/30 group-hover:to-purple-500/30 transition-all">
                  <TrendingUp className="w-8 h-8 text-pink-300" />
                </div>
                <span className="text-3xl font-bold text-pink-300">+24%</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">TSH Improvement</h3>
              <p className="text-white/70 text-sm">Levels trending toward optimal range</p>
            </CardContent>
          </Card>

          {/* Consistent Tracking */}
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-purple-400/50 hover:border-purple-400 transition-all duration-300 hover:shadow-[0_0_30px_hsl(280,80%,60%,0.4)] group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 group-hover:from-pink-500/30 group-hover:to-purple-500/30 transition-all">
                  <Activity className="w-8 h-8 text-purple-300" />
                </div>
                <span className="text-3xl font-bold text-purple-300">42</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Days Tracked</h3>
              <p className="text-white/70 text-sm">Consistent health monitoring streak</p>
            </CardContent>
          </Card>

          {/* Wellness Score */}
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-blue-400/50 hover:border-blue-400 transition-all duration-300 hover:shadow-[0_0_30px_hsl(210,80%,60%,0.4)] group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 group-hover:from-pink-500/30 group-hover:to-purple-500/30 transition-all">
                  <Heart className="w-8 h-8 text-blue-300" />
                </div>
                <span className="text-3xl font-bold text-blue-300">87%</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Wellness Score</h3>
              <p className="text-white/70 text-sm">Overall health indicator</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Charts Section */}
      <section className="relative z-10 px-6 pb-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 hover:border-pink-400 transition-all duration-300 hover:shadow-[0_0_40px_hsl(330,80%,60%,0.5)]">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">3-Month Trend</h3>
              
              <div className="bg-white/5 rounded-xl border border-pink-400/30 p-6 h-64 flex items-center justify-center">
                <div className="text-center">
                  <Target className="w-12 h-12 text-pink-300 mx-auto mb-3" />
                  <p className="text-white/70">Line chart showing TSH trends</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribution Chart */}
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-purple-400/50 hover:border-purple-400 transition-all duration-300 hover:shadow-[0_0_40px_hsl(280,80%,60%,0.5)]">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Health Metrics</h3>
              
              <div className="bg-white/5 rounded-xl border border-purple-400/30 p-6 h-64 flex items-center justify-center">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                  <p className="text-white/70">Pie chart showing metric distribution</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Goals Section */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 hover:border-pink-400 transition-all duration-300 hover:shadow-[0_0_40px_hsl(330,80%,60%,0.5)]">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Your Health Goals</h3>
              
              <div className="space-y-4">
                {/* Goal 1 */}
                <div className="bg-white/5 rounded-lg p-4 border border-pink-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">Maintain TSH in optimal range</span>
                    <span className="text-pink-300 font-bold">75%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                {/* Goal 2 */}
                <div className="bg-white/5 rounded-lg p-4 border border-purple-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">Track symptoms daily</span>
                    <span className="text-purple-300 font-bold">92%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>

                {/* Goal 3 */}
                <div className="bg-white/5 rounded-lg p-4 border border-blue-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">Regular medication adherence</span>
                    <span className="text-blue-300 font-bold">88%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ProgressDashboard;
