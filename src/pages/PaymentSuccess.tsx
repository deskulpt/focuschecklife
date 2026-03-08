import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const { t } = useLanguage();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { session_id: sessionId },
        });
        if (error || !data?.paid) {
          setStatus('error');
        } else {
          setStatus('success');
        }
      } catch {
        setStatus('error');
      }
    };
    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          {status === 'verifying' && (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <h2 className="text-xl font-bold">{t('payment.verifying')}</h2>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h2 className="text-xl font-bold">{t('payment.successTitle')}</h2>
              <p className="text-muted-foreground">{t('payment.successDesc')}</p>
              <Button onClick={() => navigate('/assessment')} className="w-full">
                {t('payment.viewResults')}
              </Button>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-destructive mx-auto" />
              <h2 className="text-xl font-bold">{t('payment.errorTitle')}</h2>
              <p className="text-muted-foreground">{t('payment.errorDesc')}</p>
              <Button onClick={() => navigate('/assessment')} variant="outline" className="w-full">
                {t('payment.backToAssessment')}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
