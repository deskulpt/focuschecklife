ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS testing_for text,
  ADD COLUMN IF NOT EXISTS guardian_relationship text,
  ADD COLUMN IF NOT EXISTS age_range text,
  ADD COLUMN IF NOT EXISTS assessment_reason text,
  ADD COLUMN IF NOT EXISTS current_experiences text,
  ADD COLUMN IF NOT EXISTS adhd_familiarity text,
  ADD COLUMN IF NOT EXISTS physical_interests text,
  ADD COLUMN IF NOT EXISTS mental_interests text,
  ADD COLUMN IF NOT EXISTS support_goals text;

COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Whether the user has completed the post-login onboarding profile form.';
COMMENT ON COLUMN public.profiles.testing_for IS 'Whether the assessment is for self, child, teen, or another person.';
COMMENT ON COLUMN public.profiles.guardian_relationship IS 'Guardian or parent relationship when testing for someone else.';
COMMENT ON COLUMN public.profiles.age_range IS 'Age range selected during onboarding.';
COMMENT ON COLUMN public.profiles.assessment_reason IS 'Why the user wants to take the ADHD screening.';
COMMENT ON COLUMN public.profiles.current_experiences IS 'Attention, organization, emotion, school, work, or life experiences reported by the user.';
COMMENT ON COLUMN public.profiles.adhd_familiarity IS 'How familiar the user is with ADHD as attention-deficit/hyperactivity disorder.';
COMMENT ON COLUMN public.profiles.physical_interests IS 'Physical activities, routines, sleep, exercise, or body-based interests.';
COMMENT ON COLUMN public.profiles.mental_interests IS 'Learning style, hobbies, focus patterns, or mental interests.';
COMMENT ON COLUMN public.profiles.support_goals IS 'Support goals for the user journey after onboarding.';