import { useLanguage } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

export const LanguageToggle = () => {
  const { language, setLanguage, availableLanguages } = useLanguage();

  if (availableLanguages.length <= 1) return null;

  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className="w-auto min-w-[120px] h-9 bg-muted/50 border-border/50 text-sm">
        <Globe className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {availableLanguages.map(lang => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
