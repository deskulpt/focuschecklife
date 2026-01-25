import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, Briefcase } from 'lucide-react';
import type { AgeGroup } from './AssessmentApp';
import { useLanguage } from '@/contexts/LanguageContext';

interface AgeSelectionProps {
  onAgeSelect: (age: AgeGroup) => void;
}

export const AgeSelection = ({ onAgeSelect }: AgeSelectionProps) => {
  const { t } = useLanguage();
  
  const ageGroups = [
    {
      id: 'child' as AgeGroup,
      titleKey: 'age.child.title',
      descriptionKey: 'age.child.description',
      icon: Users,
      color: 'from-medical-blue to-primary',
      questions: '18',
      time: '5-8'
    },
    {
      id: 'teen' as AgeGroup,
      titleKey: 'age.teen.title',
      descriptionKey: 'age.teen.description',
      icon: GraduationCap,
      color: 'from-medical-teal to-medical-blue',
      questions: '24',
      time: '8-12'
    },
    {
      id: 'adult' as AgeGroup,
      titleKey: 'age.adult.title',
      descriptionKey: 'age.adult.description',
      icon: Briefcase,
      color: 'from-primary to-medical-teal',
      questions: '28',
      time: '10-15'
    }
  ];

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          {t('age.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('age.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {ageGroups.map((group) => {
          const IconComponent = group.icon;
          
          return (
            <Card 
              key={group.id}
              className="group hover:shadow-[var(--shadow-card)] transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30"
              onClick={() => onAgeSelect(group.id)}
            >
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${group.color} mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {t(group.titleKey)}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="text-center space-y-4">
                <CardDescription className="text-sm leading-relaxed min-h-[60px]">
                  {t(group.descriptionKey)}
                </CardDescription>
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{t('age.questions')}</span>
                    <span className="font-medium">{group.questions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('age.time')}</span>
                    <span className="font-medium">{group.time} min</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
                >
                  {t('age.begin')}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-medical-light rounded-lg">
        <div className="text-center text-sm text-muted-foreground">
          <p className="font-medium mb-2">{t('age.research')}</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <span>• DSM-5 Criteria</span>
            <span>• Conners' Rating Scales</span>
            <span>• ADHD Rating Scale (ADHD-RS)</span>
            <span>• Adult ADHD Self-Report Scale (ASRS-v1.1)</span>
            <span>• Vanderbilt Assessment Scales</span>
          </div>
        </div>
      </div>
    </div>
  );
};