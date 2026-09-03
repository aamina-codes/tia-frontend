import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import tiaLogo from "@/assets/tia-butterfly-logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const friendlyError = (error: any) => {
    const msg = String(error?.message || "Something went wrong");
    const lower = msg.toLowerCase();
    if (lower.includes("invalid login credentials")) {
      return "Incorrect email or password. Please try again.";
    }
    if (lower.includes("email not confirmed") || lower.includes("not confirmed")) {
      return "Please confirm your email first — check your inbox for the confirmation link.";
    }
    if (lower.includes("rate limit") || lower.includes("too many") || error?.status === 429) {
      return "Too many attempts. Please wait a minute and try again.";
    }
    if (lower.includes("user already registered")) {
      return "An account with this email already exists. Try logging in instead.";
    }
    if (lower.includes("password") && lower.includes("6")) {
      return "Password must be at least 6 characters long.";
    }
    return msg;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) throw error;

        toast({
          title: "🦋 Welcome back!",
          description: "Successfully signed in",
        });
        navigate("/explore");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/explore`,
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) throw error;

        if (!data.session) {
          toast({
            title: "Confirm your email",
            description: `We sent a confirmation link to ${cleanEmail}. Please click it to activate your account.`,
          });
          setIsLogin(true);
          setPassword("");
          return;
        }

        toast({
          title: "🦋 Account created!",
          description: "Welcome to TIA",
        });
        navigate("/explore");
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: friendlyError(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast({
        title: "Enter your email",
        description: "Type your email address above, then tap Forgot password again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;

      toast({
        title: "Reset link sent",
        description: `Check ${cleanEmail} for a link to set a new password.`,
      });
    } catch (error: any) {
      toast({
        title: "Couldn't send reset link",
        description: friendlyError(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/explore`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: friendlyError(error),
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#1E003D' }}>
      {/* Floating Background Shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <img src={tiaLogo} alt="TIA Logo" className="w-20 h-20 drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]" />
          <div className="text-center">
            <h1 className="text-white text-3xl font-bold mb-1">TIA</h1>
            <p className="text-white/90 text-sm">Thyroid Intelligent Assistant</p>
          </div>
        </div>

          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
            <Button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full mb-6 bg-white hover:bg-white/90 text-gray-900 rounded-full py-6 shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/60">or</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {isLogin ? "Login" : "Sign Up"}
            </h2>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full py-6 pl-12 focus:ring-2 focus:ring-pink-400"
                  />
                  <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}

              <div className="relative">
                <Input
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full py-6 pl-12 focus:ring-2 focus:ring-pink-400"
                />
                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <div className="relative">
                <Input
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full py-6 pl-12 focus:ring-2 focus:ring-pink-400"
                />
                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-white/30 data-[state=checked]:bg-pink-500"
                    />
                    <label htmlFor="remember" className="text-sm text-white/80 cursor-pointer">
                      Remember me
                    </label>
                  </div>
                  <button type="button" className="text-sm text-white/80 hover:text-white transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full py-6 shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:shadow-[0_0_50px_rgba(236,72,153,0.6)] transition-all"
              >
                {isLoading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
              </Button>
            </form>

            <p className="mt-6 text-center text-white/60 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-pink-400 hover:text-pink-300 font-semibold transition-colors"
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;