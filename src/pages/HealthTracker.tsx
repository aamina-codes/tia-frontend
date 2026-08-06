import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus, Plus, Heart, FileText, Trash2,
  Activity, CalendarClock, FlaskConical, Sparkles, Battery, StickyNote,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceArea, Dot,
} from "recharts";
import { format, formatDistanceToNow } from "date-fns";
import Navigation from "@/components/Navigation";
import { useLabReports } from "@/hooks/useLabReports";
import { MARKER_RANGES } from "@/components/health/statusUtils";

interface HealthEntry {
  id: string;
  date: string;
  tsh_level: number | null;
  t3_level: number | null;
  t4_level: number | null;
  mood: string | null;
  energy_level: number | null;
  notes: string | null;
  created_at: string;
}

const moodEmojis: Record<string, string> = {
  great: "😊", good: "🙂", okay: "😐", low: "😔", bad: "😢",
};

const moodTone: Record<string, string> = {
  great: "from-emerald-400/30 to-emerald-500/10 border-emerald-400/40 text-emerald-200",
  good: "from-pink-400/30 to-purple-500/10 border-pink-400/40 text-pink-200",
  okay: "from-yellow-400/25 to-amber-500/10 border-yellow-400/40 text-yellow-200",
  low: "from-orange-400/25 to-orange-500/10 border-orange-400/40 text-orange-200",
  bad: "from-red-400/25 to-red-500/10 border-red-400/40 text-red-200",
};

const TSH = MARKER_RANGES.TSH;

const isAbnormal = (key: "TSH" | "T3" | "T4", v: number | null | undefined) => {
  if (v === null || v === undefined) return false;
  const r = MARKER_RANGES[key];
  return v < r.min || v > r.max;
};

const SERIES = [
  { key: "TSH" as const, color: "#f472b6", label: "TSH", unit: MARKER_RANGES.TSH.unit },
  { key: "T3" as const, color: "#c084fc", label: "T3", unit: MARKER_RANGES.T3.unit },
  { key: "T4" as const, color: "#60a5fa", label: "T4", unit: MARKER_RANGES.T4.unit },
];

