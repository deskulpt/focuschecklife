DROP POLICY IF EXISTS "Authenticated can read settings" ON public.site_settings;
CREATE POLICY "Authenticated can read public settings" ON public.site_settings FOR SELECT TO authenticated
USING (key = ANY (ARRAY['google_analytics_id','facebook_pixel_id','custom_head_scripts','checkout_conversion_scripts','pricing_usd','pricing_brl','discount_enabled','limited_time_enabled','discount_original_price','discount_savings_message','default_language','forced_language','available_languages','base_currency','pricing_rounding','booking_enabled','booking_url','booking_clinic_name']));
DROP POLICY IF EXISTS "Anon can read public settings" ON public.site_settings;
CREATE POLICY "Anon can read public settings" ON public.site_settings FOR SELECT TO anon
USING (key = ANY (ARRAY['google_analytics_id','facebook_pixel_id','custom_head_scripts','checkout_conversion_scripts','pricing_usd','pricing_brl','discount_enabled','limited_time_enabled','discount_original_price','discount_savings_message','default_language','forced_language','available_languages','base_currency','pricing_rounding','booking_enabled','booking_url','booking_clinic_name']));

CREATE OR REPLACE FUNCTION public.increment_assessment_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles SET assessment_count = COALESCE(assessment_count,0) + 1 WHERE user_id = NEW.user_id;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.increment_assessment_count() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_increment_assessment_count ON public.user_assessments;
CREATE TRIGGER trg_increment_assessment_count AFTER INSERT ON public.user_assessments
FOR EACH ROW EXECUTE FUNCTION public.increment_assessment_count();