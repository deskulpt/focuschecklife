import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Language = string;

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  availableLanguages: LanguageOption[];
}

// Hardcoded fallback translations (English)
const fallbackEN: Record<string, string> = {
  'app.title': 'FocusCheck ADHD Assessment',
  'app.subtitle': 'A comprehensive, research-based assessment tool using validated clinical questionnaires and cognitive tests to help identify potential ADHD symptoms across different age groups.',
  'disclaimer.title': 'Important Disclaimer:',
  'disclaimer.text': 'This assessment is for informational purposes only and is not a substitute for professional medical diagnosis. If you have concerns about ADHD symptoms, please consult with a qualified healthcare professional or mental health provider.',
  'age.title': 'Select Age Group',
  'age.subtitle': 'Choose the appropriate age category to begin the research-validated assessment',
  'age.child.title': 'Children (6-12 years)',
  'age.child.description': "Assessment based on parent/teacher observations using Conners' Rating Scales and DSM-5 criteria",
  'age.teen.title': 'Teenagers (13-17 years)',
  'age.teen.description': 'Self-report and parent questionnaire combining ADHD Rating Scale and behavioral observations',
  'age.adult.title': 'Adults (18+ years)',
  'age.adult.description': 'Adult ADHD Self-Report Scale (ASRS-v1.1) and retrospective childhood symptoms assessment',
  'age.questions': 'Questions:',
  'age.time': 'Time:',
  'age.begin': 'Begin Assessment',
  'age.research': 'Research-Based Assessment Tools Used:',
  'survey.question': 'Question',
  'survey.of': 'of',
  'survey.previous': 'Previous',
  'survey.back': 'Back',
  'survey.instructions.child': "Rate how often you've observed the following behaviors in the child over the past 6 months:",
  'survey.instructions.teen': "Rate how often these behaviors apply to you over the past 6 months:",
  'survey.instructions.adult': "Rate how often you've experienced these behaviors over the past 6 months:",
  'survey.progress': 'Category Progress',
  'survey.category.inattention': 'Inattention',
  'survey.category.hyperactivity': 'Hyperactivity',
  'survey.category.impulsivity': 'Impulsivity',
  'survey.category.functional_impairment': 'Functional',
  'scale.never': 'Never',
  'scale.rarely': 'Rarely',
  'scale.sometimes': 'Sometimes',
  'scale.often': 'Often',
  'scale.veryOften': 'Very Often',
  'games.title': 'Cognitive Assessment Games',
  'games.subtitle': 'Complete these interactive cognitive tests to provide objective data about attention, impulse control, and working memory.',
  'games.back': 'Back to Survey',
  'games.backToMenu': 'Back to Game Menu',
  'games.game': 'Game',
  'games.test1.title': 'Continuous Performance Test',
  'games.test1.description': 'Measures sustained attention and impulse control',
  'games.test1.time': '~2 min',
  'games.test2.title': 'Working Memory Test',
  'games.test2.description': 'Tests ability to hold and recall sequences',
  'games.test2.time': '~3 min',
  'games.test3.title': 'Stroop Test',
  'games.test3.description': 'Evaluates cognitive flexibility and inhibition',
  'games.test3.time': '~2 min',
  'games.complete': 'Complete',
  'games.pending': 'Pending',
  'games.start': 'Start',
  'games.viewResults': 'View Results',
  'games.completeAll': 'Please complete all games to continue',
  'games.research': 'These tests are based on validated cognitive assessment methods used in clinical ADHD evaluations.',
  'games.basedOn': 'Based on:',
  'games.note': 'Note:',
  'cpt.title': 'Continuous Performance Test',
  'cpt.description': 'This test measures sustained attention and impulse control. Stay focused!',
  'cpt.instructions': 'Press SPACE or tap the button when you see the target letter "X". Do NOT respond to any other letter.',
  'cpt.start': 'Start Test',
  'cpt.respond': 'RESPOND!',
  'cpt.hits': 'Hits',
  'cpt.misses': 'Misses',
  'cpt.falseAlarms': 'False Alarms',
  'cpt.avgReaction': 'Avg Reaction',
  'cpt.trial': 'Trial',
  'cpt.watching': 'Focus on the letter...',
  'wm.title': 'Working Memory Test',
  'wm.description': 'This test measures your ability to hold and manipulate information in memory.',
  'wm.instructions.title': 'Instructions:',
  'wm.instructions.1': 'Watch the sequence of highlighted squares',
  'wm.instructions.2': 'Remember the order in which they appear',
  'wm.instructions.3': 'Click the squares in the same order',
  'wm.instructions.4': 'The sequence gets longer as you progress',
  'wm.start': 'Start Test',
  'wm.watch': 'Watch the sequence...',
  'wm.repeat': 'Click the squares in order',
  'wm.level': 'Level',
  'wm.trial': 'Trial',
  'wm.correct': 'Correct',
  'wm.maxLevel': 'Max Level',
  'stroop.title': 'Stroop Test',
  'stroop.description': 'This test evaluates cognitive flexibility and response inhibition.',
  'stroop.instructions.title': 'Instructions:',
  'stroop.instructions.1': 'You will see color words displayed in different ink colors',
  'stroop.instructions.2': 'Select the COLOR of the ink, NOT the word itself',
  'stroop.instructions.3': 'Work as quickly and accurately as possible',
  'stroop.start': 'Start Test',
  'stroop.selectColor': 'Select the INK COLOR, not the word!',
  'stroop.trial': 'Trial',
  'stroop.correct': 'Correct',
  'stroop.avgTime': 'Avg Time',
  'results.title': 'Assessment Results',
  'results.completed': 'Completed',
  'results.ageGroup.child': 'Child (6-12 years)',
  'results.ageGroup.teen': 'Teen (13-17 years)',
  'results.ageGroup.adult': 'Adult (18+ years)',
  'results.overallScore': 'Overall Score',
  'results.overallRisk': 'Overall Risk Indicator',
  'results.low': 'Low',
  'results.moderate': 'Moderate',
  'results.high': 'High',
  'results.categoryBreakdown': 'Category Breakdown',
  'results.cognitivePerformance': 'Cognitive Performance Tests',
  'results.cognitiveDescription': 'Objective measures of attention, memory, and executive function',
  'results.performanceComparison': 'Performance Comparison',
  'results.symptomProfile': 'Symptom Profile',
  'results.score': 'Score',
  'results.yourScore': 'Your Score',
  'results.clinicalThreshold': 'Clinical Threshold',
  'results.basedOn': 'Assessment Based On',
  'results.clinicalCriteria': 'Clinical Criteria:',
  'results.validatedScales': 'Validated Scales:',
  'results.retake': 'Take Assessment Again',
  'results.save': 'Save Results',
  'results.medicalDisclaimer': 'Medical Disclaimer',
  'results.disclaimerText': 'This assessment is for educational and informational purposes only. It is not intended to diagnose, treat, or replace professional medical advice. ADHD diagnosis requires comprehensive evaluation by a qualified healthcare professional, including clinical interviews, medical history, and sometimes additional testing. If you have concerns about ADHD symptoms, please consult with a licensed healthcare provider.',
  'dashboard.high.title': 'Significant ADHD Symptoms Indicated',
  'dashboard.high.description': 'Your responses suggest a high likelihood of ADHD symptoms that may significantly impact daily functioning.',
  'dashboard.high.recommendation': 'We strongly recommend consulting with a healthcare professional for a comprehensive evaluation.',
  'dashboard.moderate.title': 'Moderate ADHD Symptoms Indicated',
  'dashboard.moderate.description': 'Your responses suggest some ADHD symptoms that may be impacting your daily life.',
  'dashboard.moderate.recommendation': 'Consider discussing these symptoms with a healthcare professional for further evaluation.',
  'dashboard.low.title': 'Low ADHD Symptoms Indicated',
  'dashboard.low.description': 'Your responses suggest minimal ADHD symptoms at this time.',
  'dashboard.low.recommendation': 'Continue monitoring symptoms and consult a professional if concerns develop.',
  'dashboard.sustainedAttention': 'Sustained Attention',
  'dashboard.impulseControl': 'Impulse Control',
  'dashboard.workingMemory': 'Working Memory',
  'dashboard.cognitiveFlexibility': 'Cognitive Flexibility',
  'dashboard.reactionTime': 'Reaction Time',
  'dashboard.accuracy': 'Accuracy',
  'dashboard.level': 'Level',
  'dashboard.attentionTest': 'Attention Test (CPT)',
  'dashboard.memoryTest': 'Memory Test',
  'dashboard.flexibilityTest': 'Flexibility Test',
  'dashboard.correctHits': 'Correct Hits',
  'dashboard.falseAlarms': 'False Alarms',
  'dashboard.missed': 'Missed',
  'dashboard.avgTime': 'Avg Time',
  'dashboard.correct': 'Correct',
  'dashboard.incorrect': 'Incorrect',
  'dashboard.maxLevelAchieved': 'Max Level Achieved',
  'dashboard.congruent': 'Congruent',
  'dashboard.incongruent': 'Incongruent',
  'dashboard.clinicalNote': 'Clinical Note:',
  'dashboard.clinicalNoteText': 'These computerized tests provide objective measurements similar to those used by professionals in ADHD assessment. The Continuous Performance Test (CPT) measures sustained attention, the Working Memory Test assesses memory capacity, and the Stroop Test evaluates cognitive flexibility and inhibition control.',
  'dashboard.accuracyPercent': 'Accuracy %',
  'dashboard.performanceScore': 'Performance Score',
  'dashboard.attention': 'Attention',
  'dashboard.memory': 'Memory',
  'dashboard.flexibility': 'Flexibility',
  'category.inattention.low': 'Attention and focus appear to be within typical ranges.',
  'category.inattention.moderate': 'Some difficulties with attention, focus, and task completion may be present.',
  'category.inattention.high': 'Significant attention difficulties that likely impact daily functioning.',
  'category.hyperactivity.low': 'Activity levels appear to be within typical ranges.',
  'category.hyperactivity.moderate': 'Some signs of restlessness or excessive activity may be present.',
  'category.hyperactivity.high': 'Significant hyperactivity that likely impacts daily functioning.',
  'category.impulsivity.low': 'Impulse control appears to be within typical ranges.',
  'category.impulsivity.moderate': 'Some impulsive behaviors may be present.',
  'category.impulsivity.high': 'Significant impulsivity that likely impacts daily functioning.',
  'category.functional_impairment.low': 'Minimal impact on daily life and functioning.',
  'category.functional_impairment.moderate': 'Some challenges with daily tasks and responsibilities.',
  'category.functional_impairment.high': 'Significant impact on work, school, or relationship functioning.',
  'paywall.unlockTitle': 'Unlock Full Results',
  'paywall.unlockDescription': 'Get detailed category breakdown, cognitive performance analysis, symptom radar chart, and clinical recommendations.',
  'paywall.oneTime': 'one-time',
  'landing.myAssessment': 'My Assessment',
  'landing.logout': 'Logout',
};

