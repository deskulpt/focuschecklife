
-- PACKAGES
CREATE TABLE public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  price_cad_cents integer NOT NULL DEFAULT 0,
  sale_price_cad_cents integer,
  is_free boolean NOT NULL DEFAULT false,
  grants_full_test boolean NOT NULL DEFAULT false,
  grants_pdf boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.packages TO anon, authenticated;
GRANT ALL ON public.packages TO service_role;

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active packages" ON public.packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage packages" ON public.packages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed starter packages
INSERT INTO public.packages (slug, name, description, features, price_cad_cents, sale_price_cad_cents, is_free, grants_full_test, grants_pdf, sort_order)
VALUES
  ('free-basic', 'Free Basic', 'Quick screening with limited results preview.',
    '["Cognitive games","Symptom screener","Limited preview"]'::jsonb, 0, NULL, true, false, false, 1),
  ('full-report', 'Full Report', 'Complete results, AI interpretation and PDF download.',
    '["Full risk profile","AI-powered interpretation","PDF report download"]'::jsonb, 699, NULL, false, true, true, 2),
  ('monitoring-plan', 'Monitoring Plan', 'Reassessments over time with longitudinal comparison.',
    '["Everything in Full Report","Reassessment tracking","Longitudinal comparisons"]'::jsonb, 1499, NULL, false, true, true, 3);

-- EXCHANGE RATES (base = CAD)
CREATE TABLE public.exchange_rates (
  currency_code text PRIMARY KEY,
  rate_from_cad numeric NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.exchange_rates TO anon, authenticated;
GRANT ALL ON public.exchange_rates TO service_role;

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read exchange rates" ON public.exchange_rates
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage rates" ON public.exchange_rates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Seed CAD = 1
INSERT INTO public.exchange_rates (currency_code, rate_from_cad) VALUES ('CAD', 1);

-- Site settings: localization + currency
INSERT INTO public.site_settings (key, value) VALUES
  ('default_language', 'en'),
  ('forced_language', ''),
  ('available_languages', 'en,pt'),
  ('base_currency', 'CAD'),
  ('pricing_rounding', '.99')
ON CONFLICT (key) DO NOTHING;
