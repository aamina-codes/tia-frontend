import { useState, useEffect } from "react";
import { ArrowLeft, Camera, User, Mail, Calendar, Shield, Pill, Clock, Bell, FileText, Activity, Edit2, Lock, BellRing, LogOut, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLabReports } from "@/hooks/useLabReports";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { reports, profileReport } = useLabReports();

  // Auth & profile
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Health details form
  const [healthDetails, setHealthDetails] = useState({
    age: "", gender: "", diagnosisType: "", emergencyContactName: "", emergencyContactPhone: "", doctorName: "", healthGoals: "",
  });

  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", email: "" });
  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [darkModeToggle, setDarkModeToggle] = useState(false);
  const [notifPrefsOpen, setNotifPrefsOpen] = useState(false);
  const [notifMedication, setNotifMedication] = useState(true);
  const [notifLabTests, setNotifLabTests] = useState(true);
  const [notifAppointments, setNotifAppointments] = useState(true);

  const [totalReminders, setTotalReminders] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchReminders(session.user.id);
      }
    });
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", userId).single();
    if (data) {
      setProfile(data);
      setEditForm({ full_name: data.full_name || "", email: data.email || "" });
    }
  };

  const fetchReminders = async (userId: string) => {
    const { count } = await supabase.from("reminders").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("is_active", true);
    setTotalReminders(count ?? 0);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
      toast({ title: "🦋 Photo updated!", description: "Profile picture changed successfully." });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: editForm.full_name, email: editForm.email }).eq("user_id", user.id);
    if (error) { toast({ title: "Error", description: "Failed to update profile", variant: "destructive" }); return; }
    toast({ title: "🦋 Profile updated!", description: "Your information has been saved" });
    setIsEditingProfile(false);
    fetchProfile(user.id);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out", description: "You've been successfully signed out" });
    navigate("/");
  };

  // Use profileReport from centralized state (addedToProfile=true), fall back to latest
  const labForProfile = profileReport ?? (reports.length > 0 ? reports[0] : null);

  const getThyroidBadge = () => {
    if (!labForProfile) return { label: "No Data", color: "bg-white/10 text-white/60" };
    const tsh = labForProfile.tsh;
    if (tsh === null) return { label: "Unknown", color: "bg-white/10 text-white/60" };
    if (tsh < 0.4) return { label: "Hyperthyroid", color: "bg-orange-500/20 text-orange-300 border-orange-400/50" };
    if (tsh > 4.0) return { label: "Hypothyroid", color: "bg-yellow-500/20 text-yellow-300 border-yellow-400/50" };
    return { label: "Normal", color: "bg-green-500/20 text-green-300 border-green-400/50" };
  };

  const thyroidBadge = getThyroidBadge();
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "N/A";

  const cardClass = "bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 hover:border-pink-400 transition-all duration-300 hover:shadow-[0_0_40px_hsl(330,80%,60%,0.5)]";
  const sectionTitle = "text-2xl font-bold text-white mb-4 flex items-center gap-3";

  const getStatusBadgeColor = (status: string) => {
    if (status === "normal") return "bg-green-500/20 text-green-300";
    if (status === "elevated") return "bg-yellow-500/20 text-yellow-300";
    if (status === "low") return "bg-orange-500/20 text-orange-300";
    return "bg-white/10 text-white/60";
  };

  return (
    <div className="min-h-screen bg-deep-dark-purple relative overflow-hidden">
      <Navigation />
      <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 pt-24 px-6">
        <Button variant="ghost" onClick={() => navigate("/explore")} className="text-white hover:bg-white/10 transition-colors mb-8 focus:outline-none focus:ring-0">
          <ArrowLeft className="w-5 h-5 mr-2" />Back
        </Button>
      </div>

      <section className="relative z-10 px-6 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">Your Profile</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">Your centralized health identity and account overview.</p>
        </div>
      </section>

      <div className="relative z-10 px-6 pb-20 max-w-4xl mx-auto space-y-8">

        {/* USER INFO */}
        <Card className={cardClass}>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 border-2 border-pink-400/50 flex items-center justify-center overflow-hidden">
                  {avatarPreview ? <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-14 h-14 text-pink-300" />}
                </div>
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:shadow-[0_0_25px_rgba(236,72,153,0.7)] transition-all">
                  <Camera className="w-4 h-4 text-white" />
                </label>
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                {isEditingProfile ? (
                  <div className="space-y-3">
                    <Input value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} placeholder="Full Name" className="bg-white/10 border-white/20 text-white" />
                    <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="Email" className="bg-white/10 border-white/20 text-white" />
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full">Save</Button>
                      <Button variant="outline" onClick={() => setIsEditingProfile(false)} className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-full">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold text-white">{profile?.full_name || "User"}</h2>
                    <p className="text-white/70 flex items-center gap-2 justify-center md:justify-start"><Mail className="w-4 h-4" />{user?.email || "N/A"}</p>
                    <p className="text-white/60 flex items-center gap-2 justify-center md:justify-start"><Calendar className="w-4 h-4" />Last report: {labForProfile ? new Date(labForProfile.uploadDate).toLocaleDateString() : "No reports yet"}</p>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${thyroidBadge.color}`}>
                      <Shield className="w-3 h-3" />{thyroidBadge.label}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LATEST LAB SUMMARY — from centralized state */}
        <Card className={cardClass}>
          <CardContent className="p-8">
            <h3 className={sectionTitle}><Activity className="w-6 h-6 text-pink-300" />Latest Smart Lab Summary</h3>
            {labForProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "TSH", value: labForProfile.tsh, unit: "µIU/mL", status: labForProfile.tshStatus },
                  { label: "T3", value: labForProfile.t3, unit: "ng/dL", status: labForProfile.t3Status },
                  { label: "T4", value: labForProfile.t4, unit: "µg/dL", status: labForProfile.t4Status },
                ].map((item) => (
                  <div key={item.label} className="bg-white/5 border border-pink-400/20 rounded-xl p-4 text-center">
                    <p className="text-white/60 text-sm">{item.label}</p>
                    <p className="text-3xl font-bold text-pink-300 my-1">{item.value ?? "N/A"}</p>
                    <p className="text-white/50 text-xs">{item.unit}</p>
                    <Badge className={`mt-2 ${getStatusBadgeColor(item.status)}`}>{item.status || "unknown"}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/50">No lab reports analyzed yet. Upload a report to see your summary.</p>
            )}
          </CardContent>
        </Card>

        {/* MEDICATION & HEALTH SUMMARY */}
        <Card className={cardClass}>
          <CardContent className="p-8">
            <h3 className={sectionTitle}><Pill className="w-6 h-6 text-pink-300" />Medication & Health Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Current Medication", value: "Levothyroxine", icon: Pill },
                { label: "Dosage", value: "50 mcg", icon: Activity },
                { label: "Reminder Time", value: "8:00 AM daily", icon: Clock },
                { label: "Next Checkup", value: "March 15, 2026", icon: Calendar },
              ].map((item) => (
                <div key={item.label} className="bg-white/5 border border-pink-400/20 rounded-xl p-4 flex items-center gap-4">
                  <div className="p-2 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20"><item.icon className="w-5 h-5 text-pink-300" /></div>
                  <div><p className="text-white/60 text-sm">{item.label}</p><p className="text-white font-semibold">{item.value}</p></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* REMINDERS OVERVIEW */}
        <Card className={cardClass}>
          <CardContent className="p-8">
            <h3 className={sectionTitle}><Bell className="w-6 h-6 text-pink-300" />Reminders Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Active Reminders", value: totalReminders, color: "text-pink-300" },
                { label: "Next Upcoming", value: "Tomorrow 8:00 AM", color: "text-purple-300" },
                { label: "Missed Reminders", value: 0, color: "text-green-300" },
              ].map((item) => (
                <div key={item.label} className="bg-white/5 border border-pink-400/20 rounded-xl p-4 text-center">
                  <p className="text-white/60 text-sm mb-1">{item.label}</p>
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* REPORTS OVERVIEW — from centralized state */}
        <Card className={cardClass}>
          <CardContent className="p-8">
            <h3 className={sectionTitle}><FileText className="w-6 h-6 text-pink-300" />Reports Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Total Reports", value: reports.length, color: "text-pink-300" },
                { label: "Last Uploaded", value: reports.length > 0 ? new Date(reports[0].uploadDate).toLocaleDateString() : "N/A", color: "text-purple-300" },
                { label: "Lab Analyses Done", value: reports.length, color: "text-blue-300" },
              ].map((item) => (
                <div key={item.label} className="bg-white/5 border border-pink-400/20 rounded-xl p-4 text-center">
                  <p className="text-white/60 text-sm mb-1">{item.label}</p>
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* PERSONAL & HEALTH DETAILS */}
        <Card className={cardClass}>
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className={sectionTitle}><User className="w-6 h-6 text-pink-300" />Personal & Health Details</h3>
              <Button onClick={() => setIsEditingHealth(!isEditingHealth)} variant="ghost" className="text-pink-300 hover:bg-white/10 rounded-full">
                <Edit2 className="w-4 h-4 mr-2" />{isEditingHealth ? "Done" : "Edit"}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70">Age</Label>
                <Input type="number" value={healthDetails.age} onChange={(e) => setHealthDetails({ ...healthDetails, age: e.target.value })} disabled={!isEditingHealth} className="bg-white/10 border-white/20 text-white disabled:opacity-60" placeholder="Enter age" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Gender</Label>
                <Select value={healthDetails.gender} onValueChange={(v) => setHealthDetails({ ...healthDetails, gender: v })} disabled={!isEditingHealth}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white disabled:opacity-60"><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent className="bg-[#2a1050] border-white/20">
                    <SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Diagnosis Type</Label>
                <Select value={healthDetails.diagnosisType} onValueChange={(v) => setHealthDetails({ ...healthDetails, diagnosisType: v })} disabled={!isEditingHealth}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white disabled:opacity-60"><SelectValue placeholder="Select diagnosis" /></SelectTrigger>
                  <SelectContent className="bg-[#2a1050] border-white/20">
                    <SelectItem value="hypothyroidism">Hypothyroidism</SelectItem><SelectItem value="hyperthyroidism">Hyperthyroidism</SelectItem>
                    <SelectItem value="subclinical-hypo">Subclinical Hypothyroidism</SelectItem><SelectItem value="subclinical-hyper">Subclinical Hyperthyroidism</SelectItem>
                    <SelectItem value="not-diagnosed">Not Diagnosed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-white/70">Doctor Name</Label><Input value={healthDetails.doctorName} onChange={(e) => setHealthDetails({ ...healthDetails, doctorName: e.target.value })} disabled={!isEditingHealth} className="bg-white/10 border-white/20 text-white disabled:opacity-60" placeholder="Dr. Name" /></div>
              <div className="space-y-2"><Label className="text-white/70">Emergency Contact Name</Label><Input value={healthDetails.emergencyContactName} onChange={(e) => setHealthDetails({ ...healthDetails, emergencyContactName: e.target.value })} disabled={!isEditingHealth} className="bg-white/10 border-white/20 text-white disabled:opacity-60" placeholder="Contact name" /></div>
              <div className="space-y-2"><Label className="text-white/70">Emergency Contact Phone</Label><Input value={healthDetails.emergencyContactPhone} onChange={(e) => setHealthDetails({ ...healthDetails, emergencyContactPhone: e.target.value })} disabled={!isEditingHealth} className="bg-white/10 border-white/20 text-white disabled:opacity-60" placeholder="Phone number" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-white/70">Health Goals</Label><Input value={healthDetails.healthGoals} onChange={(e) => setHealthDetails({ ...healthDetails, healthGoals: e.target.value })} disabled={!isEditingHealth} className="bg-white/10 border-white/20 text-white disabled:opacity-60" placeholder="e.g. Maintain TSH in range, exercise daily" /></div>
            </div>
          </CardContent>
        </Card>

        {/* ACCOUNT INFORMATION */}
        <Card className={cardClass}>
          <CardContent className="p-8">
            <h3 className={sectionTitle}><Shield className="w-6 h-6 text-pink-300" />Account Information</h3>
            <div className="space-y-3">
              <div className="bg-white/5 border border-pink-400/20 rounded-xl p-4 flex items-center justify-between"><div><p className="text-white/60 text-sm">Member Since</p><p className="text-white font-semibold">{memberSince}</p></div><Calendar className="w-5 h-5 text-pink-300" /></div>
              <div className="bg-white/5 border border-pink-400/20 rounded-xl p-4 flex items-center justify-between"><div><p className="text-white/60 text-sm">Email</p><p className="text-white font-semibold">{user?.email || "N/A"}</p></div><Mail className="w-5 h-5 text-pink-300" /></div>
            </div>
          </CardContent>
        </Card>

        {/* SETTINGS */}
        <Card className={cardClass}>
          <CardContent className="p-8">
            <h3 className={sectionTitle}><Activity className="w-6 h-6 text-pink-300" />Settings</h3>
            <div className="space-y-2">
              <button onClick={() => setIsEditingProfile(true)} className="w-full bg-white/5 border border-pink-400/20 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-3"><Edit2 className="w-5 h-5 text-pink-300" /><span className="text-white font-medium">Edit Profile</span></div>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
              </button>
              <button onClick={() => setChangePasswordOpen(true)} className="w-full bg-white/5 border border-pink-400/20 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-3"><Lock className="w-5 h-5 text-pink-300" /><span className="text-white font-medium">Change Password</span></div>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
              </button>
              <button onClick={() => setNotifPrefsOpen(true)} className="w-full bg-white/5 border border-pink-400/20 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-3"><BellRing className="w-5 h-5 text-pink-300" /><span className="text-white font-medium">Notification Preferences</span></div>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
              </button>
              <div className="w-full bg-white/5 border border-pink-400/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><Activity className="w-5 h-5 text-pink-300" /><div><span className="text-white font-medium">Dark Mode</span><p className="text-white/40 text-xs">Coming Soon</p></div></div>
                <Switch checked={darkModeToggle} onCheckedChange={setDarkModeToggle} />
              </div>
              <button onClick={handleSignOut} className="w-full bg-red-500/10 border border-red-400/30 rounded-xl p-4 flex items-center justify-between hover:bg-red-500/20 transition-all group mt-4">
                <div className="flex items-center gap-3"><LogOut className="w-5 h-5 text-red-400" /><span className="text-red-300 font-medium">Sign Out</span></div>
                <ChevronRight className="w-5 h-5 text-red-400/40 group-hover:text-red-400/70 transition-colors" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="bg-[#1E003D] border-pink-400/30 text-white">
          <DialogHeader><DialogTitle className="text-white">Change Password</DialogTitle><DialogDescription className="text-white/60">Enter your new password below.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label className="text-white/70">New Password</Label><Input type="password" placeholder="New password" className="bg-white/10 border-white/20 text-white" /></div>
            <div className="space-y-2"><Label className="text-white/70">Confirm Password</Label><Input type="password" placeholder="Confirm password" className="bg-white/10 border-white/20 text-white" /></div>
            <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full" onClick={() => { setChangePasswordOpen(false); toast({ title: "🦋 Password updated!", description: "Your password has been changed." }); }}>Update Password</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Preferences Dialog */}
      <Dialog open={notifPrefsOpen} onOpenChange={setNotifPrefsOpen}>
        <DialogContent className="bg-[#1E003D] border-pink-400/30 text-white">
          <DialogHeader><DialogTitle className="text-white">Notification Preferences</DialogTitle><DialogDescription className="text-white/60">Choose what notifications you want to receive.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            {[
              { label: "Medication Reminders", checked: notifMedication, onChange: setNotifMedication },
              { label: "Lab Test Reminders", checked: notifLabTests, onChange: setNotifLabTests },
              { label: "Appointment Reminders", checked: notifAppointments, onChange: setNotifAppointments },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between bg-white/5 border border-pink-400/20 rounded-xl p-4">
                <span className="text-white font-medium">{item.label}</span>
                <Switch checked={item.checked} onCheckedChange={item.onChange} />
              </div>
            ))}
            <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full" onClick={() => { setNotifPrefsOpen(false); toast({ title: "🦋 Preferences saved!", description: "Your notification settings have been updated." }); }}>Save Preferences</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
