import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Brain, Target, Shield, CheckCircle, ArrowRight, Star, Users, FileText, Zap, BookOpen, Menu, X } from 'lucide-react';
import { WaitlistSignup } from '@/components/WaitlistSignup';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const siteSettings = useSiteSettings();

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

  const navAction = () => (user ? navigate('/assessment') : navigate('/auth'));

  const faqKeys = Array.from({ length: 8 }, (_, i) => i + 1);
  const learnArticles = [
    { titleKey: 'learn.a1.title', contentKey: 'learn.a1.content', icon: Target },
    { titleKey: 'learn.a2.title', contentKey: 'learn.a2.content', icon: Brain },
    { titleKey: 'learn.a3.title', contentKey: 'learn.a3.content', icon: FileText },
    { titleKey: 'learn.a4.title', contentKey: 'learn.a4.content', icon: Shield },
    { titleKey: 'learn.a5.title', contentKey: 'learn.a5.content', icon: Star },
    { titleKey: 'learn.a6.title', contentKey: 'learn.a6.content', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[hsl(var(--primary)/0.08)] blur-[100px]" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 rounded-full bg-[hsl(var(--medical-teal)/0.06)] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-[hsl(var(--primary)/0.05)] blur-[80px]" />
      </div>

      {/* Nav */}
      <nav className="glass sticky top-0 z-50 border-b border-border/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="FocusCheck ADHD Assessment" className="w-9 h-9" loading="lazy" />
            <span className="text-lg font-bold text-foreground tracking-tight">FocusCheck</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <LanguageToggle />
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/assessment')}>{t('landing.myAssessment')}</Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>{t('landing.logout')}</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>{t('nav.signIn')}</Button>
                <button onClick={() => navigate('/auth')} className="btn-gradient px-5 py-2 text-sm rounded-lg">
                  {t('nav.getStarted')}
                </button>
              </>
            )}
          </div>
          <div className="flex md:hidden items-center gap-2">
            <LanguageToggle />
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/30 glass px-4 py-3 space-y-2">
            {user ? (
              <>
                <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/assessment'); setMobileMenuOpen(false); }}>{t('landing.myAssessment')}</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>{t('landing.logout')}</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}>{t('nav.signIn')}</Button>
                <button className="btn-gradient w-full py-2.5 text-sm rounded-lg" onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}>
                  {t('nav.getStarted')}
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 md:pt-28 pb-12 sm:pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)] mb-6 sm:mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--success))] animate-pulse-soft" />
          <span className="text-xs sm:text-sm font-medium text-[hsl(var(--primary))]">{t('hero.badge')}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-5 sm:mb-6 leading-[1.1] tracking-tight">
          {siteSettings['landing_title'] ? (
            <span className="text-gradient">{siteSettings['landing_title']}</span>
          ) : (
            <>
              <span className="text-gradient">{t('hero.title1')}</span>
              <br />
              <span className="text-foreground">{t('hero.title2')}</span>
            </>
          )}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          {t('hero.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
          <button onClick={navAction} className="btn-gradient inline-flex items-center justify-center gap-2 px-8 py-4 text-base sm:text-lg font-semibold rounded-xl shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.4)]">
            {t('hero.cta')} <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base sm:text-lg font-semibold rounded-xl border border-border bg-background text-foreground hover:bg-muted transition-colors"
          >
            <BookOpen className="w-5 h-5" /> {t('hero.learnMore')}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-5">{t('hero.noCreditCard')}</p>
      </section>

      {/* Trust Badges */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-3 gap-3 sm:gap-5">
          {[
            { icon: Shield, label: t('trust.dsm5'), sub: t('trust.dsm5Sub') },
            { icon: Brain, label: t('trust.cognitive'), sub: t('trust.cognitiveSub') },
            { icon: Users, label: t('trust.ageGroups'), sub: t('trust.ageGroupsSub') },
          ].map((item, i) => (
            <div key={i} className="glass-card p-4 sm:p-6 text-center card-hover group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center group-hover:bg-[hsl(var(--primary)/0.15)] transition-colors">
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--primary))]" />
              </div>
              <div className="font-semibold text-xs sm:text-sm text-foreground">{item.label}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20" id="pricing">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">{t('pricing.title')}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            {t('pricing.subtitle')}
          </p>
        </div>

        {siteSettings['limited_time_enabled'] === 'true' && siteSettings['limited_time_message'] && (
          <div className="max-w-3xl mx-auto mb-8 glass-card p-4 text-center border-[hsl(var(--warning)/0.3)]">
            <p className="text-sm font-semibold text-[hsl(var(--warning))]">{siteSettings['limited_time_message']}</p>
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Free */}
          <div className="glass-card p-6 sm:p-7 flex flex-col card-hover">
            <div className="mb-5">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">{t('pricing.free.title')}</h3>
              <div className="text-3xl sm:text-4xl font-bold text-foreground mt-2">{t('pricing.free.price')}</div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('pricing.free.subtitle')}</p>
            </div>
            <div className="space-y-2.5 flex-1">
              {['pricing.free.f1', 'pricing.free.f2', 'pricing.free.f3', 'pricing.free.f4'].map((k, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-[hsl(var(--success))] flex-shrink-0" /> {t(k)}
                </div>
              ))}
            </div>
            <button onClick={navAction} className="mt-6 w-full py-3 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors text-sm">
              {t('pricing.free.cta')}
            </button>
          </div>

          {/* Full — featured */}
          <div className="relative glass-card p-6 sm:p-7 flex flex-col card-hover border-[hsl(var(--primary)/0.4)] shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.2)]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="btn-gradient px-4 py-1 text-xs font-semibold rounded-full">{t('pricing.full.badge')}</span>
            </div>
            <div className="mb-5">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">{t('pricing.full.title')}</h3>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl sm:text-4xl font-bold text-foreground">
                  {siteSettings['pricing_usd'] || t('pricing.full.price')}
                </span>
                {siteSettings['discount_enabled'] === 'true' && siteSettings['discount_original_price'] && (
                  <span className="text-base text-muted-foreground line-through">{siteSettings['discount_original_price']}</span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('pricing.full.subtitle')}</p>
              {siteSettings['discount_enabled'] === 'true' && siteSettings['discount_savings_message'] && (
                <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))] border border-[hsl(var(--success)/0.2)]">
                  {siteSettings['discount_savings_message']}
                </span>
              )}
            </div>
            <div className="space-y-2.5 flex-1">
              {['pricing.full.f1', 'pricing.full.f2', 'pricing.full.f3', 'pricing.full.f4', 'pricing.full.f5'].map((k, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-[hsl(var(--success))] flex-shrink-0" /> {t(k)}
                </div>
              ))}
            </div>
            <button onClick={navAction} className="btn-gradient mt-6 w-full py-3 rounded-xl text-sm font-semibold shadow-[0_4px_20px_-6px_hsl(var(--primary)/0.4)]">
              {t('pricing.full.cta')}
            </button>
          </div>

          {/* Monitoring */}
          <div className="relative glass-card p-6 sm:p-7 flex flex-col card-hover">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 text-xs font-semibold rounded-full bg-accent text-accent-foreground border border-accent/50">{t('pricing.monitor.badge')}</span>
            </div>
            <div className="mb-5">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">{t('pricing.monitor.title')}</h3>
              <div className="text-3xl sm:text-4xl font-bold text-foreground mt-2">
                {siteSettings['pricing_monitor_usd'] || t('pricing.monitor.price')}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('pricing.monitor.subtitle')}</p>
            </div>
            <div className="space-y-2.5 flex-1">
              {['pricing.monitor.f1', 'pricing.monitor.f2', 'pricing.monitor.f3', 'pricing.monitor.f4', 'pricing.monitor.f5'].map((k, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-[hsl(var(--success))] flex-shrink-0" /> {t(k)}
                </div>
              ))}
            </div>
            <WaitlistSignup source="landing-pricing" variant="compact" className="mt-6" />
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <WaitlistSignup source="landing" />
      </section>

      {/* Educational Content */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20" id="learn">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">{t('learn.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            {t('learn.subtitle')}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {learnArticles.map((article, i) => (
            <div key={i} className="glass-card p-5 sm:p-6 card-hover group" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center group-hover:bg-[hsl(var(--primary)/0.15)] transition-colors flex-shrink-0">
                  <article.icon className="w-5 h-5 text-[hsl(var(--primary))]" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground leading-snug">{t(article.titleKey)}</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t(article.contentKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20" id="faq">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">{t('faq.title')}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            {t('faq.subtitle')}
          </p>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqKeys.map((i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="glass-card px-5 sm:px-6 border-border/30 overflow-hidden">
              <AccordionTrigger className="text-sm sm:text-base font-medium text-left py-4 text-foreground hover:no-underline">
                {t(`faq.q${i}`)}
              </AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-5">
                {t(`faq.a${i}`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="relative glass-card p-8 sm:p-12 md:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary)/0.05)] to-[hsl(var(--medical-teal)/0.05)] pointer-events-none" aria-hidden="true" />
          <div className="relative">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-foreground">{t('cta.title')}</h2>
            <p className="text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto text-sm sm:text-base">
              {t('cta.subtitle')}
            </p>
            <button onClick={navAction} className="btn-gradient inline-flex items-center gap-2 px-8 py-4 text-base sm:text-lg font-semibold rounded-xl shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.4)]">
              {t('cta.button')} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-background/60 backdrop-blur-sm py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <img src="/logo.png" alt="FocusCheck" className="w-6 h-6" loading="lazy" />
            <span className="font-semibold text-foreground">FocusCheck</span>
          </div>
          <p className="max-w-xl mx-auto mb-4">{t('footer.disclaimer')}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            <a href="/resources" className="text-[hsl(var(--primary))] hover:underline">Resources</a>
            <span className="text-border">•</span>
            <a href="/terms" className="text-[hsl(var(--primary))] hover:underline">{t('footer.terms')}</a>
            <span className="text-border">•</span>
            <a href="/privacy" className="text-[hsl(var(--primary))] hover:underline">{t('footer.privacy')}</a>
          </div>
          <p>© {new Date().getFullYear()} {t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
