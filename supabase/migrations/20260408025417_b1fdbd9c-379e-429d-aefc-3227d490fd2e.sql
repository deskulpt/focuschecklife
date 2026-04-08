
-- Add CRM fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS share_results_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_email_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_email_opt_in_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS marketing_push_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_push_opt_in_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS stripe_order_id text;

-- Add test metadata to assessments
ALTER TABLE public.user_assessments
  ADD COLUMN IF NOT EXISTS test_type text NOT NULL DEFAULT 'ADHD',
  ADD COLUMN IF NOT EXISTS completion_percentage numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS time_spent_seconds integer DEFAULT 0;
