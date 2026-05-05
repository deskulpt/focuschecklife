-- Allow anon to read site_settings (landing page + tracking scripts use it pre-auth)
DROP POLICY IF EXISTS "Anyone can read settings" ON public.site_settings;
CREATE POLICY "Anyone can read settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (true);

-- Ensure realtime.messages restricts subscriptions to admins only
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can subscribe to realtime" ON realtime.messages;
CREATE POLICY "Admins can subscribe to realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Tighten promo_code_redemptions INSERT to require a valid, active, redeemable code
DROP POLICY IF EXISTS "Users can redeem codes" ON public.promo_code_redemptions;
CREATE POLICY "Users can redeem codes"
ON public.promo_code_redemptions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.promo_codes pc
    WHERE pc.id = promo_code_id
      AND pc.is_active = true
      AND (pc.expires_at IS NULL OR pc.expires_at > now())
      AND (pc.max_uses IS NULL OR pc.times_used < pc.max_uses)
  )
);