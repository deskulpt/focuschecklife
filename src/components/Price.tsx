import { useCurrency } from '@/contexts/CurrencyContext';

interface PriceProps {
  /** Price in CAD cents */
  cadCents: number;
  /** Optional original price (CAD cents) for strikethrough */
  originalCadCents?: number;
  className?: string;
  showBilledNote?: boolean;
}

/**
 * Displays a price auto-converted from CAD to the visitor's currency,
 * rounded to a clean .99 (or nearest 99 for zero-decimal currencies).
 */
export const Price = ({ cadCents, originalCadCents, className, showBilledNote }: PriceProps) => {
  const { formatPrice, currency } = useCurrency();

  if (cadCents === 0) {
    return <span className={className}>{formatPrice(0)}</span>;
  }

  return (
    <span className={className}>
      {originalCadCents && originalCadCents > cadCents ? (
        <span className="line-through text-muted-foreground mr-2 text-sm">{formatPrice(originalCadCents)}</span>
      ) : null}
      {formatPrice(cadCents)}
      {showBilledNote && currency !== 'CAD' ? (
        <span className="block text-[10px] text-muted-foreground font-normal mt-1">
          Shown in {currency} · billed in CAD
        </span>
      ) : null}
    </span>
  );
};
