import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Terms = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" /> {t('nav.home')}
        </Button>

        <h1 className="text-3xl font-bold mb-6">{t('terms.title')}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t('terms.lastUpdated')}: March 9, 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/80">
          <section>
            <h2 className="text-xl font-semibold text-foreground">{t('terms.s1.title')}</h2>
            <p>{t('terms.s1.text')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground">{t('terms.s2.title')}</h2>
            <p>{t('terms.s2.text')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground">{t('terms.s3.title')}</h2>
            <p>{t('terms.s3.text')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground">{t('terms.s4.title')}</h2>
            <p>{t('terms.s4.text')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground">{t('terms.s5.title')}</h2>
            <p>{t('terms.s5.text')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground">{t('terms.s6.title')}</h2>
            <p>{t('terms.s6.text')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Contact</h2>
            <p>
              FocusCheck is operated at <a href="https://focuscheck.life" className="text-primary hover:underline">focuscheck.life</a>.
              For questions about these Terms, email{' '}
              <a href="mailto:hello@focuscheck.life" className="text-primary hover:underline">hello@focuscheck.life</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
