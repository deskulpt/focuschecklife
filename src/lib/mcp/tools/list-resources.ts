import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_resources",
  title: "List ADHD resources",
  description:
    "List the published ADHD learning resources curated in FocusCheck (organisations, podcasts, communities), optionally filtered by category.",
  inputSchema: {
    category: z.string().trim().min(1).nullable().default(null).describe("Optional category filter."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("cms_resources")
      .select("title, description, url, category, badge, sort_order")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (category) query = query.eq("category", category);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const rows = data ?? [];
    return {
      content: [
        { type: "text", text: rows.length ? JSON.stringify(rows, null, 2) : "No published resources." },
      ],
      structuredContent: { resources: rows },
    };
  },
});
