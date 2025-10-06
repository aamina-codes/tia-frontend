import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { useState } from "react";

const Chatbot = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);

  return (
    <div className="min-h-screen bg-purple-900 relative overflow-hidden">
      <Navigation />
      
      {/* Floating Background Shapes with Sparkles */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-pink-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>

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

      {/* Chat Interface */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          {!started ? (
            // Welcome Screen
            <div className="text-center">
              <div className="mb-8 flex justify-center">
                <div className="p-8 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 animate-pulse">
                  <img 
                    src="/src/assets/tia-butterfly-logo.png" 
                    alt="TIA Butterfly" 
                    className="w-32 h-32"
                  />
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Chat with TIA
              </h1>
              
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Your empathetic AI companion for thyroid health questions and support.
              </p>
              
              <Button 
                size="lg"
                onClick={() => setStarted(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-lg px-12 py-6 rounded-full shadow-[0_0_30px_hsl(330,80%,50%,0.5)] hover:shadow-[0_0_50px_hsl(330,80%,50%,0.8)] transition-all duration-300 hover:scale-105"
              >
                <MessageCircle className="w-6 h-6 mr-2" />
                Start Chat
              </Button>
            </div>
          ) : (
            // Chat Interface
            <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 transition-all duration-300">
              <CardContent className="p-0">
                {/* Chat Header */}
                <div className="p-6 border-b border-white/10 flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30">
                    <img 
                      src="/src/assets/tia-butterfly-logo.png" 
                      alt="TIA" 
                      className="w-12 h-12"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">TIA Assistant</h3>
                    <p className="text-white/60 text-sm">Always here to help</p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-6 h-96 overflow-y-auto space-y-4">
                  {/* TIA Message */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex-shrink-0">
                      <img 
                        src="/src/assets/tia-butterfly-logo.png" 
                        alt="TIA" 
                        className="w-8 h-8"
                      />
                    </div>
                    <div className="bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-2xl rounded-tl-none p-4 max-w-md">
                      <p className="text-white">
                        Hello! I'm TIA, your thyroid health companion. How can I help you today? 💜
                      </p>
                    </div>
                  </div>

                  {/* User Message Example */}
                  <div className="flex items-start space-x-3 justify-end">
                    <div className="bg-gradient-to-r from-pink-500/40 to-white/30 rounded-2xl rounded-tr-none p-4 max-w-md">
                      <p className="text-white">
                        Can you help me understand my TSH levels?
                      </p>
                    </div>
                  </div>

                  {/* TIA Response */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex-shrink-0">
                      <img 
                        src="/src/assets/tia-butterfly-logo.png" 
                        alt="TIA" 
                        className="w-8 h-8"
                      />
                    </div>
                    <div className="bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-2xl rounded-tl-none p-4 max-w-md">
                      <p className="text-white">
                        Of course! TSH (Thyroid Stimulating Hormone) helps regulate your thyroid function. Normal ranges are typically 0.4-4.0 mIU/L. Would you like me to explain what your specific levels mean?
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="p-6 border-t border-white/10">
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 bg-white/10 border border-pink-400/30 rounded-full px-6 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-pink-400 transition-all"
                    />
                    <Button 
                      size="icon"
                      className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-[0_0_20px_hsl(330,80%,50%,0.4)] hover:shadow-[0_0_30px_hsl(330,80%,50%,0.6)] transition-all duration-300"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default Chatbot;
