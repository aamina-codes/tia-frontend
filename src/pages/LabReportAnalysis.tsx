import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  Loader2,
  Trash2,
  UserPlus,
  UserCheck,
  Sparkles,
  User,
  Building2,
  Calendar,
  Stethoscope,
  Apple,
  Pill,
  Activity,
  Moon,
  Droplet,
  Lightbulb,
  AlertCircle,
  RefreshCw,
  FileUp,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useLabReports } from "@/hooks/useLabReports";
import { analyzeReport, LabReportApiError } from "@/services/labReportApi";
import { MARKER_RANGES } from "@/components/health/statusUtils";
import tiaLogo from "@/assets/tia-butterfly-logo.png";

type Tone = "green" | "yellow" | "orange" | "red" | "blue" | "muted";

const LOADING_MESSAGES = [
  "Reading report...",
  "Extracting thyroid values...",
  "Generating AI analysis...",
  "Preparing recommendations...",
];

const LabReportAnalysis = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { reports, latestReport, addReport, deleteReport, toggleAddToProfile } = useLabReports();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [justAnalyzedId, setJustAnalyzedId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  // Rotate loading messages during analysis
  useEffect(() => {
    if (!isUploading) return;
    setLoadingMsgIndex(0);
    const id = setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1600);
    return () => clearInterval(id);
  }, [isUploading]);

  // Auto-hide success animation
  useEffect(() => {
    if (!showSuccess) return;
    const id = setTimeout(() => setShowSuccess(false), 2400);
    return () => clearTimeout(id);
  }, [showSuccess]);

  // Normalize backend status/severity to a color tone.
  const toneFor = (status?: string, severity?: string): Tone => {
    const sev = (severity || "").toLowerCase();
    if (sev === "severe" || sev === "critical") return "red";
    if (sev === "moderate") return "orange";
    if (sev === "mild" || sev === "borderline") return "yellow";
    if (sev === "normal") return "green";

    const s = (status || "").toLowerCase();
    if (s === "normal" || s === "optimal") return "green";
    if (s === "low") return "yellow";
    if (s === "slightly high" || s === "borderline") return "orange";
    if (s === "high" || s === "very high" || s === "very low") return "red";
    return "muted";
  };

  // Tone → styling maps. Uses translucent tints that work on the dark purple bg.
  const toneCard: Record<Tone, string> = {
    green: "bg-emerald-500/10 border-emerald-400/40 shadow-[0_0_28px_rgba(16,185,129,0.25)]",
    yellow: "bg-yellow-500/10 border-yellow-400/40 shadow-[0_0_28px_rgba(234,179,8,0.22)]",
    orange: "bg-orange-500/10 border-orange-400/40 shadow-[0_0_28px_rgba(251,146,60,0.25)]",
    red: "bg-red-500/10 border-red-400/40 shadow-[0_0_28px_rgba(239,68,68,0.3)]",
    blue: "bg-sky-500/10 border-sky-400/40 shadow-[0_0_28px_rgba(56,189,248,0.22)]",
    muted: "bg-white/5 border-white/15",
  };

  const toneText: Record<Tone, string> = {
    green: "text-emerald-300",
    yellow: "text-yellow-200",
    orange: "text-orange-300",
    red: "text-red-300",
    blue: "text-sky-300",
    muted: "text-white/60",
  };

  const toneBadge: Record<Tone, string> = {
    green: "bg-emerald-500/20 text-emerald-200 border border-emerald-400/50",
    yellow: "bg-yellow-500/20 text-yellow-100 border border-yellow-400/50",
    orange: "bg-orange-500/20 text-orange-100 border border-orange-400/50",
    red: "bg-red-500/20 text-red-100 border border-red-400/50",
    blue: "bg-sky-500/20 text-sky-100 border border-sky-400/50",
    muted: "bg-white/10 text-white/70 border border-white/20",
  };

  const toneDot: Record<Tone, string> = {
    green: "🟢",
    yellow: "🟡",
    orange: "🟠",
    red: "🔴",
    blue: "🔵",
    muted: "⚪",
  };

  // ── Light-surface variants ────────────────────────────────────────────────
  // Used inside the AI Clinical Analysis report card, which sits on a light
  // paper-like surface so body copy stays high-contrast and accessible.
  const toneTextOnLight: Record<Tone, string> = {
    green: "text-emerald-700",
    yellow: "text-amber-700",
    orange: "text-orange-700",
    red: "text-red-700",
    blue: "text-sky-700",
    muted: "text-slate-500",
  };

  const toneBadgeOnLight: Record<Tone, string> = {
    green: "bg-emerald-50 text-emerald-800 border border-emerald-300",
    yellow: "bg-amber-50 text-amber-800 border border-amber-300",
    orange: "bg-orange-50 text-orange-800 border border-orange-300",
    red: "bg-red-50 text-red-800 border border-red-300",
    blue: "bg-sky-50 text-sky-800 border border-sky-300",
    muted: "bg-slate-100 text-slate-700 border border-slate-300",
  };

  const toneDotOnLight: Record<Tone, string> = {
    green: "bg-emerald-500",
    yellow: "bg-amber-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
    blue: "bg-sky-500",
    muted: "bg-slate-400",
  };

  const toneStroke: Record<Tone, string> = {
    green: "#059669",
    yellow: "#d97706",
    orange: "#ea580c",
    red: "#dc2626",
    blue: "#0284c7",
    muted: "#94a3b8",
  };

  // Small colored status dot — replaces emoji for a cleaner clinical look.
  const StatusDot = ({ tone }: { tone: Tone }) => (
    <span className={`w-2 h-2 rounded-full shrink-0 ${toneDotOnLight[tone]}`} />
  );


  // Extract a display value from an analysis entry or raw thyroid map.
  const readValue = (entry: any, raw: any): string | number => {
    const v = entry?.value ?? entry?.level ?? entry?.result ?? raw;
    if (v === null || v === undefined || v === "") return "—";
    if (typeof v === "object") return v.value ?? v.level ?? "—";
    return v;
  };

  const formatValue = (v: string | number) => (v === "—" || v === "N/A" ? "—" : v);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload a file smaller than 10MB", variant: "destructive" });
      return;
    }
    setSelectedFile(file);
    setJustAnalyzedId(null);
    setError(null);
  };

  const handleAnalyzeReport = async () => {
    if (!selectedFile) return;
    setError(null);
    setIsUploading(true);
    setProgress(20);

    try {
      setProgress(40);
      setIsAnalyzing(true);
      setProgress(60);

      const report = await analyzeReport(selectedFile);
      setProgress(90);

      const saved = addReport(report);
      setProgress(100);

      setJustAnalyzedId(saved.id);
      setShowSuccess(true);
      toast({ title: "Analysis Complete", description: "Your report has been analyzed and saved." });
      setIsAnalyzing(false);
      setIsUploading(false);
      setProgress(0);
      setSelectedFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      const description =
        err instanceof LabReportApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Something went wrong.";
      setError(description);
      toast({ title: "Analysis failed", description, variant: "destructive" });
      setIsUploading(false);
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const displayReport = justAnalyzedId ? reports.find((r) => r.id === justAnalyzedId) : latestReport;

  // Pick a recommendation icon from keywords in the text.
  const recIconFor = (text: string) => {
    const t = text.toLowerCase();
    if (/(diet|food|nutri|eat|iodine|selenium|vitamin)/.test(t)) return { Icon: Apple, label: "Nutrition", tone: "green" as Tone };
    if (/(medic|drug|dose|levothyroxine|tablet|prescrib)/.test(t)) return { Icon: Pill, label: "Medication", tone: "blue" as Tone };
    if (/(exercis|activ|walk|yoga|workout|movement)/.test(t)) return { Icon: Activity, label: "Exercise", tone: "orange" as Tone };
    if (/(sleep|rest|bed)/.test(t)) return { Icon: Moon, label: "Sleep", tone: "blue" as Tone };
    if (/(water|hydrat|fluid)/.test(t)) return { Icon: Droplet, label: "Hydration", tone: "blue" as Tone };
    if (/(doctor|physician|consult|endocrin|follow.?up|test|monitor)/.test(t))
      return { Icon: Stethoscope, label: "Medical Follow-up", tone: "yellow" as Tone };
    return { Icon: Lightbulb, label: "Tip", tone: "muted" as Tone };
  };

  // Circular progress ring for health score.
  const HealthRing = ({ score }: { score: number }) => {
    const clamped = Math.max(0, Math.min(100, score));
    const label = clamped >= 90 ? "Excellent" : clamped >= 70 ? "Good" : clamped >= 50 ? "Fair" : "Needs Care";
    const ringTone: Tone = clamped >= 90 ? "green" : clamped >= 70 ? "yellow" : "red";
    const stroke =
      ringTone === "green" ? "#34d399" : ringTone === "yellow" ? "#facc15" : "#f87171";
    const R = 52;
    const C = 2 * Math.PI * R;
    const offset = C - (clamped / 100) * C;
    return (
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg width="128" height="128" className="-rotate-90">
          <circle cx="64" cy="64" r={R} stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
          <circle
            cx="64"
            cy="64"
            r={R}
            stroke={stroke}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-out", filter: `drop-shadow(0 0 10px ${stroke})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${toneText[ringTone]}`}>{clamped}</span>
          <span className="text-[10px] uppercase tracking-widest text-white/60">{label}</span>
        </div>
      </div>
    );
  };

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-center gap-3 py-1">
      <div className="p-2 rounded-lg bg-white/5 border border-white/10">
        <Icon className="w-4 h-4 text-purple-200" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-white/50">{label}</p>
        <p className="text-white/90 text-sm font-medium truncate">{value || "—"}</p>
      </div>
    </div>
  );

  const getField = (obj: any, keys: string[]): string => {
    if (!obj) return "";
    for (const k of keys) {
      const v = obj[k];
      if (v !== undefined && v !== null && v !== "") return String(v);
    }
    return "";
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: "#1E003D" }}>
      <Navigation />

      {/* Floating background glow */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "1s" }}
      />

      {/* Back button */}
      <div className="relative z-10 pt-24 px-6">
        <button
          onClick={() => navigate("/explore")}
          className="group flex items-center text-white/80 hover:text-white transition-all duration-300 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back to Features</span>
        </button>
      </div>

      {/* Header */}
      <section className="relative z-10 px-6 pb-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20 animate-float">
              <img
                src={tiaLogo}
                alt="TIA Butterfly Logo"
                className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(236,72,153,0.7)]"
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Smart Lab Report Analysis
          </h1>
          <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto">
            Upload your thyroid blood test report and let TIA turn the numbers into clear, friendly guidance.
          </p>
        </div>
      </section>

      {/* Upload */}
      <section className="relative z-10 px-6 pb-10">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-white/[0.04] backdrop-blur-xl border border-purple-300/25 rounded-3xl overflow-hidden">
            <CardContent className="p-8 md:p-10">
              <div className="flex flex-col items-center text-center space-y-5">
                <div
                  className={`p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-blue-500/20 border border-white/10 ${
                    isUploading ? "" : "animate-float"
                  }`}
                >
                  {isUploading ? (
                    <Loader2 className="w-14 h-14 text-pink-300 animate-spin" />
                  ) : showSuccess ? (
                    <CheckCircle className="w-14 h-14 text-emerald-400 animate-scale-in drop-shadow-[0_0_18px_rgba(16,185,129,0.8)]" />
                  ) : selectedFile ? (
                    <FileText className="w-14 h-14 text-purple-200 animate-scale-in" />
                  ) : (
                    <FileUp className="w-14 h-14 text-pink-300" />
                  )}
                </div>

                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {isUploading
                      ? "Analyzing your report..."
                      : showSuccess
                      ? "Analysis completed successfully"
                      : selectedFile
                      ? "Ready to analyze"
                      : "Upload your thyroid report"}
                  </h3>
                  <p className="text-white/70 text-sm md:text-base">
                    {isUploading
                      ? LOADING_MESSAGES[loadingMsgIndex]
                      : "Upload your thyroid blood test report in PDF or image format."}
                  </p>
                </div>

                {!isUploading && !selectedFile && (
                  <div className="flex flex-wrap justify-center gap-2 text-xs">
                    {["PDF", "PNG", "JPG"].map((f) => (
                      <span key={f} className="px-3 py-1 rounded-full bg-white/5 border border-white/15 text-white/70">
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                {selectedFile && !isUploading && (
                  <div className="w-full max-w-md rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-300 shrink-0" />
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-white text-sm font-medium truncate">{selectedFile.name}</p>
                        <p className="text-white/60 text-xs">
                          {(selectedFile.size / 1024).toFixed(1)} KB · Upload successful
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isUploading && (
                  <div className="w-full max-w-md space-y-2 animate-fade-in">
                    <Progress value={progress} className="h-2" />
                    <p className="text-pink-300 text-xs text-center font-medium">{progress}%</p>
                  </div>
                )}

                {error && !isUploading && (
                  <div className="w-full max-w-md rounded-2xl border border-red-400/40 bg-red-500/10 p-4 animate-fade-in text-left">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold">
                          Something went wrong while analyzing your report.
                        </p>
                        <p className="text-white/70 text-xs mt-1">Please try again.</p>
                        {selectedFile && (
                          <Button
                            onClick={handleAnalyzeReport}
                            size="sm"
                            className="mt-3 bg-red-500/20 hover:bg-red-500/30 text-red-100 border border-red-400/50 rounded-full"
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {!isUploading && !selectedFile && (
                  <>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3.5 rounded-full shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:shadow-[0_0_50px_rgba(236,72,153,0.8)] transition-all duration-300 hover:scale-105 flex items-center space-x-2">
                        <Upload className="w-5 h-5" />
                        <span className="font-semibold">Choose File</span>
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
                  <div className="flex flex-wrap justify-center gap-3 animate-fade-in">
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setError(null);
                        const input = document.getElementById("file-upload") as HTMLInputElement;
                        if (input) input.value = "";
                      }}
                      className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-300 text-sm font-medium"
                    >
                      Choose Different File
                    </button>
                    <button
                      onClick={handleAnalyzeReport}
                      disabled={isUploading}
                      className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-[0_0_24px_rgba(236,72,153,0.5)] transition-all duration-300 hover:scale-105 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
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

      {/* Results */}
      {displayReport && (
        <>
          {(() => {
            const analysis = displayReport.analysis ?? {};
            const raw = displayReport.thyroidValues ?? {};
            const patient = displayReport.patient ?? {};
            const reportDetails = displayReport.reportDetails ?? {};

            const markerKeys = ["TSH", "T3", "T4", "FT3", "FT4", "Anti_TPO"];
            const markerLabels: Record<string, { label: string; unit: string; rangeKey?: keyof typeof MARKER_RANGES }> = {
              TSH: { label: "TSH", unit: "µIU/mL", rangeKey: "TSH" },
              T3: { label: "T3", unit: "ng/dL", rangeKey: "T3" },
              T4: { label: "T4", unit: "µg/dL", rangeKey: "T4" },
              FT3: { label: "Free T3", unit: "pg/mL", rangeKey: "FT3" },
              FT4: { label: "Free T4", unit: "ng/dL", rangeKey: "FT4" },
              Anti_TPO: { label: "Anti-TPO", unit: "IU/mL", rangeKey: "AntiTPO" },
            };

            const markers = markerKeys.map((k) => {
              const entry = analysis?.[k] ?? {};
              const rawVal = raw?.[k];
              const hasData = entry !== undefined && (Object.keys(entry).length > 0 || rawVal !== undefined);
              const rangeKey = markerLabels[k].rangeKey;
              const range = rangeKey ? MARKER_RANGES[rangeKey] : undefined;
              return {
                key: k,
                label: markerLabels[k].label,
                unit: markerLabels[k].unit,
                value: hasData ? readValue(entry, rawVal) : "—",
                status: hasData ? entry?.status ?? "Normal" : "Not Available",
                severity: entry?.severity,
                tone: hasData ? toneFor(entry?.status, entry?.severity) : ("muted" as Tone),
                range: range ? `${range.min} - ${range.max}` : undefined,
                hasData,
              };
            });

            const availableMarkers = markers.filter((m) => m.hasData);
            const abnormalTests = availableMarkers.filter((m) => m.tone !== "green" && m.tone !== "muted");

            const riskLevel: string = displayReport.risk?.level ?? displayReport.risk?.risk ?? "Unknown";
            const riskTone = toneFor(riskLevel);
            const healthScore: number | undefined =
              displayReport.risk?.score ?? displayReport.risk?.health_score;

            const overallStatus =
              abnormalTests.length === 0
                ? "Stable"
                : abnormalTests.some((m) => m.tone === "red")
                ? "Critical"
                : "Mild Imbalance";
            const overallTone: Tone =
              overallStatus === "Stable" ? "green" : overallStatus === "Critical" ? "red" : "yellow";

            const interpretation: string =
              (analysis as any)?.interpretation ??
              (analysis as any)?.overall ??
              displayReport.summary ??
              "";

            const conditions: any[] = displayReport.possibleConditions ?? [];
            const recs: any[] = displayReport.recommendations ?? [];

            const patientName = getField(patient, ["name", "patient_name", "full_name"]);
            const patientAge = getField(patient, ["age", "patient_age"]);
            const patientGender = getField(patient, ["gender", "sex"]);

            const labName = getField(reportDetails, ["lab", "lab_name", "laboratory"]);
            const reportDate = getField(reportDetails, ["date", "report_date", "collected_on", "collection_date"]);
            const doctorName = getField(reportDetails, ["doctor", "physician", "referred_by", "referring_doctor"]);

            const hasPatientInfo = patientName || patientAge || patientGender;
            const hasReportInfo = labName || reportDate || doctorName;

            return (
              <section className="relative z-10 px-6 pb-12">
                <div className="max-w-5xl mx-auto space-y-6">
                  {/* Patient + Report info */}
                  {(hasPatientInfo || hasReportInfo) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hasPatientInfo && (
                        <Card className="bg-white/[0.04] backdrop-blur-xl border border-purple-300/20 rounded-2xl">
                          <CardContent className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                              <User className="w-4 h-4 text-purple-200" />
                              <h4 className="text-white/90 font-semibold text-sm uppercase tracking-wider">
                                Patient Information
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <InfoRow icon={User} label="Name" value={patientName} />
                              <InfoRow icon={Calendar} label="Age" value={patientAge} />
                              <InfoRow icon={User} label="Gender" value={patientGender} />
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      {hasReportInfo && (
                        <Card className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl">
                          <CardContent className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                              <FileText className="w-4 h-4 text-white/70" />
                              <h4 className="text-white/80 font-semibold text-sm uppercase tracking-wider">
                                Report Information
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <InfoRow icon={Building2} label="Lab" value={labName} />
                              <InfoRow icon={Calendar} label="Date" value={reportDate} />
                              <InfoRow icon={Stethoscope} label="Doctor" value={doctorName} />
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Thyroid Profile */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-pink-300" />
                        Thyroid Profile
                      </h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${toneBadge[overallTone]}`}>
                        {toneDot[overallTone]} {overallStatus}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {markers.map((m) => (
                        <Card
                          key={m.key}
                          className={`backdrop-blur-xl border rounded-2xl transition-all duration-300 hover:-translate-y-0.5 ${toneCard[m.tone]}`}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-white font-semibold">{m.label}</h3>
                                <p className="text-white/50 text-[11px] uppercase tracking-wider">{m.unit}</p>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${toneBadge[m.tone]}`}>
                                {toneDot[m.tone]} {m.hasData ? m.status : "Not Available"}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1 mb-2">
                              <span className={`text-3xl font-bold ${toneText[m.tone]}`}>
                                {formatValue(m.value)}
                              </span>
                              {m.hasData && <span className="text-white/40 text-xs">{m.unit}</span>}
                            </div>
                            {m.range && (
                              <div className="pt-2 border-t border-white/10">
                                <p className="text-[11px] text-white/50 uppercase tracking-wider">Reference Range</p>
                                <p className="text-white/80 text-sm font-medium">{m.range}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* AI Clinical Analysis */}
                  <Card className="bg-gradient-to-br from-purple-600/15 via-purple-500/10 to-transparent backdrop-blur-xl border border-purple-300/30 rounded-3xl overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600/40 to-pink-500/30 px-6 py-4 border-b border-white/10 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/10">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-white">AI Clinical Analysis</h3>
                    </div>
                    <CardContent className="p-6 md:p-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        {/* Health score ring */}
                        <div className="flex flex-col items-center justify-center md:border-r md:border-white/10 md:pr-6">
                          {healthScore !== undefined && healthScore !== null ? (
                            <>
                              <HealthRing score={Number(healthScore)} />
                              <p className="text-white/60 text-xs mt-2 uppercase tracking-wider">Health Score</p>
                            </>
                          ) : (
                            <div className="text-white/50 text-sm text-center">Score not available</div>
                          )}
                        </div>

                        {/* Overall status + risk */}
                        <div className="md:col-span-2 space-y-4">
                          <div>
                            <p className="text-white/50 text-[11px] uppercase tracking-wider mb-1.5">Overall Status</p>
                            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold ${toneBadge[overallTone]}`}>
                              {toneDot[overallTone]} {overallStatus}
                            </span>
                          </div>
                          <div>
                            <p className="text-white/50 text-[11px] uppercase tracking-wider mb-1.5">Risk Level</p>
                            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold ${toneBadge[riskTone]}`}>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {riskLevel} Risk
                            </span>
                          </div>
                          {interpretation && (
                            <div>
                              <p className="text-white/50 text-[11px] uppercase tracking-wider mb-1.5">Interpretation</p>
                              <p className="text-white/85 text-sm leading-relaxed">{interpretation}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Abnormal tests */}
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-white/50 text-[11px] uppercase tracking-wider mb-2">Abnormal Tests</p>
                        {abnormalTests.length === 0 ? (
                          <p className="text-emerald-200 text-sm">No abnormal thyroid markers detected.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {abnormalTests.map((m) => (
                              <span key={m.key} className={`px-3 py-1 rounded-full text-xs font-medium ${toneBadge[m.tone]}`}>
                                {toneDot[m.tone]} {m.label}: {m.status}
                                {m.severity ? ` (${m.severity})` : ""}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Possible Conditions */}
                  {conditions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-purple-200" />
                        Possible Conditions
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {conditions.map((c, i) => {
                          const name =
                            typeof c === "string" ? c : c?.name ?? c?.condition ?? "Condition";
                          const confidenceRaw =
                            typeof c === "object" ? c?.confidence ?? c?.likelihood ?? c?.probability : undefined;
                          const conf = String(confidenceRaw ?? "").toLowerCase();
                          const confTone: Tone =
                            conf.includes("high") ? "red" : conf.includes("med") || conf.includes("moderate") ? "orange" : conf ? "yellow" : "muted";
                          const confLabel = confidenceRaw
                            ? String(confidenceRaw).charAt(0).toUpperCase() + String(confidenceRaw).slice(1)
                            : "—";
                          return (
                            <Card
                              key={i}
                              className="bg-white/[0.04] backdrop-blur-xl border border-purple-300/20 rounded-2xl hover:border-purple-300/40 transition-colors"
                            >
                              <CardContent className="p-4">
                                <p className="text-white font-semibold mb-2">{name}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-white/50 text-xs">Confidence</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${toneBadge[confTone]}`}>
                                    {confLabel}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {recs.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-pink-300" />
                        Personalized Recommendations
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {recs.map((rec, index) => {
                          const text =
                            typeof rec === "string"
                              ? rec
                              : rec?.text ?? rec?.message ?? rec?.recommendation ?? "";
                          if (!text) return null;
                          const { Icon, label, tone } = recIconFor(text);
                          return (
                            <Card
                              key={index}
                              className={`backdrop-blur-xl border rounded-2xl transition-all duration-300 hover:-translate-y-0.5 ${toneCard[tone]}`}
                            >
                              <CardContent className="p-4 flex items-start gap-3">
                                <div className={`p-2.5 rounded-xl bg-white/10 border border-white/10 shrink-0`}>
                                  <Icon className={`w-5 h-5 ${toneText[tone]}`} />
                                </div>
                                <div className="min-w-0">
                                  <p className={`text-[11px] uppercase tracking-wider mb-0.5 ${toneText[tone]}`}>
                                    {label}
                                  </p>
                                  <p className="text-white/85 text-sm leading-relaxed">{text}</p>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* AI Summary */}
                  {displayReport.summary && (
                    <Card className="relative overflow-hidden border-0 rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 shadow-[0_20px_60px_-20px_rgba(168,85,247,0.5)]">
                      <div className="absolute inset-0 opacity-30 pointer-events-none">
                        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-pink-400/40 blur-3xl" />
                        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-blue-400/30 blur-3xl" />
                      </div>
                      <CardContent className="relative p-6 md:p-8">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
                            <Sparkles className="w-6 h-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white text-lg font-bold mb-2">AI Summary</h3>
                            <p className="text-white/95 text-base md:text-lg leading-relaxed">
                              {displayReport.summary}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </section>
            );
          })()}
        </>
      )}

      {/* Report History */}
      {reports.length > 0 && (
        <section className="relative z-10 px-6 pb-20">
          <div className="max-w-5xl mx-auto">
            <Card className="bg-white/[0.04] backdrop-blur-xl border border-purple-300/25 rounded-3xl">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-pink-300" />
                  Report History ({reports.length})
                </h3>
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className={`bg-white/[0.03] border rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.06] ${
                        report.id === justAnalyzedId
                          ? "border-pink-400/50 shadow-[0_0_20px_rgba(236,72,153,0.25)]"
                          : "border-white/10"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <p className="text-white font-semibold text-sm">
                              {new Date(report.uploadDate).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            {report.id === justAnalyzedId && (
                              <Badge className="bg-pink-500/20 text-pink-200 border-pink-400/50 text-[10px]">Latest</Badge>
                            )}
                            {report.addedToProfile && (
                              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/50 text-[10px]">
                                On Profile
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                            <span className="text-white/50">
                              TSH:{" "}
                              <span className={toneText[toneFor(report.analysis?.TSH?.status, report.analysis?.TSH?.severity)]}>
                                {report.tsh ?? "—"}
                              </span>
                            </span>
                            <span className="text-white/50">
                              T3:{" "}
                              <span className={toneText[toneFor(report.analysis?.T3?.status, report.analysis?.T3?.severity)]}>
                                {report.t3 ?? "—"}
                              </span>
                            </span>
                            <span className="text-white/50">
                              T4:{" "}
                              <span className={toneText[toneFor(report.analysis?.T4?.status, report.analysis?.T4?.severity)]}>
                                {report.t4 ?? "—"}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAddToProfile(report.id)}
                            className={`rounded-full text-xs ${
                              report.addedToProfile
                                ? "text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10"
                                : "text-pink-300 hover:text-pink-200 hover:bg-pink-500/10"
                            }`}
                          >
                            {report.addedToProfile ? (
                              <UserCheck className="w-4 h-4 mr-1" />
                            ) : (
                              <UserPlus className="w-4 h-4 mr-1" />
                            )}
                            {report.addedToProfile ? "On Profile" : "Add to Profile"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              deleteReport(report.id);
                              toast({ title: "Report deleted", description: "Removed from all pages." });
                            }}
                            className="rounded-full text-red-300 hover:text-red-200 hover:bg-red-500/10 text-xs"
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
