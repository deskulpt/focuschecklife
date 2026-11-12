import { Link } from 'react-router-dom';
import { ArrowLeft, Target, FlaskConical, ClipboardCheck, BookOpen, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SeoHead } from '@/components/SeoHead';
import landingShot from '@/assets/research/landing.jpg';
import pricingShot from '@/assets/research/pricing.jpg';
import authShot from '@/assets/research/auth.jpg';
import resourcesShot from '@/assets/research/resources.jpg';

const objectives = [
  'Give people an accessible, private first step to learn whether ADHD may explain what they or their child experience.',
  'Combine subjective self-report with objective task performance (reaction time, omission and commission errors, working memory span).',
  'Adapt every instrument to age: self-report for teens and adults, parent-mediated observation for children aged 6–12.',
  'Guide people toward qualified professionals and trusted learning resources — never replace a clinical diagnosis.',
];

const instruments = [
  { name: 'DSM-5-TR symptom criteria', detail: '18 symptoms across inattention and hyperactivity-impulsivity, with age-adjusted thresholds (6+ for children, 5+ for 17 and older).', source: 'American Psychiatric Association (2022). Diagnostic and Statistical Manual of Mental Disorders, 5th ed., text rev.', url: 'https://www.psychiatry.org/psychiatrists/practice/dsm' },
  { name: 'Adult ADHD Self-Report Scale (ASRS v1.1)', detail: 'WHO-endorsed 18-item scale; Part A (6 items) is the most predictive screener.', source: 'Kessler, R. C. et al. (2005). Psychological Medicine, 35(2), 245–256.', url: 'https://doi.org/10.1017/S0033291704002892' },
  { name: 'Conners-style parent rating', detail: 'Parent-reported behaviour across home and school settings for ages 6–12.', source: 'Conners, C. K. (2008). Conners 3rd Edition. Multi-Health Systems.', url: 'https://www.pearsonassessments.com/' },
  { name: 'Continuous Performance Test (CPT)', detail: 'Measures sustained attention (omissions) and impulsivity (commissions) with reaction-time variability.', source: 'Rosvold, H. E. et al. (1956). Journal of Consulting Psychology, 20(5), 343–350.', url: 'https://doi.org/10.1037/h0043220' },
  { name: 'Working memory task', detail: 'Span and n-back style recall, based on the multi-component working memory model.', source: 'Baddeley, A. (2000). Trends in Cognitive Sciences, 4(11), 417–423.', url: 'https://doi.org/10.1016/S1364-6613(00)01538-2' },
  { name: 'Stroop interference task', detail: 'Assesses response inhibition and cognitive flexibility.', source: 'Stroop, J. R. (1935). Journal of Experimental Psychology, 18(6), 643–662.', url: 'https://doi.org/10.1037/h0054651' },
  { name: 'Executive function theory of ADHD', detail: 'Framework linking inhibition deficits to everyday attention difficulties.', source: 'Barkley, R. A. (1997). Psychological Bulletin, 121(1), 65–94.', url: 'https://doi.org/10.1037/0033-2909.121.1.65' },
];

const procedures = [
  { step: 'Consent', text: 'Explicit consent before any data is saved; unconsented data is deleted after 7 days.' },
  { step: 'Age selection', text: 'Age band selects the instrument variant, wording, and game difficulty.' },
  { step: 'Questionnaire', text: 'DSM-5 aligned items scored per domain; frequency answers mapped to symptom presence.' },
  { step: 'Cognitive tasks', text: 'CPT, working memory, and Stroop run in one sitting; sessions cannot be resumed to keep timing valid.' },
  { step: 'Scoring', text: 'Questionnaire and task scores combine into a weighted composite shown as an indicative risk band.' },
  { step: 'Results', text: 'Plain-language results, symptom radar, and suggested next steps, with a clear non-diagnostic notice.' },
];

