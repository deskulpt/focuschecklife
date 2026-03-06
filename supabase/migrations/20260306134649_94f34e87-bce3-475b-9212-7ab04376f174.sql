
-- Languages table
CREATE TABLE public.languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  flag text NOT NULL DEFAULT '🌐',
  is_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read enabled languages" ON public.languages FOR SELECT USING (is_enabled = true);
CREATE POLICY "Admins can manage languages" ON public.languages FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Translations table
CREATE TABLE public.translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code text NOT NULL REFERENCES public.languages(code) ON DELETE CASCADE,
  key text NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(language_code, key)
);

ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read translations" ON public.translations FOR SELECT USING (true);
CREATE POLICY "Admins can manage translations" ON public.translations FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Seed default languages
INSERT INTO public.languages (code, name, flag, is_enabled) VALUES
  ('en', 'English', '🇺🇸', true),
  ('pt-BR', 'Português (BR)', '🇧🇷', true);

-- updated_at trigger
CREATE TRIGGER update_translations_updated_at BEFORE UPDATE ON public.translations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
