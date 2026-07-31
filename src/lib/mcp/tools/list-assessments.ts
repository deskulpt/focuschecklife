import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_assessments",
  title: "List my assessments",
  description:
    "List the signed-in user's completed FocusCheck screening assessments, newest first, with score, risk level and completion metadata.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(10).describe("Maximum assessments to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("user_assessments")
      .select(
        "id, test_type, age_group, overall_score, risk_level, completion_percentage, time_spent_seconds, is_full_access, completed_at",
      )
      .eq("user_id", ctx.getUserId())
      .order("completed_at", { ascending: false })
      .limit(limit ?? 10);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const rows = data ?? [];
    return {
      content: [
        {
          type: "text",
          text: rows.length
            ? JSON.stringify(rows, null, 2)
            : "No assessments completed yet.",
        },
      ],
      structuredContent: { assessments: rows },
    };
  },
});
