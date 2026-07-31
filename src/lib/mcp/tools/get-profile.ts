import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_profile",
  title: "Get my FocusCheck profile",
  description:
    "Return the signed-in user's FocusCheck profile: name, location, onboarding answers, plan, attempts used, and consent flags.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "full_name, age, age_range, gender, city, state, country, plan, has_paid_full_test, has_paid_pdf, assessment_count, onboarding_completed, testing_for, guardian_relationship, adhd_familiarity, assessment_reason, current_experiences, support_goals, physical_interests, mental_interests, share_results_consent, marketing_email_opt_in, marketing_push_opt_in, created_at",
      )
      .eq("user_id", ctx.getUserId())
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return { content: [{ type: "text", text: "No profile found for this account yet." }] };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { profile: data },
    };
  },
});
