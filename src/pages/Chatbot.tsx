import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Loader2, Check, Paperclip, Activity, FileText, Stethoscope, HeartPulse, Sparkle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import tiaLogo from "@/assets/tia-butterfly-logo.png";
import {
  QuickReply,
  SymptomCheckbox,
  detectTrigger,
  getInitialResponse,
  getConditionResponse,
  getSymptomResponse,
  getTestExplanation,
  EDUCATIONAL_DISCLAIMER
} from "@/lib/thyroidDecisionTree";
import { useLabReports } from "@/hooks/useLabReports";

const PROFILE_STORAGE_KEY = "tia_profile_data";

const buildUserContext = async (latestLocalReport: any): Promise<string> => {
  const parts: string[] = [];

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', user.id)
        .maybeSingle();
      if (profile?.full_name) parts.push(`Patient name: ${profile.full_name}`);

      const { data: report } = await supabase
        .from('lab_reports')
        .select('report_name, tsh_level, t3_level, t4_level, tsh_status, t3_status, t4_status, ai_summary, ai_recommendations, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (report) {
        parts.push(`\nLatest Lab Report (${report.report_name}, uploaded ${new Date(report.created_at).toLocaleDateString()}):`);
        if (report.tsh_level != null) parts.push(`- TSH: ${report.tsh_level} µIU/mL (${report.tsh_status || 'unknown'})`);
        if (report.t3_level != null) parts.push(`- T3: ${report.t3_level} ng/dL (${report.t3_status || 'unknown'})`);
        if (report.t4_level != null) parts.push(`- T4: ${report.t4_level} µg/dL (${report.t4_status || 'unknown'})`);
        if (report.ai_summary) parts.push(`- AI Summary: ${report.ai_summary}`);
        if (report.ai_recommendations) parts.push(`- AI Recommendations: ${report.ai_recommendations}`);
      }

      const { data: tracker } = await supabase
        .from('health_tracker')
        .select('date, tsh_level, t3_level, t4_level, mood, energy_level')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5);
      if (tracker && tracker.length > 0) {
        parts.push(`\nRecent Health Tracker entries:`);
        tracker.forEach((t) => {
          const bits = [`Date: ${t.date}`];
          if (t.tsh_level != null) bits.push(`TSH ${t.tsh_level}`);
          if (t.t3_level != null) bits.push(`T3 ${t.t3_level}`);
          if (t.t4_level != null) bits.push(`T4 ${t.t4_level}`);
          if (t.mood) bits.push(`mood ${t.mood}`);
          if (t.energy_level != null) bits.push(`energy ${t.energy_level}/10`);
          parts.push(`- ${bits.join(', ')}`);
        });
      }
    }
  } catch (e) {
    console.warn('Could not fetch Supabase context:', e);
  }

  try {
    const localProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (localProfile) {
      const p = JSON.parse(localProfile);
      const personal: string[] = [];
      if (p.age) personal.push(`Age: ${p.age}`);
      if (p.gender) personal.push(`Gender: ${p.gender}`);
      if (p.diagnosis) personal.push(`Diagnosis: ${p.diagnosis}`);
      if (p.healthGoals) personal.push(`Health goals: ${p.healthGoals}`);
      if (personal.length) parts.push(`\nPersonal info: ${personal.join(' | ')}`);
    }
  } catch {}

  if (latestLocalReport && parts.findIndex(p => p.includes('Latest Lab Report')) === -1) {
    parts.push(`\nLatest Lab Report (local, ${new Date(latestLocalReport.uploadDate).toLocaleDateString()}):`);
    if (latestLocalReport.tsh != null) parts.push(`- TSH: ${latestLocalReport.tsh} (${latestLocalReport.tshStatus})`);
    if (latestLocalReport.t3 != null) parts.push(`- T3: ${latestLocalReport.t3} (${latestLocalReport.t3Status})`);
    if (latestLocalReport.t4 != null) parts.push(`- T4: ${latestLocalReport.t4} (${latestLocalReport.t4Status})`);
    if (latestLocalReport.ft3 != null) parts.push(`- Free T3: ${latestLocalReport.ft3} (${latestLocalReport.ft3Status})`);
    if (latestLocalReport.ft4 != null) parts.push(`- Free T4: ${latestLocalReport.ft4} (${latestLocalReport.ft4Status})`);
    if (latestLocalReport.antiTPO != null) parts.push(`- Anti-TPO: ${latestLocalReport.antiTPO} (${latestLocalReport.antiTPOStatus})`);
    if (latestLocalReport.interpretation) parts.push(`- Interpretation: ${latestLocalReport.interpretation}`);
    if (latestLocalReport.recommendations?.length) {
      const recTexts = latestLocalReport.recommendations
        .map((r: any) => (typeof r === 'string' ? r : (r?.text ?? r?.message ?? '')))
        .filter(Boolean);
      if (recTexts.length) parts.push(`- Recommendations: ${recTexts.join('; ')}`);
    }
  }

  return parts.length ? parts.join('\n') : '';
};

