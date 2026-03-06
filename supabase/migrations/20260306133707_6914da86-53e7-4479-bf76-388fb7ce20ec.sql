
-- Admin roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: admins can see all roles, users can see own
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Site settings table (for JS pixels, site config)
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.site_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CMS FAQs
CREATE TABLE public.cms_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cms_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published faqs" ON public.cms_faqs FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage faqs" ON public.cms_faqs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CMS Articles  
CREATE TABLE public.cms_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  icon text NOT NULL DEFAULT 'FileText',
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cms_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published articles" ON public.cms_articles FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage articles" ON public.cms_articles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Page visits tracking
CREATE TABLE public.page_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  referrer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert visits" ON public.page_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read visits" ON public.page_visits FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin RLS for promo_codes: allow full CRUD
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin RLS for profiles: admins can read all
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin RLS for user_assessments: admins can read all
CREATE POLICY "Admins can read all assessments" ON public.user_assessments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin RLS for redemptions: admins can read all
CREATE POLICY "Admins can read all redemptions" ON public.promo_code_redemptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert admin role for anand2064@gmail.com (deferred - will match when user exists)
-- We need a function to auto-assign on signup
CREATE OR REPLACE FUNCTION public.check_admin_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'anand2064@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_admin_check
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.check_admin_email();

-- If user already exists, insert role now
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'anand2064@gmail.com'
ON CONFLICT DO NOTHING;

-- Insert default site settings for tracking pixels
INSERT INTO public.site_settings (key, value) VALUES
  ('google_analytics_id', ''),
  ('facebook_pixel_id', ''),
  ('custom_head_scripts', ''),
  ('checkout_conversion_scripts', '')
ON CONFLICT (key) DO NOTHING;

-- Enable realtime for page_visits for live analytics
ALTER PUBLICATION supabase_realtime ADD TABLE public.page_visits;
