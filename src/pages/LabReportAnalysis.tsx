import { ArrowLeft, Upload, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";

const LabReportAnalysis = () => {
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
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Smart Lab Report Analysis
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Upload your thyroid test reports (TSH, T3, T4) and let TIA analyze them with AI-powered insights.
          </p>
        </div>
      </section>

      {/* Upload Section */}
      <section className="relative z-10 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 hover:border-pink-400 transition-all duration-300 hover:shadow-[0_0_40px_hsl(330,80%,60%,0.5)]">
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="p-6 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                  <Upload className="w-16 h-16 text-pink-300" />
                </div>
                
                <h3 className="text-2xl font-bold text-white">Upload Your Report</h3>
                
                <p className="text-white/80 text-center max-w-md">
                  Drag and drop your thyroid test report here, or click to browse
                </p>
                
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-6 rounded-full shadow-[0_0_30px_hsl(330,80%,50%,0.5)] hover:shadow-[0_0_50px_hsl(330,80%,50%,0.8)] transition-all duration-300 hover:scale-105"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Choose File
                </Button>
                
                <p className="text-white/60 text-sm">
                  Supports PDF, JPG, PNG (Max 10MB)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results Section (Placeholder) */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-purple-400/50 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                  <FileText className="w-8 h-8 text-purple-300" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">AI Analysis Results</h3>
                  <p className="text-white/70 mb-4">
                    Upload a report to see personalized insights and recommendations from TIA.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="p-4 bg-white/5 rounded-lg border border-pink-400/30">
                      <p className="text-white/60 text-sm">
                        ✨ Instant analysis of TSH, T3, and T4 levels
                      </p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg border border-pink-400/30">
                      <p className="text-white/60 text-sm">
                        📊 Compare results with normal ranges
                      </p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg border border-pink-400/30">
                      <p className="text-white/60 text-sm">
                        💡 Personalized health recommendations
                      </p>
                    </div>
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

export default LabReportAnalysis;
