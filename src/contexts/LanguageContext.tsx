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
    'app.title': 'FocusCheck ADHD Assessment',
    'app.subtitle': 'A comprehensive, research-based assessment tool using validated clinical questionnaires and cognitive tests to help identify potential ADHD symptoms across different age groups.',
    
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
    
    // CPT Game
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
    
    // Working Memory Game
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
    
    // Stroop Game
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
    
    // Results
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
    
    // Dashboard Assessment Levels
    'dashboard.high.title': 'Significant ADHD Symptoms Indicated',
    'dashboard.high.description': 'Your responses suggest a high likelihood of ADHD symptoms that may significantly impact daily functioning.',
    'dashboard.high.recommendation': 'We strongly recommend consulting with a healthcare professional for a comprehensive evaluation.',
    'dashboard.moderate.title': 'Moderate ADHD Symptoms Indicated',
    'dashboard.moderate.description': 'Your responses suggest some ADHD symptoms that may be impacting your daily life.',
    'dashboard.moderate.recommendation': 'Consider discussing these symptoms with a healthcare professional for further evaluation.',
    'dashboard.low.title': 'Low ADHD Symptoms Indicated',
    'dashboard.low.description': 'Your responses suggest minimal ADHD symptoms at this time.',
    'dashboard.low.recommendation': 'Continue monitoring symptoms and consult a professional if concerns develop.',
    
    // Dashboard metrics
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
    
    // Category descriptions
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

    // Paywall
    'paywall.unlockTitle': 'Unlock Full Results',
    'paywall.unlockDescription': 'Get detailed category breakdown, cognitive performance analysis, symptom radar chart, and clinical recommendations.',
    'paywall.oneTime': 'one-time',

    // Landing
    'landing.myAssessment': 'My Assessment',
    'landing.logout': 'Logout',
  },
  'pt-BR': {
    // Header
    'app.title': 'Avaliação de TDAH FocusCheck',
    'app.subtitle': 'Uma ferramenta de avaliação abrangente, baseada em pesquisas, utilizando questionários clínicos validados e testes cognitivos para ajudar a identificar potenciais sintomas de TDAH em diferentes faixas etárias.',
    
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
    'games.backToMenu': 'Voltar ao Menu de Jogos',
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
    'games.basedOn': 'Baseado em:',
    'games.note': 'Nota:',
    
    // CPT Game
    'cpt.title': 'Teste de Desempenho Contínuo',
    'cpt.description': 'Este teste mede atenção sustentada e controle de impulsos. Mantenha o foco!',
    'cpt.instructions': 'Pressione ESPAÇO ou toque no botão quando vir a letra alvo "X". NÃO responda a nenhuma outra letra.',
    'cpt.start': 'Iniciar Teste',
    'cpt.respond': 'RESPONDA!',
    'cpt.hits': 'Acertos',
    'cpt.misses': 'Erros',
    'cpt.falseAlarms': 'Alarmes Falsos',
    'cpt.avgReaction': 'Tempo Médio',
    'cpt.trial': 'Rodada',
    'cpt.watching': 'Foque na letra...',
    
    // Working Memory Game
    'wm.title': 'Teste de Memória de Trabalho',
    'wm.description': 'Este teste mede sua capacidade de reter e manipular informações na memória.',
    'wm.instructions.title': 'Instruções:',
    'wm.instructions.1': 'Observe a sequência de quadrados destacados',
    'wm.instructions.2': 'Lembre a ordem em que aparecem',
    'wm.instructions.3': 'Clique nos quadrados na mesma ordem',
    'wm.instructions.4': 'A sequência fica maior conforme você avança',
    'wm.start': 'Iniciar Teste',
    'wm.watch': 'Observe a sequência...',
    'wm.repeat': 'Clique nos quadrados em ordem',
    'wm.level': 'Nível',
    'wm.trial': 'Tentativa',
    'wm.correct': 'Correto',
    'wm.maxLevel': 'Nível Máximo',
    
    // Stroop Game
    'stroop.title': 'Teste de Stroop',
    'stroop.description': 'Este teste avalia flexibilidade cognitiva e inibição de resposta.',
    'stroop.instructions.title': 'Instruções:',
    'stroop.instructions.1': 'Você verá palavras de cores exibidas em cores de tinta diferentes',
    'stroop.instructions.2': 'Selecione a COR da tinta, NÃO a palavra em si',
    'stroop.instructions.3': 'Trabalhe o mais rápido e precisamente possível',
    'stroop.start': 'Iniciar Teste',
    'stroop.selectColor': 'Selecione a COR DA TINTA, não a palavra!',
    'stroop.trial': 'Rodada',
    'stroop.correct': 'Correto',
    'stroop.avgTime': 'Tempo Médio',
    
    // Results
    'results.title': 'Resultados da Avaliação',
    'results.completed': 'Concluído',
    'results.ageGroup.child': 'Criança (6-12 anos)',
    'results.ageGroup.teen': 'Adolescente (13-17 anos)',
    'results.ageGroup.adult': 'Adulto (18+ anos)',
    'results.overallScore': 'Pontuação Geral',
    'results.overallRisk': 'Indicador de Risco Geral',
    'results.low': 'Baixo',
    'results.moderate': 'Moderado',
    'results.high': 'Alto',
    'results.categoryBreakdown': 'Detalhamento por Categoria',
    'results.cognitivePerformance': 'Testes de Desempenho Cognitivo',
    'results.cognitiveDescription': 'Medidas objetivas de atenção, memória e função executiva',
    'results.performanceComparison': 'Comparação de Desempenho',
    'results.symptomProfile': 'Perfil de Sintomas',
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
    
    // Dashboard Assessment Levels
    'dashboard.high.title': 'Sintomas Significativos de TDAH Indicados',
    'dashboard.high.description': 'Suas respostas sugerem uma alta probabilidade de sintomas de TDAH que podem impactar significativamente o funcionamento diário.',
    'dashboard.high.recommendation': 'Recomendamos fortemente consultar um profissional de saúde para uma avaliação abrangente.',
    'dashboard.moderate.title': 'Sintomas Moderados de TDAH Indicados',
    'dashboard.moderate.description': 'Suas respostas sugerem alguns sintomas de TDAH que podem estar impactando sua vida diária.',
    'dashboard.moderate.recommendation': 'Considere discutir esses sintomas com um profissional de saúde para avaliação adicional.',
    'dashboard.low.title': 'Baixos Sintomas de TDAH Indicados',
    'dashboard.low.description': 'Suas respostas sugerem sintomas mínimos de TDAH neste momento.',
    'dashboard.low.recommendation': 'Continue monitorando os sintomas e consulte um profissional se surgirem preocupações.',
    
    // Dashboard metrics
    'dashboard.sustainedAttention': 'Atenção Sustentada',
    'dashboard.impulseControl': 'Controle de Impulsos',
    'dashboard.workingMemory': 'Memória de Trabalho',
    'dashboard.cognitiveFlexibility': 'Flexibilidade Cognitiva',
    'dashboard.reactionTime': 'Tempo de Reação',
    'dashboard.accuracy': 'Precisão',
    'dashboard.level': 'Nível',
    'dashboard.attentionTest': 'Teste de Atenção (CPT)',
    'dashboard.memoryTest': 'Teste de Memória',
    'dashboard.flexibilityTest': 'Teste de Flexibilidade',
    'dashboard.correctHits': 'Acertos Corretos',
    'dashboard.falseAlarms': 'Alarmes Falsos',
    'dashboard.missed': 'Perdidos',
    'dashboard.avgTime': 'Tempo Médio',
    'dashboard.correct': 'Correto',
    'dashboard.incorrect': 'Incorreto',
    'dashboard.maxLevelAchieved': 'Nível Máximo Atingido',
    'dashboard.congruent': 'Congruente',
    'dashboard.incongruent': 'Incongruente',
    'dashboard.clinicalNote': 'Nota Clínica:',
    'dashboard.clinicalNoteText': 'Estes testes computadorizados fornecem medidas objetivas semelhantes às usadas por profissionais na avaliação de TDAH. O Teste de Desempenho Contínuo (CPT) mede atenção sustentada, o Teste de Memória de Trabalho avalia a capacidade de memória, e o Teste de Stroop avalia flexibilidade cognitiva e controle de inibição.',
    'dashboard.accuracyPercent': 'Precisão %',
    'dashboard.performanceScore': 'Pontuação de Desempenho',
    'dashboard.attention': 'Atenção',
    'dashboard.memory': 'Memória',
    'dashboard.flexibility': 'Flexibilidade',
    
    // Category descriptions
    'category.inattention.low': 'Atenção e foco parecem estar dentro das faixas típicas.',
    'category.inattention.moderate': 'Algumas dificuldades com atenção, foco e conclusão de tarefas podem estar presentes.',
    'category.inattention.high': 'Dificuldades significativas de atenção que provavelmente impactam o funcionamento diário.',
    'category.hyperactivity.low': 'Níveis de atividade parecem estar dentro das faixas típicas.',
    'category.hyperactivity.moderate': 'Alguns sinais de inquietação ou atividade excessiva podem estar presentes.',
    'category.hyperactivity.high': 'Hiperatividade significativa que provavelmente impacta o funcionamento diário.',
    'category.impulsivity.low': 'Controle de impulsos parece estar dentro das faixas típicas.',
    'category.impulsivity.moderate': 'Alguns comportamentos impulsivos podem estar presentes.',
    'category.impulsivity.high': 'Impulsividade significativa que provavelmente impacta o funcionamento diário.',
    'category.functional_impairment.low': 'Impacto mínimo na vida diária e funcionamento.',
    'category.functional_impairment.moderate': 'Alguns desafios com tarefas e responsabilidades diárias.',
    'category.functional_impairment.high': 'Impacto significativo no trabalho, escola ou funcionamento nos relacionamentos.',

    // Paywall
    'paywall.unlockTitle': 'Desbloqueie os Resultados Completos',
    'paywall.unlockDescription': 'Obtenha detalhamento por categoria, análise de desempenho cognitivo, gráfico radar de sintomas e recomendações clínicas.',
    'paywall.oneTime': 'pagamento único',

    // Landing
    'landing.myAssessment': 'Minha Avaliação',
    'landing.logout': 'Sair',
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
