import { useState } from "react";
import { ArrowLeft, Upload, FileText, CheckCircle, Loader2, Trash2, UserPlus, UserCheck, Shield, Heart, FlaskConical, Stethoscope, Lightbulb, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useLabReports } from "@/hooks/useLabReports";
import tiaLogo from "@/assets/tia-butterfly-logo.png";

const LabReportAnalysis = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { reports, latestReport, addReport, deleteReport, toggleAddToProfile } = useLabReports();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [justAnalyzedId, setJustAnalyzedId] = useState<string | null>(null);

  // Note: All medical calculations (status, summary, recommendations) are now
  // performed by the backend. The frontend only stores and displays results.



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-400';
      case 'elevated': return 'text-yellow-400';
      case 'low': return 'text-orange-400';
      default: return 'text-white/40';
    }
  };

  const getStatusGlow = (status: string) => {
    switch (status) {
      case 'normal': return 'shadow-[0_0_30px_rgba(34,197,94,0.5)]';
      case 'elevated': return 'shadow-[0_0_30px_rgba(234,179,8,0.5)]';
      case 'low': return 'shadow-[0_0_30px_rgba(251,146,60,0.5)]';
      default: return '';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload a file smaller than 10MB", variant: "destructive" });
      return;
    }
    setSelectedFile(file);
    setJustAnalyzedId(null);
  };

  const handleAnalyzeReport = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setProgress(20);

    try {
      setProgress(40);
      setIsAnalyzing(true);

      const formData = new FormData();
      formData.append('file', selectedFile);
      setProgress(60);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/analyze-report`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Server error: ${response.status} ${response.statusText}`);
      setProgress(80);

      const data = await response.json();
      setProgress(100);

      if (!data?.success || !data?.report) {
        throw new Error(data?.message || "Analysis failed");
      }

      // Backend now performs all medical analysis. Store the full report as-is.
      const report = data.report;
      const saved = addReport(report);

      setJustAnalyzedId(saved.id);


      toast({ title: "Analysis Complete!", description: "Your report has been analyzed and saved." });
      setIsAnalyzing(false);
      setIsUploading(false);
      setProgress(0);
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: "Analysis failed", description: error instanceof Error ? error.message : "Something went wrong.", variant: "destructive" });
      setIsUploading(false);
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  // The report to show in the results section (just analyzed or latest)
  const displayReport = justAnalyzedId ? reports.find(r => r.id === justAnalyzedId) : latestReport;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#1E003D' }}>
      <Navigation />
      
      {/* Floating Background Shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

      {/* Back Button */}
      <div className="relative z-10 pt-24 px-6">
        <button onClick={() => navigate('/explore')} className="group flex items-center text-white/80 hover:text-white transition-all duration-300 mb-8">
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-all duration-300" />
          <span className="group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-all duration-300">Back to Features</span>
        </button>
      </div>

      {/* Header Section */}
      <section className="relative z-10 px-6 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 animate-float">
              <img src={tiaLogo} alt="TIA Butterfly Logo" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(236,72,153,0.8)]" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Smart Lab Report Analysis
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-2">
            Upload your thyroid test reports (TSH, T3, T4) and let TIA analyze them with AI-powered insights.
          </p>
          <p className="text-sm text-pink-300/70 italic">
            Your reports are saved locally and synced across your health dashboard
          </p>
        </div>
      </section>

      {/* Upload Section */}
      <section className="relative z-10 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 hover:border-pink-400 transition-all duration-500 shadow-[0_0_60px_rgba(236,72,153,0.3)] hover:shadow-[0_0_80px_rgba(236,72,153,0.6)] rounded-3xl">
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="p-8 rounded-full bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-pink-500/20 shadow-[0_0_40px_rgba(236,72,153,0.4)] animate-pulse">
                  {isUploading ? (
                    <Loader2 className="w-20 h-20 text-pink-300 animate-spin drop-shadow-[0_0_12px_rgba(236,72,153,0.8)]" />
                  ) : selectedFile ? (
                    <CheckCircle className="w-20 h-20 text-green-400 drop-shadow-[0_0_16px_rgba(34,197,94,0.8)] animate-scale-in" />
                  ) : (
                    <Upload className="w-20 h-20 text-pink-300 drop-shadow-[0_0_12px_rgba(236,72,153,0.6)]" />
                  )}
                </div>
                
                <h3 className="text-3xl font-bold text-white drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]">
                  {isUploading ? "Analyzing Your Report..." : selectedFile ? "File Selected!" : "Upload Your Thyroid Report"}
                </h3>
                
                {selectedFile && !isUploading && (
                  <div className="flex items-center space-x-3 px-6 py-3 bg-green-500/10 border border-green-400/50 rounded-full animate-fade-in">
                    <CheckCircle className="w-5 h-5 text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                    <span className="text-white/90 font-medium">{selectedFile.name}</span>
                  </div>
                )}
                
                <p className="text-white/70 text-center max-w-md text-lg">
                  {isUploading ? "TIA is reading your report with compassionate AI insights..." : selectedFile ? "Ready to analyze! Click the button below to continue" : "Supported formats: PDF, PNG, JPG"}
                </p>

                {isUploading && (
                  <div className="w-full max-w-md space-y-3 animate-fade-in">
                    <Progress value={progress} className="h-3 shadow-[0_0_20px_rgba(236,72,153,0.4)]" />
                    <p className="text-pink-300 text-sm text-center font-medium drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]">
                      {isAnalyzing ? "Running AI analysis..." : `Uploading... ${progress}%`}
                    </p>
                  </div>
                )}
                
                {!isUploading && !selectedFile && (
                  <>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-10 py-5 rounded-full shadow-[0_0_40px_rgba(236,72,153,0.6)] hover:shadow-[0_0_60px_rgba(236,72,153,0.9)] transition-all duration-500 hover:scale-110 flex items-center space-x-3">
                        <Upload className="w-6 h-6" />
                        <span className="text-lg font-semibold">Choose File</span>
                      </div>
                    </label>
                    <input id="file-upload" type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.txt" onChange={handleFileSelect} disabled={isUploading} />
                  </>
                )}

                {selectedFile && !isUploading && (
                  <div className="flex space-x-4 animate-fade-in">
                    <button onClick={() => { setSelectedFile(null); const input = document.getElementById('file-upload') as HTMLInputElement; if (input) input.value = ''; }} className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                      Choose Different File
                    </button>
                    <button onClick={handleAnalyzeReport} className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-[0_0_30px_rgba(236,72,153,0.6)] hover:shadow-[0_0_50px_rgba(236,72,153,0.9)] transition-all duration-300 hover:scale-105 font-semibold">
                      Analyze Report
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Latest Result Display */}
      {displayReport && (
        <>
          <section className="relative z-10 px-6 pb-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "TSH Level", value: displayReport.tsh, unit: "µIU/mL", status: displayReport.tshStatus },
                  { label: "T3 Level", value: displayReport.t3, unit: "ng/dL", status: displayReport.t3Status },
                  { label: "T4 Level", value: displayReport.t4, unit: "µg/dL", status: displayReport.t4Status },
                ].map((item) => (
                  <Card key={item.label} className={`bg-white/5 backdrop-blur-sm border-2 border-white/20 transition-all duration-300 ${getStatusGlow(item.status)}`}>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-white/70 text-sm mb-2">{item.label}</h3>
                      <p className={`text-4xl font-bold mb-2 ${getStatusColor(item.status)}`}>{item.value ?? 'N/A'}</p>
                      <p className="text-white/60 text-xs mb-3">{item.unit}</p>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(item.status)} bg-white/10`}>{item.status}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section className="relative z-10 px-6 pb-12">
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="bg-white/5 backdrop-blur-sm border-2 border-purple-400/50 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20">
                      <FileText className="w-8 h-8 text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-3">AI Analysis Summary</h3>
                      <p className="text-white/80 leading-relaxed">{displayReport.interpretation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20">
                      <CheckCircle className="w-8 h-8 text-pink-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-4">Personalized Recommendations</h3>
                      <div className="space-y-3">
                        {displayReport.recommendations?.map((rec, index) => (
                          <div key={index} className="p-4 bg-white/5 rounded-lg border border-pink-400/30">
                            <p className="text-white/80">{index + 1}. {rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      )}

      {/* Report History */}
      {reports.length > 0 && (
        <section className="relative z-10 px-6 pb-20">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/5 backdrop-blur-sm border-2 border-purple-400/50 transition-all duration-300">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-pink-300" />
                  Report History ({reports.length})
                </h3>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className={`bg-white/5 border rounded-xl p-5 transition-all duration-300 hover:bg-white/10 ${report.id === justAnalyzedId ? 'border-pink-400/60 shadow-[0_0_20px_rgba(236,72,153,0.3)]' : 'border-pink-400/20'}`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-white font-semibold">{new Date(report.uploadDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                            {report.id === justAnalyzedId && <Badge className="bg-pink-500/20 text-pink-300 border-pink-400/50 text-xs">Latest</Badge>}
                            {report.addedToProfile && <Badge className="bg-green-500/20 text-green-300 border-green-400/50 text-xs">On Profile</Badge>}
                          </div>
                          <div className="flex gap-4 text-sm">
                            <span className="text-white/60">TSH: <span className={getStatusColor(report.tshStatus)}>{report.tsh ?? 'N/A'}</span></span>
                            <span className="text-white/60">T3: <span className={getStatusColor(report.t3Status)}>{report.t3 ?? 'N/A'}</span></span>
                            <span className="text-white/60">T4: <span className={getStatusColor(report.t4Status)}>{report.t4 ?? 'N/A'}</span></span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAddToProfile(report.id)}
                            className={`rounded-full text-sm ${report.addedToProfile ? 'text-green-300 hover:text-green-200 hover:bg-green-500/10' : 'text-pink-300 hover:text-pink-200 hover:bg-pink-500/10'}`}
                          >
                            {report.addedToProfile ? <UserCheck className="w-4 h-4 mr-1" /> : <UserPlus className="w-4 h-4 mr-1" />}
                            {report.addedToProfile ? "On Profile" : "Add to Profile"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { deleteReport(report.id); toast({ title: "Report deleted", description: "Removed from all pages." }); }}
                            className="rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
};

export default LabReportAnalysis;