// Dot that turns red when the value falls outside the reference range
const SmartDot = (props: any) => {
  const { cx, cy, value, dataKey, stroke } = props;
  if (cx === undefined || cy === undefined || value === null || value === undefined) return null;
  const bad = isAbnormal(dataKey, value);
  return (
    <Dot
      cx={cx}
      cy={cy}
      r={bad ? 5 : 3.5}
      fill={bad ? "#ef4444" : stroke}
      stroke={bad ? "#fca5a5" : "rgba(255,255,255,0.6)"}
      strokeWidth={bad ? 2 : 1}
    />
  );
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-pink-400/40 bg-[#1a0b2e]/95 backdrop-blur-md px-4 py-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]">
      <p className="text-white/60 text-[11px] uppercase tracking-wider mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload
          .filter((p: any) => p.value !== null && p.value !== undefined)
          .map((p: any) => {
            const bad = isAbnormal(p.dataKey, p.value);
            const r = MARKER_RANGES[p.dataKey as "TSH" | "T3" | "T4"];
            return (
              <div key={p.dataKey} className="flex items-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                <span className="text-white/80 font-medium">{p.dataKey}</span>
                <span className="text-white font-bold">{p.value}</span>
                <span className="text-white/40 text-[11px]">{r.unit}</span>
                <span
                  className={`ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    bad ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {bad ? "Out of range" : "Normal"}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
};

const KpiCard = ({
  icon: Icon, label, value, sub, accent, delay,
}: {
  icon: React.ElementType; label: string; value: string; sub?: React.ReactNode; accent: string; delay: number;
}) => (
  <Card
    className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-pink-400/50 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_hsl(330,80%,60%,0.25)] animate-fade-in"
    style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
  >
    <CardContent className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className={`p-1.5 rounded-lg bg-gradient-to-br ${accent}`}>
          <Icon className="w-4 h-4 text-white" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white leading-none">{value}</p>
      {sub && <div className="mt-2 text-xs text-white/60">{sub}</div>}
    </CardContent>
  </Card>
);

const HealthTracker = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { reports } = useLabReports();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    tsh_level: "", t3_level: "", t4_level: "", mood: "", energy_level: "", notes: ""
  });

  const fetchEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from('health_tracker').select('*').eq('user_id', user.id).order('date', { ascending: true });
    if (!error && data) setEntries(data);
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleDeleteEntry = async (id: string) => {
    const { error } = await supabase.from('health_tracker').delete().eq('id', id);
    if (!error) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast({ title: "Entry removed", description: "Health entry has been deleted." });
    } else {
      toast({ title: "Error", description: "Failed to delete entry.", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Please sign in", description: "You need to be signed in to add health entries.", variant: "destructive" }); navigate('/auth'); return; }
      const { error } = await supabase.from('health_tracker').insert({
        user_id: user.id, date: formData.date,
        tsh_level: formData.tsh_level ? parseFloat(formData.tsh_level) : null,
        t3_level: formData.t3_level ? parseFloat(formData.t3_level) : null,
        t4_level: formData.t4_level ? parseFloat(formData.t4_level) : null,
        mood: formData.mood || null, energy_level: formData.energy_level ? parseInt(formData.energy_level) : null, notes: formData.notes || null
      });
      if (error) throw error;
      toast({ title: "Entry added!", description: "Your health data has been saved successfully." });
      setFormData({ date: new Date().toISOString().split('T')[0], tsh_level: "", t3_level: "", t4_level: "", mood: "", energy_level: "", notes: "" });
      setIsOpen(false);
      fetchEntries();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save entry.", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  // Merge DB entries with lab reports for chart data
  const chartData = useMemo(() => {
    const dbPoints = entries.map(entry => ({
      date: format(new Date(entry.date), 'MMM dd'),
      sortKey: new Date(entry.date).getTime(),
      TSH: entry.tsh_level, T3: entry.t3_level, T4: entry.t4_level
    }));

    const labPoints = reports
      .filter(r => r.tsh !== null || r.t3 !== null || r.t4 !== null)
      .map(r => ({
        date: format(new Date(r.uploadDate), 'MMM dd'),
        sortKey: new Date(r.uploadDate).getTime(),
        TSH: r.tsh, T3: r.t3, T4: r.t4
      }));

    return [...dbPoints, ...labPoints].sort((a, b) => a.sortKey - b.sortKey);
  }, [entries, reports]);

  // ── KPIs ────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const tshSeries = chartData
      .filter((p) => p.TSH !== null && p.TSH !== undefined)
      .map((p) => ({ value: Number(p.TSH), sortKey: p.sortKey, date: p.date }));

    const latest = tshSeries.length ? tshSeries[tshSeries.length - 1] : null;
    const previous = tshSeries.length > 1 ? tshSeries[tshSeries.length - 2] : null;
    const avg = tshSeries.length
      ? tshSeries.reduce((s, p) => s + p.value, 0) / tshSeries.length
      : null;

    const lastTimestamps = [
      ...entries.map((e) => new Date(e.date).getTime()),
      ...reports.map((r) => new Date(r.uploadDate).getTime()),
    ].filter((t) => !Number.isNaN(t));
    const lastUpdated = lastTimestamps.length ? new Date(Math.max(...lastTimestamps)) : null;

    return { tshSeries, latest, previous, avg, lastUpdated };
  }, [chartData, entries, reports]);

  const tshDelta =
    kpis.latest && kpis.previous ? kpis.latest.value - kpis.previous.value : null;

  // ── AI trend summary (rule-based, plain language) ───────────────────────
  const trendSummary = useMemo(() => {
    const s = kpis.tshSeries;
    if (s.length === 0) return null;
    const lines: string[] = [];
    const latest = s[s.length - 1].value;
    const inRange = latest >= TSH.min && latest <= TSH.max;

    lines.push(
      inRange
        ? `Your most recent TSH is ${latest} ${TSH.unit}, comfortably inside the typical reference range of ${TSH.min}–${TSH.max}.`
        : `Your most recent TSH is ${latest} ${TSH.unit}, which sits ${latest > TSH.max ? "above" : "below"} the typical range of ${TSH.min}–${TSH.max}.`
    );

    if (s.length > 1) {
      const first = s[0].value;
      const diff = latest - first;
      const pct = first !== 0 ? Math.abs(diff / first) * 100 : 0;
      if (pct < 5) {
        lines.push(`Across your last ${s.length} readings the level has stayed steady — a good sign of stability.`);
      } else if (diff < 0) {
        lines.push(`Compared with your earliest reading it has come down by ${Math.abs(diff).toFixed(2)} (${pct.toFixed(0)}%), so the overall direction is downward.`);
      } else {
        lines.push(`Compared with your earliest reading it has risen by ${diff.toFixed(2)} (${pct.toFixed(0)}%), so the overall direction is upward.`);
      }
    } else {
      lines.push(`Add a few more readings and TIA can describe how your levels are moving over time.`);
    }

    const outOfRange = s.filter((p) => p.value < TSH.min || p.value > TSH.max).length;
    if (outOfRange > 0) {
      lines.push(`${outOfRange} of ${s.length} readings fell outside the reference band — worth mentioning at your next check-up.`);
    }

    lines.push(`This is educational information only, not a diagnosis.`);
    return lines;
  }, [kpis.tshSeries]);

  const moodEntries = entries.filter(e => e.mood).slice(-6).reverse();
  const noteEntries = entries.filter(e => e.notes).slice(-6).reverse();

  const DeltaPill = () => {
    if (tshDelta === null) return <span className="text-white/40">No previous reading</span>;
    const flat = Math.abs(tshDelta) < 0.05;
    const Icon = flat ? Minus : tshDelta > 0 ? TrendingUp : TrendingDown;
    const cls = flat ? "text-white/60" : tshDelta > 0 ? "text-orange-300" : "text-emerald-300";
    return (
      <span className={`inline-flex items-center gap-1 font-semibold ${cls}`}>
        <Icon className="w-3.5 h-3.5" />
        {flat ? "Stable" : `${tshDelta > 0 ? "+" : ""}${tshDelta.toFixed(2)} vs previous`}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-deep-dark-purple relative overflow-hidden">
      <Navigation />
      <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 pt-24 px-6">
        <Button variant="ghost" onClick={() => navigate('/explore')} className="text-white hover:bg-white/10 transition-colors mb-8 focus:outline-none focus:ring-0">
          <ArrowLeft className="w-5 h-5 mr-2" />Back
        </Button>
      </div>

      <section className="relative z-10 px-6 pb-10">
        <div className="max-w-6xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">Thyroid Health Tracker</h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">Monitor your thyroid trends and wellness journey in one clear view.</p>
        </div>
      </section>

      {/* ── KPI summary cards ───────────────────────────────────────────── */}
      <section className="relative z-10 px-6 pb-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={Activity}
            label="Latest TSH"
            value={kpis.latest ? `${kpis.latest.value}` : "—"}
            sub={kpis.latest ? <DeltaPill /> : "Awaiting first reading"}
            accent="from-pink-500 to-rose-500"
            delay={0}
          />
          <KpiCard
            icon={TrendingUp}
            label="Average TSH"
            value={kpis.avg !== null ? kpis.avg.toFixed(2) : "—"}
            sub={kpis.avg !== null ? `Across ${kpis.tshSeries.length} reading${kpis.tshSeries.length === 1 ? "" : "s"}` : "No data yet"}
            accent="from-purple-500 to-fuchsia-500"
            delay={60}
          />
          <KpiCard
            icon={FlaskConical}
            label="Reports Uploaded"
            value={`${reports.length}`}
            sub={`${entries.length} manual entr${entries.length === 1 ? "y" : "ies"}`}
            accent="from-blue-500 to-indigo-500"
            delay={120}
          />
          <KpiCard
            icon={CalendarClock}
            label="Last Updated"
            value={kpis.lastUpdated ? format(kpis.lastUpdated, "MMM dd") : "—"}
            sub={kpis.lastUpdated ? `${formatDistanceToNow(kpis.lastUpdated, { addSuffix: true })}` : "Nothing logged yet"}
            accent="from-emerald-500 to-teal-500"
            delay={180}
          />
        </div>
      </section>

      {/* ── Trend graph ─────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border border-pink-400/30 rounded-3xl hover:border-pink-400/60 transition-all duration-300 hover:shadow-[0_0_45px_hsl(330,80%,60%,0.28)]">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Health Trends</h3>
                  <p className="text-white/50 text-sm mt-1">Shaded bands show the typical reference range for each marker.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full shadow-[0_0_20px_hsl(330,80%,50%,0.4)] hover:shadow-[0_0_30px_hsl(330,80%,50%,0.6)] transition-all duration-300">
                      <Plus className="w-4 h-4 mr-2" />Add Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-deep-dark-purple border-pink-400/50 text-white max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">Add Health Entry</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                      <div><Label className="text-white/80">Date</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="bg-white/10 border-pink-400/30 text-white focus:border-pink-400" /></div>
                      <div className="grid grid-cols-3 gap-3">
                        <div><Label className="text-white/80">TSH (mIU/L)</Label><Input type="number" step="0.01" placeholder="e.g., 2.5" value={formData.tsh_level} onChange={(e) => setFormData({ ...formData, tsh_level: e.target.value })} className="bg-white/10 border-pink-400/30 text-white placeholder:text-white/40 focus:border-pink-400" /></div>
                        <div><Label className="text-white/80">T3 (ng/dL)</Label><Input type="number" step="0.01" placeholder="e.g., 120" value={formData.t3_level} onChange={(e) => setFormData({ ...formData, t3_level: e.target.value })} className="bg-white/10 border-purple-400/30 text-white placeholder:text-white/40 focus:border-purple-400" /></div>
                        <div><Label className="text-white/80">T4 (μg/dL)</Label><Input type="number" step="0.01" placeholder="e.g., 8.0" value={formData.t4_level} onChange={(e) => setFormData({ ...formData, t4_level: e.target.value })} className="bg-white/10 border-blue-400/30 text-white placeholder:text-white/40 focus:border-blue-400" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label className="text-white/80">Mood</Label>
                          <Select value={formData.mood} onValueChange={(value) => setFormData({ ...formData, mood: value })}>
                            <SelectTrigger className="bg-white/10 border-pink-400/30 text-white focus:border-pink-400"><SelectValue placeholder="Select mood" /></SelectTrigger>
                            <SelectContent className="bg-deep-dark-purple border-pink-400/30">
                              <SelectItem value="great">😊 Great</SelectItem><SelectItem value="good">🙂 Good</SelectItem><SelectItem value="okay">😐 Okay</SelectItem><SelectItem value="low">😔 Low</SelectItem><SelectItem value="bad">😢 Bad</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div><Label className="text-white/80">Energy (1-10)</Label>
                          <Select value={formData.energy_level} onValueChange={(value) => setFormData({ ...formData, energy_level: value })}>
                            <SelectTrigger className="bg-white/10 border-purple-400/30 text-white focus:border-purple-400"><SelectValue placeholder="Select level" /></SelectTrigger>
                            <SelectContent className="bg-deep-dark-purple border-purple-400/30">
                              {[1,2,3,4,5,6,7,8,9,10].map((num) => (<SelectItem key={num} value={num.toString()}>{num}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div><Label className="text-white/80">Notes</Label><Textarea placeholder="Any symptoms or observations..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="bg-white/10 border-pink-400/30 text-white placeholder:text-white/40 focus:border-pink-400 min-h-[80px]" /></div>
                      <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full shadow-[0_0_20px_hsl(330,80%,50%,0.4)] hover:shadow-[0_0_30px_hsl(330,80%,50%,0.6)] transition-all duration-300">
                        {isLoading ? "Saving..." : "Save Entry"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4">
                {SERIES.map((s) => (
                  <div key={s.key} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                    <span className="text-white/80 text-sm font-medium">{s.label}</span>
                    <span className="text-white/35 text-xs">
                      {MARKER_RANGES[s.key].min}–{MARKER_RANGES[s.key].max} {s.unit}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-300/50" />
                  <span className="text-white/60 text-xs">Out of range</span>
                </div>
              </div>

              <div className="bg-white/[0.03] rounded-2xl border border-purple-400/25 p-4 h-[360px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
                      <defs>
                        {SERIES.map((s) => (
                          <linearGradient key={s.key} id={`glow-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={s.color} stopOpacity={0.9} />
                            <stop offset="100%" stopColor={s.color} stopOpacity={0.4} />
                          </linearGradient>
                        ))}
                      </defs>

                      {/* Reference range bands */}
                      <ReferenceArea y1={MARKER_RANGES.T3.min} y2={MARKER_RANGES.T3.max} fill="#c084fc" fillOpacity={0.07} strokeOpacity={0} />
                      <ReferenceArea y1={MARKER_RANGES.T4.min} y2={MARKER_RANGES.T4.max} fill="#60a5fa" fillOpacity={0.08} strokeOpacity={0} />
                      <ReferenceArea y1={MARKER_RANGES.TSH.min} y2={MARKER_RANGES.TSH.max} fill="#34d399" fillOpacity={0.12} strokeOpacity={0} />

                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.45)" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                      <YAxis stroke="rgba(255,255,255,0.45)" fontSize={11} tickLine={false} axisLine={false} width={44} />
                      <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(244,114,182,0.35)", strokeWidth: 1.5 }} />

                      {SERIES.map((s) => (
                        <Line
                          key={s.key}
                          type="monotone"
                          dataKey={s.key}
                          stroke={s.color}
                          strokeWidth={2.5}
                          connectNulls
                          dot={<SmartDot />}
                          activeDot={{ r: 6, strokeWidth: 2, stroke: "rgba(255,255,255,0.8)" }}
                          animationDuration={900}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-8 h-8 text-pink-300" />
                      </div>
                      <p className="text-white/70 text-lg font-medium">Your health trends will appear here</p>
                      <p className="text-white/45 text-sm mt-2">Add your first entry or upload a lab report to begin</p>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Trend Summary */}
              {trendSummary && (
                <div className="mt-6 rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent p-5 animate-fade-in">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="p-1.5 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600">
                      <Sparkles className="w-4 h-4 text-white" />
                    </span>
                    <h4 className="text-sm font-bold text-white uppercase tracking-[0.12em]">AI Trend Summary</h4>
                  </div>
                  <div className="space-y-2">
                    {trendSummary.map((line, i) => (
                      <p key={i} className="text-white/75 text-sm leading-relaxed">{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Entry list with delete */}
              {entries.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-white/50 text-[11px] uppercase tracking-[0.12em] font-semibold mb-3">All Entries</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {[...entries].reverse().map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-pink-400/15 hover:border-pink-400/40 transition-all">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
                            <span className="text-white/45">{format(new Date(entry.date), 'MMM dd, yyyy')}</span>
                            {entry.tsh_level !== null && (
                              <span className={isAbnormal("TSH", entry.tsh_level) ? "text-red-300 font-semibold" : ""}>TSH: {entry.tsh_level}</span>
                            )}
                            {entry.t3_level !== null && (
                              <span className={isAbnormal("T3", entry.t3_level) ? "text-red-300 font-semibold" : ""}>T3: {entry.t3_level}</span>
                            )}
                            {entry.t4_level !== null && (
                              <span className={isAbnormal("T4", entry.t4_level) ? "text-red-300 font-semibold" : ""}>T4: {entry.t4_level}</span>
                            )}
                            {entry.mood && <span>{moodEmojis[entry.mood] || ''} {entry.mood}</span>}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-white/40 hover:text-red-400 hover:bg-red-400/10 ml-2 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Mood Log & Health Notes ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mood Log */}
          <Card className="bg-white/5 backdrop-blur-sm border border-pink-400/30 rounded-3xl hover:border-pink-400/60 transition-all duration-300 hover:shadow-[0_0_30px_hsl(330,80%,60%,0.25)]">
            <CardContent className="p-6 md:p-7">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/25 to-purple-500/20"><Heart className="w-5 h-5 text-pink-300" /></div>
                <h3 className="text-xl font-bold text-white">Mood Log</h3>
                <span className="ml-auto text-xs text-white/40">{moodEntries.length} recent</span>
              </div>
              <p className="text-white/50 text-sm mb-5 pl-1">How you've been feeling day to day</p>

              {moodEntries.length > 0 ? (
                <div className="relative pl-6">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-pink-400/50 via-purple-400/30 to-transparent" />
                  <div className="space-y-3">
                    {moodEntries.map((entry) => (
                      <div key={entry.id} className="relative">
                        <span className="absolute -left-[22px] top-4 w-3 h-3 rounded-full bg-pink-400 ring-4 ring-pink-400/15" />
                        <div className={`rounded-xl border bg-gradient-to-r p-3.5 transition-transform duration-200 hover:translate-x-0.5 ${moodTone[entry.mood!] ?? moodTone.good}`}>
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold flex items-center gap-2">
                              <span className="text-lg leading-none">{moodEmojis[entry.mood!] || "😊"}</span>
                              {entry.mood!.charAt(0).toUpperCase() + entry.mood!.slice(1)}
                            </p>
                            <span className="text-white/45 text-xs">{format(new Date(entry.date), 'MMM dd')}</span>
                          </div>
                          {entry.energy_level !== null && (
                            <div className="mt-2.5 flex items-center gap-2">
                              <Battery className="w-3.5 h-3.5 text-white/50" />
                              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-700"
                                  style={{ width: `${(entry.energy_level / 10) * 100}%` }}
                                />
                              </div>
                              <span className="text-white/55 text-[11px] font-semibold">{entry.energy_level}/10</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 rounded-2xl border border-dashed border-pink-400/25 bg-white/[0.03]">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 text-pink-300" />
                  </div>
                  <p className="text-white/70 text-sm font-medium">No mood entries yet</p>
                  <p className="text-white/40 text-xs mt-1">Log how you feel to spot patterns over time</p>
                  <Button size="sm" onClick={() => setIsOpen(true)} className="mt-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full">
                    <Plus className="w-3.5 h-3.5 mr-1.5" />Log mood
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Health Notes */}
          <Card className="bg-white/5 backdrop-blur-sm border border-purple-400/30 rounded-3xl hover:border-purple-400/60 transition-all duration-300 hover:shadow-[0_0_30px_hsl(280,80%,60%,0.25)]">
            <CardContent className="p-6 md:p-7">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/25 to-blue-500/20"><FileText className="w-5 h-5 text-purple-300" /></div>
                <h3 className="text-xl font-bold text-white">Health Notes</h3>
                <span className="ml-auto text-xs text-white/40">{noteEntries.length} recent</span>
              </div>
              <p className="text-white/50 text-sm mb-5 pl-1">Observations and symptoms you've recorded</p>

              {noteEntries.length > 0 ? (
                <div className="relative pl-6">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-purple-400/50 via-blue-400/30 to-transparent" />
                  <div className="space-y-3">
                    {noteEntries.map((entry) => (
                      <div key={entry.id} className="relative">
                        <span className="absolute -left-[22px] top-4 w-3 h-3 rounded-full bg-purple-400 ring-4 ring-purple-400/15" />
                        <div className="rounded-xl border border-purple-400/25 bg-white/5 p-3.5 hover:bg-white/[0.08] transition-colors">
                          <div className="flex items-start gap-2.5">
                            <StickyNote className="w-4 h-4 text-purple-300 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-white/85 text-sm leading-relaxed">{entry.notes}</p>
                              <span className="text-white/40 text-xs mt-2 block">{format(new Date(entry.date), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 rounded-2xl border border-dashed border-purple-400/25 bg-white/[0.03]">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-3">
                    <StickyNote className="w-6 h-6 text-purple-300" />
                  </div>
                  <p className="text-white/70 text-sm font-medium">No notes yet</p>
                  <p className="text-white/40 text-xs mt-1">Jot down symptoms to give context to your numbers</p>
                  <Button size="sm" onClick={() => setIsOpen(true)} className="mt-4 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-full">
                    <Plus className="w-3.5 h-3.5 mr-1.5" />Add note
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HealthTracker;
