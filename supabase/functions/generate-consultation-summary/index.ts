import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { verifyUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const { user } = await verifyUser(req);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Server-side premium gate — free-tier users cannot call this endpoint.
    const { data: sub } = await supabase
      .from("user_subscriptions")
      .select("tier, expires_at")
      .eq("user_id", user.id)
      .maybeSingle();

    const isPremium = !!sub && sub.tier === "premium" &&
      (!sub.expires_at || new Date(sub.expires_at) > new Date());
    if (!isPremium) {
      return new Response(JSON.stringify({ error: "TIA Plus subscription required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [labRes, healthRes] = await Promise.all([
      supabase
        .from("lab_reports")
        .select("tsh_level, t3_level, t4_level, tsh_status, t3_status, t4_status, created_at, ai_summary")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("health_tracker")
        .select("date, mood, energy_level, tsh_level, t3_level, t4_level, notes")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(30),
    ]);

    const labs = labRes.data || [];
    const health = healthRes.data || [];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dataContext = JSON.stringify({ labs, health });

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are TIA, a thyroid health AI assistant. Generate a professional, clinical-quality consultation summary suitable for sharing with a doctor.

The summary should include:
1. **Patient Overview** — brief summary of tracking history
2. **Lab Trend Analysis** — TSH, T3, T4 trends over available reports with dates
3. **Symptom Patterns** — mood, energy, and any noted symptoms
4. **Key Observations** — correlations between lab values and symptoms
5. **Questions to Discuss** — 2-3 suggested questions for the doctor visit

Format the summary in clean, professional prose. Use bullet points where appropriate.
Keep tone objective and clinical but clear for a patient to understand.
Do NOT diagnose or prescribe — frame observations as data points for discussion.
Keep the total length under 500 words.`,
          },
          {
            role: "user",
            content: `Generate a doctor consultation summary from this data:\n${dataContext}`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI error:", status, await aiResponse.text());
      return new Response(JSON.stringify({ error: "Failed to generate summary" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const summary = aiData.choices?.[0]?.message?.content || "Unable to generate summary.";

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-consultation-summary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
