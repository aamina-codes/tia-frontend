import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import tiaLogo from "@/assets/tia-butterfly-logo.png";

const LoadingScreen = () => (
  <div
    className="min-h-screen flex items-center justify-center"
    style={{ backgroundColor: "#1E003D" }}
  >
    <img
      src={tiaLogo}
      alt="Loading TIA"
      className="w-16 h-16 animate-pulse drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]"
    />
  </div>
);

interface Props {
  children: ReactNode;
  /** When false, an incomplete profile is not redirected (used by /onboarding itself). */
  requireOnboarding?: boolean;
}

const ProtectedRoute = ({ children, requireOnboarding = true }: Props) => {
  const { user, profile, loading, profileLoading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (profileLoading) return <LoadingScreen />;

  if (requireOnboarding && !profile?.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!requireOnboarding && profile?.onboarding_completed) {
    return <Navigate to="/explore" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
