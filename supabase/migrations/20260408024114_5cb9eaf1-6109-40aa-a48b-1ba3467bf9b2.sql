
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  source TEXT NOT NULL DEFAULT 'landing',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_waitlist_email ON public.waitlist (email);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
ON public.waitlist
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can read waitlist"
ON public.waitlist
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete waitlist entries"
ON public.waitlist
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
