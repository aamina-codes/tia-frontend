import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, TrendingUp, Plus, Heart, FileText } from "lucide-react";
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import Navigation from "@/components/Navigation";
import { useLabReports } from "@/hooks/useLabReports";

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
  great: "😊", good: "🙂", okay: "😐", low: "😔", bad: "😢"
};

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

    const all = [...dbPoints, ...labPoints].sort((a, b) => a.sortKey - b.sortKey);
    return all;
  }, [entries, reports]);

  const moodEntries = entries.filter(e => e.mood).slice(-5).reverse();
  const noteEntries = entries.filter(e => e.notes).slice(-5).reverse();

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

      <section className="relative z-10 px-6 pb-12">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">Thyroid Health Tracker</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">Monitor your thyroid health trends and track your wellness journey.</p>
        </div>
      </section>

      {/* Graph Section */}
      <section className="relative z-10 px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 hover:border-pink-400 transition-all duration-300 hover:shadow-[0_0_40px_hsl(330,80%,60%,0.5)]">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Health Trends</h3>
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
              
              <div className="bg-white/5 rounded-xl border border-purple-400/30 p-4 h-80">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" fontSize={12} />
                      <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 20, 50, 0.95)', border: '1px solid rgba(236, 72, 153, 0.5)', borderRadius: '8px', color: 'white' }} />
                      <Legend />
                      <Line type="monotone" dataKey="TSH" stroke="#f472b6" strokeWidth={2} dot={{ fill: '#f472b6' }} />
                      <Line type="monotone" dataKey="T3" stroke="#c084fc" strokeWidth={2} dot={{ fill: '#c084fc' }} />
                      <Line type="monotone" dataKey="T4" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="w-16 h-16 text-pink-300 mx-auto mb-4" />
                      <p className="text-white/70 text-lg">Your health trends will appear here</p>
                      <p className="text-white/50 text-sm mt-2">Start by adding your first entry or uploading a lab report</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center space-x-8 mt-6">
                <div className="flex items-center space-x-2"><div className="w-4 h-4 rounded-full bg-pink-400"></div><span className="text-white/80 text-sm">TSH</span></div>
                <div className="flex items-center space-x-2"><div className="w-4 h-4 rounded-full bg-purple-400"></div><span className="text-white/80 text-sm">T3</span></div>
                <div className="flex items-center space-x-2"><div className="w-4 h-4 rounded-full bg-blue-400"></div><span className="text-white/80 text-sm">T4</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mood Log & Health Notes */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 hover:border-pink-400 transition-all duration-300 hover:shadow-[0_0_30px_hsl(330,80%,60%,0.4)]">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20"><Heart className="w-6 h-6 text-pink-300" /></div>
                <h3 className="text-xl font-bold text-white">Mood Log</h3>
              </div>
              <p className="text-white/70 mb-4">Track how you're feeling each day</p>
              <div className="space-y-2">
                {moodEntries.length > 0 ? moodEntries.map((entry) => (
                  <div key={entry.id} className="p-3 bg-white/5 rounded-lg border border-pink-400/20 hover:border-pink-400/50 transition-all">
                    <div className="flex justify-between items-center">
                      <p className="text-white/80 text-sm">{moodEmojis[entry.mood!] || "😊"} {entry.mood?.charAt(0).toUpperCase()}{entry.mood?.slice(1)}</p>
                      <span className="text-white/50 text-xs">{format(new Date(entry.date), 'MMM dd')}</span>
                    </div>
                  </div>
                )) : <div className="p-3 bg-white/5 rounded-lg border border-pink-400/20 text-white/50 text-sm">No mood entries yet</div>}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-2 border-purple-400/50 hover:border-purple-400 transition-all duration-300 hover:shadow-[0_0_30px_hsl(280,80%,60%,0.4)]">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20"><FileText className="w-6 h-6 text-purple-300" /></div>
                <h3 className="text-xl font-bold text-white">Health Notes</h3>
              </div>
              <p className="text-white/70 mb-4">Recent observations and symptoms</p>
              <div className="space-y-2">
                {noteEntries.length > 0 ? noteEntries.map((entry) => (
                  <div key={entry.id} className="p-3 bg-white/5 rounded-lg border border-purple-400/20 hover:border-purple-400/50 transition-all">
                    <p className="text-white/80 text-sm line-clamp-2">{entry.notes}</p>
                    <span className="text-white/50 text-xs">{format(new Date(entry.date), 'MMM dd')}</span>
                  </div>
                )) : <div className="p-3 bg-white/5 rounded-lg border border-purple-400/20 text-white/50 text-sm">No notes yet</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HealthTracker;
