import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, Shield, CheckCircle, ArrowRight, Star, Users, FileText, Zap, BookOpen } from 'lucide-react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-medical-light/20 to-background">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-card/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="FocusCheck" className="w-10 h-10" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-medical-teal bg-clip-text text-transparent">
              FocusCheck
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            {user ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/assessment')}>
                  {t('landing.myAssessment') || 'My Assessment'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  {t('landing.logout') || 'Logout'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate('/auth')}>
                  Get Started Free
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
          ✨ Clinically Validated • DSM-5 Based
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-primary to-medical-teal bg-clip-text text-transparent">
            Know Your ADHD.
          </span>
          <br />
          <span className="text-foreground">Take Control of Your Focus.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
          The most comprehensive online ADHD assessment combining validated questionnaires
          with cognitive performance tests. Get actionable insights in under 20 minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => user ? navigate('/assessment') : navigate('/auth')} className="text-lg px-8 py-6">
            Start Free Assessment <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => document.getElementById('learn')?.scrollIntoView({ behavior: 'smooth' })} className="text-lg px-8 py-6">
            <BookOpen className="mr-2 w-5 h-5" /> Learn About ADHD
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-4">No credit card required • Results in 20 minutes</p>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Shield, label: 'DSM-5 Based', sub: 'Gold standard criteria' },
            { icon: Brain, label: 'Cognitive Tests', sub: 'CPT, Stroop, Memory' },
            { icon: Users, label: '3 Age Groups', sub: 'Children, Teens, Adults' },
            { icon: FileText, label: 'PDF Report', sub: 'Share with your doctor' },
          ].map((item, i) => (
            <Card key={i} className="text-center border-border/50 bg-card/60">
              <CardContent className="pt-6 pb-4">
                <item.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="font-semibold text-sm">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-16" id="pricing">
        <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          Start with a free assessment snapshot. Upgrade for comprehensive results and a professional PDF report.
        </p>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free */}
          <Card className="border-border/50 relative">
            <CardHeader>
              <CardTitle className="text-lg">Free Snapshot</CardTitle>
              <div className="text-3xl font-bold">$0</div>
              <p className="text-sm text-muted-foreground">Get started</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Complete survey questionnaire', 'Play all 3 cognitive games', 'Basic results snapshot', 'Overall risk indicator'].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" /> {f}
                </div>
              ))}
              <Button className="w-full mt-4" variant="outline" onClick={() => user ? navigate('/assessment') : navigate('/auth')}>
                Start Free
              </Button>
            </CardContent>
          </Card>

          {/* Full Test */}
          <Card className="border-primary/50 relative shadow-[var(--shadow-card)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-3">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-lg">Full Assessment</CardTitle>
              <div className="text-3xl font-bold">$5</div>
              <p className="text-sm text-muted-foreground">One-time payment</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Everything in Free', 'Detailed category breakdown', 'Cognitive performance analysis', 'Symptom profile radar chart', 'Clinical recommendations'].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" /> {f}
                </div>
              ))}
              <Button className="w-full mt-4" onClick={() => user ? navigate('/assessment') : navigate('/auth')}>
                Get Full Results
              </Button>
            </CardContent>
          </Card>

          {/* PDF Report */}
          <Card className="border-border/50 relative">
            <CardHeader>
              <CardTitle className="text-lg">Professional Report</CardTitle>
              <div className="text-3xl font-bold">$20</div>
              <p className="text-sm text-muted-foreground">Downloadable PDF</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Everything in Full Assessment', 'Comprehensive PDF report', 'Share with your practitioner', 'Clinical methodology notes', 'Personalized recommendations'].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" /> {f}
                </div>
              ))}
              <Button className="w-full mt-4" variant="outline" onClick={() => user ? navigate('/assessment') : navigate('/auth')}>
                Get PDF Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Educational Content */}
      <section className="container mx-auto px-4 py-16" id="learn">
        <h2 className="text-3xl font-bold text-center mb-4">Understanding ADHD</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Knowledge is the first step. Learn why testing matters and how results can transform your life.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              title: 'Why Test for ADHD?',
              content: 'ADHD affects 5-10% of children and 2-5% of adults worldwide. Many go undiagnosed for years, struggling with focus, organization, and impulse control without understanding why. Early identification leads to better outcomes — studies show that properly managed ADHD results in 30% improvement in academic and work performance.',
              icon: Target,
            },
            {
              title: 'What This Assessment Reveals',
              content: 'Our multi-dimensional assessment evaluates four key areas: inattention, hyperactivity, impulsivity, and functional impairment. Combined with cognitive tests (CPT, Stroop, Working Memory), you get a comprehensive picture of how your brain processes information, maintains attention, and controls impulses.',
              icon: Brain,
            },
            {
              title: 'Working With Your Practitioner',
              content: 'Your FocusCheck results are designed to be shared with healthcare professionals. The detailed breakdown helps your doctor or therapist understand your specific symptom profile, enabling more targeted treatment plans. Bring your PDF report to your next appointment for a more productive conversation.',
              icon: FileText,
            },
            {
              title: 'Our Clinical Methodology',
              content: 'FocusCheck uses DSM-5 diagnostic criteria, the Adult ADHD Self-Report Scale (ASRS-v1.1), Conners\' Rating Scales, and Vanderbilt Assessment Scales. Our cognitive tests mirror those used in clinical settings — the Continuous Performance Test, N-Back Working Memory Test, and Stroop Color-Word Test.',
              icon: Shield,
            },
            {
              title: 'Life After Diagnosis',
              content: 'Understanding your ADHD profile opens doors to effective strategies: cognitive behavioral therapy, medication options, workplace accommodations, organizational tools, and mindfulness practices. Many adults report feeling "finally understood" after getting clarity on their symptoms.',
              icon: Star,
            },
            {
              title: 'ADHD Is Not a Limitation',
              content: 'Many successful entrepreneurs, artists, and innovators have ADHD. Traits like hyperfocus, creativity, and high energy can be powerful assets when properly channeled. The key is understanding your unique cognitive profile and building systems that work with your brain, not against it.',
              icon: Zap,
            },
          ].map((article, i) => (
            <Card key={i} className="border-border/50 hover:shadow-[var(--shadow-card)] transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <article.icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{article.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{article.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-primary/10 to-medical-teal/10 border-primary/20 max-w-3xl mx-auto">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Understand Your Mind?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join thousands who have taken the first step towards understanding their ADHD.
              Start your free assessment today.
            </p>
            <Button size="lg" onClick={() => user ? navigate('/assessment') : navigate('/auth')} className="text-lg px-8 py-6">
              Begin Your Assessment <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.png" alt="FocusCheck" className="w-6 h-6" />
            <span className="font-semibold text-foreground">FocusCheck</span>
          </div>
          <p className="max-w-xl mx-auto mb-4">
            This tool is for informational purposes only and does not constitute medical advice.
            Always consult a qualified healthcare professional for diagnosis and treatment.
          </p>
          <p>© {new Date().getFullYear()} FocusCheck. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
