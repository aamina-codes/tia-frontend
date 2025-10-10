import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportText, userId } = await req.json();
    
    if (!reportText || !userId) {
      return new Response(
        JSON.stringify({ error: "Report text and user ID are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not found');
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing lab report with AI...');

    // Call Lovable AI to analyze the report
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are TIA, a compassionate thyroid health assistant. Analyze thyroid lab reports and extract TSH, T3, and T4 levels. Provide empathetic, clear insights.

Your response MUST be a valid JSON object with this exact structure:
{
  "tsh_level": number or null,
  "t3_level": number or null,
  "t4_level": number or null,
  "tsh_status": "normal" | "elevated" | "low" | "unknown",
  "t3_status": "normal" | "elevated" | "low" | "unknown",
  "t4_status": "normal" | "elevated" | "low" | "unknown",
  "summary": "2-3 sentence empathetic summary",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

Normal ranges:
- TSH: 0.4 - 4.0 µIU/mL
- T3: 80 - 200 ng/dL
- T4: 5.0 - 12.0 µg/dL

Be warm, encouraging, and supportive in your tone.`
          },
          {
            role: 'user',
            content: `Please analyze this thyroid lab report and extract the hormone levels:\n\n${reportText}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to analyze report" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI analysis complete, parsing results...');

    // Parse the AI response
    let analysisResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = JSON.parse(aiContent);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, aiContent);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI analysis" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store in health_tracker for automatic syncing
    const { error: trackerError } = await supabase
      .from('health_tracker')
      .insert({
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        tsh_level: analysisResult.tsh_level,
        t3_level: analysisResult.t3_level,
        t4_level: analysisResult.t4_level,
        notes: analysisResult.summary,
      });

    if (trackerError) {
      console.error('Error syncing to health tracker:', trackerError);
    }

    // Auto-create reminder for next test (30 days from now)
    const nextTestDate = new Date();
    nextTestDate.setDate(nextTestDate.getDate() + 30);

    const { error: reminderError } = await supabase
      .from('reminders')
      .insert({
        user_id: userId,
        title: 'Schedule Next Thyroid Test',
        description: 'Time for your follow-up thyroid test',
        reminder_type: 'test',
        reminder_date: nextTestDate.toISOString().split('T')[0],
        frequency: 'once',
        is_active: true,
      });

    if (reminderError) {
      console.error('Error creating reminder:', reminderError);
    }

    console.log('Analysis complete and synced!');

    return new Response(
      JSON.stringify({
        ...analysisResult,
        synced: true,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-lab-report function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});