import { useLanguage, Language } from '@/contexts/LanguageContext';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <ToggleGroup 
        type="single" 
        value={language} 
        onValueChange={(value) => value && setLanguage(value as Language)}
        className="bg-muted/50 p-1 rounded-lg"
      >
        <ToggleGroupItem 
          value="en" 
          aria-label="English"
          className="px-3 py-1.5 text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md transition-all"
        >
          🇺🇸 EN
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="pt-BR" 
          aria-label="Português Brasileiro"
          className="px-3 py-1.5 text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md transition-all"
        >
          🇧🇷 PT
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
