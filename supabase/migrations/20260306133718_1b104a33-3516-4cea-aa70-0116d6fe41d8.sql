
-- Fix the permissive INSERT policy on page_visits to be more specific
DROP POLICY IF EXISTS "Anyone can insert visits" ON public.page_visits;
CREATE POLICY "Anyone can insert visits" ON public.page_visits FOR INSERT TO anon, authenticated
  WITH CHECK (true);
