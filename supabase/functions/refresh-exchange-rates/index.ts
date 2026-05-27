import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TRACKED = [
  "CAD","USD","EUR","GBP","AUD","NZD","BRL","MXN","ARS","CLP","COP",
  "INR","JPY","CNY","HKD","SGD","KRW","TWD","THB","MYR","IDR","PHP","VND",
  "AED","SAR","ILS","TRY","EGP","ZAR","NGN","KES",
  "CHF","SEK","NOK","DKK","PLN","CZK","HUF","RON","RUB","UAH",
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // open.er-api.com is free, no key required, base = CAD
    const r = await fetch("https://open.er-api.com/v6/latest/CAD");
    if (!r.ok) throw new Error(`forex fetch failed: ${r.status}`);
    const json = await r.json();
    const rates = json?.rates as Record<string, number> | undefined;
    if (!rates) throw new Error("no rates in response");

    const rows = TRACKED
      .filter((c) => typeof rates[c] === "number")
      .map((c) => ({ currency_code: c, rate_from_cad: rates[c], updated_at: new Date().toISOString() }));

    // ensure CAD = 1
    if (!rows.find((r) => r.currency_code === "CAD")) {
      rows.push({ currency_code: "CAD", rate_from_cad: 1, updated_at: new Date().toISOString() });
    }

    const { error } = await supabase.from("exchange_rates").upsert(rows, { onConflict: "currency_code" });
    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, count: rows.length, fetched_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("refresh-exchange-rates error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
