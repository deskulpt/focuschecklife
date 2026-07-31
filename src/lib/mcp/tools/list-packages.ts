import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_packages",
  title: "List FocusCheck packages",
  description:
    "List the active FocusCheck packages with their base prices in Canadian dollars (cents) and what each package unlocks.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("packages")
      .select(
        "slug, name, description, features, price_cad_cents, sale_price_cad_cents, is_free, grants_full_test, grants_pdf, sort_order",
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const rows = data ?? [];
    return {
      content: [
        { type: "text", text: rows.length ? JSON.stringify(rows, null, 2) : "No active packages." },
      ],
      structuredContent: { packages: rows },
    };
  },
});
