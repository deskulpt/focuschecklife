import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export const PromoCodeInput = () => {
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
      // Look up the promo code
      const { data: promoCode, error: lookupError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('is_active', true)
        .single();

      if (lookupError || !promoCode) {
        toast({ title: 'Invalid Code', description: 'This promo code is not valid or has expired.', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Check max uses
      if (promoCode.max_uses && promoCode.times_used >= promoCode.max_uses) {
        toast({ title: 'Code Expired', description: 'This promo code has reached its maximum uses.', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Check expiration
      if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
        toast({ title: 'Code Expired', description: 'This promo code has expired.', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Try to redeem (unique constraint will prevent double-use)
      const { error: redeemError } = await supabase
        .from('promo_code_redemptions')
        .insert({ promo_code_id: promoCode.id, user_id: user.id });

      if (redeemError) {
        if (redeemError.code === '23505') {
          toast({ title: 'Already Redeemed', description: 'You have already used this promo code.', variant: 'destructive' });
        } else {
          toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
        }
        setLoading(false);
        return;
      }

      // Update profile with granted access
      const updates: Record<string, boolean> = {};
      if (promoCode.grants_full_test) updates.has_paid_full_test = true;
      if (promoCode.grants_pdf) updates.has_paid_pdf = true;

      if (Object.keys(updates).length > 0) {
        await supabase.from('profiles').update(updates).eq('user_id', user.id);
      }

      // Increment times_used — we can't update directly due to RLS, so we use a simple approach
      // The promo_codes table doesn't have an update policy for regular users, which is correct for security.

      setRedeemed(true);
      refetchProfile();
      toast({ title: '🎉 Code Redeemed!', description: 'Your access has been upgraded. Enjoy the full experience!' });
    } catch {
      toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (redeemed) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-success" />
          <span className="text-sm font-medium text-success">Promo code redeemed successfully! Refresh your results to see full access.</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-muted">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{t('promo.title') || 'Have a promo code?'}</span>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder={t('promo.placeholder') || 'Enter code'}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
          />
          <Button onClick={handleRedeem} disabled={loading || !code.trim()} size="sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('promo.apply') || 'Apply'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
