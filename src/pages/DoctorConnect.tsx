import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft, Upload, Share2, FileText, Trash2, Loader2, Search, Star,
  MapPin, Stethoscope, CalendarDays, Clock, ShieldCheck, Video, Building2, Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  report_name: string;
  report_type: string;
  created_at: string;
  report_url: string | null;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  city: string;
  experience: number;
  rating: number;
  reviews: number;
  fee: number;
  mode: "Online" | "In-person" | "Both";
  availability: string;
  slots: string[];
  initials: string;
}

const DOCTORS: Doctor[] = [
  { id: "d1", name: "Dr. Sarah Johnson", specialization: "Endocrinologist", hospital: "Apollo Speciality Hospital", city: "Chennai", experience: 14, rating: 4.9, reviews: 312, fee: 900, mode: "Both", availability: "Available today", slots: ["10:00 AM", "11:30 AM", "4:00 PM"], initials: "SJ" },
  { id: "d2", name: "Dr. Rahul Menon", specialization: "Thyroid Specialist", hospital: "Fortis Malar", city: "Bengaluru", experience: 9, rating: 4.7, reviews: 188, fee: 700, mode: "Online", availability: "Next slot tomorrow", slots: ["9:15 AM", "1:00 PM", "6:30 PM"], initials: "RM" },
  { id: "d3", name: "Dr. Ananya Rao", specialization: "Endocrinologist", hospital: "Manipal Hospitals", city: "Bengaluru", experience: 18, rating: 4.8, reviews: 460, fee: 1200, mode: "In-person", availability: "Available today", slots: ["12:00 PM", "3:30 PM"], initials: "AR" },
  { id: "d4", name: "Dr. Kavya Iyer", specialization: "General Physician", hospital: "Kauvery Hospital", city: "Vellore", experience: 6, rating: 4.6, reviews: 97, fee: 450, mode: "Both", availability: "Available today", slots: ["8:30 AM", "2:00 PM", "5:15 PM"], initials: "KI" },
  { id: "d5", name: "Dr. Imran Qureshi", specialization: "Nutritionist", hospital: "TIA Care Network", city: "Online", experience: 11, rating: 4.5, reviews: 145, fee: 500, mode: "Online", availability: "Next slot in 2 days", slots: ["11:00 AM", "7:00 PM"], initials: "IQ" },
  { id: "d6", name: "Dr. Meera Nair", specialization: "Thyroid Specialist", hospital: "AIIMS Delhi", city: "New Delhi", experience: 22, rating: 5.0, reviews: 720, fee: 1500, mode: "Both", availability: "Waitlist open", slots: ["10:45 AM", "4:45 PM"], initials: "MN" },
];

const SPECIALITIES = ["All", "Endocrinologist", "Thyroid Specialist", "General Physician", "Nutritionist"];
const MODES = ["All", "Online", "In-person"];

