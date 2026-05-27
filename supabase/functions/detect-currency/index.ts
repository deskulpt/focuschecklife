import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Minimal country -> ISO currency map (covers ~99% of visitors)
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: "USD", CA: "CAD", GB: "GBP", AU: "AUD", NZ: "NZD",
  BR: "BRL", MX: "MXN", AR: "ARS", CL: "CLP", CO: "COP",
  IN: "INR", JP: "JPY", CN: "CNY", HK: "HKD", SG: "SGD", KR: "KRW", TW: "TWD", TH: "THB", MY: "MYR", ID: "IDR", PH: "PHP", VN: "VND",
  AE: "AED", SA: "SAR", IL: "ILS", TR: "TRY", EG: "EGP", ZA: "ZAR", NG: "NGN", KE: "KES",
  CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN", CZ: "CZK", HU: "HUF", RO: "RON", RU: "RUB", UA: "UAH",
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", PT: "EUR", NL: "EUR", BE: "EUR", AT: "EUR", IE: "EUR", FI: "EUR", GR: "EUR", LU: "EUR", SK: "EUR", SI: "EUR", EE: "EUR", LV: "EUR", LT: "EUR", CY: "EUR", MT: "EUR",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      "";

    let country = req.headers.get("cf-ipcountry") || "";
    if (!country && ip) {
      try {
        const r = await fetch(`https://ipapi.co/${ip}/country/`);
        if (r.ok) country = (await r.text()).trim();
      } catch (_) { /* ignore */ }
    }
    country = (country || "").toUpperCase();
    const currency = COUNTRY_TO_CURRENCY[country] || "USD";

    return new Response(
      JSON.stringify({ country, currency }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ country: "", currency: "USD", error: e instanceof Error ? e.message : "unknown" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
