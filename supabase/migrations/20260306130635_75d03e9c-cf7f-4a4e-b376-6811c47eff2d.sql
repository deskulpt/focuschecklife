CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  grants_full_test boolean NOT NULL DEFAULT true,
  grants_pdf boolean NOT NULL DEFAULT false,
  max_uses integer DEFAULT NULL,
  times_used integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz DEFAULT NULL
);

CREATE TABLE public.promo_code_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid REFERENCES public.promo_codes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(promo_code_id, user_id)
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read active promo codes (to validate)
CREATE POLICY "Anyone can read active promo codes" ON public.promo_codes
  FOR SELECT TO authenticated USING (is_active = true);

-- Users can insert their own redemptions
CREATE POLICY "Users can redeem codes" ON public.promo_code_redemptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can view their own redemptions
CREATE POLICY "Users can view own redemptions" ON public.promo_code_redemptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Insert promo codes for friends and family
INSERT INTO public.promo_codes (code, description, grants_full_test, grants_pdf, max_uses) VALUES
  ('FAMILY2026', 'Friends & Family - Full Test Access', true, false, 20),
  ('FRIEND-VIP', 'VIP Friend Code - Full Test + PDF', true, true, 10),
  ('BETA-TESTER', 'Beta Tester Access', true, false, 50),
  ('FOCUSCHECK1', 'Launch Promo - Full Test', true, false, 30),
  ('PDF-GIFT', 'Gift Code - PDF Report', false, true, 15);