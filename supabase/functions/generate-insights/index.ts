import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Fetch user data in parallel
    const [labRes, healthRes] = await Promise.all([
      supabase
        .from("lab_reports")
        .select("tsh_level, t3_level, t4_level, tsh_status, t3_status, t4_status, created_at")
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

    if (labs.length === 0 && health.length === 0) {
      return new Response(
        JSON.stringify({ insights: [{ type: "info", title: "Getting Started", message: "Start tracking your health data and uploading lab reports to receive personalized insights.", timestamp: new Date().toISOString() }] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
            content: `You are TIA's insight engine — a thyroid health AI that generates personalized, supportive health insights.

Given a user's lab reports and health tracker data, generate 3-5 smart insights.

Each insight must have:
- "type": one of "correlation", "trend", "encouragement", "tip"
- "title": a short bold title (5-8 words)
- "message": a supportive, specific insight (1-2 sentences). Reference actual data patterns you see.
- "icon": one of "sparkles", "trending-up", "heart", "lightbulb", "shield"

Rules:
- Be supportive and empowering, NEVER alarming
- Reference specific data patterns (e.g., "Your TSH improved from X to Y")
- Connect different data points (mood + labs, energy + levels)
- Include at least one encouragement insight
- Do NOT diagnose or prescribe
- Keep language warm and clear

Respond ONLY with a valid JSON array of insight objects. No markdown, no explanation.`,
          },
          {
            role: "user",
            content: `Here is the user's recent health data:\n${dataContext}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_insights",
              description: "Return structured health insights",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["correlation", "trend", "encouragement", "tip"] },
                        title: { type: "string" },
                        message: { type: "string" },
                        icon: { type: "string", enum: ["sparkles", "trending-up", "heart", "lightbulb", "shield"] },
                      },
                      required: ["type", "title", "message", "icon"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["insights"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_insights" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI error:", status, await aiResponse.text());
      return new Response(JSON.stringify({ error: "Failed to generate insights" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    let insights;
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      insights = parsed.insights;
    } else {
      // Fallback: try parsing content directly
      const content = aiData.choices?.[0]?.message?.content;
      if (content) {
        insights = JSON.parse(content);
      } else {
        insights = [{ type: "info", title: "Check Back Soon", message: "TIA is analyzing your data. More insights will appear as you log more entries.", icon: "sparkles" }];
      }
    }

    // Add timestamps
    const timestampedInsights = (Array.isArray(insights) ? insights : [insights]).map((ins: any) => ({
      ...ins,
      timestamp: new Date().toISOString(),
    }));

    return new Response(JSON.stringify({ insights: timestampedInsights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