const quality = [
  'Automated tests check pricing rules and the 2-free-attempt limit.',
  'Attempt counting runs on the server so limits cannot be bypassed.',
  'End-to-end checks of sign-up, assessment, results, payment, and admin flows before launch.',
  'Repeated security reviews of data access, payments, and promo codes.',
  'Accessibility: light, dark, and high-contrast themes, font scaling, keyboard navigation (WCAG 2.1 AA target).',
];

const shots = [
  { src: landingShot, caption: 'Home page — clear starting point and non-medical framing' },
  { src: pricingShot, caption: 'Plans — free check with optional full report' },
  { src: authShot, caption: 'Sign up — captures consent and communication preferences' },
  { src: resourcesShot, caption: 'Learning resources — curated trusted sources' },
];

const Section = ({ icon: Icon, title, children }: { icon: typeof Target; title: string; children: React.ReactNode }) => (
  <section className="mb-14">
    <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-semibold mb-4 text-foreground">
      <Icon className="w-5 h-5 text-primary" /> {title}
    </h2>
    {children}
  </section>
);

export const Research = () => (
  <div className="min-h-screen bg-background">
    <SeoHead
      title="Research & methodology — FocusCheck"
      description="The research, instruments, test procedures, and product development behind the FocusCheck ADHD screening tool."
      path="/research"
    />
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" /> Back home
      </Link>
      <header className="mb-12">
        <Badge variant="secondary" className="mb-3">Pending clinical trials</Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Research & methodology</h1>
        <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
          How FocusCheck was designed, which published research it builds on, and how we test it.
        </p>
      </header>

      <Section icon={Target} title="Objective">
        <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
          {objectives.map((o) => <li key={o}>{o}</li>)}
        </ul>
      </Section>

      <Section icon={Users} title="Product development">
        <Card className="p-5 border-border/40">
          <h3 className="font-semibold text-foreground">Aloke Diddi — Founder & product lead</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Led product research and design: reviewing published ADHD screening instruments, shaping the age-adapted
            assessment flow, defining scoring and results language, and overseeing accessibility, localisation, privacy,
            and testing.
          </p>
        </Card>
        <p className="text-sm text-muted-foreground mt-4">
          The approach draws on the published work of clinicians and researchers listed below, whose instruments and
          theories form the scientific basis of the screening.
        </p>
      </Section>

      <Section icon={BookOpen} title="Research foundations">
        <div className="grid gap-3 sm:grid-cols-2">
          {instruments.map((i) => (
            <Card key={i.name} className="p-4 border-border/40">
              <h3 className="font-semibold text-foreground">{i.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{i.detail}</p>
              <a href={i.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-2 block">
                {i.source}
              </a>
            </Card>
          ))}
        </div>
      </Section>

      <Section icon={FlaskConical} title="Test procedure">
        <ol className="space-y-3">
          {procedures.map((p, idx) => (
            <li key={p.step} className="flex gap-3">
              <span className="tabular-nums w-7 h-7 shrink-0 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center">{idx + 1}</span>
              <div><span className="font-medium text-foreground">{p.step}: </span><span className="text-muted-foreground">{p.text}</span></div>
            </li>
          ))}
        </ol>
      </Section>

      <Section icon={ClipboardCheck} title="Quality & testing">
        <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
          {quality.map((q) => <li key={q}>{q}</li>)}
        </ul>
      </Section>

      <section className="mb-14">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-foreground">Screenshots</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {shots.map((s) => (
            <figure key={s.caption} className="rounded-xl overflow-hidden border border-border/40">
              <img src={s.src} alt={s.caption} loading="lazy" className="w-full h-auto" />
              <figcaption className="p-3 text-sm text-muted-foreground">{s.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <div className="p-5 rounded-xl border border-border/40 bg-muted/30 text-sm text-muted-foreground">
        <strong className="text-foreground">Important:</strong> FocusCheck is an educational screening tool and does
        not provide a diagnosis. Validation through clinical trials is pending. Please speak with a qualified
        professional about your results.
      </div>
    </div>
  </div>
);
