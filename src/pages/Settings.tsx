import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Bell, ShieldCheck, Palette, Info, LogOut, Mail, Trash2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Section = ({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
    <CardContent className="p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-pink-300" />
        </div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {description && <p className="text-white/55 text-sm mb-4 ml-12">{description}</p>}
      <div className="mt-4 space-y-3">{children}</div>
    </CardContent>
  </Card>
);

const Row = ({ label, value, action }: { label: string; value?: string; action?: React.ReactNode }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-white/10 last:border-0">
    <div>
      <p className="text-white/90 text-sm">{label}</p>
      {value && <p className="text-white/50 text-sm">{value}</p>}
    </div>
    {action}
  </div>
);

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const sendPasswordReset = async () => {
    if (!user?.email) return;
    setSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSending(false);
    toast(
      error
        ? { title: "Couldn't send the email", description: "Please try again in a moment.", variant: "destructive" }
        : { title: "Check your inbox", description: `We sent a password reset link to ${user.email}.` }
    );
  };

  const clearLocalReports = () => {
    localStorage.removeItem("tia_lab_reports");
    toast({ title: "Reports cleared", description: "Analysed reports stored on this device were removed." });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-deep-dark-purple relative overflow-hidden">
      <Navigation />
      <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <main className="relative z-10 pt-24 pb-28 px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <header>
            <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">Settings</h1>
            <p className="text-white/60 mt-2">Manage your account, data and preferences.</p>
          </header>

          <Section icon={User} title="Account">
            <Row label="Name" value={profile?.full_name || "Not set"} action={
              <Button variant="ghost" onClick={() => navigate("/profile")} className="text-pink-300 hover:text-white hover:bg-white/10 rounded-full">Edit profile</Button>
            } />
            <Row label="Email" value={user?.email ?? "—"} />
            <Row
              label="Password"
              value="Send yourself a reset link"
              action={
                <Button variant="ghost" disabled={sending} onClick={sendPasswordReset} className="text-pink-300 hover:text-white hover:bg-white/10 rounded-full">
                  <Mail className="w-4 h-4 mr-2" /> {sending ? "Sending…" : "Reset password"}
                </Button>
              }
            />
            <Row
              label="Sign out"
              action={
                <Button variant="ghost" onClick={handleSignOut} className="text-white/80 hover:text-white hover:bg-white/10 rounded-full">
                  <LogOut className="w-4 h-4 mr-2" /> Sign out
                </Button>
              }
            />
          </Section>

          <Section
            icon={Bell}
            title="Notifications"
            description="TIA reminds you inside the app. Manage what you're reminded about in your care plan."
          >
            <Row
              label="Reminders"
              value="Medication, lab tests and appointments"
              action={
                <Button variant="ghost" onClick={() => navigate("/care-plan")} className="text-pink-300 hover:text-white hover:bg-white/10 rounded-full">
                  Open care plan
                </Button>
              }
            />
          </Section>

          <Section
            icon={ShieldCheck}
            title="Privacy & data"
            description="Your health information is stored against your account and only visible to you."
          >
            <Row
              label="Analysed reports on this device"
              value="Clear the lab report analyses saved in this browser"
              action={
                <Button variant="ghost" onClick={clearLocalReports} className="text-white/80 hover:text-white hover:bg-white/10 rounded-full">
                  <Trash2 className="w-4 h-4 mr-2" /> Clear
                </Button>
              }
            />
            <Row label="Account deletion" value="Contact us and we'll remove your account and data." />
          </Section>

          <Section icon={Palette} title="Appearance">
            <Row label="Theme" value="TIA uses a single dark theme designed for readability." />
          </Section>

          <Section icon={Info} title="About">
            <Row
              label="About TIA"
              action={
                <Button variant="ghost" onClick={() => navigate("/about")} className="text-pink-300 hover:text-white hover:bg-white/10 rounded-full">Open</Button>
              }
            />
            <Row
              label="Help & safety"
              action={
                <Button variant="ghost" onClick={() => navigate("/help")} className="text-pink-300 hover:text-white hover:bg-white/10 rounded-full">Open</Button>
              }
            />
          </Section>
        </div>
      </main>
    </div>
  );
};

export default Settings;
