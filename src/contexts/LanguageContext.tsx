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

const fallbackEN: Record<string, string> = {
  // App
  'app.title': 'FocusCheck ADHD Assessment',
  'app.subtitle': 'A comprehensive, research-based assessment tool using validated clinical questionnaires and cognitive tests to help identify potential ADHD symptoms across different age groups.',
  'disclaimer.title': 'Important Disclaimer:',
  'disclaimer.text': 'This assessment is for informational purposes only and is not a substitute for professional medical diagnosis. If you have concerns about ADHD symptoms, please consult with a qualified healthcare professional or mental health provider.',

  // Navigation
  'nav.home': 'Home',
  'nav.signIn': 'Sign In',
  'nav.getStarted': 'Get Started Free',
  'landing.myAssessment': 'My Assessment',
  'landing.logout': 'Logout',

  // Hero
  'hero.badge': '✨ Pending Clinical Trials • DSM-5 Based',
  'hero.title1': 'Know Your ADHD.',
  'hero.title2': 'Take Control of Your Focus.',
  'hero.subtitle': 'The most comprehensive online ADHD assessment combining validated questionnaires with cognitive performance tests. Get actionable insights in under 20 minutes.',
  'hero.cta': 'Start Free Assessment',
  'hero.learnMore': 'Learn About ADHD',
  'hero.noCreditCard': 'No credit card required • Results in 20 minutes',

  // Trust Badges
  'trust.dsm5': 'DSM-5 Based',
  'trust.dsm5Sub': 'Gold standard criteria',
  'trust.cognitive': 'Cognitive Tests',
  'trust.cognitiveSub': 'CPT, Stroop, Memory',
  'trust.ageGroups': '3 Age Groups',
  'trust.ageGroupsSub': 'Children, Teens, Adults',
  'trust.pdf': 'PDF Report',
  'trust.pdfSub': 'Share with your doctor',

  // Pricing
  'pricing.title': 'Simple, Transparent Pricing',
  'pricing.subtitle': 'Start with a free assessment snapshot. Upgrade for comprehensive results and a professional PDF report.',
  'pricing.free.title': 'Free Snapshot',
  'pricing.free.price': '$0',
  'pricing.free.subtitle': 'Get started',
  'pricing.free.f1': 'Complete survey questionnaire',
  'pricing.free.f2': 'Play all 3 cognitive games',
  'pricing.free.f3': 'Basic results snapshot',
  'pricing.free.f4': 'Overall risk indicator',
  'pricing.free.cta': 'Start Free',
  'pricing.full.title': 'Full Assessment',
  'pricing.full.price': '$5',
  'pricing.full.subtitle': 'One-time payment',
  'pricing.full.badge': 'Most Popular',
  'pricing.full.f1': 'Everything in Free',
  'pricing.full.f2': 'Detailed category breakdown',
  'pricing.full.f3': 'Cognitive performance analysis',
  'pricing.full.f4': 'Symptom profile radar chart',
  'pricing.full.f5': 'Clinical recommendations',
  'pricing.full.cta': 'Get Full Results',
  'pricing.pdf.title': 'Professional Report',
  'pricing.pdf.price': '$20',
  'pricing.pdf.subtitle': 'Downloadable PDF',
  'pricing.pdf.f1': 'Everything in Full Assessment',
  'pricing.pdf.f2': 'Comprehensive PDF report',
  'pricing.pdf.f3': 'Share with your practitioner',
  'pricing.pdf.f4': 'Clinical methodology notes',
  'pricing.pdf.f5': 'Personalized recommendations',
  'pricing.pdf.cta': 'Get PDF Report',

  // Learn
  'learn.title': 'Understanding ADHD',
  'learn.subtitle': 'Knowledge is the first step. Learn why testing matters and how results can transform your life.',
  'learn.a1.title': 'Why Test for ADHD?',
  'learn.a1.content': 'ADHD affects 5-10% of children and 2-5% of adults worldwide. Many go undiagnosed for years, struggling with focus, organization, and impulse control without understanding why. Early identification leads to better outcomes — studies show that properly managed ADHD results in 30% improvement in academic and work performance.',
  'learn.a2.title': 'What This Assessment Reveals',
  'learn.a2.content': 'Our multi-dimensional assessment evaluates four key areas: inattention, hyperactivity, impulsivity, and functional impairment. Combined with cognitive tests (CPT, Stroop, Working Memory), you get a comprehensive picture of how your brain processes information, maintains attention, and controls impulses.',
  'learn.a3.title': 'Working With Your Practitioner',
  'learn.a3.content': 'Your FocusCheck results are designed to be shared with healthcare professionals. The detailed breakdown helps your doctor or therapist understand your specific symptom profile, enabling more targeted treatment plans. Bring your PDF report to your next appointment for a more productive conversation.',
  'learn.a4.title': 'Our Clinical Methodology',
  'learn.a4.content': "FocusCheck uses DSM-5 diagnostic criteria, the Adult ADHD Self-Report Scale (ASRS-v1.1), Conners' Rating Scales, and Vanderbilt Assessment Scales. Our cognitive tests mirror those used in clinical settings — the Continuous Performance Test, N-Back Working Memory Test, and Stroop Color-Word Test.",
  'learn.a5.title': 'Life After Diagnosis',
  'learn.a5.content': 'Understanding your ADHD profile opens doors to effective strategies: cognitive behavioral therapy, medication options, workplace accommodations, organizational tools, and mindfulness practices. Many adults report feeling "finally understood" after getting clarity on their symptoms.',
  'learn.a6.title': 'ADHD Is Not a Limitation',
  'learn.a6.content': 'Many successful entrepreneurs, artists, and innovators have ADHD. Traits like hyperfocus, creativity, and high energy can be powerful assets when properly channeled. The key is understanding your unique cognitive profile and building systems that work with your brain, not against it.',

  // FAQ
  'faq.title': 'Frequently Asked Questions',
  'faq.subtitle': 'Everything you need to know about our ADHD assessment.',
  'faq.q1': 'What is FocusCheck ADHD assessment?',
  'faq.a1': "FocusCheck is a comprehensive online ADHD screening tool that combines clinically validated questionnaires (based on DSM-5 criteria, ASRS-v1.1, and Conners' Rating Scales) with cognitive performance tests including the Continuous Performance Test (CPT), Stroop Color-Word Test, and N-Back Working Memory Test.",
  'faq.q2': 'Is this ADHD test free?',
  'faq.a2': "Yes! The basic assessment including all questionnaires and cognitive games is completely free. You'll receive a results snapshot at no cost. Detailed breakdowns are available for $5, and a professional PDF report for your doctor costs $20.",
  'faq.q3': 'How long does the ADHD assessment take?',
  'faq.a3': 'The complete assessment takes approximately 15-20 minutes, including the questionnaire (5-15 minutes depending on age group) and three cognitive performance tests (about 5 minutes total).',
  'faq.q4': 'Can this test diagnose ADHD?',
  'faq.a4': 'FocusCheck is a screening tool, not a diagnostic instrument. Only a qualified healthcare professional can diagnose ADHD. Our results provide valuable insights and a detailed report you can share with your doctor to support the diagnostic process.',
  'faq.q5': 'What age groups does FocusCheck support?',
  'faq.a5': "FocusCheck offers age-appropriate assessments for three groups: Children (6-12 years) using Conners' Rating Scales and DSM-5 criteria, Teenagers (13-17 years) combining self-report and parent questionnaires, and Adults (18+) using the ASRS-v1.1 scale with retrospective childhood assessment.",
  'faq.q6': 'Is my data private and secure?',
  'faq.a6': 'Absolutely. All assessment data is encrypted and stored securely with row-level security. Your results are only accessible through your authenticated account. We never share personal health data with third parties.',
  'faq.q7': 'Can I share my results with my doctor?',
  'faq.a7': 'Yes! Our Professional Report ($20) generates a detailed PDF designed to be shared with healthcare providers. It includes your symptom profile, cognitive test scores, clinical methodology notes, and personalized recommendations — making your appointment more productive.',
  'faq.q8': 'What cognitive tests are included?',
  'faq.a8': 'Three research-backed tests: 1) Continuous Performance Test (CPT) measuring sustained attention, 2) N-Back Working Memory Test evaluating working memory capacity, and 3) Stroop Color-Word Test assessing inhibitory control and processing speed.',

  // CTA
  'cta.title': 'Ready to Understand Your Mind?',
  'cta.subtitle': 'Join thousands who have taken the first step towards understanding their ADHD. Start your free assessment today.',
  'cta.button': 'Begin Your Assessment',

  // Footer
  'footer.disclaimer': 'This tool is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.',
  'footer.copyright': 'FocusCheck. All rights reserved.',

  // Auth
  'auth.welcomeBack': 'Welcome Back',
  'auth.createAccount': 'Create Free Account',
  'auth.signInSubtitle': 'Sign in to access your assessments',
  'auth.signUpSubtitle': 'Start your ADHD assessment journey today',
  'auth.subtitle': 'ADHD assessment platform — pending clinical trials',
  'auth.fullName': 'Full Name *',
  'auth.phone': 'Phone Number',
  'auth.age': 'Age',
  'auth.gender': 'Gender',
  'auth.gender.male': 'Male',
  'auth.gender.female': 'Female',
  'auth.gender.nonBinary': 'Non-binary',
  'auth.gender.preferNot': 'Prefer not to say',
  'auth.country': 'Country',
  'auth.email': 'Email *',
  'auth.password': 'Password *',
  'auth.submit.signIn': 'Sign In',
  'auth.submit.signUp': 'Create Account',
  'auth.loading': 'Please wait...',
  'auth.switchToSignUp': "Don't have an account? Sign up free",
  'auth.switchToSignIn': 'Already have an account? Sign in',
  'auth.freeIncludes': 'Free account includes:',
  'auth.freeIncludesDesc': 'Complete first assessment with results snapshot',
  'auth.backHome': 'Back to home',
  'auth.accountCreated': 'Account created!',
  'auth.checkEmail': 'Please check your email to verify your account.',
  'auth.error': 'Error',

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
  'survey.answered': 'Answered',
  'survey.selectAnswer': 'Select an answer to continue',

  // Scale
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
  'games.progress': 'Assessment Progress',
  'games.completed': 'completed',
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
  'games.allComplete': 'All Tests Complete!',

  // CPT
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

  // Working Memory
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

  // Stroop
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
  'results.unlockCta': 'Unlock Full Results — $5',
  'results.printDisabled': 'Printing is disabled for the free preview.',
  'results.upgradeDescription': 'Get detailed category breakdowns, cognitive performance analysis, symptom radar charts, and personalized clinical recommendations.',

  // Consent
  'consent.title': 'Terms & Privacy Consent',
  'consent.intro': 'Before we save your assessment results, please review our data handling practices:',
  'consent.point1': 'Your assessment data is stored securely and linked to your account.',
  'consent.point2': 'Data is used solely to display your results and is never shared with third parties.',
  'consent.point3': 'If you decline, your results will still be shown but will not be saved — they will be lost on refresh.',
  'consent.point4': 'Saved assessments that are not accessed for 7 days will be automatically deleted.',
  'consent.accept': 'Accept & Save Results',
  'consent.decline': "Decline — Don't Save",

  // Dashboard
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

  // Promo
  'promo.title': 'Have a promo code?',
  'promo.placeholder': 'Enter code',
  'promo.apply': 'Apply',
  'promo.redeemed': 'Promo code redeemed successfully! Refresh your results to see full access.',
  'promo.successTitle': '🎉 Code Redeemed!',
  'promo.successDesc': 'Your access has been upgraded. Enjoy the full experience!',
  'promo.invalidCode': 'Invalid Code',
  'promo.invalidCodeDesc': 'This promo code is not valid or has expired.',
  'promo.codeExpired': 'Code Expired',
  'promo.codeExpiredDesc': 'This promo code has expired.',
  'promo.maxUsesDesc': 'This promo code has reached its maximum uses.',
  'promo.alreadyRedeemed': 'Already Redeemed',
  'promo.alreadyRedeemedDesc': 'You have already used this promo code.',
  'promo.error': 'Error',
  'promo.errorDesc': 'Something went wrong. Please try again.',

  // Assessment flow
  'assessment.paymentSoon': 'Payment integration coming soon! For now, enjoy the full preview.',
};

