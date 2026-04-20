import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Authenticate the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { assessmentData, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language === 'pt-BR' ? 'Brazilian Portuguese' : 'English';

    const systemPrompt = `You are a clinical neuropsychologist specializing in ADHD assessment. You provide compassionate, evidence-based interpretations of ADHD screening results. Your tone is warm, professional, and empowering — never alarming.

IMPORTANT RULES:
- Respond in ${lang}
- This is a SCREENING tool, not a diagnosis. Always emphasize this.
- Be specific about what each score means in practical, everyday terms
- Provide actionable next steps
- Reference DSM-5 criteria where relevant
- Use empathetic language — many users are anxious about results
- Keep the response structured with clear sections
- Do NOT use markdown headers (no #), use plain text with line breaks
- Keep total response under 400 words`;

    const userPrompt = `Interpret these ADHD screening results for a user:

AGE GROUP: ${assessmentData.ageGroup}

SURVEY SCORES (percentage of max possible):
- Inattention: ${assessmentData.categoryScores?.inattention?.percentage || 0}% (${assessmentData.categoryScores?.inattention?.level || 'unknown'})
- Hyperactivity: ${assessmentData.categoryScores?.hyperactivity?.percentage || 0}% (${assessmentData.categoryScores?.hyperactivity?.level || 'unknown'})
- Impulsivity: ${assessmentData.categoryScores?.impulsivity?.percentage || 0}% (${assessmentData.categoryScores?.impulsivity?.level || 'unknown'})
- Functional Impairment: ${assessmentData.categoryScores?.functional_impairment?.percentage || 0}% (${assessmentData.categoryScores?.functional_impairment?.level || 'unknown'})

COGNITIVE TEST RESULTS:
${assessmentData.cpt ? `Attention Test (CPT): ${assessmentData.cpt.correctHits} correct hits, ${assessmentData.cpt.missedTargets} missed, ${assessmentData.cpt.falseAlarms} false alarms, avg reaction time ${assessmentData.cpt.averageReactionTime}ms` : 'Not completed'}
${assessmentData.workingMemory ? `Working Memory: ${assessmentData.workingMemory.correctResponses} correct, ${assessmentData.workingMemory.incorrectResponses} incorrect, max level ${assessmentData.workingMemory.maxNLevel}` : 'Not completed'}
${assessmentData.stroop ? `Stroop Test: ${assessmentData.stroop.correctResponses} correct, avg ${assessmentData.stroop.averageReactionTime}ms, congruent accuracy ${Math.round((assessmentData.stroop.congruentAccuracy || 0) * 100)}%, incongruent accuracy ${Math.round((assessmentData.stroop.incongruentAccuracy || 0) * 100)}%` : 'Not completed'}

Provide:
1. A brief overall summary (2-3 sentences)
2. Key findings from the survey portion — what the pattern of scores suggests in everyday terms
3. Key findings from cognitive tests — what reaction times and accuracy patterns mean
4. Areas of strength identified
5. Practical recommendations (3-4 specific, actionable suggestions)
6. A brief note about what to discuss with a healthcare professional`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI interpretation failed");
    }

    const result = await response.json();
    const interpretation = result.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ interpretation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("interpret-results error:", e);
    return new Response(JSON.stringify({ error: "An internal error occurred. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
