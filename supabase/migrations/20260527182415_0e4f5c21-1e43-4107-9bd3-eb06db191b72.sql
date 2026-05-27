
CREATE TABLE public.cms_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  badge TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cms_resources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_resources TO authenticated;
GRANT ALL ON public.cms_resources TO service_role;

ALTER TABLE public.cms_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published resources"
ON public.cms_resources FOR SELECT
USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage resources"
ON public.cms_resources FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_cms_resources_updated_at
BEFORE UPDATE ON public.cms_resources
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.cms_resources (category, title, description, url, badge, sort_order) VALUES
('Trusted Organizations','CHADD','Children & Adults with ADHD — evidence-based articles, webinars, local support groups.','https://chadd.org','Org',0),
('Trusted Organizations','ADDA','Attention Deficit Disorder Association — adult-focused resources, community, free guides.','https://add.org','Org',1),
('Trusted Organizations','CDC ADHD Resource Hub','Fact sheets, infographics, behavior therapy guides, and a partner toolkit.','https://www.cdc.gov/adhd/communication-resources/index.html','Org',2),
('Trusted Organizations','AACAP ADHD Resource Center','Family guides covering signs, treatment, school success, and teen years.','https://www.aacap.org/aacap/Families_and_Youth/Resource_Centers/ADHD_Resource_Center/Home.aspx','Org',3),
('YouTube Channels','HowToADHD','Practical daily strategies, accessible and research-informed.','https://www.youtube.com/@HowtoADHD','Video',0),
('YouTube Channels','ADHD reWired','In-depth conversations and practical strategies from coach Eric Tivers.','https://www.youtube.com/@ADHDreWired','Video',1),
('YouTube Channels','ADHDVision','Visual storytelling depicting real ADHD experiences.','https://www.youtube.com/@ADHDVision','Video',2),
('Podcasts','ADHD Experts Podcast (CHADD)','Clinical experts, evidence-based.','https://chadd.org/adhd-weekly/','Audio',0),
('Podcasts','I Have ADHD Podcast','Hosted by coach Kristen Carder — practical and community-focused.','https://ihaveadhd.com/podcast/','Audio',1),
('Podcasts','Women & ADHD','Addresses underdiagnosed female ADHD.','https://womenandadhdpodcast.com/','Audio',2),
('Podcasts','ADHD Big Brother','Short weekly episodes for adults who feel stuck or unmotivated.','https://adhdbigbro.com/','Audio',3),
('Online Communities','r/ADHD (Reddit)','One of the largest peer communities — honest and highly active.','https://www.reddit.com/r/ADHD/','Community',0),
('Online Communities','r/ADHDpartners','For partners and family of people with ADHD.','https://www.reddit.com/r/ADHD_partners/','Community',1),
('Online Communities','ADDA Virtual Support Groups','Free facilitated groups for adults.','https://add.org/support-groups/','Community',2),
('Free Reading & Guides','ADDitude Magazine','Free articles, symptom guides, and weekly newsletter.','https://www.additudemag.com','Read',0),
('Free Reading & Guides','Understood.org','Plain-language explanations, great for parents.','https://www.understood.org','Read',1),
('Free Reading & Guides','CDC ADHD Across the Lifetime Toolkit','One-stop educational toolkit for families and educators.','https://www.cdc.gov/adhd/communication-resources/index.html','Read',2),
('For Family & Friends','Is It You, Me, or Adult ADHD? (Gina Pera)','Book written for partners — excerpts and summaries available online.','https://adhdrollercoaster.org/','Book',0),
('For Family & Friends','CHADD Family-to-Family','Free workshop series for family members.','https://chadd.org/for-adults/family-to-family/','Workshop',1),
('For Family & Friends','HowToADHD — For Loved Ones','Short videos explaining ADHD behaviors non-judgmentally.','https://www.youtube.com/playlist?list=PLNAFmpyM4OQ8XzD8QbcVCIRMNXh0XmDi4','Video',2);
