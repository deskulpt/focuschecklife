import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("User not authenticated or email not available");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // Parse package slug from body (default: full-report)
    let packageSlug = "full-report";
    try {
      const body = await req.json();
      if (body?.packageSlug && typeof body.packageSlug === "string") {
        packageSlug = body.packageSlug;
      }
    } catch (_) { /* no body */ }

    // Fetch package using service role (RLS allows public read but we want active check)
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const { data: pkg, error: pkgErr } = await admin
      .from("packages")
      .select("name, description, price_cad_cents, sale_price_cad_cents, is_free, is_active")
      .eq("slug", packageSlug)
      .maybeSingle();

    if (pkgErr || !pkg || !pkg.is_active) throw new Error("Package not found");
    if (pkg.is_free) throw new Error("This package is free — no payment required");

    const amount = pkg.sale_price_cad_cents ?? pkg.price_cad_cents;
    if (!amount || amount <= 0) throw new Error("Invalid package price");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{
        price_data: {
          currency: "cad",
          unit_amount: amount,
          product_data: {
            name: pkg.name,
            description: pkg.description ?? undefined,
          },
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/assessment`,
      metadata: {
        user_id: user.id,
        package_slug: packageSlug,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("create-payment error:", error);
    const known = error instanceof Error &&
      ["User not authenticated or email not available", "Package not found", "This package is free — no payment required", "Invalid package price"].includes(error.message);
    const msg = known ? (error as Error).message : "An internal error occurred. Please try again.";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: known ? 400 : 500,
    });
  }
});
