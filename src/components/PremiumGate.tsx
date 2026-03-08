import { useNavigate } from "react-router-dom";
import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription, PremiumFeature } from "@/hooks/useSubscription";

interface PremiumGateProps {
  feature: PremiumFeature;
  children: React.ReactNode;
  fallbackMessage?: string;
}

const PremiumGate = ({ feature, children, fallbackMessage }: PremiumGateProps) => {
  const { isPremium, isLoading } = useSubscription();
  const navigate = useNavigate();

  if (isLoading) return <>{children}</>;
  if (isPremium) return <>{children}</>;

  return (
    <div className="relative group">
      <div className="pointer-events-none opacity-40 blur-[2px] select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="bg-card/95 backdrop-blur-md border border-primary/20 rounded-2xl p-6 text-center max-w-sm mx-4 shadow-lg">
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
            <Crown className="w-6 h-6 text-pink-300" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">TIA Plus Feature</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {fallbackMessage || "Unlock deeper insights and advanced tools with TIA Plus."}
          </p>
          <Button
            onClick={() => navigate("/pricing")}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full px-6"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to TIA Plus
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PremiumGate;

// Small badge for feature cards
export const PremiumBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-400/30">
    <Crown className="w-3 h-3" />
    Plus
  </span>
);