// Hardcoded fallback for pt-BR
const fallbackPTBR: Record<string, string> = {
  'app.title': 'Avaliação de TDAH FocusCheck',
  'app.subtitle': 'Uma ferramenta de avaliação abrangente, baseada em pesquisas, utilizando questionários clínicos validados e testes cognitivos para ajudar a identificar potenciais sintomas de TDAH em diferentes faixas etárias.',
  'disclaimer.title': 'Aviso Importante:',
  'disclaimer.text': 'Esta avaliação é apenas para fins informativos e não substitui o diagnóstico médico profissional. Se você tiver preocupações sobre sintomas de TDAH, consulte um profissional de saúde qualificado ou um profissional de saúde mental.',
  'age.title': 'Selecione a Faixa Etária',
  'age.subtitle': 'Escolha a categoria de idade apropriada para iniciar a avaliação validada por pesquisas',
  'age.child.title': 'Crianças (6-12 anos)',
  'age.child.description': 'Avaliação baseada em observações de pais/professores usando Escalas de Conners e critérios do DSM-5',
  'age.teen.title': 'Adolescentes (13-17 anos)',
  'age.teen.description': 'Auto-relato e questionário para pais combinando Escala de TDAH e observações comportamentais',
  'age.adult.title': 'Adultos (18+ anos)',
  'age.adult.description': 'Escala de Auto-Relato de TDAH para Adultos (ASRS-v1.1) e avaliação retrospectiva de sintomas na infância',
  'age.questions': 'Perguntas:',
  'age.time': 'Tempo:',
  'age.begin': 'Iniciar Avaliação',
  'survey.question': 'Pergunta',
  'survey.of': 'de',
  'survey.previous': 'Anterior',
  'survey.back': 'Voltar',
  'scale.never': 'Nunca',
  'scale.rarely': 'Raramente',
  'scale.sometimes': 'Às vezes',
  'scale.often': 'Frequentemente',
  'scale.veryOften': 'Muito Frequentemente',
  'games.title': 'Jogos de Avaliação Cognitiva',
  'games.start': 'Iniciar',
  'games.complete': 'Concluído',
  'games.pending': 'Pendente',
  'games.viewResults': 'Ver Resultados',
  'results.title': 'Resultados da Avaliação',
  'results.low': 'Baixo',
  'results.moderate': 'Moderado',
  'results.high': 'Alto',
  'results.retake': 'Refazer Avaliação',
  'paywall.unlockTitle': 'Desbloqueie os Resultados Completos',
  'landing.myAssessment': 'Minha Avaliação',
  'landing.logout': 'Sair',
};

const hardcodedFallbacks: Record<string, Record<string, string>> = {
  'en': fallbackEN,
  'pt-BR': fallbackPTBR,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [availableLanguages, setAvailableLanguages] = useState<LanguageOption[]>([
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
  ]);
  const [dbTranslations, setDbTranslations] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    // Load enabled languages
    supabase.from('languages').select('code, name, flag').eq('is_enabled', true).then(({ data }) => {
      if (data && data.length > 0) {
        setAvailableLanguages(data as LanguageOption[]);
      }
    });

    // Load all translations
    supabase.from('translations').select('language_code, key, value').then(({ data }) => {
      if (data && data.length > 0) {
        const map: Record<string, Record<string, string>> = {};
        (data as any[]).forEach(row => {
          if (!map[row.language_code]) map[row.language_code] = {};
          map[row.language_code][row.key] = row.value;
        });
        setDbTranslations(map);
      }
    });
  }, []);

  const t = (key: string): string => {
    // Priority: DB translations > hardcoded fallbacks > key
    return dbTranslations[language]?.[key]
      || hardcodedFallbacks[language]?.[key]
      || hardcodedFallbacks['en']?.[key]
      || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