const DoctorConnect = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [speciality, setSpeciality] = useState("All");
  const [mode, setMode] = useState("All");
  const [booking, setBooking] = useState<Doctor | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [attach, setAttach] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const fetchReports = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("lab_reports")
      .select("id, report_name, report_type, created_at, report_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setReports(data);
  };

  useEffect(() => { fetchReports(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }

      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("lab-reports").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("lab-reports").getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("lab_reports").insert({
        user_id: user.id,
        report_name: file.name,
        report_type: file.type.includes("pdf") ? "pdf" : "image",
        report_url: urlData.publicUrl,
        file_size: file.size,
      });
      if (dbError) throw dbError;

      toast({ title: "Report uploaded!", description: file.name });
      fetchReports();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const { error } = await supabase.from("lab_reports").delete().eq("id", id);
    if (!error) {
      setReports((prev) => prev.filter((r) => r.id !== id));
      setAttach((prev) => prev.filter((x) => x !== id));
      toast({ title: "Report deleted", description: name });
    } else {
      toast({ title: "Error", description: "Failed to delete report.", variant: "destructive" });
    }
  };

  const filtered = useMemo(() => {
    return DOCTORS.filter((d) => {
      const q = query.trim().toLowerCase();
      const matchesQuery = !q ||
        d.name.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.hospital.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q);
      const matchesSpec = speciality === "All" || d.specialization === speciality;
      const matchesMode = mode === "All" || d.mode === mode || d.mode === "Both";
      return matchesQuery && matchesSpec && matchesMode;
    });
  }, [query, speciality, mode]);

  const openBooking = (d: Doctor) => {
    setBooking(d);
    setSlot(d.slots[0] ?? null);
    setAttach(reports.slice(0, 1).map((r) => r.id));
    setNote("");
  };

  const confirmBooking = () => {
    if (!booking || !slot) return;
    toast({
      title: "Appointment requested",
      description: `${booking.name} • ${slot}${attach.length ? ` • ${attach.length} report(s) shared securely` : ""}`,
    });
    setBooking(null);
  };

  const toggleAttach = (id: string) =>
    setAttach((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="min-h-screen bg-deep-dark-purple relative overflow-hidden">
      <Navigation />

      <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 pt-24 px-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/explore')}
          className="text-white hover:bg-white/10 transition-colors mb-6 focus:outline-none focus:ring-0"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      </div>

      {/* Header */}
      <section className="relative z-10 px-6 pb-8">
        <div className="max-w-6xl mx-auto text-center animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Doctor Connect
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Find a thyroid specialist, book a consultation, and securely share your reports before the visit.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-white/70 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            Documents are shared privately from your encrypted TIA account
          </div>
        </div>
      </section>

      {/* Search & filters */}
      <section className="relative z-10 px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-5 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by doctor, specialization, hospital or city"
                  className="pl-11 h-12 bg-white/10 border-white/15 text-white placeholder:text-white/45 rounded-full focus-visible:ring-pink-400/50"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {SPECIALITIES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeciality(s)}
                    className={`px-4 py-1.5 rounded-full text-sm transition-all border ${
                      speciality === s
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent shadow-[0_0_18px_hsl(330,80%,50%,0.35)]"
                        : "bg-white/5 text-white/70 border-white/10 hover:border-pink-400/50 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <span className="mx-1 h-5 w-px bg-white/15 hidden sm:block" />
                {MODES.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-4 py-1.5 rounded-full text-sm transition-all border ${
                      mode === m
                        ? "bg-white/15 text-white border-purple-400/60"
                        : "bg-white/5 text-white/70 border-white/10 hover:border-purple-400/50 hover:text-white"
                    }`}
                  >
                    {m === "All" ? "Any mode" : m}
                  </button>
                ))}
              </div>
              <p className="text-white/50 text-sm">{filtered.length} specialist{filtered.length === 1 ? "" : "s"} available</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Doctor cards */}
      <section className="relative z-10 px-6 pb-12">
        <div className="max-w-6xl mx-auto grid gap-5 md:grid-cols-2">
          {filtered.map((d, i) => (
            <Card
              key={d.id}
              style={{ animationDelay: `${i * 60}ms` }}
              className="animate-fadeIn bg-white/5 backdrop-blur-sm border border-white/10 hover:border-pink-400/60 transition-all duration-300 hover:shadow-[0_0_40px_hsl(330,80%,60%,0.25)] hover:-translate-y-0.5"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/40 to-purple-600/40 border border-white/15 flex items-center justify-center text-white text-xl font-semibold">
                      {d.initials}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#1E003D] flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#1E003D]" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-white truncate">{d.name}</h3>
                        <p className="text-pink-300 text-sm flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5" /> {d.specialization}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-sm bg-white/10 rounded-full px-2.5 py-1 flex-shrink-0">
                        <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        <span className="text-white font-semibold">{d.rating}</span>
                        <span className="text-white/50 text-xs">({d.reviews})</span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-white/70">
                      <span className="flex items-center gap-1.5 truncate"><Building2 className="w-3.5 h-3.5 text-purple-300" />{d.hospital}</span>
                      <span className="flex items-center gap-1.5 truncate"><MapPin className="w-3.5 h-3.5 text-purple-300" />{d.city}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-purple-300" />{d.experience} yrs exp</span>
                      <span className="flex items-center gap-1.5">
                        {d.mode === "In-person"
                          ? <Building2 className="w-3.5 h-3.5 text-purple-300" />
                          : <Video className="w-3.5 h-3.5 text-purple-300" />}
                        {d.mode} consult
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full border ${
                        d.availability.includes("today")
                          ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/30"
                          : "bg-amber-400/10 text-amber-200 border-amber-400/30"
                      }`}>
                        {d.availability}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/70 border border-white/10">
                        ₹{d.fee} consultation
                      </span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={() => openBooking(d)}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full shadow-[0_0_20px_hsl(330,80%,50%,0.35)] hover:shadow-[0_0_30px_hsl(330,80%,50%,0.55)] transition-all"
                      >
                        <CalendarDays className="w-4 h-4 mr-2" />
                        Book appointment
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => toast({ title: "Profile coming soon", description: d.name })}
                        className="rounded-full text-white/70 hover:text-white hover:bg-white/10 border border-white/10"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <Card className="md:col-span-2 bg-white/5 border border-white/10">
              <CardContent className="p-10 text-center text-white/60">
                No specialists match your search. Try clearing the filters.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Secure document sharing */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-6xl mx-auto grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2 bg-white/5 backdrop-blur-sm border-2 border-pink-400/40 hover:border-pink-400 transition-all duration-300">
            <CardContent className="p-7">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                  <ShieldCheck className="w-7 h-7 text-pink-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Secure document sharing</h3>
                  <p className="text-white/60 text-sm">Send reports to your doctor before the appointment</p>
                </div>
              </div>

              <div className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-1">
                {reports.length > 0 ? reports.map((r) => (
                  <div key={r.id} className="bg-white/5 rounded-xl p-4 border border-pink-400/25 hover:border-pink-400/50 transition-all">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-white/5">
                          <FileText className="w-4 h-4 text-pink-300" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{r.report_name}</p>
                          <p className="text-white/50 text-xs">{r.report_type} • {new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => toast({ title: "Report shared securely", description: r.report_name })}
                          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(r.id, r.report_name)}
                          className="text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="bg-white/5 rounded-xl p-8 border border-dashed border-pink-400/30 text-center">
                    <FileText className="w-8 h-8 text-pink-300/60 mx-auto mb-2" />
                    <p className="text-white/60 text-sm">No reports yet — upload one to share with your doctor.</p>
                  </div>
                )}
              </div>

              <label className="block">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full shadow-[0_0_20px_hsl(330,80%,50%,0.4)] hover:shadow-[0_0_30px_hsl(330,80%,50%,0.6)] transition-all duration-300 py-2.5 px-4 cursor-pointer font-medium text-sm">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {uploading ? "Uploading..." : "Upload New Report"}
                </div>
              </label>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-2 border-purple-400/40 hover:border-purple-400 transition-all duration-300">
            <CardContent className="p-7">
              <div className="flex items-center space-x-3 mb-5">
                <div className="p-3 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                  <Share2 className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Message your doctor</h3>
                  <p className="text-white/60 text-sm">Ask a question before your visit</p>
                </div>
              </div>

              <Textarea
                placeholder="Type your message or questions here..."
                className="bg-white/10 border-purple-400/25 text-white placeholder:text-white/45 min-h-40 mb-4 focus:border-purple-400 transition-all"
              />

              <Button
                onClick={() => toast({ title: "Message sent", description: "Your care team will respond shortly." })}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-full shadow-[0_0_20px_hsl(280,80%,50%,0.4)] hover:shadow-[0_0_30px_hsl(280,80%,50%,0.6)] transition-all duration-300"
              >
                Send message
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Booking dialog */}
      <Dialog open={!!booking} onOpenChange={(o) => !o && setBooking(null)}>
        <DialogContent className="bg-[#25064a] border border-purple-400/30 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Book appointment</DialogTitle>
            <DialogDescription className="text-white/60">
              {booking && `${booking.name} • ${booking.specialization} • ${booking.hospital}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <p className="text-sm text-white/70 mb-2">Choose a slot</p>
              <div className="flex flex-wrap gap-2">
                {booking?.slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={`px-4 py-2 rounded-full text-sm border transition-all ${
                      slot === s
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 border-transparent text-white"
                        : "bg-white/5 border-white/15 text-white/70 hover:border-pink-400/50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-white/70 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-300" /> Share reports securely
              </p>
              {reports.length ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {reports.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => toggleAttach(r.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                        attach.includes(r.id)
                          ? "bg-pink-500/15 border-pink-400/60"
                          : "bg-white/5 border-white/10 hover:border-white/25"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        attach.includes(r.id) ? "bg-pink-500 border-pink-500" : "border-white/30"
                      }`}>
                        {attach.includes(r.id) && <Check className="w-3 h-3 text-white" />}
                      </span>
                      <span className="text-sm text-white/85 truncate">{r.report_name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-white/50 text-sm">No reports available to share yet.</p>
              )}
            </div>

            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason for visit (optional)"
              className="bg-white/10 border-purple-400/25 text-white placeholder:text-white/45 min-h-20"
            />

            <Button
              onClick={confirmBooking}
              disabled={!slot}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Confirm appointment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorConnect;
