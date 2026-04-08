import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, Briefcase, ShieldCheck } from 'lucide-react';
import type { AgeGroup } from './AssessmentApp';
import { useLanguage } from '@/contexts/LanguageContext';

interface AgeSelectionProps {
  onAgeSelect: (age: AgeGroup) => void;
}

export const AgeSelection = ({ onAgeSelect }: AgeSelectionProps) => {
  const { t, language } = useLanguage();
  const lang = language as 'en' | 'pt-BR';

  const ageGroups = [
    {
      id: 'child' as AgeGroup,
      titleKey: 'age.child.title',
      icon: Users,
      color: 'from-medical-blue to-primary',
      questions: '18',
      time: '5-8',
      isMinor: true,
      description: {
        en: 'Parent/guardian-completed screening. Questions are about your child\'s behavior. Cognitive games use simplified visuals (shapes, animals) with slower pacing.',
        'pt-BR': 'Triagem preenchida pelo pai/responsável. As perguntas são sobre o comportamento do seu filho(a). Os jogos cognitivos usam visuais simplificados (formas, animais) com ritmo mais lento.',
      },
      badge: {
        en: '👨‍👩‍👧 Parent-completed',
        'pt-BR': '👨‍👩‍👧 Preenchido pelos pais',
      },
      gameDetails: {
        en: '• Attention: Spot the ⭐ among animals\n• Memory: 2×2 colored grid, starts at level 2\n• Flexibility: Match colored shapes (no reading needed)',
        'pt-BR': '• Atenção: Encontre a ⭐ entre animais\n• Memória: Grade 2×2 colorida, começa no nível 2\n• Flexibilidade: Combine formas coloridas (sem leitura)',
      },
    },
    {
      id: 'teen' as AgeGroup,
      titleKey: 'age.teen.title',
      icon: GraduationCap,
      color: 'from-medical-teal to-medical-blue',
      questions: '24',
      time: '8-12',
      isMinor: true,
      description: {
        en: 'Self-report with optional parent input. Includes academic and social functioning questions. Moderate-difficulty cognitive tests.',
        'pt-BR': 'Auto-relato com contribuição opcional dos pais. Inclui questões de funcionamento acadêmico e social. Testes cognitivos de dificuldade moderada.',
      },
      badge: {
        en: '🧑 Self + Parent input',
        'pt-BR': '🧑 Auto-relato + Pais',
      },
      gameDetails: {
        en: '• Attention: 25 letter trials, moderate speed\n• Memory: 3×3 grid, starts at level 3\n• Flexibility: Color-word Stroop with 4 colors',
        'pt-BR': '• Atenção: 25 tentativas com letras, velocidade moderada\n• Memória: Grade 3×3, começa no nível 3\n• Flexibilidade: Stroop cor-palavra com 4 cores',
      },
    },
    {
      id: 'adult' as AgeGroup,
      titleKey: 'age.adult.title',
      icon: Briefcase,
      color: 'from-primary to-medical-teal',
      questions: '28',
      time: '10-15',
      isMinor: false,
      description: {
        en: 'ASRS-v1.1 based self-report. Covers work, relationships, and daily functioning. Full-speed cognitive testing for comprehensive results.',
        'pt-BR': 'Auto-relato baseado no ASRS-v1.1. Abrange trabalho, relacionamentos e funcionamento diário. Testes cognitivos em velocidade máxima para resultados abrangentes.',
      },
      badge: {
        en: '🧑‍💼 Self-report',
        'pt-BR': '🧑‍💼 Auto-relato',
      },
      gameDetails: {
        en: '• Attention: 30 rapid letter trials\n• Memory: 3×3 grid, starts at level 3, max 7\n• Flexibility: Full Stroop test, 24 trials',
        'pt-BR': '• Atenção: 30 tentativas rápidas com letras\n• Memória: Grade 3×3, começa no nível 3, máx 7\n• Flexibilidade: Teste Stroop completo, 24 tentativas',
      },
    }
  ];

  return (
    <div className="p-4 sm:p-8">
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
              <CardHeader className="text-center pb-3">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${group.color} mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {t(group.titleKey)}
                </CardTitle>
                <div className="mt-1">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {group.badge[lang]}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="text-center space-y-3">
                <CardDescription className="text-sm leading-relaxed text-left">
                  {group.description[lang]}
                </CardDescription>

                {group.isMinor && (
                  <div className="flex items-start gap-2 p-2 bg-primary/5 rounded-lg text-left">
                    <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      {lang === 'pt-BR'
                        ? 'Menores de idade: um pai ou responsável autorizado deve supervisionar e completar a avaliação.'
                        : 'Minors: an authorized parent or guardian must supervise and complete the assessment.'}
                    </p>
                  </div>
                )}

                <div className="p-2 bg-muted/50 rounded-lg text-left">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {lang === 'pt-BR' ? 'Jogos cognitivos:' : 'Cognitive games:'}
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-pre-line">{group.gameDetails[lang]}</p>
                </div>
                
                <div className="space-y-1 text-xs text-muted-foreground">
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
                  className="w-full mt-2 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
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
