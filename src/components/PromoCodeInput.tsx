import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface PromoCodeInputProps {
  onRedeemed?: () => void;
}

export const PromoCodeInput = ({ onRedeemed }: PromoCodeInputProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const { user, refetchProfile } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleRedeem = async () => {
    if (!code.trim() || !user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('redeem_promo_code', { _code: code.trim() });

      if (error || !data) {
        toast({ title: t('promo.error'), description: t('promo.errorDesc'), variant: 'destructive' });
        setLoading(false);
        return;
      }

      const result = data as { success: boolean; error?: string };

      if (!result.success) {
        const errMap: Record<string, { title: string; desc: string }> = {
          unauthorized: { title: t('promo.error'), desc: t('promo.errorDesc') },
          invalid_code: { title: t('promo.invalidCode'), desc: t('promo.invalidCodeDesc') },
          expired: { title: t('promo.codeExpired'), desc: t('promo.codeExpiredDesc') },
          max_uses_reached: { title: t('promo.codeExpired'), desc: t('promo.maxUsesDesc') },
          already_redeemed: { title: t('promo.alreadyRedeemed'), desc: t('promo.alreadyRedeemedDesc') },
        };
        const m = errMap[result.error || ''] || { title: t('promo.error'), desc: t('promo.errorDesc') };
        toast({ title: m.title, description: m.desc, variant: 'destructive' });
        setLoading(false);
        return;
      }

      setRedeemed(true);
      refetchProfile();
      onRedeemed?.();
      toast({ title: t('promo.successTitle'), description: t('promo.successDesc') });
    } catch {
      toast({ title: t('promo.error'), description: t('promo.errorDesc'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (redeemed) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-success" />
          <span className="text-sm font-medium text-success">{t('promo.redeemed')}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-muted">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{t('promo.title')}</span>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder={t('promo.placeholder')}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
          />
          <Button onClick={handleRedeem} disabled={loading || !code.trim()} size="sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('promo.apply')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
