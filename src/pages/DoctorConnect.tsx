import { ArrowLeft, Upload, Share2, MessageSquare, FileText, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";

const DoctorConnect = () => {
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
          className="text-white hover:bg-white/10 transition-colors mb-8 focus:outline-none focus:ring-0"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      </div>

      {/* Header Section */}
      <section className="relative z-10 px-6 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Doctor Connect
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Share your health data seamlessly with your healthcare provider for better collaboration.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Upload Reports */}
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 hover:border-pink-400 transition-all duration-300 hover:shadow-[0_0_40px_hsl(330,80%,60%,0.5)]">
            <CardContent className="p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                  <FileText className="w-8 h-8 text-pink-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Recent Reports</h3>
                  <p className="text-white/70">Upload and manage your medical documents</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="bg-white/5 rounded-lg p-4 border border-pink-400/30 hover:border-pink-400/50 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-pink-300" />
                      <div>
                        <p className="text-white font-semibold">Thyroid Panel - Nov 2024</p>
                        <p className="text-white/60 text-sm">Lab Results • 2 pages</p>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-pink-400/30 hover:border-pink-400/50 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-purple-300" />
                      <div>
                        <p className="text-white font-semibold">Ultrasound Report - Oct 2024</p>
                        <p className="text-white/60 text-sm">Imaging • 3 pages</p>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full shadow-[0_0_20px_hsl(330,80%,50%,0.4)] hover:shadow-[0_0_30px_hsl(330,80%,50%,0.6)] transition-all duration-300"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload New Report
              </Button>
            </CardContent>
          </Card>

          {/* Share Health Summary */}
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-purple-400/50 hover:border-purple-400 transition-all duration-300 hover:shadow-[0_0_40px_hsl(280,80%,60%,0.5)]">
            <CardContent className="p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                  <Share2 className="w-8 h-8 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Share Health Summary</h3>
                  <p className="text-white/70">Send comprehensive health data to your doctor</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 border border-purple-400/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <UserCheck className="w-5 h-5 text-purple-300" />
                      <span className="text-white">Dr. Sarah Johnson</span>
                    </div>
                    <span className="text-white/60 text-sm">Endocrinologist</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-full shadow-[0_0_20px_hsl(280,80%,50%,0.4)] hover:shadow-[0_0_30px_hsl(280,80%,50%,0.6)] transition-all duration-300"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Communication */}
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 hover:border-pink-400 transition-all duration-300 hover:shadow-[0_0_40px_hsl(330,80%,60%,0.5)]">
            <CardContent className="p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                  <MessageSquare className="w-8 h-8 text-pink-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Request Consultation</h3>
                  <p className="text-white/70">Send a message to your healthcare provider</p>
                </div>
              </div>

              <Textarea 
                placeholder="Type your message or questions here..."
                className="bg-white/10 border-pink-400/30 text-white placeholder:text-white/50 min-h-32 mb-4 focus:border-pink-400 transition-all"
              />

              <Button 
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full shadow-[0_0_20px_hsl(330,80%,50%,0.4)] hover:shadow-[0_0_30px_hsl(330,80%,50%,0.6)] transition-all duration-300"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default DoctorConnect;
