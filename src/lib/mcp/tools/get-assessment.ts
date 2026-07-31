import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_assessment",
  title: "Get an assessment report",
  description:
    "Return one of the signed-in user's assessments in full, including survey responses, cognitive game results and the saved AI interpretation when unlocked.",
  inputSchema: {
    assessmentId: z.string().uuid().describe("The assessment id returned by list_assessments."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ assessmentId }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("user_assessments")
      .select("*")
      .eq("id", assessmentId)
      .eq("user_id", ctx.getUserId())
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) throw new ToolError(`No assessment found with id ${assessmentId}.`);

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { assessment: data },
    };
  },
});