const fallbackPTBR: Record<string, string> = {
  'app.title': 'Avaliação de TDAH FocusCheck',
  'app.subtitle': 'Uma ferramenta de avaliação abrangente, baseada em pesquisas, utilizando questionários clínicos validados e testes cognitivos para ajudar a identificar potenciais sintomas de TDAH em diferentes faixas etárias.',
  'disclaimer.title': 'Aviso Importante:',
  'disclaimer.text': 'Esta avaliação é apenas para fins informativos e não substitui o diagnóstico médico profissional.',
  'nav.home': 'Início',
  'nav.signIn': 'Entrar',
  'nav.getStarted': 'Comece Grátis',
  'landing.myAssessment': 'Minha Avaliação',
  'landing.logout': 'Sair',
  'hero.badge': '✨ Ensaios Clínicos Pendentes • Baseado no DSM-5',
  'hero.title1': 'Conheça Seu TDAH.',
  'hero.title2': 'Assuma o Controle do Seu Foco.',
  'hero.subtitle': 'A avaliação online de TDAH mais abrangente, combinando questionários validados com testes de desempenho cognitivo. Obtenha insights acionáveis em menos de 20 minutos.',
  'hero.cta': 'Iniciar Avaliação Gratuita',
  'hero.learnMore': 'Saiba Mais Sobre TDAH',
  'hero.noCreditCard': 'Sem cartão de crédito • Resultados em 20 minutos',
  'trust.dsm5': 'Baseado no DSM-5',
  'trust.dsm5Sub': 'Critério padrão ouro',
  'trust.cognitive': 'Testes Cognitivos',
  'trust.cognitiveSub': 'CPT, Stroop, Memória',
  'trust.ageGroups': '3 Faixas Etárias',
  'trust.ageGroupsSub': 'Crianças, Adolescentes, Adultos',
  'trust.pdf': 'Relatório PDF',
  'trust.pdfSub': 'Compartilhe com seu médico',
  'pricing.title': 'Preços Simples e Transparentes',
  'pricing.subtitle': 'Comece com uma avaliação gratuita. Atualize para resultados completos e um relatório PDF profissional.',
  'pricing.free.title': 'Resumo Gratuito',
  'pricing.free.price': '$0',
  'pricing.free.subtitle': 'Comece agora',
  'pricing.free.f1': 'Questionário completo',
  'pricing.free.f2': 'Todos os 3 jogos cognitivos',
  'pricing.free.f3': 'Resumo básico dos resultados',
  'pricing.free.f4': 'Indicador geral de risco',
  'pricing.free.cta': 'Começar Grátis',
  'pricing.full.title': 'Avaliação Completa',
  'pricing.full.price': '$5',
  'pricing.full.subtitle': 'Pagamento único',
  'pricing.full.badge': 'Mais Popular',
  'pricing.full.f1': 'Tudo do Grátis',
  'pricing.full.f2': 'Detalhamento por categoria',
  'pricing.full.f3': 'Análise de desempenho cognitivo',
  'pricing.full.f4': 'Gráfico radar de sintomas',
  'pricing.full.f5': 'Recomendações clínicas',
  'pricing.full.cta': 'Obter Resultados Completos',
  'pricing.pdf.title': 'Relatório Profissional',
  'pricing.pdf.price': '$20',
  'pricing.pdf.subtitle': 'PDF para download',
  'pricing.pdf.f1': 'Tudo da Avaliação Completa',
  'pricing.pdf.f2': 'Relatório PDF abrangente',
  'pricing.pdf.f3': 'Compartilhe com seu médico',
  'pricing.pdf.f4': 'Notas de metodologia clínica',
  'pricing.pdf.f5': 'Recomendações personalizadas',
  'pricing.pdf.cta': 'Obter Relatório PDF',
  'learn.title': 'Entendendo o TDAH',
  'learn.subtitle': 'Conhecimento é o primeiro passo. Saiba por que o teste importa e como os resultados podem transformar sua vida.',
  'faq.title': 'Perguntas Frequentes',
  'faq.subtitle': 'Tudo que você precisa saber sobre nossa avaliação de TDAH.',
  'cta.title': 'Pronto para Entender Sua Mente?',
  'cta.subtitle': 'Junte-se a milhares que deram o primeiro passo para entender seu TDAH. Comece sua avaliação gratuita hoje.',
  'cta.button': 'Iniciar Sua Avaliação',
  'footer.disclaimer': 'Esta ferramenta é apenas para fins informativos e não constitui aconselhamento médico. Consulte sempre um profissional de saúde qualificado.',
  'footer.copyright': 'FocusCheck. Todos os direitos reservados.',
  'auth.welcomeBack': 'Bem-vindo de Volta',
  'auth.createAccount': 'Criar Conta Gratuita',
  'auth.signInSubtitle': 'Entre para acessar suas avaliações',
  'auth.signUpSubtitle': 'Comece sua jornada de avaliação de TDAH hoje',
  'auth.subtitle': 'Plataforma de avaliação de TDAH — ensaios clínicos pendentes',
  'auth.fullName': 'Nome Completo *',
  'auth.phone': 'Telefone',
  'auth.age': 'Idade',
  'auth.gender': 'Gênero',
  'auth.gender.male': 'Masculino',
  'auth.gender.female': 'Feminino',
  'auth.gender.nonBinary': 'Não-binário',
  'auth.gender.preferNot': 'Prefiro não dizer',
  'auth.country': 'País',
  'auth.email': 'E-mail *',
  'auth.password': 'Senha *',
  'auth.submit.signIn': 'Entrar',
  'auth.submit.signUp': 'Criar Conta',
  'auth.loading': 'Aguarde...',
  'auth.switchToSignUp': 'Não tem conta? Cadastre-se grátis',
  'auth.switchToSignIn': 'Já tem conta? Entre',
  'auth.freeIncludes': 'Conta gratuita inclui:',
  'auth.freeIncludesDesc': 'Primeira avaliação completa com resumo dos resultados',
  'auth.backHome': 'Voltar ao início',
  'auth.accountCreated': 'Conta criada!',
  'auth.checkEmail': 'Verifique seu e-mail para confirmar sua conta.',
  'auth.error': 'Erro',
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
  'age.research': 'Ferramentas de Avaliação Baseadas em Pesquisa:',
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
  'survey.answered': 'Respondido',
  'survey.selectAnswer': 'Selecione uma resposta para continuar',
  'scale.never': 'Nunca',
  'scale.rarely': 'Raramente',
  'scale.sometimes': 'Às vezes',
  'scale.often': 'Frequentemente',
  'scale.veryOften': 'Muito Frequentemente',
  'games.title': 'Jogos de Avaliação Cognitiva',
  'games.subtitle': 'Complete estes testes cognitivos interativos para fornecer dados objetivos sobre atenção, controle de impulsos e memória de trabalho.',
  'games.back': 'Voltar ao Questionário',
  'games.backToMenu': 'Voltar ao Menu de Jogos',
  'games.game': 'Jogo',
  'games.progress': 'Progresso da Avaliação',
  'games.completed': 'concluído(s)',
  'games.test1.title': 'Teste de Desempenho Contínuo',
  'games.test1.description': 'Mede a atenção sustentada e o controle de impulsos',
  'games.test2.title': 'Teste de Memória de Trabalho',
  'games.test2.description': 'Testa a capacidade de reter e recordar sequências',
  'games.test3.title': 'Teste de Stroop',
  'games.test3.description': 'Avalia flexibilidade cognitiva e inibição',
  'games.complete': 'Concluído',
  'games.pending': 'Pendente',
  'games.start': 'Iniciar',
  'games.viewResults': 'Ver Resultados',
  'games.completeAll': 'Complete todos os jogos para continuar',
  'games.research': 'Estes testes são baseados em métodos de avaliação cognitiva validados usados em avaliações clínicas de TDAH.',
  'games.basedOn': 'Baseado em:',
  'games.note': 'Nota:',
  'games.allComplete': 'Todos os Testes Concluídos!',
  'results.title': 'Resultados da Avaliação',
  'results.completed': 'Concluído',
  'results.ageGroup.child': 'Criança (6-12 anos)',
  'results.ageGroup.teen': 'Adolescente (13-17 anos)',
  'results.ageGroup.adult': 'Adulto (18+ anos)',
  'results.overallScore': 'Pontuação Geral',
  'results.low': 'Baixo',
  'results.moderate': 'Moderado',
  'results.high': 'Alto',
  'results.retake': 'Refazer Avaliação',
  'results.save': 'Salvar Resultados',
  'results.unlockCta': 'Desbloquear Resultados Completos — $5',
  'results.getPdf': 'Obter Relatório PDF — $20',
  'results.upgradeDescription': 'Obtenha detalhamentos por categoria, análise de desempenho cognitivo, gráficos radar de sintomas e recomendações clínicas personalizadas.',
  'paywall.unlockTitle': 'Desbloqueie os Resultados Completos',
  'paywall.unlockDescription': 'Obtenha detalhamento por categoria, análise de desempenho cognitivo, gráfico radar de sintomas e recomendações clínicas.',
  'paywall.oneTime': 'pagamento único',
  'promo.title': 'Tem um código promocional?',
  'promo.placeholder': 'Digite o código',
  'promo.apply': 'Aplicar',
  'promo.redeemed': 'Código promocional resgatado com sucesso! Atualize seus resultados para ver o acesso completo.',
  'assessment.paymentSoon': 'Integração de pagamento em breve! Por enquanto, aproveite a visualização completa.',
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
    supabase.from('languages').select('code, name, flag').eq('is_enabled', true).then(({ data }) => {
      if (data && data.length > 0) {
        setAvailableLanguages(data as LanguageOption[]);
      }
    });

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
