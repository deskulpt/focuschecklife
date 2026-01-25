import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'pt-BR';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  'en': {
    // Header
    'app.title': 'ADHD Assessment Tool',
    'app.subtitle': 'A comprehensive, research-based assessment tool using validated clinical questionnaires to help identify potential ADHD symptoms across different age groups.',
    
    // Disclaimer
    'disclaimer.title': 'Important Disclaimer:',
    'disclaimer.text': 'This assessment is for informational purposes only and is not a substitute for professional medical diagnosis. If you have concerns about ADHD symptoms, please consult with a qualified healthcare professional or mental health provider.',
    
    // Age Selection
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
    
    // Survey
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
    
    // Scale labels
    'scale.never': 'Never',
    'scale.rarely': 'Rarely',
    'scale.sometimes': 'Sometimes',
    'scale.often': 'Often',
    'scale.veryOften': 'Very Often',
    
    // Games
    'games.title': 'Cognitive Assessment Games',
    'games.subtitle': 'Complete these interactive cognitive tests to provide objective data about attention, impulse control, and working memory.',
    'games.back': 'Back to Survey',
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
    
    // CPT Game
    'cpt.title': 'Continuous Performance Test',
    'cpt.instructions': 'Press SPACE or tap the button when you see the target letter "X". Do NOT respond to any other letter. Stay focused!',
    'cpt.start': 'Start Test',
    'cpt.respond': 'RESPOND!',
    'cpt.hits': 'Hits',
    'cpt.misses': 'Misses',
    'cpt.falseAlarms': 'False Alarms',
    'cpt.avgReaction': 'Avg Reaction',
    'cpt.complete': 'Test Complete!',
    'cpt.continue': 'Continue',
    
    // Working Memory Game
    'wm.title': 'Working Memory Test',
    'wm.instructions': 'Watch the sequence of highlighted squares, then repeat the pattern by clicking the squares in the same order.',
    'wm.start': 'Start Test',
    'wm.watch': 'Watch the pattern...',
    'wm.repeat': 'Repeat the pattern!',
    'wm.correct': 'Correct!',
    'wm.incorrect': 'Incorrect',
    'wm.level': 'Level',
    'wm.score': 'Score',
    'wm.complete': 'Test Complete!',
    'wm.maxLevel': 'Max Level',
    'wm.totalScore': 'Total Score',
    'wm.continue': 'Continue',
    
    // Stroop Game
    'stroop.title': 'Stroop Test',
    'stroop.instructions': 'Select the COLOR of the ink, not the word itself. Work as quickly and accurately as possible!',
    'stroop.start': 'Start Test',
    'stroop.round': 'Round',
    'stroop.correct': 'Correct',
    'stroop.avgTime': 'Avg Time',
    'stroop.complete': 'Test Complete!',
    'stroop.accuracy': 'Accuracy',
    'stroop.continue': 'Continue',
    
    // Results
    'results.title': 'Assessment Results',
    'results.completed': 'Completed',
    'results.ageGroup.child': 'Child (6-12 years)',
    'results.ageGroup.teen': 'Teen (13-17 years)',
    'results.ageGroup.adult': 'Adult (18+ years)',
    'results.overallRisk': 'Overall Risk Indicator',
    'results.low': 'Low',
    'results.moderate': 'Moderate',
    'results.high': 'High',
    'results.categoryBreakdown': 'Category Breakdown',
    'results.cognitivePerformance': 'Cognitive Performance',
    'results.performanceComparison': 'Performance Comparison',
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
    
    // Dashboard metrics
    'dashboard.sustainedAttention': 'Sustained Attention',
    'dashboard.impulseControl': 'Impulse Control',
    'dashboard.workingMemory': 'Working Memory',
    'dashboard.cognitiveFlexibility': 'Cognitive Flexibility',
    'dashboard.reactionTime': 'Reaction Time',
    'dashboard.accuracy': 'Accuracy',
    'dashboard.level': 'Level',
  },
  'pt-BR': {
    // Header
    'app.title': 'Ferramenta de Avaliação de TDAH',
    'app.subtitle': 'Uma ferramenta de avaliação abrangente, baseada em pesquisas, utilizando questionários clínicos validados para ajudar a identificar potenciais sintomas de TDAH em diferentes faixas etárias.',
    
    // Disclaimer
    'disclaimer.title': 'Aviso Importante:',
    'disclaimer.text': 'Esta avaliação é apenas para fins informativos e não substitui o diagnóstico médico profissional. Se você tiver preocupações sobre sintomas de TDAH, consulte um profissional de saúde qualificado ou um profissional de saúde mental.',
    
    // Age Selection
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
    'age.research': 'Ferramentas de Avaliação Baseadas em Pesquisas Utilizadas:',
    
    // Survey
    'survey.question': 'Pergunta',
    'survey.of': 'de',
    'survey.previous': 'Anterior',
    'survey.back': 'Voltar',
    'survey.instructions.child': 'Avalie com que frequência você observou os seguintes comportamentos na criança nos últimos 6 meses:',
    'survey.instructions.teen': 'Avalie com que frequência esses comportamentos se aplicam a você nos últimos 6 meses:',
    'survey.instructions.adult': 'Avalie com que frequência você experimentou esses comportamentos nos últimos 6 meses:',
    'survey.progress': 'Progresso por Categoria',
    'survey.category.inattention': 'Desatenção',
    'survey.category.hyperactivity': 'Hiperatividade',
    'survey.category.impulsivity': 'Impulsividade',
    'survey.category.functional_impairment': 'Funcional',
    
    // Scale labels
    'scale.never': 'Nunca',
    'scale.rarely': 'Raramente',
    'scale.sometimes': 'Às vezes',
    'scale.often': 'Frequentemente',
    'scale.veryOften': 'Muito Frequentemente',
    
    // Games
    'games.title': 'Jogos de Avaliação Cognitiva',
    'games.subtitle': 'Complete estes testes cognitivos interativos para fornecer dados objetivos sobre atenção, controle de impulsos e memória de trabalho.',
    'games.back': 'Voltar ao Questionário',
    'games.game': 'Jogo',
    'games.test1.title': 'Teste de Desempenho Contínuo',
    'games.test1.description': 'Mede atenção sustentada e controle de impulsos',
    'games.test1.time': '~2 min',
    'games.test2.title': 'Teste de Memória de Trabalho',
    'games.test2.description': 'Testa a capacidade de reter e recordar sequências',
    'games.test2.time': '~3 min',
    'games.test3.title': 'Teste de Stroop',
    'games.test3.description': 'Avalia flexibilidade cognitiva e inibição',
    'games.test3.time': '~2 min',
    'games.complete': 'Concluído',
    'games.pending': 'Pendente',
    'games.start': 'Iniciar',
    'games.viewResults': 'Ver Resultados',
    'games.completeAll': 'Por favor, complete todos os jogos para continuar',
    'games.research': 'Estes testes são baseados em métodos de avaliação cognitiva validados usados em avaliações clínicas de TDAH.',
    
    // CPT Game
    'cpt.title': 'Teste de Desempenho Contínuo',
    'cpt.instructions': 'Pressione ESPAÇO ou toque no botão quando vir a letra alvo "X". NÃO responda a nenhuma outra letra. Mantenha o foco!',
    'cpt.start': 'Iniciar Teste',
    'cpt.respond': 'RESPONDA!',
    'cpt.hits': 'Acertos',
    'cpt.misses': 'Erros',
    'cpt.falseAlarms': 'Alarmes Falsos',
    'cpt.avgReaction': 'Tempo Médio',
    'cpt.complete': 'Teste Concluído!',
    'cpt.continue': 'Continuar',
    
    // Working Memory Game
    'wm.title': 'Teste de Memória de Trabalho',
    'wm.instructions': 'Observe a sequência de quadrados destacados e repita o padrão clicando nos quadrados na mesma ordem.',
    'wm.start': 'Iniciar Teste',
    'wm.watch': 'Observe o padrão...',
    'wm.repeat': 'Repita o padrão!',
    'wm.correct': 'Correto!',
    'wm.incorrect': 'Incorreto',
    'wm.level': 'Nível',
    'wm.score': 'Pontuação',
    'wm.complete': 'Teste Concluído!',
    'wm.maxLevel': 'Nível Máximo',
    'wm.totalScore': 'Pontuação Total',
    'wm.continue': 'Continuar',
    
    // Stroop Game
    'stroop.title': 'Teste de Stroop',
    'stroop.instructions': 'Selecione a COR da tinta, não a palavra em si. Trabalhe o mais rápido e precisamente possível!',
    'stroop.start': 'Iniciar Teste',
    'stroop.round': 'Rodada',
    'stroop.correct': 'Correto',
    'stroop.avgTime': 'Tempo Médio',
    'stroop.complete': 'Teste Concluído!',
    'stroop.accuracy': 'Precisão',
    'stroop.continue': 'Continuar',
    
    // Results
    'results.title': 'Resultados da Avaliação',
    'results.completed': 'Concluído',
    'results.ageGroup.child': 'Criança (6-12 anos)',
    'results.ageGroup.teen': 'Adolescente (13-17 anos)',
    'results.ageGroup.adult': 'Adulto (18+ anos)',
    'results.overallRisk': 'Indicador de Risco Geral',
    'results.low': 'Baixo',
    'results.moderate': 'Moderado',
    'results.high': 'Alto',
    'results.categoryBreakdown': 'Detalhamento por Categoria',
    'results.cognitivePerformance': 'Desempenho Cognitivo',
    'results.performanceComparison': 'Comparação de Desempenho',
    'results.score': 'Pontuação',
    'results.yourScore': 'Sua Pontuação',
    'results.clinicalThreshold': 'Limiar Clínico',
    'results.basedOn': 'Avaliação Baseada Em',
    'results.clinicalCriteria': 'Critérios Clínicos:',
    'results.validatedScales': 'Escalas Validadas:',
    'results.retake': 'Refazer Avaliação',
    'results.save': 'Salvar Resultados',
    'results.medicalDisclaimer': 'Aviso Médico',
    'results.disclaimerText': 'Esta avaliação é apenas para fins educacionais e informativos. Não se destina a diagnosticar, tratar ou substituir aconselhamento médico profissional. O diagnóstico de TDAH requer avaliação abrangente por um profissional de saúde qualificado, incluindo entrevistas clínicas, histórico médico e, às vezes, testes adicionais. Se você tiver preocupações sobre sintomas de TDAH, consulte um profissional de saúde licenciado.',
    
    // Dashboard metrics
    'dashboard.sustainedAttention': 'Atenção Sustentada',
    'dashboard.impulseControl': 'Controle de Impulsos',
    'dashboard.workingMemory': 'Memória de Trabalho',
    'dashboard.cognitiveFlexibility': 'Flexibilidade Cognitiva',
    'dashboard.reactionTime': 'Tempo de Reação',
    'dashboard.accuracy': 'Precisão',
    'dashboard.level': 'Nível',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
