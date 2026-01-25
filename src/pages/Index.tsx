import AssessmentApp from '@/components/AssessmentApp';
import { LanguageProvider } from '@/contexts/LanguageContext';

const Index = () => {
  return (
    <LanguageProvider>
      <AssessmentApp />
    </LanguageProvider>
  );
};

export default Index;
