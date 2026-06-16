DROP POLICY IF EXISTS "Anyone can insert visits" ON public.page_visits;
CREATE POLICY "Anyone can insert valid visits"
ON public.page_visits
FOR INSERT
TO anon, authenticated
WITH CHECK (
  session_id IS NOT NULL
  AND length(trim(session_id)) > 0
  AND page IS NOT NULL
  AND length(trim(page)) > 0
  AND length(page) <= 500
);

DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;
CREATE POLICY "Anyone can join waitlist with valid email"
ON public.waitlist
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(trim(email)) BETWEEN 3 AND 320
  AND position('@' in email) > 1
  AND source IS NOT NULL
  AND length(trim(source)) > 0
  AND length(source) <= 100
);