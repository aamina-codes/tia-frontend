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
import { analyzeReport, LabReportApiError } from "@/services/labReportApi";
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

  // Normalize a backend status/severity string to a color tone.
  // Priority: severity ("Severe" > "Moderate" > "Mild" > "Normal") overrides status when present.
  const toneFor = (status?: string, severity?: string): "green" | "yellow" | "orange" | "red" | "muted" => {
    const sev = (severity || "").toLowerCase();
    if (sev === "severe") return "red";
    if (sev === "moderate") return "orange";
    if (sev === "mild") return "yellow";
    if (sev === "normal") return "green";

    const s = (status || "").toLowerCase();
    if (s === "normal") return "green";
    if (s === "low") return "yellow";
    if (s === "high") return "red";
    return "muted";
  };

  const toneText: Record<string, string> = {
    green: "text-green-400",
    yellow: "text-yellow-300",
    orange: "text-orange-400",
    red: "text-red-400",
    muted: "text-white/60",
  };
  const toneGlow: Record<string, string> = {
    green: "shadow-[0_0_30px_rgba(34,197,94,0.45)] border-green-400/40",
    yellow: "shadow-[0_0_30px_rgba(234,179,8,0.4)] border-yellow-400/40",
    orange: "shadow-[0_0_30px_rgba(251,146,60,0.45)] border-orange-400/40",
    red: "shadow-[0_0_30px_rgba(239,68,68,0.5)] border-red-400/40",
    muted: "border-white/20",
  };
  const toneBadge: Record<string, string> = {
    green: "bg-green-500/15 text-green-300 border border-green-400/40 shadow-[0_0_12px_rgba(34,197,94,0.35)]",
    yellow: "bg-yellow-500/15 text-yellow-200 border border-yellow-400/40 shadow-[0_0_12px_rgba(234,179,8,0.3)]",
    orange: "bg-orange-500/15 text-orange-200 border border-orange-400/40 shadow-[0_0_12px_rgba(251,146,60,0.35)]",
    red: "bg-red-500/15 text-red-300 border border-red-400/40 shadow-[0_0_12px_rgba(239,68,68,0.4)]",
    muted: "bg-white/10 text-white/70 border border-white/20",
  };

  // Extract a display value from an analysis entry or the raw thyroid_values map.
  const readValue = (entry: any, raw: any): string | number => {
    const v = entry?.value ?? entry?.level ?? entry?.result ?? raw;
    if (v === null || v === undefined || v === "") return "N/A";
    if (typeof v === "object") return v.value ?? v.level ?? "N/A";
    return v;
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
      setProgress(60);

      // Delegate transport + error normalization to the API service layer.
      const report = await analyzeReport(selectedFile);
      setProgress(90);

      // Backend performs all medical analysis. Store the full report as-is.
      const saved = addReport(report);
      setProgress(100);

      setJustAnalyzedId(saved.id);

      toast({ title: "Analysis Complete!", description: "Your report has been analyzed and saved." });
      setIsAnalyzing(false);
      setIsUploading(false);
      setProgress(0);
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      const description =
        error instanceof LabReportApiError
          ? error.message
          : error instanceof Error
          ? error.message
          : "Something went wrong.";
      toast({ title: "Analysis failed", description, variant: "destructive" });
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
          {(() => {
            const analysis = displayReport.analysis ?? {};
            const raw = displayReport.thyroidValues ?? {};
            const markerKeys = ["TSH", "T3", "T4", "FT3", "FT4", "Anti_TPO"];
            const markerLabels: Record<string, { label: string; unit: string }> = {
              TSH: { label: "TSH", unit: "µIU/mL" },
              T3: { label: "T3", unit: "ng/dL" },
              T4: { label: "T4", unit: "µg/dL" },
              FT3: { label: "Free T3", unit: "pg/mL" },
              FT4: { label: "Free T4", unit: "ng/dL" },
              Anti_TPO: { label: "Anti-TPO", unit: "IU/mL" },
            };
            const markers = markerKeys
              .filter((k) => analysis?.[k] !== undefined || raw?.[k] !== undefined)
              .map((k) => {
                const entry = analysis?.[k] ?? {};
                return {
                  key: k,
                  label: markerLabels[k].label,
                  unit: markerLabels[k].unit,
                  value: readValue(entry, raw?.[k]),
                  status: entry?.status ?? "Unknown",
                  severity: entry?.severity,
                  tone: toneFor(entry?.status, entry?.severity),
                };
              });

            const riskLevel: string = displayReport.risk?.level ?? displayReport.risk?.risk ?? "Unknown";
            const riskTone = toneFor(riskLevel);
            const healthScore = displayReport.risk?.score ?? displayReport.risk?.health_score;
            const abnormalTests = markers.filter((m) => m.tone !== "green" && m.tone !== "muted");
            const conditions: any[] = displayReport.possibleConditions ?? [];
            const recs: any[] = displayReport.recommendations ?? [];

            return (
              <>
                {markers.length > 0 && (
                  <section className="relative z-10 px-6 pb-8">
                    <div className="max-w-4xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {markers.map((m) => (
                          <Card key={m.key} className={`bg-white/5 backdrop-blur-sm border-2 transition-all duration-300 ${toneGlow[m.tone]}`}>
                            <CardContent className="p-6 text-center">
                              <h3 className="text-white/70 text-sm mb-2">{m.label}</h3>
                              <p className={`text-4xl font-bold mb-2 ${toneText[m.tone]}`}>{m.value}</p>
                              <p className="text-white/60 text-xs mb-3">{m.unit}</p>
                              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${toneBadge[m.tone]}`}>
                                {m.status}
                                {m.severity && m.severity !== "Normal" ? ` · ${m.severity}` : ""}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                <section className="relative z-10 px-6 pb-12">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {/* Summary sections */}
                    <Card className="bg-white/5 backdrop-blur-sm border-2 border-purple-400/50 transition-all duration-300">
                      <CardContent className="p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20">
                            <FileText className="w-6 h-6 text-purple-300" />
                          </div>
                          <h3 className="text-xl font-bold text-white">AI Analysis Summary</h3>
                        </div>

                        {/* Overall Risk */}
                        <div className="flex items-start gap-4">
                          <Shield className="w-5 h-5 text-purple-300 mt-1 shrink-0" />
                          <div className="flex-1">
                            <p className="text-white/60 text-sm mb-1">Overall Risk</p>
                            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${toneBadge[riskTone]}`}>
                              {riskLevel}
                            </span>
                          </div>
                        </div>

                        {/* Health Score */}
                        {healthScore !== undefined && healthScore !== null && (
                          <div className="flex items-start gap-4">
                            <Heart className="w-5 h-5 text-pink-300 mt-1 shrink-0" />
                            <div className="flex-1">
                              <p className="text-white/60 text-sm mb-1">Health Score</p>
                              <p className="text-2xl font-bold bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                                {healthScore} <span className="text-white/50 text-base font-normal">/ 100</span>
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Abnormal Tests */}
                        <div className="flex items-start gap-4">
                          <FlaskConical className="w-5 h-5 text-blue-300 mt-1 shrink-0" />
                          <div className="flex-1">
                            <p className="text-white/60 text-sm mb-2">Abnormal Tests</p>
                            {abnormalTests.length === 0 ? (
                              <span className={`inline-block px-3 py-1 rounded-full text-sm ${toneBadge.green}`}>None</span>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {abnormalTests.map((m) => (
                                  <span key={m.key} className={`px-3 py-1 rounded-full text-xs font-medium ${toneBadge[m.tone]}`}>
                                    {m.label}: {m.status}{m.severity ? ` (${m.severity})` : ""}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Possible Conditions */}
                        <div className="flex items-start gap-4">
                          <Stethoscope className="w-5 h-5 text-purple-300 mt-1 shrink-0" />
                          <div className="flex-1">
                            <p className="text-white/60 text-sm mb-2">Possible Conditions</p>
                            {conditions.length === 0 ? (
                              <span className={`inline-block px-3 py-1 rounded-full text-sm ${toneBadge.green}`}>
                                No obvious thyroid disorder pattern detected
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {conditions.map((c, i) => {
                                  const name = typeof c === "string" ? c : (c?.name ?? c?.condition ?? JSON.stringify(c));
                                  const sev = typeof c === "object" ? (c?.severity ?? c?.likelihood) : undefined;
                                  const tone = toneFor(undefined, sev) === "muted" ? "orange" : toneFor(undefined, sev);
                                  return (
                                    <span key={i} className={`px-3 py-1.5 rounded-full text-sm font-medium ${toneBadge[tone]}`}>
                                      {name}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Summary text (if backend provides) */}
                        {displayReport.summary && (
                          <div className="flex items-start gap-4 pt-2 border-t border-white/10">
                            <Sparkles className="w-5 h-5 text-pink-300 mt-1 shrink-0" />
                            <p className="text-white/80 leading-relaxed">{displayReport.summary}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 transition-all duration-300">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 rounded-full bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20">
                            <Lightbulb className="w-6 h-6 text-pink-300" />
                          </div>
                          <h3 className="text-xl font-bold text-white">Personalized Recommendations</h3>
                        </div>
                        {recs.length === 0 ? (
                          <p className="text-white/70">No specific recommendations based on the current thyroid profile.</p>
                        ) : (
                          <ol className="space-y-4">
                            {recs.map((rec, index) => {
                              const text = typeof rec === "string" ? rec : (rec?.text ?? rec?.message ?? JSON.stringify(rec));
                              return (
                                <li key={index} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-pink-400/30">
                                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 text-pink-200 text-sm font-semibold shrink-0">
                                    {index + 1}
                                  </span>
                                  <div className="flex items-start gap-2 flex-1">
                                    <CheckCircle className="w-4 h-4 text-pink-300 mt-1 shrink-0" />
                                    <p className="text-white/85 leading-relaxed">{text}</p>
                                  </div>
                                </li>
                              );
                            })}
                          </ol>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </section>
              </>
            );
          })()}

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
                            <span className="text-white/60">TSH: <span className={toneText[toneFor(report.analysis?.TSH?.status, report.analysis?.TSH?.severity)]}>{report.tsh ?? 'N/A'}</span></span>
                            <span className="text-white/60">T3: <span className={toneText[toneFor(report.analysis?.T3?.status, report.analysis?.T3?.severity)]}>{report.t3 ?? 'N/A'}</span></span>
                            <span className="text-white/60">T4: <span className={toneText[toneFor(report.analysis?.T4?.status, report.analysis?.T4?.severity)]}>{report.t4 ?? 'N/A'}</span></span>
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
