import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Download, AlertTriangle, Lock } from 'lucide-react';
import type { AssessmentData } from './AssessmentApp';
import { AssessmentResultsDashboard } from './AssessmentResultsDashboard';
import { useLanguage } from '@/contexts/LanguageContext';

interface AssessmentResultsProps {
  data: AssessmentData;
  onRestart: () => void;
  isFreePreview?: boolean;
  onUpgrade?: () => void;
}

export const AssessmentResults = ({ data, onRestart, isFreePreview = false, onUpgrade }: AssessmentResultsProps) => {
  const { t } = useLanguage();

  // Block printing when on results page
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'no-print-style';
    style.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        body::after {
          visibility: visible !important;
          content: "Printing is disabled. Please purchase the PDF report for a printable version.";
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 24px;
          text-align: center;
          color: #333;
        }
      }
    `;
    document.head.appendChild(style);

    const handleBeforePrint = () => {
      alert('Printing is disabled. Please purchase the Professional PDF Report ($20) for a downloadable and printable version.');
    };
    window.addEventListener('beforeprint', handleBeforePrint);

    return () => {
      const el = document.getElementById('no-print-style');
      if (el) el.remove();
      window.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, []);
  
  const getAgeGroupTitle = () => {
    switch (data.ageGroup) {
      case 'child': return t('results.ageGroup.child');
      case 'teen': return t('results.ageGroup.teen');
      case 'adult': return t('results.ageGroup.adult');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-medical-teal bg-clip-text text-transparent mb-2">
          {t('results.title')}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          {getAgeGroupTitle()} • {t('results.completed')} {data.completedAt.toLocaleDateString()}
        </p>
      </div>

      {/* Visual Dashboard */}
      <AssessmentResultsDashboard data={data} isFreePreview={isFreePreview} />

      {/* Upgrade CTA for free users */}
      {isFreePreview && onUpgrade && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6 text-center space-y-4">
            <h3 className="text-xl font-bold">{t('paywall.unlockTitle') || 'Unlock Your Full Results'}</h3>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Get detailed category breakdowns, cognitive performance analysis, symptom radar charts, and personalized clinical recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={onUpgrade} size="lg" className="gap-2">
                <Lock className="w-4 h-4" /> Unlock Full Results — $5
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Download className="w-4 h-4" /> Get PDF Report — $20
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Research Sources */}
      {!isFreePreview && (
        <Card className="bg-medical-light">
          <CardHeader>
            <CardTitle className="text-lg">{t('results.basedOn')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">{t('results.clinicalCriteria')}</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• DSM-5 Diagnostic Criteria for ADHD</li>
                  <li>• American Psychiatric Association Guidelines</li>
                  <li>• WHO International Classification</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{t('results.validatedScales')}</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Adult ADHD Self-Report Scale (ASRS-v1.1)</li>
                  <li>• Conners' Rating Scales</li>
                  <li>• ADHD Rating Scale (ADHD-RS)</li>
                  <li>• Vanderbilt Assessment Scales</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onRestart} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          {t('results.retake')}
        </Button>
        {!isFreePreview && (
          <Button variant="secondary" className="flex items-center gap-2 opacity-50 cursor-not-allowed" disabled>
            <Download className="w-4 h-4" />
            {t('results.save')} (PDF — $20)
          </Button>
        )}
      </div>

      {/* Important Disclaimer */}
      <div className="mt-8 p-6 bg-destructive/5 border border-destructive/20 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="flex-shrink-0 w-5 h-5 text-destructive mt-0.5" />
          <div className="text-sm">
            <h4 className="font-semibold text-destructive mb-2">{t('results.medicalDisclaimer')}</h4>
            <p className="text-foreground/80 leading-relaxed">{t('results.disclaimerText')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
