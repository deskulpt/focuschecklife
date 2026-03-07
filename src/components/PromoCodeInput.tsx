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
      const { data: promoCode, error: lookupError } = await supabase
        .from('promo_codes').select('*').eq('code', code.trim().toUpperCase()).eq('is_active', true).single();

      if (lookupError || !promoCode) {
        toast({ title: t('promo.invalidCode'), description: t('promo.invalidCodeDesc'), variant: 'destructive' });
        setLoading(false);
        return;
      }

      if (promoCode.max_uses && promoCode.times_used >= promoCode.max_uses) {
        toast({ title: t('promo.codeExpired'), description: t('promo.maxUsesDesc'), variant: 'destructive' });
        setLoading(false);
        return;
      }

      if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
        toast({ title: t('promo.codeExpired'), description: t('promo.codeExpiredDesc'), variant: 'destructive' });
        setLoading(false);
        return;
      }

      const { error: redeemError } = await supabase
        .from('promo_code_redemptions').insert({ promo_code_id: promoCode.id, user_id: user.id });

      if (redeemError) {
        if (redeemError.code === '23505') {
          toast({ title: t('promo.alreadyRedeemed'), description: t('promo.alreadyRedeemedDesc'), variant: 'destructive' });
        } else {
          toast({ title: t('promo.error'), description: t('promo.errorDesc'), variant: 'destructive' });
        }
        setLoading(false);
        return;
      }

      const updates: Record<string, boolean> = {};
      if (promoCode.grants_full_test) updates.has_paid_full_test = true;
      if (promoCode.grants_pdf) updates.has_paid_pdf = true;

      if (Object.keys(updates).length > 0) {
        await supabase.from('profiles').update(updates).eq('user_id', user.id);
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
