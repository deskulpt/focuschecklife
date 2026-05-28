import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANG_NAMES: Record<string, string> = {
  en: "English",
  "pt-BR": "Brazilian Portuguese",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  hi: "Hindi",
  zh: "Chinese (Simplified)",
  ja: "Japanese",
  ar: "Arabic",
};

const callAi = async (apiKey: string, system: string, user: string) => {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      stream: false,
    }),
  });
  if (!response.ok) {
    if (response.status === 429) return { error: "Rate limited. Please try again in a moment.", status: 429 };
    if (response.status === 402) return { error: "AI credits exhausted. Please add funds.", status: 402 };
    const t = await response.text();
    console.error("AI gateway error:", response.status, t);
    return { error: "AI request failed", status: 500 };
  }
  const result = await response.json();
  return { text: (result.choices?.[0]?.message?.content || "").trim() };
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    // Server-side paywall enforcement
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("has_paid_full_test")
      .eq("user_id", userId)
      .maybeSingle();
    if (!profile?.has_paid_full_test) {
      return new Response(JSON.stringify({ error: "Upgrade required to generate AI report." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const body = await req.json();
    const mode: "generate" | "translate" = body.mode === "translate" ? "translate" : "generate";

    // -------- TRANSLATE MODE (on-demand, user-triggered) --------
    if (mode === "translate") {
      const { assessmentId, targetLanguage } = body;
      if (!assessmentId || !targetLanguage) {
        return new Response(JSON.stringify({ error: "assessmentId and targetLanguage are required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (targetLanguage === "en") {
        return new Response(JSON.stringify({ error: "Source is already English" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Load assessment and verify ownership
      const { data: assessment } = await supabaseAdmin
        .from("user_assessments")
        .select("user_id, ai_interpretation, ai_interpretation_translations")
        .eq("id", assessmentId)
        .maybeSingle();
      if (!assessment || assessment.user_id !== userId) {
        return new Response(JSON.stringify({ error: "Not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!assessment.ai_interpretation) {
        return new Response(JSON.stringify({ error: "No English report to translate yet." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const cached = (assessment.ai_interpretation_translations as Record<string, string> | null) || {};
      if (cached[targetLanguage]) {
        return new Response(JSON.stringify({ interpretation: cached[targetLanguage], cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const langName = LANG_NAMES[targetLanguage] || targetLanguage;
      const sys = `You are a professional medical translator. Translate the following ADHD screening report from English into ${langName}. Preserve meaning, clinical tone, line breaks, numbers, and any inline emphasis. Do not add commentary. Return only the translated text.`;
      const result = await callAi(LOVABLE_API_KEY, sys, assessment.ai_interpretation);
      if ("error" in result) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: result.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const nextTranslations = { ...cached, [targetLanguage]: result.text };
      await supabaseAdmin
        .from("user_assessments")
        .update({ ai_interpretation_translations: nextTranslations })
        .eq("id", assessmentId);

      return new Response(JSON.stringify({ interpretation: result.text, cached: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // -------- GENERATE MODE (always English) --------
    const { assessmentData, assessmentId } = body;
    if (!assessmentData) {
      return new Response(JSON.stringify({ error: "assessmentData is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a clinical neuropsychologist specializing in ADHD assessment. You provide compassionate, evidence-based interpretations of ADHD screening results. Your tone is warm, professional, and empowering — never alarming.

IMPORTANT RULES:
- Respond in English only. Do not translate. Translations are handled separately on user request.
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

    const result = await callAi(LOVABLE_API_KEY, systemPrompt, userPrompt);
    if ("error" in result) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: result.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cache English interpretation if assessmentId is provided and owned by user
    if (assessmentId) {
      const { data: own } = await supabaseAdmin
        .from("user_assessments")
        .select("user_id")
        .eq("id", assessmentId)
        .maybeSingle();
      if (own?.user_id === userId) {
        await supabaseAdmin
          .from("user_assessments")
          .update({ ai_interpretation: result.text, ai_interpretation_translations: {} })
          .eq("id", assessmentId);
      }
    }

    return new Response(JSON.stringify({ interpretation: result.text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("interpret-results error:", e);
    return new Response(JSON.stringify({ error: "An internal error occurred. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
