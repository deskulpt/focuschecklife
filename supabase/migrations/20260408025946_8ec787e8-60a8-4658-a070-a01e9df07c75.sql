
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id, full_name, phone, country, city, state, age, gender,
    marketing_email_opt_in, marketing_email_opt_in_at,
    marketing_push_opt_in, marketing_push_opt_in_at
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'country',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'state',
    (NEW.raw_user_meta_data->>'age')::integer,
    NEW.raw_user_meta_data->>'gender',
    COALESCE((NEW.raw_user_meta_data->>'marketing_email_opt_in')::boolean, false),
    CASE WHEN (NEW.raw_user_meta_data->>'marketing_email_opt_in')::boolean = true THEN now() ELSE NULL END,
    COALESCE((NEW.raw_user_meta_data->>'marketing_push_opt_in')::boolean, false),
    CASE WHEN (NEW.raw_user_meta_data->>'marketing_push_opt_in')::boolean = true THEN now() ELSE NULL END
  );
  RETURN NEW;
END;
$function$;
