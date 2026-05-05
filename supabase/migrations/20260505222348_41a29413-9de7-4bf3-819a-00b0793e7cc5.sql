-- Remove page_visits from realtime to prevent broadcasting user tracking data
ALTER PUBLICATION supabase_realtime DROP TABLE public.page_visits;

-- Restrict realtime channel subscriptions to admins only (no public app feature uses realtime)
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can subscribe to realtime" ON realtime.messages;
CREATE POLICY "Admins can subscribe to realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));