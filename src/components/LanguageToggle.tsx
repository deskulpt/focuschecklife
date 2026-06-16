import { useLanguage } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const LanguageToggle = ({ className, showLabel = false }: LanguageToggleProps) => {
  const { language, setLanguage, availableLanguages } = useLanguage();

  if (availableLanguages.length <= 1) return null;

  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className={cn('h-9 w-full min-w-[160px] bg-muted/50 border-border/50 text-sm', className)}>
        <Globe className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
        {showLabel && <span className="text-muted-foreground mr-1">Language</span>}
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent className="z-[100] min-w-[180px]">
        {availableLanguages.map(lang => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
