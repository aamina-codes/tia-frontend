import { useNavigate } from "react-router-dom";
import { FileText, Upload, Trash2, ArrowRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLabReports } from "@/hooks/useLabReports";
import { StatusBadge } from "@/components/health/StatusBadge";
import { resolveStatus } from "@/components/health/statusUtils";

const Reports = () => {
  const navigate = useNavigate();
  const { reports, deleteReport } = useLabReports();

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-deep-dark-purple relative overflow-hidden">
      <Navigation />
      <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <main className="relative z-10 pt-24 pb-28 px-6">
        <div className="max-w-5xl mx-auto">
          <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">Your lab reports</h1>
              <p className="text-white/60 mt-2 max-w-xl">
                Every report you've analysed with TIA, newest first.
              </p>
            </div>
            <Button
              onClick={() => navigate("/lab-report")}
              className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              <Upload className="w-4 h-4 mr-2" /> Upload lab report
            </Button>
          </header>

          {reports.length === 0 ? (
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardContent className="py-16 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-pink-300" />
                </div>
                <h2 className="text-xl font-semibold text-white">No reports yet</h2>
                <p className="text-white/60 max-w-md">
                  Upload a thyroid lab report (PDF or photo) and TIA will read the values, explain
                  them in plain language and keep them here for comparison over time.
                </p>
                <Button
                  onClick={() => navigate("/lab-report")}
                  className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white mt-2"
                >
                  <Upload className="w-4 h-4 mr-2" /> Upload lab report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id} className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">Report · {formatDate(report.uploadDate)}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {report.tsh !== null && (
                          <StatusBadge status={resolveStatus("TSH", report.tsh, report.tshStatus)} label={`TSH ${report.tsh}`} />
                        )}
                        {report.t3 !== null && (
                          <StatusBadge status={resolveStatus("T3", report.t3, report.t3Status)} label={`T3 ${report.t3}`} />
                        )}
                        {report.t4 !== null && (
                          <StatusBadge status={resolveStatus("T4", report.t4, report.t4Status)} label={`T4 ${report.t4}`} />
                        )}
                      </div>
                      {report.summary && (
                        <p className="text-white/55 text-sm mt-3 line-clamp-2">{report.summary}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        onClick={() => navigate("/lab-report")}
                        className="text-white/80 hover:text-white hover:bg-white/10 rounded-full"
                      >
                        View <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                      <Button
                        variant="ghost"
                        aria-label="Delete report"
                        onClick={() => deleteReport(report.id)}
                        className="text-white/50 hover:text-white hover:bg-white/10 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;
