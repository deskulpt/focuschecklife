import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Brain, Target, Shield, CheckCircle, ArrowRight, Star, Users, FileText, Zap, BookOpen, Menu, X } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-background via-medical-light/20 to-background">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-card/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="FocusCheck ADHD Assessment" className="w-9 h-9" loading="lazy" />
            <span className="text-lg font-bold text-foreground">FocusCheck</span>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/assessment')}>{t('landing.myAssessment')}</Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>{t('landing.logout')}</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>{t('nav.signIn')}</Button>
                <Button size="sm" onClick={() => navigate('/auth')}>{t('nav.getStarted')}</Button>
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
          <div className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur-sm px-4 py-3 space-y-2">
            {user ? (
              <>
                <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/assessment'); setMobileMenuOpen(false); }}>{t('landing.myAssessment')}</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>{t('landing.logout')}</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}>{t('nav.signIn')}</Button>
                <Button className="w-full" onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}>{t('nav.getStarted')}</Button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-24 text-center">
        <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20 px-3 sm:px-4 py-1.5 text-xs sm:text-sm">
          {t('hero.badge')}
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
          {siteSettings['landing_title'] ? (
            <span className="text-primary">{siteSettings['landing_title']}</span>
          ) : (
            <>
              <span className="text-primary">{t('hero.title1')}</span>
              <br />
              <span className="text-foreground">{t('hero.title2')}</span>
            </>
          )}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
          {t('hero.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
          <Button size="lg" onClick={navAction} className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
            {t('hero.cta')} <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })} className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
            <BookOpen className="mr-2 w-5 h-5" /> {t('hero.learnMore')}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-4">{t('hero.noCreditCard')}</p>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { icon: Shield, label: t('trust.dsm5'), sub: t('trust.dsm5Sub') },
            { icon: Brain, label: t('trust.cognitive'), sub: t('trust.cognitiveSub') },
            { icon: Users, label: t('trust.ageGroups'), sub: t('trust.ageGroupsSub') },
          ].map((item, i) => (
            <Card key={i} className="text-center border-border/50 bg-card/60">
              <CardContent className="pt-4 sm:pt-6 pb-3 sm:pb-4 px-2 sm:px-4">
                <item.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-primary" />
                <div className="font-semibold text-xs sm:text-sm">{item.label}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{item.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-12 sm:py-16" id="pricing">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 sm:mb-4">{t('pricing.title')}</h2>
        <p className="text-muted-foreground text-center mb-8 sm:mb-12 max-w-xl mx-auto text-sm sm:text-base">
          {t('pricing.subtitle')}
        </p>

        {/* Limited Time Banner */}
        {siteSettings['limited_time_enabled'] === 'true' && siteSettings['limited_time_message'] && (
          <div className="max-w-3xl mx-auto mb-6 p-3 bg-warning/10 border border-warning/30 rounded-lg text-center">
            <p className="text-sm font-semibold text-warning">{siteSettings['limited_time_message']}</p>
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {/* Free */}
          <Card className="border-border/50 relative">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">{t('pricing.free.title')}</CardTitle>
              <div className="text-2xl sm:text-3xl font-bold">{t('pricing.free.price')}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t('pricing.free.subtitle')}</p>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              {['pricing.free.f1', 'pricing.free.f2', 'pricing.free.f3', 'pricing.free.f4'].map((k, i) => (
                <div key={i} className="flex items-center gap-2 text-xs sm:text-sm">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" /> {t(k)}
                </div>
              ))}
              <Button className="w-full mt-3 sm:mt-4" variant="outline" onClick={navAction}>{t('pricing.free.cta')}</Button>
            </CardContent>
          </Card>

          {/* Full */}
          <Card className="border-primary/50 relative shadow-[var(--shadow-card)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-3 text-xs">{t('pricing.full.badge')}</Badge>
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">{t('pricing.full.title')}</CardTitle>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold">
                  {siteSettings['pricing_usd'] || t('pricing.full.price')}
                </span>
                {siteSettings['discount_enabled'] === 'true' && siteSettings['discount_original_price'] && (
                  <span className="text-base text-muted-foreground line-through">{siteSettings['discount_original_price']}</span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t('pricing.full.subtitle')}</p>
              {siteSettings['discount_enabled'] === 'true' && siteSettings['discount_savings_message'] && (
                <Badge variant="secondary" className="mt-1 bg-success/10 text-success border-success/20 text-xs">
                  {siteSettings['discount_savings_message']}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              {['pricing.full.f1', 'pricing.full.f2', 'pricing.full.f3', 'pricing.full.f4', 'pricing.full.f5'].map((k, i) => (
                <div key={i} className="flex items-center gap-2 text-xs sm:text-sm">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" /> {t(k)}
                </div>
              ))}
              <Button className="w-full mt-3 sm:mt-4" onClick={navAction}>{t('pricing.full.cta')}</Button>
            </CardContent>
          </Card>

          {/* Monitoring */}
          <Card className="border-accent/50 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-accent text-accent-foreground px-3 text-xs">{t('pricing.monitor.badge')}</Badge>
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">{t('pricing.monitor.title')}</CardTitle>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold">
                  {siteSettings['pricing_monitor_usd'] || t('pricing.monitor.price')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t('pricing.monitor.subtitle')}</p>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              {['pricing.monitor.f1', 'pricing.monitor.f2', 'pricing.monitor.f3', 'pricing.monitor.f4', 'pricing.monitor.f5'].map((k, i) => (
                <div key={i} className="flex items-center gap-2 text-xs sm:text-sm">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" /> {t(k)}
                </div>
              ))}
              <Button className="w-full mt-3 sm:mt-4" variant="outline" onClick={navAction}>{t('pricing.monitor.cta')}</Button>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* Educational Content */}
      <section className="container mx-auto px-4 py-12 sm:py-16" id="learn">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 sm:mb-4">{t('learn.title')}</h2>
        <p className="text-muted-foreground text-center mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
          {t('learn.subtitle')}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {learnArticles.map((article, i) => (
            <Card key={i} className="border-border/50 hover:shadow-[var(--shadow-card)] transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <article.icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-sm sm:text-base">{t(article.titleKey)}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t(article.contentKey)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-12 sm:py-16" id="faq">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 sm:mb-4">{t('faq.title')}</h2>
        <p className="text-muted-foreground text-center mb-8 sm:mb-12 max-w-xl mx-auto text-sm sm:text-base">
          {t('faq.subtitle')}
        </p>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-2">
            {faqKeys.map((i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border/50 rounded-lg px-4 sm:px-6 bg-card/60">
                <AccordionTrigger className="text-sm sm:text-base font-medium text-left py-4">
                  {t(`faq.q${i}`)}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-4">
                  {t(`faq.a${i}`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <Card className="bg-primary/5 border-primary/20 max-w-3xl mx-auto">
          <CardContent className="p-6 sm:p-8 md:p-12 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">{t('cta.title')}</h2>
            <p className="text-muted-foreground mb-4 sm:mb-6 max-w-xl mx-auto text-sm sm:text-base">
              {t('cta.subtitle')}
            </p>
            <Button size="lg" onClick={navAction} className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
              {t('cta.button')} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 py-6 sm:py-8">
        <div className="container mx-auto px-4 text-center text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <img src="/logo.png" alt="FocusCheck" className="w-6 h-6" loading="lazy" />
            <span className="font-semibold text-foreground">FocusCheck</span>
          </div>
          <p className="max-w-xl mx-auto mb-3 sm:mb-4">{t('footer.disclaimer')}</p>
          <div className="flex items-center justify-center gap-4 mb-3">
            <a href="/terms" className="text-primary hover:underline">{t('footer.terms')}</a>
            <span>•</span>
            <a href="/privacy" className="text-primary hover:underline">{t('footer.privacy')}</a>
          </div>
          <p>© {new Date().getFullYear()} {t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
