import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import tiaLogo from "@/assets/tia-butterfly-logo.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Please use at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please retype the same password in both fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({
        title: "🦋 Password updated",
        description: "You can now use your new password.",
      });
      navigate("/explore");
    } catch (error: any) {
      toast({
        title: "Couldn't update password",
        description: error?.message || "Please request a new reset link and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#1E003D' }}>
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <img src={tiaLogo} alt="TIA Logo" className="w-20 h-20 drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]" />
          <div className="text-center">
            <h1 className="text-white text-3xl font-bold mb-1">TIA</h1>
            <p className="text-white/90 text-sm">Set a new password</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
          {!ready && (
            <p className="text-white/70 text-sm mb-4 text-center">
              Open this page from the reset link in your email to continue.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full py-6 px-6 focus:ring-2 focus:ring-pink-400"
            />
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full py-6 px-6 focus:ring-2 focus:ring-pink-400"
            />

            <Button
              type="submit"
              disabled={isLoading || !ready}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full py-6 shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:shadow-[0_0_50px_rgba(236,72,153,0.6)] transition-all"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>

          <p className="mt-6 text-center text-white/60 text-sm">
            <button
              onClick={() => navigate("/auth")}
              className="text-pink-400 hover:text-pink-300 font-semibold transition-colors"
            >
              Back to login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
