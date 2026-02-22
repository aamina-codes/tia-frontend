import { ArrowLeft, TrendingUp, Activity, Heart, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { useLabReports } from "@/hooks/useLabReports";

const ProgressDashboard = () => {
  const navigate = useNavigate();
  const { reports, latestReport } = useLabReports();

  // Compute dynamic stats from lab reports
  const totalReports = reports.length;
  const latestTSH = latestReport?.tsh;
  const latestStatus = latestReport?.tshStatus ?? "unknown";

  // Simple wellness score based on how many values are normal
  const wellnessScore = (() => {
    if (!latestReport) return 0;
    let score = 0;
    let count = 0;
    if (latestReport.tshStatus) { count++; if (latestReport.tshStatus === "normal") score++; }
    if (latestReport.t3Status) { count++; if (latestReport.t3Status === "normal") score++; }
    if (latestReport.t4Status) { count++; if (latestReport.t4Status === "normal") score++; }
    return count > 0 ? Math.round((score / count) * 100) : 0;
  })();

  return (
    <div className="min-h-screen bg-deep-dark-purple relative overflow-hidden">
      <Navigation />
      <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 pt-24 px-6">
        <Button variant="ghost" onClick={() => navigate('/explore')} className="text-white hover:bg-white/10 transition-colors mb-8 focus:outline-none focus:ring-0">
          <ArrowLeft className="w-5 h-5 mr-2" />Back
        </Button>
      </div>

      <section className="relative z-10 px-6 pb-12">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">Your Health Progress</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">Track your thyroid health journey with comprehensive analytics and insights.</p>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="relative z-10 px-6 pb-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 hover:border-pink-400 transition-all duration-300 hover:shadow-[0_0_30px_hsl(330,80%,60%,0.4)] group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 group-hover:from-pink-500/30 group-hover:to-purple-500/30 transition-all"><TrendingUp className="w-8 h-8 text-pink-300" /></div>
                <span className="text-3xl font-bold text-pink-300">{latestTSH !== null && latestTSH !== undefined ? latestTSH : "—"}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Latest TSH</h3>
              <p className="text-white/70 text-sm">Status: <span className={`font-semibold ${latestStatus === 'normal' ? 'text-green-400' : latestStatus === 'elevated' ? 'text-yellow-400' : latestStatus === 'low' ? 'text-orange-400' : 'text-white/50'}`}>{latestStatus}</span></p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-2 border-purple-400/50 hover:border-purple-400 transition-all duration-300 hover:shadow-[0_0_30px_hsl(280,80%,60%,0.4)] group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 group-hover:from-pink-500/30 group-hover:to-purple-500/30 transition-all"><Activity className="w-8 h-8 text-purple-300" /></div>
                <span className="text-3xl font-bold text-purple-300">{totalReports}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Reports Analyzed</h3>
              <p className="text-white/70 text-sm">Total lab analyses completed</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-2 border-blue-400/50 hover:border-blue-400 transition-all duration-300 hover:shadow-[0_0_30px_hsl(210,80%,60%,0.4)] group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 group-hover:from-pink-500/30 group-hover:to-purple-500/30 transition-all"><Heart className="w-8 h-8 text-blue-300" /></div>
                <span className="text-3xl font-bold text-blue-300">{wellnessScore}%</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Wellness Score</h3>
              <p className="text-white/70 text-sm">Based on latest lab values</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Reports Timeline */}
      <section className="relative z-10 px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 hover:border-pink-400 transition-all duration-300 hover:shadow-[0_0_40px_hsl(330,80%,60%,0.5)]">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent Lab Reports</h3>
              {reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.slice(0, 5).map((r) => (
                    <div key={r.id} className="bg-white/5 rounded-lg border border-pink-400/20 p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <p className="text-white font-medium">{new Date(r.uploadDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                        <div className="flex gap-4 text-sm text-white/60 mt-1">
                          <span>TSH: <span className="text-pink-300">{r.tsh ?? "N/A"}</span></span>
                          <span>T3: <span className="text-purple-300">{r.t3 ?? "N/A"}</span></span>
                          <span>T4: <span className="text-blue-300">{r.t4 ?? "N/A"}</span></span>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full ${r.tshStatus === 'normal' ? 'bg-green-500/20 text-green-300' : r.tshStatus === 'elevated' ? 'bg-yellow-500/20 text-yellow-300' : r.tshStatus === 'low' ? 'bg-orange-500/20 text-orange-300' : 'bg-white/10 text-white/50'}`}>{r.tshStatus}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-pink-300 mx-auto mb-3" />
                  <p className="text-white/70">No reports yet. Upload a lab report to see your progress.</p>
                </div>
              )}
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
                <div className="bg-white/5 rounded-lg p-4 border border-pink-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">Maintain TSH in optimal range</span>
                    <span className="text-pink-300 font-bold">{latestStatus === "normal" ? "100%" : "50%"}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full" style={{ width: latestStatus === "normal" ? "100%" : "50%" }}></div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-purple-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">Track symptoms daily</span>
                    <span className="text-purple-300 font-bold">92%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
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
