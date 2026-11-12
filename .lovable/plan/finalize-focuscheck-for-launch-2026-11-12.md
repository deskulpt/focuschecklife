# Finalize FocusCheck for launch

Review found the app builds cleanly, but a few things are broken or unfinished. This plan fixes them in order, safest first, without changing how the app looks or behaves for users unless noted.

## 1. Broken features (fix first)
- **"Send reminder email" button in Admin CRM does nothing.** It calls an email sender that was never deployed. Build the reminder email (branded, EN), deploy it, and confirm a test reminder arrives.
- **Assessment attempt counter can be bypassed or fail silently.** The count is updated from the browser and errors are ignored. Move the increment into the database (runs automatically when a result is saved) so the 2-free-attempt limit holds.
- **Saving results ignores errors.** If saving fails, the user still thinks it worked. Show a clear message and a retry option.
- **Payment button errors** show a generic toast only; add a loading state on the button and a readable error.

## 2. Security tidy-up
- Site settings: signed-in users can read every setting (including admin-only ones). Limit non-admins to the public keys already used by the site.
- Exchange rates and translations being public is intentional (needed to show prices and text to visitors) — mark these as accepted.

## 3. Code clean-up (no visible change)
- Remove ~50 loose type shortcuts (`any`) across admin screens, results and assessment flow, replacing with proper types.
- Split the very large results dashboard (54 KB) into smaller pieces: gauge, radar, AI insights, resources, PDF actions.
- Move direct database calls out of screens into a small shared service layer, starting with the assessment and profile flows.
- Remove unused files/imports and leftover duplicate lockfile.

## 4. Launch polish
- Add a project task list (roadmap) and a short project rules file.
- Add tests for the rules that matter most: 2 free attempts limit, .99 price rounding from CAD, promo code unlock.
- Final end-to-end check in the browser on desktop and mobile: sign up, onboarding, assessment, results blur, promo unlock, payment start, admin CRM reminder, language and currency switching.

## Not included (needs you)
- Google Search Console connection (needs your authorization).
- Facebook login (not supported by the managed sign-in).
- New SEO content page "ADHD symptoms in adults" — say if you want it added.

## Technical details
- New edge function `send-transactional-email` using existing email queue (`enqueue_email`), admin-only via `has_role`.
- Trigger `AFTER INSERT ON user_assessments` increments `profiles.assessment_count`; remove client update.
- Replace `site_settings` "Authenticated can read settings" policy with key whitelist + admin `has_role`.
- Services in `src/services/` (assessments, profiles, payments) consumed via TanStack Query.
- Vitest tests next to `src/lib` utilities.
