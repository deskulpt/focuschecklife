import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'VND', 'IDR', 'HUF', 'ISK', 'CLP', 'COP']);

const SYMBOLS: Record<string, string> = {
  CAD: 'CA$', USD: 'US$', EUR: '€', GBP: '£', AUD: 'A$', NZD: 'NZ$', BRL: 'R$',
  MXN: 'MX$', INR: '₹', JPY: '¥', CNY: '¥', HKD: 'HK$', SGD: 'S$', KRW: '₩',
  THB: '฿', MYR: 'RM', IDR: 'Rp', PHP: '₱', VND: '₫',
  AED: 'AED', SAR: 'SAR', ILS: '₪', TRY: '₺', EGP: 'E£', ZAR: 'R',
  CHF: 'CHF', SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč',
  HUF: 'Ft', RON: 'lei', RUB: '₽', UAH: '₴',
};

interface CurrencyContextType {
  currency: string;
  setCurrency: (c: string) => void;
  detectedCountry: string;
  rate: number;             // rate from CAD to current currency
  ratesLoaded: boolean;
  /** Convert cad cents → display string, rounded to a clean .99 */
  formatPrice: (cadCents: number, opts?: { plain?: boolean }) => string;
  /** Raw converted value (in major units, e.g. dollars) */
  convert: (cadCents: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'fc.currency';

function roundToNinetyNine(value: number, currency: string): number {
  if (value <= 0) return 0;
  if (ZERO_DECIMAL.has(currency)) {
    // round to nearest 99 (e.g. 487 -> 499, 1532 -> 1599)
    const base = Math.max(99, Math.floor(value / 100) * 100 + 99);
    return base;
  }
  // floor + 0.99 (so 6.42 -> 6.99, 7.10 -> 7.99). If converted is below 1, floor 0 -> 0.99.
  return Math.floor(value) + 0.99;
}

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<string>(() => {
    return (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || 'CAD';
  });
  const [detectedCountry, setDetectedCountry] = useState<string>('');
  const [rates, setRates] = useState<Record<string, number>>({ CAD: 1 });
  const [ratesLoaded, setRatesLoaded] = useState(false);

  // Load exchange rates (and refresh if stale).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('exchange_rates')
        .select('currency_code, rate_from_cad, updated_at');
      if (cancelled) return;
      const map: Record<string, number> = { CAD: 1 };
      let newest = 0;
      (data || []).forEach((r: { currency_code: string; rate_from_cad: number; updated_at: string }) => {
        map[r.currency_code] = Number(r.rate_from_cad);
        const t = new Date(r.updated_at).getTime();
        if (t > newest) newest = t;
      });
      setRates(map);
      setRatesLoaded(true);

      const stale = !newest || Date.now() - newest > 24 * 60 * 60 * 1000;
      if (stale) {
        try {
          await supabase.functions.invoke('refresh-exchange-rates');
          const { data: fresh } = await supabase.from('exchange_rates').select('currency_code, rate_from_cad');
          if (cancelled || !fresh) return;
          const m: Record<string, number> = { CAD: 1 };
          fresh.forEach((r: { currency_code: string; rate_from_cad: number }) => {
            m[r.currency_code] = Number(r.rate_from_cad);
          });
          setRates(m);
        } catch (_) {/* keep existing */}
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Detect currency from visitor IP (only if user hasn't picked one).
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.functions.invoke('detect-currency');
        if (cancelled || !data) return;
        const detected = (data as { currency?: string; country?: string }).currency;
        const country = (data as { country?: string }).country || '';
        setDetectedCountry(country);
        if (detected) setCurrencyState(detected);
      } catch (_) {/* keep default */}
    })();
    return () => { cancelled = true; };
  }, []);

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    try { localStorage.setItem(STORAGE_KEY, c); } catch (_) { /* ignore */ }
  };

  const rate = rates[currency] ?? 1;

  const value = useMemo<CurrencyContextType>(() => ({
    currency,
    setCurrency,
    detectedCountry,
    rate,
    ratesLoaded,
    convert: (cadCents: number) => (cadCents / 100) * rate,
    formatPrice: (cadCents: number, opts) => {
      const major = (cadCents / 100) * rate;
      if (cadCents === 0) {
        const sym = SYMBOLS[currency] || currency + ' ';
        return opts?.plain ? `${sym}0` : `${sym}0`;
      }
      const rounded = roundToNinetyNine(major, currency);
      const sym = SYMBOLS[currency] || currency + ' ';
      if (ZERO_DECIMAL.has(currency)) {
        return `${sym}${Math.round(rounded).toLocaleString()}`;
      }
      return `${sym}${rounded.toFixed(2)}`;
    },
  }), [currency, rate, ratesLoaded, detectedCountry]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};
