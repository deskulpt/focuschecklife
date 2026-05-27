import { useEffect, useState } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

export const CurrencySwitcher = ({ className }: { className?: string }) => {
  const { currency, setCurrency } = useCurrency();
  const [codes, setCodes] = useState<string[]>(['CAD', 'USD', 'EUR', 'GBP', 'BRL', 'INR', 'AUD']);

  useEffect(() => {
    supabase.from('exchange_rates').select('currency_code').then(({ data }) => {
      if (data && data.length > 0) {
        setCodes(data.map((r: { currency_code: string }) => r.currency_code).sort());
      }
    });
  }, []);

  return (
    <Select value={currency} onValueChange={setCurrency}>
      <SelectTrigger className={className ?? 'h-8 w-[88px] text-xs'}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {codes.map((c) => (
          <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
