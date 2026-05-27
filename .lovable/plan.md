## Goal

Visitors anywhere see prices in their own currency, auto-converted from your CAD base prices via live forex, rounded to a clean `.99`. You manage all packages and languages from the admin CMS.

---

## 1. Database

**New table `packages`** (replaces hardcoded $5 / free tiers)
- name, slug, description, features (list)
- `price_cad`, `sale_price_cad` (your input, in CAD cents)
- `grants_full_test`, `grants_pdf`, `is_free`
- `sort_order`, `is_active`
- Seed 3 starter packages — Free Basic, Full Report, Monitoring Plan.

**New table `exchange_rates`** (24h cache, base = CAD)
- `currency_code`, `rate_from_cad`, `updated_at`
- Public read, service-role write.

**New keys in `site_settings`**
- `default_language`, `forced_language` (blank = off), `available_languages` (CSV)
- `base_currency` = `CAD`, `pricing_rounding` = `.99`

---

## 2. Edge functions

- **`detect-currency`** — reads visitor IP, maps country → ISO currency, returns `{ currency, country }`.
- **`refresh-exchange-rates`** — fetches `exchangerate.host` (free, no key, base CAD), upserts ~30 common currencies. Auto-refresh when cache >24h stale; "Refresh now" button in admin.

---

## 3. Frontend

- **`CurrencyContext`**: detects currency on mount, loads rates, exposes `formatPrice(cadCents)` → converts and rounds to `.99` (CAD 6.50 → USD 4.99, BRL 24.99). For zero-decimal currencies (JPY, HUF, ISK) rounds to nearest 99.
- **`<Price packageId>`** component: replaces all hardcoded `$5 / R$25` strings.
- Tiny note under price: "Shown in {USD} · billed in CAD".
- Optional manual currency switcher in header.

---

## 4. Admin CMS

**New "Packages" tab** in `/admin`:
- List with reorder + active toggle.
- Form per package: name, description, features, **price CAD**, **sale price CAD**, grants checkboxes, free toggle.
- "Add package" — unlimited.

**Localization section in Admin Settings**:
- Default language, Forced language (blank = user choice), Available languages multi-select.
- "Refresh exchange rates" button + last-refreshed timestamp.

---

## 5. Stripe

`create-payment` reads `packageId`, builds Checkout session in **CAD** using `price_cad` / `sale_price_cad`. Stripe Adaptive Pricing (optional toggle in your Stripe dashboard) shows the buyer their local equivalent at checkout — settlement stays CAD.

---

## 6. Rounding logic

```
converted = cadCents × rate / 100
floor(converted) + 0.99      // 6.42 → 6.99, 7.10 → 7.99
JPY/HUF/ISK: round to nearest 99 (¥499, ¥999)
```

---

## Files

**New**: `packages` + `exchange_rates` migration, `supabase/functions/detect-currency`, `supabase/functions/refresh-exchange-rates`, `src/contexts/CurrencyContext.tsx`, `src/components/Price.tsx`, `src/components/admin/AdminPackages.tsx`.
**Edited**: `create-payment`, `Landing.tsx`, `AssessmentResultsDashboard.tsx`, `ConsentDialog.tsx`, `PromoCodeInput.tsx`, `AdminSettings.tsx`, `Admin.tsx`, `LanguageContext.tsx`.

---

## Before I build — quick confirmations

1. **Your CAD prices** for the 3 starter packages (Free / Full Report / Monitoring Plan)? I'll seed exact values — otherwise I'll seed placeholders (Free 0, Full Report 6.99 CAD, Monitoring 14.99 CAD) for you to edit.
2. Manual currency switcher in the header — yes or detection-only?
3. Enable **Stripe Adaptive Pricing** at checkout? (You'd flip the toggle in Stripe; I'll wire the code to be compatible.)
