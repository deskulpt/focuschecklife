
-- 1. Block self-update of payment columns on profiles via trigger
CREATE OR REPLACE FUNCTION public.prevent_profile_payment_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow if caller is admin or service role (no auth.uid())
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- Block changes to payment/plan columns by regular users
  IF NEW.has_paid_full_test IS DISTINCT FROM OLD.has_paid_full_test
     OR NEW.has_paid_pdf IS DISTINCT FROM OLD.has_paid_pdf
     OR NEW.plan IS DISTINCT FROM OLD.plan
     OR NEW.stripe_order_id IS DISTINCT FROM OLD.stripe_order_id
     OR NEW.assessment_count IS DISTINCT FROM OLD.assessment_count THEN
    RAISE EXCEPTION 'Not allowed to modify payment or plan fields';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_payment_self_update_trg ON public.profiles;
CREATE TRIGGER prevent_profile_payment_self_update_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_payment_self_update();

-- 2. Restrict promo_codes SELECT to admins only
DROP POLICY IF EXISTS "Anyone can read active promo codes" ON public.promo_codes;

-- 3. Secure server-side promo code redemption
CREATE OR REPLACE FUNCTION public.redeem_promo_code(_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_promo public.promo_codes%ROWTYPE;
  v_already_redeemed boolean;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;

  SELECT * INTO v_promo
  FROM public.promo_codes
  WHERE code = upper(trim(_code)) AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_code');
  END IF;

  IF v_promo.expires_at IS NOT NULL AND v_promo.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'expired');
  END IF;

  IF v_promo.max_uses IS NOT NULL AND v_promo.times_used >= v_promo.max_uses THEN
    RETURN jsonb_build_object('success', false, 'error', 'max_uses_reached');
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.promo_code_redemptions
    WHERE promo_code_id = v_promo.id AND user_id = v_user_id
  ) INTO v_already_redeemed;

  IF v_already_redeemed THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_redeemed');
  END IF;

  INSERT INTO public.promo_code_redemptions (promo_code_id, user_id)
  VALUES (v_promo.id, v_user_id);

  UPDATE public.promo_codes
  SET times_used = times_used + 1
  WHERE id = v_promo.id;

  UPDATE public.profiles
  SET has_paid_full_test = CASE WHEN v_promo.grants_full_test THEN true ELSE has_paid_full_test END,
      has_paid_pdf = CASE WHEN v_promo.grants_pdf THEN true ELSE has_paid_pdf END,
      plan = CASE WHEN v_promo.grants_full_test THEN 'paid' ELSE plan END
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'grants_full_test', v_promo.grants_full_test,
    'grants_pdf', v_promo.grants_pdf
  );
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_promo_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_promo_code(text) TO authenticated;
