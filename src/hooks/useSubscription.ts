import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionTier = "free" | "premium";

interface SubscriptionState {
  tier: SubscriptionTier;
  isLoading: boolean;
  isPremium: boolean;
}

export const useSubscription = (): SubscriptionState => {
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("user_subscriptions")
        .select("tier, expires_at")
        .eq("user_id", session.user.id)
        .single();

      if (data) {
        const isExpired = data.expires_at && new Date(data.expires_at) < new Date();
        setTier(isExpired ? "free" : (data.tier as SubscriptionTier));
      }
      setIsLoading(false);
    };

    fetchSubscription();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchSubscription();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { tier, isLoading, isPremium: tier === "premium" };
};

// Feature gating map
export const PREMIUM_FEATURES = {
  stabilityScore: true,
  smartInsights: true,
  rootCauseAnalyzer: true,
  consultationSummary: true,
  lifestyleCoaching: true,
  advancedTrends: true,
  unlimitedReports: true,
  adaptiveReminders: true,
} as const;

export type PremiumFeature = keyof typeof PREMIUM_FEATURES;
