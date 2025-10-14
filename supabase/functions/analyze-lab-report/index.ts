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
    const { fileUrl, fileName, fileType, userId } = await req.json();
    
    if (!fileUrl || !userId) {
      return new Response(
        JSON.stringify({ error: "File URL and user ID are required" }),
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

    console.log('Analyzing lab report:', fileName, 'for user:', userId);

    // Prepare the messages based on file type
    const systemPrompt = `You are TIA, a compassionate thyroid health assistant. Analyze thyroid lab reports and extract TSH, T3, and T4 levels. Also extract any medication names, dosages, and frequencies mentioned in the report.

Your response MUST be a valid JSON object with this exact structure:
{
  "tsh_level": number or null,
  "t3_level": number or null,
  "t4_level": number or null,
  "tsh_status": "normal" | "elevated" | "low" | "unknown",
  "t3_status": "normal" | "elevated" | "low" | "unknown",
  "t4_status": "normal" | "elevated" | "low" | "unknown",
  "summary": "2-3 sentence empathetic summary with beautiful language",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "medications": [{"name": "medication name", "dosage": "dosage", "frequency": "frequency"}]
}

Normal ranges:
- TSH: 0.4 - 4.0 µIU/mL
- T3: 80 - 200 ng/dL
- T4: 5.0 - 12.0 µg/dL

Be warm, encouraging, and emotionally supportive. Use gentle, caring language like:
- "Your thyroid levels are stabilizing beautifully this month 🌸"
- "TSH levels show improvement — keep nurturing your health 💜"
- "Your dedication to wellness is reflected in these balanced levels 🦋"`;

    const messages: any[] = [{ role: 'system', content: systemPrompt }];

    // Handle different file types
    if (fileType?.startsWith('image/')) {
      // For images, use vision capabilities
      messages.push({
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: 'Please analyze this thyroid lab report image and extract all hormone levels and medication information:' 
          },
          { 
            type: 'image_url', 
            image_url: { url: fileUrl } 
          }
        ]
      });
    } else {
      // For PDFs and text files, fetch the content
      try {
        const fileResponse = await fetch(fileUrl);
        const reportText = await fileResponse.text();
        messages.push({
          role: 'user',
          content: `Please analyze this thyroid lab report and extract the hormone levels and medication information:\n\n${reportText}`
        });
      } catch (fetchError) {
        console.error('Error fetching file content:', fetchError);
        messages.push({
          role: 'user',
          content: 'Please analyze this thyroid lab report based on the file information provided.'
        });
      }
    }

    // Call Lovable AI to analyze the report
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
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

    // Save to lab_reports table
    const { data: reportData, error: reportError } = await supabase
      .from('lab_reports')
      .insert({
        user_id: userId,
        report_name: fileName,
        report_type: fileType,
        report_url: fileUrl,
        tsh_level: analysisResult.tsh_level,
        t3_level: analysisResult.t3_level,
        t4_level: analysisResult.t4_level,
        tsh_status: analysisResult.tsh_status,
        t3_status: analysisResult.t3_status,
        t4_status: analysisResult.t4_status,
        ai_summary: analysisResult.summary,
        ai_recommendations: analysisResult.recommendations?.join('\n'),
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error saving lab report:', reportError);
    }

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
        synced_from_report_id: reportData?.id,
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
        description: 'Time for your follow-up thyroid test 🌸',
        reminder_type: 'test',
        reminder_date: nextTestDate.toISOString().split('T')[0],
        reminder_time: '09:00:00',
        frequency: 'once',
        is_active: true,
        synced_from_report_id: reportData?.id,
      });

    if (reminderError) {
      console.error('Error creating test reminder:', reminderError);
    }

    // Create medication reminders if medications were extracted
    if (analysisResult.medications && Array.isArray(analysisResult.medications)) {
      for (const med of analysisResult.medications) {
        const { error: medReminderError } = await supabase
          .from('reminders')
          .insert({
            user_id: userId,
            title: `Take ${med.name}`,
            description: `${med.dosage} ${med.frequency || 'as prescribed'} 💊`,
            reminder_type: 'medication',
            reminder_date: new Date().toISOString().split('T')[0],
            reminder_time: '08:00:00',
            frequency: 'daily',
            is_active: true,
            synced_from_report_id: reportData?.id,
          });

        if (medReminderError) {
          console.error('Error creating medication reminder:', medReminderError);
        }
      }
    }

    console.log('Analysis complete and synced across TIA!');

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