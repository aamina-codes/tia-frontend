import { useState } from "react";
import { ArrowLeft, Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import tiaLogo from "@/assets/tia-butterfly-logo.png";

interface AnalysisResult {
  tsh_level: number | null;
  t3_level: number | null;
  t4_level: number | null;
  tsh_status: string;
  t3_status: string;
  t4_status: string;
  summary: string;
  recommendations: string[];
  synced: boolean;
}

const LabReportAnalysis = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-400';
      case 'elevated': return 'text-yellow-400';
      case 'low': return 'text-orange-400';
      default: return 'text-gray-400';
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

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setAnalysisResult(null);
  };

  const handleAnalyzeReport = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setProgress(20);

    try {
      setProgress(40);
      setIsAnalyzing(true);

      // Create FormData and send to FastAPI backend
      const formData = new FormData();
      formData.append('file', selectedFile);

      setProgress(60);

      const response = await fetch('https://carlish-colten-readerly.ngrok-free.dev/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      setProgress(80);

      const data = await response.json();

      setProgress(100);

      // Map the API response to our AnalysisResult interface
      setAnalysisResult({
        tsh_level: data.tsh_level ?? null,
        t3_level: data.t3_level ?? null,
        t4_level: data.t4_level ?? null,
        tsh_status: data.tsh_status ?? 'unknown',
        t3_status: data.t3_status ?? 'unknown',
        t4_status: data.t4_status ?? 'unknown',
        summary: data.summary ?? data.message ?? 'Analysis complete',
        recommendations: data.recommendations ?? [],
        synced: data.synced ?? false,
      });

      toast({
        title: "✨ Report uploaded successfully!",
        description: "TIA has analyzed your thyroid health.",
      });

      setTimeout(() => {
        toast({
          title: "🦋 Analysis Complete!",
          description: "Your report has been analyzed successfully",
        });
      }, 1500);

      setIsAnalyzing(false);
      setIsUploading(false);
      setProgress(0);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#1E003D' }}>
      <Navigation />
      
      {/* Floating Background Shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

      {/* Back Button */}
      <div className="relative z-10 pt-24 px-6">
        <button
          onClick={() => navigate('/explore')}
          className="group flex items-center text-white/80 hover:text-white transition-all duration-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-all duration-300" />
          <span className="group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-all duration-300">Back to Features</span>
        </button>
      </div>

      {/* Header Section */}
      <section className="relative z-10 px-6 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 animate-float">
              <img 
                src={tiaLogo} 
                alt="TIA Butterfly Logo" 
                className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(236,72,153,0.8)]"
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Smart Lab Report Analysis
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-2">
            Upload your thyroid test reports (TSH, T3, T4) and let TIA analyze them with AI-powered insights.
          </p>
          <p className="text-sm text-pink-300/70 italic">
            ✨ Your reports are securely stored and automatically synced across your health dashboard
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
                  {isUploading ? "🦋 Analyzing Your Report..." : selectedFile ? "✨ File Selected!" : "🦋 Upload Your Thyroid Report"}
                </h3>
                
                {selectedFile && !isUploading && (
                  <div className="flex items-center space-x-3 px-6 py-3 bg-green-500/10 border border-green-400/50 rounded-full animate-fade-in">
                    <CheckCircle className="w-5 h-5 text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                    <span className="text-white/90 font-medium">{selectedFile.name}</span>
                  </div>
                )}
                
                <p className="text-white/70 text-center max-w-md text-lg">
                  {isUploading 
                    ? "TIA is reading your report with compassionate AI insights..."
                    : selectedFile 
                    ? "Ready to analyze! Click the button below to continue"
                    : "Supported formats: PDF, PNG, JPG"}
                </p>

                {isUploading && (
                  <div className="w-full max-w-md space-y-3 animate-fade-in">
                    <Progress value={progress} className="h-3 shadow-[0_0_20px_rgba(236,72,153,0.4)]" />
                    <p className="text-pink-300 text-sm text-center font-medium drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]">
                      {isAnalyzing ? "✨ Running AI analysis..." : `📤 Uploading... ${progress}%`}
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
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.txt"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                    />
                  </>
                )}

                {selectedFile && !isUploading && (
                  <div className="flex space-x-4 animate-fade-in">
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        const input = document.getElementById('file-upload') as HTMLInputElement;
                        if (input) input.value = '';
                      }}
                      className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                      Choose Different File
                    </button>
                    <button
                      onClick={handleAnalyzeReport}
                      className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-[0_0_30px_rgba(236,72,153,0.6)] hover:shadow-[0_0_50px_rgba(236,72,153,0.9)] transition-all duration-300 hover:scale-105 font-semibold"
                    >
                      Analyze Report
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results Section */}
      {analysisResult && (
        <>
          {/* Hormone Levels Cards */}
          <section className="relative z-10 px-6 pb-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* TSH */}
                <Card className={`bg-white/5 backdrop-blur-sm border-2 border-white/20 transition-all duration-300 ${getStatusGlow(analysisResult.tsh_status)}`}>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-white/70 text-sm mb-2">TSH Level</h3>
                    <p className={`text-4xl font-bold mb-2 ${getStatusColor(analysisResult.tsh_status)}`}>
                      {analysisResult.tsh_level ? `${analysisResult.tsh_level}` : 'N/A'}
                    </p>
                    <p className="text-white/60 text-xs mb-3">µIU/mL</p>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(analysisResult.tsh_status)} bg-white/10`}>
                      {analysisResult.tsh_status}
                    </div>
                  </CardContent>
                </Card>

                {/* T3 */}
                <Card className={`bg-white/5 backdrop-blur-sm border-2 border-white/20 transition-all duration-300 ${getStatusGlow(analysisResult.t3_status)}`}>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-white/70 text-sm mb-2">T3 Level</h3>
                    <p className={`text-4xl font-bold mb-2 ${getStatusColor(analysisResult.t3_status)}`}>
                      {analysisResult.t3_level ? `${analysisResult.t3_level}` : 'N/A'}
                    </p>
                    <p className="text-white/60 text-xs mb-3">ng/dL</p>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(analysisResult.t3_status)} bg-white/10`}>
                      {analysisResult.t3_status}
                    </div>
                  </CardContent>
                </Card>

                {/* T4 */}
                <Card className={`bg-white/5 backdrop-blur-sm border-2 border-white/20 transition-all duration-300 ${getStatusGlow(analysisResult.t4_status)}`}>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-white/70 text-sm mb-2">T4 Level</h3>
                    <p className={`text-4xl font-bold mb-2 ${getStatusColor(analysisResult.t4_status)}`}>
                      {analysisResult.t4_level ? `${analysisResult.t4_level}` : 'N/A'}
                    </p>
                    <p className="text-white/60 text-xs mb-3">µg/dL</p>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(analysisResult.t4_status)} bg-white/10`}>
                      {analysisResult.t4_status}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* AI Insights */}
          <section className="relative z-10 px-6 pb-12">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Summary */}
              <Card className="bg-white/5 backdrop-blur-sm border-2 border-purple-400/50 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20">
                      <FileText className="w-8 h-8 text-purple-300" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-3">AI Analysis Summary</h3>
                      <p className="text-white/80 leading-relaxed">
                        {analysisResult.summary}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20">
                      <CheckCircle className="w-8 h-8 text-pink-300" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-4">Personalized Recommendations</h3>
                      <div className="space-y-3">
                        {analysisResult.recommendations?.map((rec, index) => (
                          <div key={index} className="p-4 bg-white/5 rounded-lg border border-pink-400/30">
                            <p className="text-white/80">
                              {index + 1}. {rec}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sync Status */}
              {analysisResult.synced && (
                <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border-2 border-green-400/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-400 animate-pulse" />
                      <p className="text-white font-medium">
                        ✨ Data synced with Tracker, Dashboard, and Reminders!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default LabReportAnalysis;