interface Message {
  role: "user" | "assistant";
  content: string;
  quickReplies?: QuickReply[];
  symptomChecklist?: SymptomCheckbox[];
  condition?: string;
  sources?: string[];
}

const QUICK_ACTIONS = [
  { icon: Activity, label: "Explain my TSH", prompt: "Explain my TSH result in simple terms." },
  { icon: FileText, label: "Summarize my report", prompt: "Summarize my latest lab report." },
  { icon: Stethoscope, label: "What should I ask my doctor?", prompt: "What should I ask my doctor at my next appointment?" },
  { icon: HeartPulse, label: "Lifestyle tips", prompt: "What lifestyle habits support healthy thyroid function?" },
];

const SUGGESTED_PROMPTS = [
  "What does a high TSH mean?",
  "Are my T3 and T4 in range?",
  "Why do I feel tired all the time?",
  "How often should I retest?",
];


interface DecisionState {
  active: boolean;
  trigger: "low_tsh" | "high_tsh" | null;
  awaitingT4Response: boolean;
  awaitingSymptomResponse: boolean;
  currentCondition: string | null;
}

const Chatbot = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { latestReport } = useLabReports();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [decisionState, setDecisionState] = useState<DecisionState>({
    active: false,
    trigger: null,
    awaitingT4Response: false,
    awaitingSymptomResponse: false,
    currentCondition: null
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickReply = (reply: QuickReply) => {
    // Add user message
    setMessages(prev => [...prev, { role: "user", content: reply.label }]);

    if (decisionState.awaitingT4Response && decisionState.trigger) {
      // Process T4 response
      const response = getConditionResponse(decisionState.trigger, reply.value);
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: response.message,
        quickReplies: response.quickReplies,
        symptomChecklist: response.symptomChecklist,
        condition: response.condition
      }]);

      setDecisionState(prev => ({
        ...prev,
        awaitingT4Response: false,
        awaitingSymptomResponse: !!response.symptomChecklist,
        currentCondition: response.condition || null
      }));

      if (!response.symptomChecklist && !response.quickReplies) {
        // End decision tree
        setDecisionState({
          active: false,
          trigger: null,
          awaitingT4Response: false,
          awaitingSymptomResponse: false,
          currentCondition: null
        });
      }
    } else if (reply.value === "explain") {
      // User wants test explanation
      setMessages(prev => [...prev, {
        role: "assistant",
        content: getTestExplanation()
      }]);
      setDecisionState({
        active: false,
        trigger: null,
        awaitingT4Response: false,
        awaitingSymptomResponse: false,
        currentCondition: null
      });
    } else if (reply.value === "other") {
      // User has another question
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Of course! Feel free to ask me any other thyroid-related questions. What would you like to know?"
      }]);
      setDecisionState({
        active: false,
        trigger: null,
        awaitingT4Response: false,
        awaitingSymptomResponse: false,
        currentCondition: null
      });
    }
  };

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(s => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleSymptomSubmit = () => {
    const symptomLabels = selectedSymptoms.length > 0 
      ? `Selected symptoms: ${selectedSymptoms.join(", ")}`
      : "No symptoms selected";
    
    setMessages(prev => [...prev, { role: "user", content: symptomLabels }]);

    const response = getSymptomResponse(
      decisionState.currentCondition || "your condition",
      selectedSymptoms
    );

    setMessages(prev => [...prev, {
      role: "assistant",
      content: response
    }]);

    // Reset state
    setSelectedSymptoms([]);
    setDecisionState({
      active: false,
      trigger: null,
      awaitingT4Response: false,
      awaitingSymptomResponse: false,
      currentCondition: null
    });
  };

  const handleSendMessage = async (override?: string) => {
    const raw = (override ?? inputMessage).trim();
    if (raw && !isLoading) {
      const userMessage = raw;
      setMessages(prev => [...prev, { role: "user", content: userMessage }]);
      setInputMessage("");

      // Check for decision tree triggers
      const trigger = detectTrigger(userMessage);
      
      if (trigger) {
        // Start decision tree flow
        const initialResponse = getInitialResponse(trigger);
        
        setMessages(prev => [...prev, {
          role: "assistant",
          content: initialResponse.message,
          quickReplies: initialResponse.quickReplies
        }]);

        setDecisionState({
          active: true,
          trigger,
          awaitingT4Response: true,
          awaitingSymptomResponse: false,
          currentCondition: null
        });
        return;
      }

      // Regular AI flow
      setIsLoading(true);
      
      try {
        const userContext = await buildUserContext(latestReport);
        const history = messages.map(m => ({ role: m.role, content: m.content }));
        const { data, error } = await supabase.functions.invoke('chat', {
          body: { message: userMessage, userContext, history }
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

        // Source references: which of the user's own records informed this answer
        const sources: string[] = [];
        if (userContext.includes('Latest Lab Report')) sources.push('Your latest lab report');
        if (userContext.includes('Health Tracker')) sources.push('Health tracker entries');
        if (userContext.includes('Personal info') || userContext.includes('Patient name')) sources.push('Your profile');

        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: data.response,
          sources: sources.length ? sources : undefined
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, JPG, or PNG file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Add user message showing file upload
    setMessages(prev => [...prev, { 
      role: "user", 
      content: `📎 Uploaded: ${file.name}` 
    }]);

    // Add confirmation message
    setMessages(prev => [...prev, { 
      role: "assistant", 
      content: "Report uploaded successfully. Analyzing your results…" 
    }]);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Call the analyze-lab-report edge function
      const { data, error } = await supabase.functions.invoke('analyze-lab-report', {
        body: formData,
      });

      if (error) {
        console.error('Lab report analysis error:', error);
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "I had trouble analyzing your report. Please try again or type your lab values manually (e.g., 'My TSH is 0.3')." 
        }]);
      } else if (data?.analysis) {
        // Add the analysis response
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: data.analysis 
        }]);
      } else if (data?.values) {
        // If we got extracted values, format a response
        const values = data.values;
        let response = "I've analyzed your lab report. Here's what I found:\n\n";
        
        if (values.tsh) response += `**TSH:** ${values.tsh} ${values.tsh_unit || 'mIU/L'}\n`;
        if (values.t4) response += `**Free T4:** ${values.t4} ${values.t4_unit || 'ng/dL'}\n`;
        if (values.t3) response += `**T3:** ${values.t3} ${values.t3_unit || 'pg/mL'}\n`;
        
        response += "\nWould you like me to explain what these values mean?";
        
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: response,
          quickReplies: [
            { id: "explain", label: "Yes, explain my results", value: "explain" },
            { id: "other", label: "I have another question", value: "other" }
          ]
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "I've received your report but couldn't extract specific values. Could you tell me your TSH, T4, or T3 levels?" 
        }]);
      }
    } catch (error) {
      console.error('File upload error:', error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Something went wrong while analyzing your report. Please try again or share your lab values manually." 
      }]);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const renderMessage = (message: Message, index: number) => {
    const isLastMessage = index === messages.length - 1;
    
    return (
      <div key={index} className="animate-fadeIn">
        <div
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} items-end gap-2.5`}
        >
          {message.role === "assistant" && (
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-pink-500/25 to-purple-500/25 border border-pink-400/30 flex items-center justify-center mb-1">
              <img src={tiaLogo} alt="TIA" className="w-5 h-5 object-contain" />
            </div>
          )}

          <div className={`max-w-[78%] sm:max-w-[70%] ${message.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1.5`}>
            <div
              className={`rounded-2xl px-4 py-3 text-[0.95rem] leading-relaxed shadow-sm ${
                message.role === "user"
                  ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-br-md"
                  : "bg-white/[0.07] border border-white/10 text-white/90 rounded-bl-md backdrop-blur-sm"
              }`}
            >
              <div className="whitespace-pre-wrap">
                {message.content.split('\n').map((line, i) => {
                  // Safely render **bold** markdown as React elements (no HTML injection).
                  const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
                    if (/^\*\*[^*]+\*\*$/.test(part)) {
                      return <strong key={j}>{part.slice(2, -2)}</strong>;
                    }
                    return <span key={j}>{part}</span>;
                  });
                  return (
                    <p key={i} className="mb-1 last:mb-0">
                      {parts}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Source references */}
            {message.role === "assistant" && message.sources && message.sources.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pl-1">
                <span className="text-[0.7rem] uppercase tracking-wide text-white/40">Based on</span>
                {message.sources.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 text-[0.7rem] text-pink-200/90 bg-pink-500/10 border border-pink-400/25 rounded-full px-2 py-0.5"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {message.role === "user" && (
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/25 to-cyan-500/25 border border-blue-400/30 flex items-center justify-center mb-1">
              <svg className="w-4 h-4 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}

        </div>

        {/* Quick Replies */}
        {message.role === "assistant" && message.quickReplies && isLastMessage && (
          <div className="ml-13 mt-3 flex flex-wrap gap-2 pl-13">
            {message.quickReplies.map((reply) => (
              <Button
                key={reply.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickReply(reply)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-none text-white shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all"
              >
                {reply.label}
              </Button>
            ))}
          </div>
        )}

        {/* Symptom Checklist */}
        {message.role === "assistant" && message.symptomChecklist && isLastMessage && decisionState.awaitingSymptomResponse && (
          <div className="ml-13 mt-4 pl-13">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              {message.symptomChecklist.map((symptom) => (
                <div key={symptom.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={symptom.id}
                    checked={selectedSymptoms.includes(symptom.id)}
                    onCheckedChange={() => handleSymptomToggle(symptom.id)}
                    className="border-pink-400/50 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                  />
                  <label 
                    htmlFor={symptom.id}
                    className="text-white/80 text-sm cursor-pointer hover:text-white transition-colors"
                  >
                    {symptom.label}
                  </label>
                </div>
              ))}
              <Button
                onClick={handleSymptomSubmit}
                className="mt-4 w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Submit Symptoms
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#1E003D' }}>
      <Navigation />

      {/* Floating Background Shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 pt-24 px-6 pb-24 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/explore')}
          className="text-white hover:bg-white/10 transition-colors mb-4 focus:outline-none focus:ring-0"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>

        {/* Assistant header bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/25 to-purple-500/25 border border-pink-400/30 flex items-center justify-center">
              <img src={tiaLogo} alt="TIA butterfly logo" className="w-7 h-7 object-contain" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#1E003D]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white leading-tight">TIA</h1>
            <p className="text-sm text-white/60">Thyroid Intelligent Assistant · Online</p>
          </div>
        </div>

        <Card className="bg-white/[0.04] backdrop-blur-md border border-pink-400/25 overflow-hidden">
          <CardContent className="p-0">
            {/* Messages Area */}
            <div className="h-[520px] overflow-y-auto p-5 space-y-5">
              {messages.length === 0 && !isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-2 animate-fadeIn">
                  <div className="relative mb-5">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 blur-2xl" />
                    <div className="relative w-24 h-24 rounded-full bg-white/5 border border-pink-400/30 flex items-center justify-center animate-float">
                      <img src={tiaLogo} alt="" className="w-14 h-14 object-contain" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Hi, I'm TIA</h2>
                  <p className="text-white/70 max-w-md mb-6">
                    I can read your latest lab report and profile, then explain your results in plain language.
                    Ask me anything, or start with one of these.
                  </p>

                  {/* Quick actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                    {QUICK_ACTIONS.map(({ icon: Icon, label, prompt }) => (
                      <button
                        key={label}
                        onClick={() => handleSendMessage(prompt)}
                        className="group flex items-center gap-3 text-left rounded-xl bg-white/[0.05] border border-white/10 hover:border-pink-400/50 hover:bg-white/[0.08] px-4 py-3 transition-all"
                      >
                        <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500/25 to-purple-500/25 border border-pink-400/25 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-pink-200" />
                        </span>
                        <span className="text-sm text-white/85 group-hover:text-white">{label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Suggested prompts */}
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {SUGGESTED_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => handleSendMessage(p)}
                        className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-400/40 rounded-full px-3 py-1.5 transition-all"
                      >
                        <Sparkle className="w-3 h-3 text-pink-300" />
                        {p}
                      </button>
                    ))}
                  </div>

                  <p className="mt-6 text-[0.7rem] text-white/40 max-w-sm">
                    TIA offers educational information only and does not diagnose or prescribe.
                  </p>
                </div>
              ) : (
                messages.map((message, index) => renderMessage(message, index))
              )}

              {isLoading && (
                <div className="flex justify-start items-end gap-2.5 animate-fadeIn">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-pink-500/25 to-purple-500/25 border border-pink-400/30 flex items-center justify-center mb-1">
                    <img src={tiaLogo} alt="TIA" className="w-5 h-5 object-contain" />
                  </div>
                  <div className="bg-white/[0.07] border border-white/10 rounded-2xl rounded-bl-md px-4 py-3.5 flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full bg-pink-300/80 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1s' }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="border-t border-white/10 bg-white/[0.03] p-4">
              {messages.length > 0 && !decisionState.awaitingSymptomResponse && (
                <div className="flex gap-2 overflow-x-auto pb-3 -mt-1">
                  {QUICK_ACTIONS.map(({ icon: Icon, label, prompt }) => (
                    <button
                      key={label}
                      onClick={() => handleSendMessage(prompt)}
                      disabled={isLoading || isUploading}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs text-white/75 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-400/40 rounded-full px-3 py-1.5 transition-all disabled:opacity-40"
                    >
                      <Icon className="w-3.5 h-3.5 text-pink-300" />
                      {label}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />

                <Button
                  onClick={handlePaperclipClick}
                  disabled={isLoading || isUploading || decisionState.awaitingSymptomResponse}
                  variant="ghost"
                  size="icon"
                  aria-label="Attach lab report"
                  className="rounded-full w-11 h-11 text-pink-200 hover:text-white hover:bg-white/10 disabled:opacity-40"
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                </Button>

                <Input
                  type="text"
                  placeholder="Ask TIA about your thyroid results..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading || isUploading || decisionState.awaitingSymptomResponse}
                  className="flex-1 h-12 bg-white/[0.07] border-white/15 text-white placeholder:text-white/40 rounded-full px-5 focus-visible:ring-2 focus-visible:ring-pink-400"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || isUploading || !inputMessage.trim() || decisionState.awaitingSymptomResponse}
                  size="icon"
                  aria-label="Send message"
                  className="rounded-full w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-[0_0_20px_rgba(236,72,153,0.35)] transition-all disabled:opacity-40 disabled:shadow-none"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              <p className="mt-3 text-center text-[0.7rem] text-white/35">
                Educational support only — always confirm decisions with your doctor.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chatbot;
