# Project rules
- Business rules (pricing rounding, free-attempt limit) live in `src/lib/pricing.ts` with tests beside them — single source so UI and tests agree.
- Assessment attempt count is incremented by a database trigger on result insert, never from the client — prevents bypass.
- All app emails go through the single `send-transactional-email` function with templates in `supabase/functions/_shared/transactional-email-templates/`.
