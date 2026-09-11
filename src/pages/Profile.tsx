import { useEffect, useMemo, useState } from "react";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Bell,
  FileText,
  Activity,
  Edit2,
  Lock,
  LogOut,
  ChevronRight,
  Target,
  Stethoscope,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/contexts/AuthContext";
import { useLabReports } from "@/hooks/useLabReports";
import { useReminders } from "@/hooks/useReminders";
import { StatusBadge } from "@/components/health/StatusBadge";
import { resolveStatus, MarkerKey } from "@/components/health/statusUtils";

const GOAL_OPTIONS = [
  "Understand my lab reports",
  "Keep my levels stable",
  "Track my symptoms",
  "Remember my medication",
  "Prepare for doctor visits",
  "Learn about thyroid health",
];

const DIAGNOSIS_LABELS: Record<string, string> = {
  hypothyroidism: "Hypothyroidism",
  hyperthyroidism: "Hyperthyroidism",
  "subclinical-hypo": "Subclinical hypothyroidism",
  "subclinical-hyper": "Subclinical hyperthyroidism",
  hashimotos: "Hashimoto's",
  graves: "Graves' disease",
  "not-diagnosed": "Not diagnosed",
  unsure: "Not sure yet",
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : null;

const ageFrom = (dob?: string | null) => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age >= 0 && age < 130 ? age : null;
};

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { reports, profileReport } = useLabReports();
  const { upcoming, reminders, loading: remindersLoading } = useReminders();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    diagnosis_type: "",
    diagnosis_date: "",
    doctor_name: "",
    health_goals: [] as string[],
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      date_of_birth: profile.date_of_birth ?? "",
      gender: profile.gender ?? "",
      diagnosis_type: profile.diagnosis_type ?? "",
      diagnosis_date: profile.diagnosis_date ?? "",
      doctor_name: profile.doctor_name ?? "",
      health_goals: profile.health_goals ?? [],
    });
  }, [profile]);

  const labForProfile = profileReport ?? (reports.length > 0 ? reports[0] : null);

  const markers = useMemo(() => {
    if (!labForProfile) return [];
    return ([
      { key: "TSH" as MarkerKey, label: "TSH", value: labForProfile.tsh, unit: "µIU/mL", status: labForProfile.tshStatus },
      { key: "T3" as MarkerKey, label: "T3", value: labForProfile.t3, unit: "ng/dL", status: labForProfile.t3Status },
      { key: "T4" as MarkerKey, label: "T4", value: labForProfile.t4, unit: "µg/dL", status: labForProfile.t4Status },
      { key: "FT3" as MarkerKey, label: "Free T3", value: labForProfile.ft3, unit: "pg/mL", status: labForProfile.ft3Status },
      { key: "FT4" as MarkerKey, label: "Free T4", value: labForProfile.ft4, unit: "ng/dL", status: labForProfile.ft4Status },
      { key: "AntiTPO" as MarkerKey, label: "Anti-TPO", value: labForProfile.antiTPO, unit: "IU/mL", status: labForProfile.antiTPOStatus },
    ]).filter((m) => m.value !== null && m.value !== undefined);
  }, [labForProfile]);

  const age = ageFrom(profile?.date_of_birth);
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : null;
  const nextReminder = upcoming[0] ?? null;

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim() || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        diagnosis_type: form.diagnosis_type || null,
        diagnosis_date: form.diagnosis_date || null,
        doctor_name: form.doctor_name.trim() || null,
        health_goals: form.health_goals,
      })
      .eq("user_id", user.id);
    setSaving(false);

    if (error) {
      toast({ title: "Couldn't save", description: "Please check your connection and try again.", variant: "destructive" });
      return;
    }
    await refreshProfile();
    setIsEditing(false);
    toast({ title: "Saved", description: "Your details have been updated." });
  };

  const handlePasswordUpdate = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please retype them.", variant: "destructive" });
      return;
    }
    setUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdatingPassword(false);
    if (error) {
      toast({ title: "Couldn't update password", description: error.message, variant: "destructive" });
      return;
    }
    setChangePasswordOpen(false);
    setNewPassword("");
    setConfirmPassword("");
    toast({ title: "Password updated", description: "Use your new password next time you sign in." });
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out", description: "You've been successfully signed out" });
    navigate("/auth");
  };

  const toggleGoal = (goal: string) =>
    setForm((f) => ({
      ...f,
      health_goals: f.health_goals.includes(goal)
        ? f.health_goals.filter((g) => g !== goal)
        : [...f.health_goals, goal],
    }));

  const cardClass =
    "bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 hover:border-pink-400 transition-all duration-300 hover:shadow-[0_0_40px_hsl(330,80%,60%,0.5)]";
  const sectionTitle = "text-2xl font-bold text-white mb-4 flex items-center gap-3";
  const initials = (profile?.full_name || user?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-deep-dark-purple relative overflow-hidden pb-24 md:pb-0">
      <Navigation />
      <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <section className="relative z-10 px-6 pt-28 pb-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            My Thyroid Space
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Everything TIA knows about your thyroid journey, in one place.
          </p>
        </div>
      </section>

      <div className="relative z-10 px-6 pb-20 max-w-4xl mx-auto space-y-8">
        {/* IDENTITY */}
        <Card className={cardClass}>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500/40 to-purple-500/40 border-2 border-pink-400/50 flex items-center justify-center text-3xl font-bold text-white">
                {initials}
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <h2 className="text-3xl font-bold text-white">{profile?.full_name || "Your profile"}</h2>
                <p className="text-white/70 flex items-center gap-2 justify-center md:justify-start">
                  <Mail className="w-4 h-4" />{user?.email}
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
                  {age !== null && (
                    <Badge className="bg-white/10 text-white/80 border-white/20">{age} years</Badge>
                  )}
                  {profile?.gender && (
                    <Badge className="bg-white/10 text-white/80 border-white/20 capitalize">{profile.gender}</Badge>
                  )}
                  {profile?.diagnosis_type && (
                    <Badge className="bg-pink-500/20 text-pink-200 border-pink-400/40">
                      {DIAGNOSIS_LABELS[profile.diagnosis_type] ?? profile.diagnosis_type}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setIsEditing((v) => !v)}
                variant="ghost"
                className="text-pink-300 hover:bg-white/10 rounded-full"
              >
                <Edit2 className="w-4 h-4 mr-2" />{isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* MY DETAILS */}
        <Card className={cardClass}>
          <CardContent className="p-8">
            <h3 className={sectionTitle}><User className="w-6 h-6 text-pink-300" />My details</h3>

            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Full name</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="bg-white/10 border-white/20 text-white" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Date of birth</Label>
                  <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-[#2a1050] border-white/20 z-50 [&_[role=option]]:text-white [&_[role=option]]:cursor-pointer [&_[role=option][data-highlighted]]:bg-white/15 [&_[role=option][data-highlighted]]:text-white">
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Diagnosis</Label>
                  <Select value={form.diagnosis_type} onValueChange={(v) => setForm({ ...form, diagnosis_type: v })}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-[#2a1050] border-white/20 z-50 [&_[role=option]]:text-white [&_[role=option]]:cursor-pointer [&_[role=option][data-highlighted]]:bg-white/15 [&_[role=option][data-highlighted]]:text-white">
                      {Object.entries(DIAGNOSIS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Diagnosed on</Label>
                  <Input type="date" value={form.diagnosis_date} onChange={(e) => setForm({ ...form, diagnosis_date: e.target.value })} className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">My doctor</Label>
                  <Input value={form.doctor_name} onChange={(e) => setForm({ ...form, doctor_name: e.target.value })} className="bg-white/10 border-white/20 text-white" placeholder="Dr. Name" />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label className="text-white/70">My goals</Label>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_OPTIONS.map((goal) => {
                      const active = form.health_goals.includes(goal);
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => toggleGoal(goal)}
                          className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                            active
                              ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent"
                              : "bg-white/5 text-white/70 border-white/20 hover:bg-white/10"
                          }`}
                        >
                          {goal}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full">
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-full">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Date of birth", value: formatDate(profile?.date_of_birth) },
                  { label: "Gender", value: profile?.gender ?? null },
                  { label: "Diagnosis", value: profile?.diagnosis_type ? DIAGNOSIS_LABELS[profile.diagnosis_type] ?? profile.diagnosis_type : null },
                  { label: "Diagnosed on", value: formatDate(profile?.diagnosis_date) },
                  { label: "My doctor", value: profile?.doctor_name ?? null },
                  { label: "Member since", value: memberSince },
                ].map((item) => (
                  <div key={item.label} className="bg-white/5 border border-pink-400/20 rounded-xl p-4">
                    <p className="text-white/60 text-sm">{item.label}</p>
                    <p className={`font-semibold capitalize ${item.value ? "text-white" : "text-white/40"}`}>
                      {item.value || "Not added yet"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* GOALS */}
        {!isEditing && (
          <Card className={cardClass}>
            <CardContent className="p-8">
              <h3 className={sectionTitle}><Target className="w-6 h-6 text-pink-300" />My goals</h3>
              {profile?.health_goals?.length ? (
                <div className="flex flex-wrap gap-2">
                  {profile.health_goals.map((goal) => (
                    <Badge key={goal} className="bg-purple-500/20 text-purple-100 border-purple-400/40 px-4 py-1.5 text-sm">
                      {goal}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-white/50">
                  You haven't chosen any goals yet. Tap Edit above to pick what matters to you.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* LATEST REPORT */}
        <Card className={cardClass}>
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${sectionTitle} mb-0`}><Activity className="w-6 h-6 text-pink-300" />Latest results</h3>
              {labForProfile && (
                <Button variant="ghost" onClick={() => navigate("/reports")} className="text-pink-300 hover:bg-white/10 rounded-full">
                  All reports<ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
            {labForProfile ? (
              <>
                <p className="text-white/60 text-sm mb-4">
                  From {formatDate(labForProfile.uploadDate) ?? "your latest report"}
                </p>
                {markers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {markers.map((item) => (
                      <div key={item.label} className="bg-white/5 border border-pink-400/20 rounded-xl p-4 text-center">
                        <p className="text-white/60 text-sm">{item.label}</p>
                        <p className="text-3xl font-bold text-pink-300 my-1">{item.value}</p>
                        <p className="text-white/50 text-xs mb-2">{item.unit}</p>
                        <StatusBadge status={resolveStatus(item.key, item.value as number, item.status)} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/50">No thyroid markers were detected in this report.</p>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-white/50">No reports analysed yet.</p>
                <Button onClick={() => navigate("/lab-report")} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full">
                  Upload a report
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ACTIVITY SNAPSHOT */}
        <Card className={cardClass}>
          <CardContent className="p-8">
            <h3 className={sectionTitle}><FileText className="w-6 h-6 text-pink-300" />My activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-pink-400/20 rounded-xl p-4 text-center">
                <p className="text-white/60 text-sm mb-1">Reports analysed</p>
                <p className="text-2xl font-bold text-pink-300">{reports.length}</p>
              </div>
              <div className="bg-white/5 border border-pink-400/20 rounded-xl p-4 text-center">
                <p className="text-white/60 text-sm mb-1">Active reminders</p>
                <p className="text-2xl font-bold text-purple-300">
                  {remindersLoading ? "…" : reminders.filter((r) => r.is_active).length}
                </p>
              </div>
              <div className="bg-white/5 border border-pink-400/20 rounded-xl p-4 text-center">
                <p className="text-white/60 text-sm mb-1">Next reminder</p>
                <p className="text-base font-semibold text-white">
                  {remindersLoading
                    ? "…"
                    : nextReminder
                      ? `${nextReminder.title} · ${formatDate(nextReminder.reminder_date)}`
                      : "None scheduled"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button variant="outline" onClick={() => navigate("/care-plan")} className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-full">
                <Bell className="w-4 h-4 mr-2" />My care plan
              </Button>
              <Button variant="outline" onClick={() => navigate("/assistant")} className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-full">
                <MessageCircle className="w-4 h-4 mr-2" />Ask TIA
              </Button>
              <Button variant="outline" onClick={() => navigate("/doctor-connect")} className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-full">
                <Stethoscope className="w-4 h-4 mr-2" />Doctor connect
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ACCOUNT */}
        <Card className={cardClass}>
          <CardContent className="p-8">
            <h3 className={sectionTitle}><Shield className="w-6 h-6 text-pink-300" />Account</h3>
            <div className="space-y-2">
              <div className="bg-white/5 border border-pink-400/20 rounded-xl p-4 flex items-center justify-between">
                <div><p className="text-white/60 text-sm">Email</p><p className="text-white font-semibold">{user?.email}</p></div>
                <Mail className="w-5 h-5 text-pink-300" />
              </div>
              {memberSince && (
                <div className="bg-white/5 border border-pink-400/20 rounded-xl p-4 flex items-center justify-between">
                  <div><p className="text-white/60 text-sm">Member since</p><p className="text-white font-semibold">{memberSince}</p></div>
                  <Calendar className="w-5 h-5 text-pink-300" />
                </div>
              )}
              <button onClick={() => setChangePasswordOpen(true)} className="w-full bg-white/5 border border-pink-400/20 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-3"><Lock className="w-5 h-5 text-pink-300" /><span className="text-white font-medium">Change password</span></div>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
              </button>
              <button onClick={() => navigate("/settings")} className="w-full bg-white/5 border border-pink-400/20 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-3"><Activity className="w-5 h-5 text-pink-300" /><span className="text-white font-medium">Settings</span></div>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
              </button>
              <button onClick={handleSignOut} className="w-full bg-red-500/10 border border-red-400/30 rounded-xl p-4 flex items-center justify-between hover:bg-red-500/20 transition-all group mt-4">
                <div className="flex items-center gap-3"><LogOut className="w-5 h-5 text-red-400" /><span className="text-red-300 font-medium">Sign out</span></div>
                <ChevronRight className="w-5 h-5 text-red-400/40 group-hover:text-red-400/70 transition-colors" />
              </button>
            </div>
            <p className="text-white/40 text-xs mt-6">
              Educational support only — always confirm decisions with your doctor.
            </p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="bg-[#1E003D] border-pink-400/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Change password</DialogTitle>
            <DialogDescription className="text-white/60">Enter your new password below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/70">New password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="bg-white/10 border-white/20 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Confirm password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="bg-white/10 border-white/20 text-white" />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full"
              disabled={updatingPassword}
              onClick={handlePasswordUpdate}
            >
              {updatingPassword ? "Updating…" : "Update password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
