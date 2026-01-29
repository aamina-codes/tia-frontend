import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import tiaLogo from "@/assets/tia-butterfly-logo.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Chatbot = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm TIA, your Thyroid Intelligent Assistant. How can I help you today?" }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() && !isLoading) {
      const userMessage = inputMessage;
      setMessages(prev => [...prev, { role: "user", content: userMessage }]);
      setInputMessage("");
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('chat', {
          body: { message: userMessage }
        });

        if (error) {
          console.error('Chat error:', error);
          toast({
            title: "Error",
            description: "Failed to get response. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: data.response
        }]);
      } catch (error) {
        console.error('Chat error:', error);
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
      <section className="relative z-10 px-6 pb-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src={tiaLogo} alt="TIA" className="w-16 h-16 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Chat with TIA
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Your empathetic AI companion for thyroid health questions and support.
          </p>
        </div>
      </section>

      {/* Chat Container */}
      <section className="relative z-10 px-6 pb-32">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 hover:border-pink-400 transition-all duration-300">
            <CardContent className="p-6">
              {/* Messages Area */}
              <div className="h-[500px] overflow-y-auto mb-4 space-y-4 pr-2">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} items-start gap-3`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-400/30 flex items-center justify-center">
                        <img src={tiaLogo} alt="TIA" className="w-6 h-6" />
                      </div>
                    )}
                    
                    <div 
                      className={`max-w-[70%] rounded-2xl p-4 ${
                        message.role === "user" 
                          ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400/30" 
                          : "bg-white/5 border border-white/10"
                      }`}
                    >
                      <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {message.role === "user" && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-400/30 flex items-center justify-center">
                      <img src={tiaLogo} alt="TIA" className="w-6 h-6" />
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 text-pink-300 animate-spin" />
                      <p className="text-white/90">TIA is thinking...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="flex items-center gap-3">
                <Input
                  type="text"
                  placeholder="Ask me anything about thyroid health..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1 bg-white/10 border-pink-400/30 text-white placeholder:text-white/50 rounded-full px-6 py-6 focus:ring-2 focus:ring-pink-400"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white p-6 shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all duration-300 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Chatbot;