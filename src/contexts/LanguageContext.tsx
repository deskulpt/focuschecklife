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

export const fallbackEN: Record<string, string> = {
  // App
  'app.title': 'FocusCheck ADHD Assessment',
  'app.subtitle': 'A comprehensive, research-based screening tool using validated questionnaires and cognitive tests to help identify potential ADHD symptoms across different age groups.',
  'disclaimer.title': 'Important Disclaimer:',
  'disclaimer.text': 'This screening is for informational and educational purposes only and is not a substitute for professional evaluation. If you have concerns about ADHD symptoms, please consult with a qualified healthcare professional.',

  // Navigation
  'nav.home': 'Home',
  'nav.signIn': 'Sign In',
  'nav.getStarted': 'Get Started Free',
  'landing.myAssessment': 'My Assessment',
  'landing.logout': 'Logout',

  // Hero
  'hero.badge': '✨ Research-Based • DSM-5 Aligned',
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

  // Pricing
  'pricing.title': 'Simple, Transparent Pricing',
  'pricing.subtitle': 'Start with a free assessment snapshot. Upgrade for comprehensive, detailed results.',
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
  'pricing.full.f5': 'Personalized insights & recommendations',
  'pricing.full.cta': 'Get Full Results',
  'pricing.monitor.title': 'Monitoring Plan',
  'pricing.monitor.price': '$12',
  'pricing.monitor.subtitle': 'One-time payment',
  'pricing.monitor.badge': 'Best Value',
  'pricing.monitor.f1': 'Everything in Full Assessment',
  'pricing.monitor.f2': 'Unlimited reassessments',
  'pricing.monitor.f3': 'Track progress over time',
  'pricing.monitor.f4': 'Compare past vs latest results',
  'pricing.monitor.f5': 'AI-powered trend analysis',
  'pricing.monitor.cta': 'Get Monitoring Plan',

  // Learn
  'learn.title': 'Understanding ADHD',
  'learn.subtitle': 'Knowledge is the first step. Learn why testing matters and how results can transform your life.',
  'learn.a1.title': 'Why Test for ADHD?',
  'learn.a1.content': 'ADHD affects 5-10% of children and 2-5% of adults worldwide. Many go undiagnosed for years, struggling with focus, organization, and impulse control without understanding why. Early identification leads to better outcomes — studies show that properly managed ADHD results in 30% improvement in academic and work performance.',
  'learn.a2.title': 'What This Assessment Reveals',
  'learn.a2.content': 'Our multi-dimensional assessment evaluates four key areas: inattention, hyperactivity, impulsivity, and functional impairment. Combined with cognitive tests (CPT, Stroop, Working Memory), you get a comprehensive picture of how your brain processes information, maintains attention, and controls impulses.',
  'learn.a3.title': 'Working With Your Practitioner',
  'learn.a3.content': 'Your FocusCheck results are designed to be shared with healthcare professionals. The detailed breakdown helps your doctor or therapist understand your specific symptom profile, enabling more targeted treatment plans. Bring your results to your next appointment for a more productive conversation.',
  'learn.a4.title': 'Our Methodology',
  'learn.a4.content': "FocusCheck is aligned with DSM-5 criteria and uses established screening scales including the Adult ADHD Self-Report Scale (ASRS-v1.1), Conners' Rating Scales, and Vanderbilt Assessment Scales. Our cognitive tests mirror validated research tools — the Continuous Performance Test, N-Back Working Memory Test, and Stroop Color-Word Test.",
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
  'faq.a2': "Yes! The basic assessment including all questionnaires and cognitive games is completely free. You'll receive a results snapshot at no cost. Detailed breakdowns with cognitive analysis and personalized recommendations are available for $5.",
  'faq.q3': 'How long does the ADHD assessment take?',
  'faq.a3': 'The complete assessment takes approximately 15-20 minutes, including the questionnaire (5-15 minutes depending on age group) and three cognitive performance tests (about 5 minutes total).',
  'faq.q4': 'Can this test diagnose ADHD?',
  'faq.a4': 'FocusCheck is a screening tool, not a diagnostic instrument. Only a qualified healthcare professional can diagnose ADHD. Our results provide valuable insights and a detailed report you can share with your doctor to support the diagnostic process.',
  'faq.q5': 'What age groups does FocusCheck support?',
  'faq.a5': "FocusCheck offers age-appropriate assessments for three groups: Children (6-12 years) using Conners' Rating Scales and DSM-5 criteria, Teenagers (13-17 years) combining self-report and parent questionnaires, and Adults (18+) using the ASRS-v1.1 scale with retrospective childhood assessment.",
  'faq.q6': 'Is my data private and secure?',
  'faq.a6': 'Absolutely. All assessment data is encrypted and stored securely with row-level security. Your results are only accessible through your authenticated account. We never share personal health data with third parties.',
  'faq.q7': 'Can I share my results with my doctor?',
  'faq.a7': 'Yes! With the Full Assessment ($5), you get a detailed results breakdown including your symptom profile, cognitive test scores, and personalized recommendations — which you can screenshot or share with your healthcare provider to make your appointment more productive.',
  'faq.q8': 'What cognitive tests are included?',
  'faq.a8': 'Three research-backed tests: 1) Continuous Performance Test (CPT) measuring sustained attention, 2) N-Back Working Memory Test evaluating working memory capacity, and 3) Stroop Color-Word Test assessing inhibitory control and processing speed.',

  // CTA
  'cta.title': 'Ready to Understand Your Mind?',
  'cta.subtitle': 'Join thousands who have taken the first step towards understanding their ADHD. Start your free assessment today.',
  'cta.button': 'Begin Your Assessment',

  // Footer
  'footer.disclaimer': 'This tool is for informational and educational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for diagnosis and treatment.',
  'footer.copyright': 'FocusCheck. All rights reserved.',

  // Auth
  'auth.welcomeBack': 'Welcome Back',
  'auth.createAccount': 'Create Free Account',
  'auth.signInSubtitle': 'Sign in to access your assessments',
  'auth.signUpSubtitle': 'Start your ADHD assessment journey today',
  'auth.subtitle': 'ADHD screening platform — for informational purposes only',
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
  'results.clinicalThreshold': 'Reference Threshold',
  'results.basedOn': 'Assessment Based On',
  'results.clinicalCriteria': 'Reference Criteria:',
  'results.validatedScales': 'Validated Scales:',
  'results.retake': 'Take Assessment Again',
  'results.save': 'Save Results',
  'results.medicalDisclaimer': 'Important Disclaimer',
  'results.disclaimerText': 'This screening is for educational and informational purposes only. It is not intended to diagnose, treat, or replace professional evaluation. ADHD diagnosis requires comprehensive evaluation by a qualified healthcare professional, including interviews, history review, and sometimes additional testing. If you have concerns about ADHD symptoms, please consult with a licensed healthcare provider.',
  'results.unlockCta': 'Unlock Full Results — $5',
  'results.printDisabled': 'Printing is disabled for the free preview.',
  'results.upgradeDescription': 'Get detailed category breakdowns, cognitive performance analysis, symptom radar charts, and personalized recommendations.',

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
  'dashboard.clinicalNote': 'Note:',
  'dashboard.clinicalNoteText': 'These computerized tests provide objective measurements similar to those used by professionals in ADHD screening. The Continuous Performance Test (CPT) measures sustained attention, the Working Memory Test assesses memory capacity, and the Stroop Test evaluates cognitive flexibility and inhibition control. Results should be discussed with a qualified professional.',
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
  'paywall.unlockDescription': 'Get detailed category breakdown, cognitive performance analysis, symptom radar chart, and personalized recommendations.',
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

  // Payment
  'payment.verifying': 'Verifying your payment...',
  'payment.successTitle': 'Payment Successful!',
  'payment.successDesc': 'Your full assessment access has been unlocked. View your detailed results now.',
  'payment.viewResults': 'View My Results',
  'payment.errorTitle': 'Payment Verification Failed',
  'payment.errorDesc': 'We couldn\'t verify your payment. Please try again or contact support.',
  'payment.backToAssessment': 'Back to Assessment',

  // Auth consent
  'auth.agreeTerms': 'I agree to the',
  'auth.termsLink': 'Terms of Service',
  'auth.and': 'and',
  'auth.privacyLink': 'Privacy Policy',
  'auth.marketingConsent': 'I agree to receive product updates, tips, and promotional emails. You can unsubscribe at any time.',
  'auth.mustAcceptTerms': 'You must accept the Terms of Service and Privacy Policy to create an account.',

  // Terms page
  'terms.title': 'Terms of Service',
  'terms.lastUpdated': 'Last Updated',
  'terms.s1.title': '1. Acceptance of Terms',
  'terms.s1.text': 'By accessing or using FocusCheck ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.',
  'terms.s2.title': '2. Description of Service',
  'terms.s2.text': 'FocusCheck is an online ADHD screening tool that provides informational and educational self-assessments based on validated questionnaires and cognitive exercises. FocusCheck is NOT a medical device, does NOT provide medical diagnoses, and is NOT operated by licensed medical professionals. Results are for personal awareness only and should NOT be used as a substitute for professional evaluation.',
  'terms.s3.title': '3. No Medical Advice',
  'terms.s3.text': 'The Service does not provide medical advice, diagnosis, or treatment. All content and results are for informational and educational purposes only. You should consult a qualified healthcare professional before making any health-related decisions based on information from this Service.',
  'terms.s4.title': '4. User Accounts & Data',
  'terms.s4.text': 'You are responsible for maintaining the confidentiality of your account credentials. Assessment data you choose to save is stored securely and linked to your account. Saved data not accessed for 7 days may be automatically deleted. You may decline to save your data at any time.',
  'terms.s5.title': '5. Payments & Refunds',
  'terms.s5.text': 'The full assessment unlock is a one-time payment processed via Stripe. Payments are non-refundable once assessment results have been delivered. All prices are displayed in your local currency equivalent where available.',
  'terms.s6.title': '6. Limitation of Liability',
  'terms.s6.text': 'FocusCheck and its operators shall not be liable for any decisions made based on the screening results. The Service is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or usefulness of any assessment results.',

  // Privacy page
  'privacy.title': 'Privacy Policy',
  'privacy.s1.title': '1. Information We Collect',
  'privacy.s1.text': 'We collect information you provide during account creation (name, email, age, gender, country, phone) and assessment data (survey responses, cognitive test results). We also collect usage data such as page visits, session IDs, and referrer information for analytics.',
  'privacy.s2.title': '2. How We Use Your Information',
  'privacy.s2.text': 'Your personal information is used to create and manage your account, display your assessment results, process payments, and if you opted in, send you product updates and promotional communications. We do not sell your personal data to third parties.',
  'privacy.s3.title': '3. Data Storage & Security',
  'privacy.s3.text': 'Your data is stored securely with encryption and row-level security policies. Only you can access your assessment results through your authenticated account. Assessment data not accessed for 7 days may be automatically purged.',
  'privacy.s4.title': '4. Marketing Communications',
  'privacy.s4.text': 'If you opted in during registration, we may send you product updates, tips, and promotional emails. You can unsubscribe at any time by clicking the unsubscribe link in any email or by contacting us.',
  'privacy.s5.title': '5. Third-Party Services',
  'privacy.s5.text': 'We use third-party services for payment processing (Stripe), analytics, and infrastructure hosting. These services have their own privacy policies. We do not share your health-related assessment data with any third party.',
  'privacy.s6.title': '6. Your Rights',
  'privacy.s6.text': 'You may request deletion of your account and associated data at any time by contacting us. You have the right to access, correct, or delete your personal information. If you are in the EU/EEA, you have additional rights under GDPR.',

  // Booking
  'booking.title': 'Book a Professional Consultation',
  'booking.description': 'Get a comprehensive clinical evaluation with a licensed mental health professional to discuss your screening results.',
  'booking.descriptionWithClinic': 'Book a consultation with {clinic} to discuss your screening results with a licensed mental health professional.',
  'booking.cta': 'Book Appointment',

  // Footer links
  'footer.terms': 'Terms of Service',
  'footer.privacy': 'Privacy Policy',

  // Reassessment limit
  'reassessment.limitTitle': 'Assessment Limit Reached',
  'reassessment.limitDescription': 'You have used your 2 free assessment attempts. Upgrade to take additional assessments.',
  'reassessment.upgradeToRetake': 'Upgrade to Retake',
  'reassessment.attemptsUsed': 'Attempts used',
};

const fallbackPTBR: Record<string, string> = {
  // App
  'app.title': 'Avaliação de TDAH FocusCheck',
  'app.subtitle': 'Uma ferramenta de triagem abrangente, baseada em pesquisas, utilizando questionários validados e testes cognitivos para ajudar a identificar potenciais sintomas de TDAH em diferentes faixas etárias.',
  'disclaimer.title': 'Aviso Importante:',
  'disclaimer.text': 'Esta triagem é apenas para fins informativos e educacionais e não substitui a avaliação profissional. Consulte um profissional de saúde qualificado.',

  // Navigation
  'nav.home': 'Início',
  'nav.signIn': 'Entrar',
  'nav.getStarted': 'Comece Grátis',
  'landing.myAssessment': 'Minha Avaliação',
  'landing.logout': 'Sair',

  // Hero
  'hero.badge': '✨ Baseado em Pesquisas • Alinhado ao DSM-5',
  'hero.title1': 'Conheça Seu TDAH.',
  'hero.title2': 'Assuma o Controle do Seu Foco.',
  'hero.subtitle': 'A avaliação online de TDAH mais abrangente, combinando questionários validados com testes de desempenho cognitivo. Obtenha insights acionáveis em menos de 20 minutos.',
  'hero.cta': 'Iniciar Avaliação Gratuita',
  'hero.learnMore': 'Saiba Mais Sobre TDAH',
  'hero.noCreditCard': 'Sem cartão de crédito • Resultados em 20 minutos',

  // Trust Badges
  'trust.dsm5': 'Baseado no DSM-5',
  'trust.dsm5Sub': 'Critério padrão ouro',
  'trust.cognitive': 'Testes Cognitivos',
  'trust.cognitiveSub': 'CPT, Stroop, Memória',
  'trust.ageGroups': '3 Faixas Etárias',
  'trust.ageGroupsSub': 'Crianças, Adolescentes, Adultos',

  // Pricing — BRL
  'pricing.title': 'Preços Simples e Transparentes',
  'pricing.subtitle': 'Comece com uma avaliação gratuita. Atualize para resultados completos e detalhados.',
  'pricing.free.title': 'Resumo Gratuito',
  'pricing.free.price': 'R$0',
  'pricing.free.subtitle': 'Comece agora',
  'pricing.free.f1': 'Questionário completo',
  'pricing.free.f2': 'Todos os 3 jogos cognitivos',
  'pricing.free.f3': 'Resumo básico dos resultados',
  'pricing.free.f4': 'Indicador geral de risco',
  'pricing.free.cta': 'Começar Grátis',
  'pricing.full.title': 'Avaliação Completa',
  'pricing.full.price': 'R$25',
  'pricing.full.subtitle': 'Pagamento único',
  'pricing.full.badge': 'Mais Popular',
  'pricing.full.f1': 'Tudo do Grátis',
  'pricing.full.f2': 'Detalhamento por categoria',
  'pricing.full.f3': 'Análise de desempenho cognitivo',
  'pricing.full.f4': 'Gráfico radar de sintomas',
  'pricing.full.f5': 'Insights e recomendações personalizadas',
  'pricing.full.cta': 'Obter Resultados Completos',

  // Learn
  'learn.title': 'Entendendo o TDAH',
  'learn.subtitle': 'Conhecimento é o primeiro passo. Saiba por que o teste importa e como os resultados podem transformar sua vida.',
  'learn.a1.title': 'Por Que Testar para TDAH?',
  'learn.a1.content': 'O TDAH afeta 5-10% das crianças e 2-5% dos adultos em todo o mundo. Muitos passam anos sem diagnóstico, lutando com foco, organização e controle de impulsos sem entender o porquê. A identificação precoce leva a melhores resultados — estudos mostram que o TDAH adequadamente gerenciado resulta em 30% de melhoria no desempenho acadêmico e profissional.',
  'learn.a2.title': 'O Que Esta Avaliação Revela',
  'learn.a2.content': 'Nossa avaliação multidimensional examina quatro áreas-chave: desatenção, hiperatividade, impulsividade e comprometimento funcional. Combinada com testes cognitivos (CPT, Stroop, Memória de Trabalho), você obtém uma visão abrangente de como seu cérebro processa informações, mantém a atenção e controla impulsos.',
  'learn.a3.title': 'Trabalhando com Seu Profissional',
  'learn.a3.content': 'Seus resultados do FocusCheck são projetados para serem compartilhados com profissionais de saúde. O detalhamento ajuda seu médico ou terapeuta a entender seu perfil específico de sintomas, permitindo planos de tratamento mais direcionados. Leve seus resultados para sua próxima consulta para uma conversa mais produtiva.',
  'learn.a4.title': 'Nossa Metodologia',
  'learn.a4.content': 'O FocusCheck é alinhado aos critérios do DSM-5 e utiliza escalas de triagem estabelecidas, incluindo a Escala de Auto-Relato de TDAH para Adultos (ASRS-v1.1), Escalas de Conners e Escalas de Avaliação de Vanderbilt. Nossos testes cognitivos espelham ferramentas de pesquisa validadas — Teste de Desempenho Contínuo, Teste de Memória de Trabalho N-Back e Teste de Stroop.',
  'learn.a5.title': 'Vida Após o Diagnóstico',
  'learn.a5.content': 'Entender seu perfil de TDAH abre portas para estratégias eficazes: terapia cognitivo-comportamental, opções de medicação, acomodações no trabalho, ferramentas organizacionais e práticas de mindfulness. Muitos adultos relatam se sentir "finalmente compreendidos" após obter clareza sobre seus sintomas.',
  'learn.a6.title': 'TDAH Não É uma Limitação',
  'learn.a6.content': 'Muitos empreendedores, artistas e inovadores de sucesso têm TDAH. Traços como hiperfoco, criatividade e alta energia podem ser ativos poderosos quando bem direcionados. A chave é entender seu perfil cognitivo único e construir sistemas que trabalhem com seu cérebro, não contra ele.',

  // FAQ
  'faq.title': 'Perguntas Frequentes',
  'faq.subtitle': 'Tudo que você precisa saber sobre nossa avaliação de TDAH.',
  'faq.q1': 'O que é a avaliação de TDAH FocusCheck?',
  'faq.a1': 'O FocusCheck é uma ferramenta abrangente de triagem online de TDAH que combina questionários clinicamente validados (baseados nos critérios do DSM-5, ASRS-v1.1 e Escalas de Conners) com testes de desempenho cognitivo, incluindo o Teste de Desempenho Contínuo (CPT), Teste de Stroop e Teste de Memória de Trabalho N-Back.',
  'faq.q2': 'Este teste de TDAH é gratuito?',
  'faq.a2': 'Sim! A avaliação básica, incluindo todos os questionários e jogos cognitivos, é completamente gratuita. Você receberá um resumo dos resultados sem custo. Detalhamentos completos com análise cognitiva e recomendações personalizadas estão disponíveis por R$25.',
  'faq.q3': 'Quanto tempo leva a avaliação de TDAH?',
  'faq.a3': 'A avaliação completa leva aproximadamente 15-20 minutos, incluindo o questionário (5-15 minutos dependendo da faixa etária) e três testes de desempenho cognitivo (cerca de 5 minutos no total).',
  'faq.q4': 'Este teste pode diagnosticar TDAH?',
  'faq.a4': 'O FocusCheck é uma ferramenta de triagem, não um instrumento de diagnóstico. Apenas um profissional de saúde qualificado pode diagnosticar TDAH. Nossos resultados fornecem insights valiosos e um relatório detalhado que você pode compartilhar com seu médico para apoiar o processo diagnóstico.',
  'faq.q5': 'Quais faixas etárias o FocusCheck suporta?',
  'faq.a5': 'O FocusCheck oferece avaliações apropriadas para três grupos: Crianças (6-12 anos) usando Escalas de Conners e critérios do DSM-5, Adolescentes (13-17 anos) combinando auto-relato e questionários para pais, e Adultos (18+) usando a escala ASRS-v1.1 com avaliação retrospectiva da infância.',
  'faq.q6': 'Meus dados são privados e seguros?',
  'faq.a6': 'Absolutamente. Todos os dados da avaliação são criptografados e armazenados com segurança com segurança em nível de linha. Seus resultados só são acessíveis através da sua conta autenticada. Nunca compartilhamos dados pessoais de saúde com terceiros.',
  'faq.q7': 'Posso compartilhar meus resultados com meu médico?',
  'faq.a7': 'Sim! Com a Avaliação Completa (R$25), você obtém um detalhamento dos resultados incluindo seu perfil de sintomas, pontuações dos testes cognitivos e recomendações personalizadas — que você pode capturar e compartilhar com seu profissional de saúde para uma consulta mais produtiva.',
  'faq.q8': 'Quais testes cognitivos estão incluídos?',
  'faq.a8': 'Três testes baseados em pesquisa: 1) Teste de Desempenho Contínuo (CPT) medindo atenção sustentada, 2) Teste de Memória de Trabalho N-Back avaliando capacidade de memória de trabalho, e 3) Teste de Stroop avaliando controle inibitório e velocidade de processamento.',

  // CTA
  'cta.title': 'Pronto para Entender Sua Mente?',
  'cta.subtitle': 'Junte-se a milhares que deram o primeiro passo para entender seu TDAH. Comece sua avaliação gratuita hoje.',
  'cta.button': 'Iniciar Sua Avaliação',

  // Footer
  'footer.disclaimer': 'Esta ferramenta é apenas para fins informativos e educacionais e não constitui aconselhamento médico, diagnóstico ou tratamento. Consulte sempre um profissional de saúde qualificado.',
  'footer.copyright': 'FocusCheck. Todos os direitos reservados.',

  // Auth
  'auth.welcomeBack': 'Bem-vindo de Volta',
  'auth.createAccount': 'Criar Conta Gratuita',
  'auth.signInSubtitle': 'Entre para acessar suas avaliações',
  'auth.signUpSubtitle': 'Comece sua jornada de avaliação de TDAH hoje',
  'auth.subtitle': 'Plataforma de triagem de TDAH — apenas para fins informativos',
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
  'age.research': 'Ferramentas de Avaliação Baseadas em Pesquisa:',

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
  'survey.answered': 'Respondido',
  'survey.selectAnswer': 'Selecione uma resposta para continuar',

  // Scale
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
  'games.progress': 'Progresso da Avaliação',
  'games.completed': 'concluído(s)',
  'games.test1.title': 'Teste de Desempenho Contínuo',
  'games.test1.description': 'Mede a atenção sustentada e o controle de impulsos',
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
  'games.completeAll': 'Complete todos os jogos para continuar',
  'games.research': 'Estes testes são baseados em métodos de avaliação cognitiva validados usados em avaliações clínicas de TDAH.',
  'games.basedOn': 'Baseado em:',
  'games.note': 'Nota:',
  'games.allComplete': 'Todos os Testes Concluídos!',

  // CPT
  'cpt.title': 'Teste de Desempenho Contínuo',
  'cpt.description': 'Este teste mede a atenção sustentada e o controle de impulsos. Mantenha o foco!',
  'cpt.instructions': 'Pressione ESPAÇO ou toque no botão quando vir a letra alvo "X". NÃO responda a nenhuma outra letra.',
  'cpt.start': 'Iniciar Teste',
  'cpt.respond': 'RESPONDA!',
  'cpt.hits': 'Acertos',
  'cpt.misses': 'Erros',
  'cpt.falseAlarms': 'Alarmes Falsos',
  'cpt.avgReaction': 'Reação Média',
  'cpt.trial': 'Tentativa',
  'cpt.watching': 'Foque na letra...',

  // Working Memory
  'wm.title': 'Teste de Memória de Trabalho',
  'wm.description': 'Este teste mede sua capacidade de reter e manipular informações na memória.',
  'wm.instructions.title': 'Instruções:',
  'wm.instructions.1': 'Observe a sequência de quadrados destacados',
  'wm.instructions.2': 'Lembre-se da ordem em que aparecem',
  'wm.instructions.3': 'Clique nos quadrados na mesma ordem',
  'wm.instructions.4': 'A sequência fica mais longa conforme você avança',
  'wm.start': 'Iniciar Teste',
  'wm.watch': 'Observe a sequência...',
  'wm.repeat': 'Clique nos quadrados em ordem',
  'wm.level': 'Nível',
  'wm.trial': 'Tentativa',
  'wm.correct': 'Correto',
  'wm.maxLevel': 'Nível Máximo',

  // Stroop
  'stroop.title': 'Teste de Stroop',
  'stroop.description': 'Este teste avalia flexibilidade cognitiva e inibição de resposta.',
  'stroop.instructions.title': 'Instruções:',
  'stroop.instructions.1': 'Você verá palavras de cores exibidas em cores de tinta diferentes',
  'stroop.instructions.2': 'Selecione a COR da tinta, NÃO a palavra em si',
  'stroop.instructions.3': 'Trabalhe o mais rápido e com precisão possível',
  'stroop.start': 'Iniciar Teste',
  'stroop.selectColor': 'Selecione a COR DA TINTA, não a palavra!',
  'stroop.trial': 'Tentativa',
  'stroop.correct': 'Correto',
  'stroop.avgTime': 'Tempo Médio',

  // Results
  'results.title': 'Resultados da Avaliação',
  'results.completed': 'Concluído',
  'results.ageGroup.child': 'Criança (6-12 anos)',
  'results.ageGroup.teen': 'Adolescente (13-17 anos)',
  'results.ageGroup.adult': 'Adulto (18+ anos)',
  'results.overallScore': 'Pontuação Geral',
  'results.overallRisk': 'Indicador Geral de Risco',
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
  'results.clinicalThreshold': 'Limiar de Referência',
  'results.basedOn': 'Avaliação Baseada Em',
  'results.clinicalCriteria': 'Critérios de Referência:',
  'results.validatedScales': 'Escalas Validadas:',
  'results.retake': 'Refazer Avaliação',
  'results.save': 'Salvar Resultados',
  'results.medicalDisclaimer': 'Aviso Importante',
  'results.disclaimerText': 'Esta triagem é apenas para fins educacionais e informativos. Não se destina a diagnosticar, tratar ou substituir avaliação profissional. O diagnóstico de TDAH requer avaliação abrangente por um profissional de saúde qualificado. Consulte um profissional licenciado se tiver preocupações.',
  'results.unlockCta': 'Desbloquear Resultados Completos — R$25',
  'results.printDisabled': 'A impressão está desabilitada para a visualização gratuita.',
  'results.upgradeDescription': 'Obtenha detalhamentos por categoria, análise de desempenho cognitivo, gráficos radar de sintomas e recomendações personalizadas.',

  // Consent
  'consent.title': 'Termos e Consentimento de Privacidade',
  'consent.intro': 'Antes de salvar seus resultados, por favor revise nossas práticas de tratamento de dados:',
  'consent.point1': 'Seus dados de avaliação são armazenados com segurança e vinculados à sua conta.',
  'consent.point2': 'Os dados são usados exclusivamente para exibir seus resultados e nunca são compartilhados com terceiros.',
  'consent.point3': 'Se recusar, seus resultados ainda serão exibidos, mas não serão salvos — serão perdidos ao atualizar a página.',
  'consent.point4': 'Avaliações salvas que não forem acessadas por 7 dias serão automaticamente excluídas.',
  'consent.accept': 'Aceitar e Salvar Resultados',
  'consent.decline': 'Recusar — Não Salvar',

  // Dashboard
  'dashboard.high.title': 'Sintomas Significativos de TDAH Indicados',
  'dashboard.high.description': 'Suas respostas sugerem uma alta probabilidade de sintomas de TDAH que podem impactar significativamente o funcionamento diário.',
  'dashboard.high.recommendation': 'Recomendamos fortemente consultar um profissional de saúde para uma avaliação abrangente.',
  'dashboard.moderate.title': 'Sintomas Moderados de TDAH Indicados',
  'dashboard.moderate.description': 'Suas respostas sugerem alguns sintomas de TDAH que podem estar impactando sua vida diária.',
  'dashboard.moderate.recommendation': 'Considere discutir esses sintomas com um profissional de saúde para avaliação adicional.',
  'dashboard.low.title': 'Sintomas Baixos de TDAH Indicados',
  'dashboard.low.description': 'Suas respostas sugerem sintomas mínimos de TDAH neste momento.',
  'dashboard.low.recommendation': 'Continue monitorando os sintomas e consulte um profissional se surgirem preocupações.',
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
  'dashboard.maxLevelAchieved': 'Nível Máximo Alcançado',
  'dashboard.congruent': 'Congruente',
  'dashboard.incongruent': 'Incongruente',
  'dashboard.clinicalNote': 'Nota:',
  'dashboard.clinicalNoteText': 'Estes testes computadorizados fornecem medições objetivas semelhantes às usadas por profissionais na triagem de TDAH. O Teste de Desempenho Contínuo (CPT) mede a atenção sustentada, o Teste de Memória de Trabalho avalia a capacidade de memória, e o Teste de Stroop avalia flexibilidade cognitiva e controle inibitório. Os resultados devem ser discutidos com um profissional qualificado.',
  'dashboard.accuracyPercent': '% de Precisão',
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
  'category.functional_impairment.high': 'Impacto significativo no trabalho, escola ou relacionamentos.',

  // Paywall
  'paywall.unlockTitle': 'Desbloqueie os Resultados Completos',
  'paywall.unlockDescription': 'Obtenha detalhamento por categoria, análise de desempenho cognitivo, gráfico radar de sintomas e recomendações personalizadas.',
  'paywall.oneTime': 'pagamento único',

  // Promo
  'promo.title': 'Tem um código promocional?',
  'promo.placeholder': 'Digite o código',
  'promo.apply': 'Aplicar',
  'promo.redeemed': 'Código promocional resgatado com sucesso! Atualize seus resultados para ver o acesso completo.',
  'promo.successTitle': '🎉 Código Resgatado!',
  'promo.successDesc': 'Seu acesso foi atualizado. Aproveite a experiência completa!',
  'promo.invalidCode': 'Código Inválido',
  'promo.invalidCodeDesc': 'Este código promocional não é válido ou expirou.',
  'promo.codeExpired': 'Código Expirado',
  'promo.codeExpiredDesc': 'Este código promocional expirou.',
  'promo.maxUsesDesc': 'Este código promocional atingiu o máximo de usos.',
  'promo.alreadyRedeemed': 'Já Resgatado',
  'promo.alreadyRedeemedDesc': 'Você já usou este código promocional.',
  'promo.error': 'Erro',
  'promo.errorDesc': 'Algo deu errado. Por favor, tente novamente.',

  // Payment
  'payment.verifying': 'Verificando seu pagamento...',
  'payment.successTitle': 'Pagamento Realizado com Sucesso!',
  'payment.successDesc': 'Seu acesso completo à avaliação foi desbloqueado. Veja seus resultados detalhados agora.',
  'payment.viewResults': 'Ver Meus Resultados',
  'payment.errorTitle': 'Falha na Verificação do Pagamento',
  'payment.errorDesc': 'Não conseguimos verificar seu pagamento. Tente novamente ou entre em contato com o suporte.',
  'payment.backToAssessment': 'Voltar à Avaliação',

  // Auth consent
  'auth.agreeTerms': 'Eu concordo com os',
  'auth.termsLink': 'Termos de Serviço',
  'auth.and': 'e',
  'auth.privacyLink': 'Política de Privacidade',
  'auth.marketingConsent': 'Concordo em receber atualizações do produto, dicas e e-mails promocionais. Você pode cancelar a inscrição a qualquer momento.',
  'auth.mustAcceptTerms': 'Você deve aceitar os Termos de Serviço e a Política de Privacidade para criar uma conta.',

  // Terms page
  'terms.title': 'Termos de Serviço',
  'terms.lastUpdated': 'Última Atualização',
  'terms.s1.title': '1. Aceitação dos Termos',
  'terms.s1.text': 'Ao acessar ou usar o FocusCheck ("o Serviço"), você concorda em cumprir estes Termos de Serviço. Se não concordar, por favor não use o Serviço.',
  'terms.s2.title': '2. Descrição do Serviço',
  'terms.s2.text': 'O FocusCheck é uma ferramenta online de triagem de TDAH que fornece autoavaliações informativas e educacionais baseadas em questionários validados e exercícios cognitivos. O FocusCheck NÃO é um dispositivo médico, NÃO fornece diagnósticos médicos e NÃO é operado por profissionais médicos licenciados. Os resultados são apenas para conscientização pessoal e NÃO devem ser usados como substituto para avaliação profissional.',
  'terms.s3.title': '3. Sem Aconselhamento Médico',
  'terms.s3.text': 'O Serviço não fornece aconselhamento médico, diagnóstico ou tratamento. Todo o conteúdo e resultados são apenas para fins informativos e educacionais. Você deve consultar um profissional de saúde qualificado antes de tomar qualquer decisão relacionada à saúde com base nas informações deste Serviço.',
  'terms.s4.title': '4. Contas de Usuário e Dados',
  'terms.s4.text': 'Você é responsável por manter a confidencialidade das credenciais da sua conta. Os dados de avaliação que você optar por salvar são armazenados com segurança e vinculados à sua conta. Dados salvos não acessados por 7 dias podem ser automaticamente excluídos. Você pode recusar salvar seus dados a qualquer momento.',
  'terms.s5.title': '5. Pagamentos e Reembolsos',
  'terms.s5.text': 'O desbloqueio da avaliação completa é um pagamento único processado via Stripe. Os pagamentos não são reembolsáveis após a entrega dos resultados da avaliação. Todos os preços são exibidos na moeda local equivalente quando disponível.',
  'terms.s6.title': '6. Limitação de Responsabilidade',
  'terms.s6.text': 'O FocusCheck e seus operadores não serão responsáveis por qualquer decisão tomada com base nos resultados da triagem. O Serviço é fornecido "como está" sem garantias de qualquer tipo. Não garantimos a precisão, completude ou utilidade de quaisquer resultados de avaliação.',

  // Privacy page
  'privacy.title': 'Política de Privacidade',
  'privacy.s1.title': '1. Informações que Coletamos',
  'privacy.s1.text': 'Coletamos informações fornecidas durante a criação da conta (nome, e-mail, idade, gênero, país, telefone) e dados de avaliação (respostas do questionário, resultados dos testes cognitivos). Também coletamos dados de uso, como visitas a páginas, IDs de sessão e informações de referência para análise.',
  'privacy.s2.title': '2. Como Usamos Suas Informações',
  'privacy.s2.text': 'Suas informações pessoais são usadas para criar e gerenciar sua conta, exibir seus resultados de avaliação, processar pagamentos e, se você optou, enviar atualizações do produto e comunicações promocionais. Não vendemos seus dados pessoais a terceiros.',
  'privacy.s3.title': '3. Armazenamento e Segurança de Dados',
  'privacy.s3.text': 'Seus dados são armazenados com segurança com criptografia e políticas de segurança em nível de linha. Somente você pode acessar seus resultados de avaliação através da sua conta autenticada. Dados de avaliação não acessados por 7 dias podem ser automaticamente removidos.',
  'privacy.s4.title': '4. Comunicações de Marketing',
  'privacy.s4.text': 'Se você optou durante o registro, podemos enviar atualizações do produto, dicas e e-mails promocionais. Você pode cancelar a inscrição a qualquer momento clicando no link de cancelamento em qualquer e-mail ou entrando em contato conosco.',
  'privacy.s5.title': '5. Serviços de Terceiros',
  'privacy.s5.text': 'Usamos serviços de terceiros para processamento de pagamentos (Stripe), análise e hospedagem de infraestrutura. Esses serviços têm suas próprias políticas de privacidade. Não compartilhamos seus dados de avaliação relacionados à saúde com terceiros.',
  'privacy.s6.title': '6. Seus Direitos',
  'privacy.s6.text': 'Você pode solicitar a exclusão de sua conta e dados associados a qualquer momento entrando em contato conosco. Você tem o direito de acessar, corrigir ou excluir suas informações pessoais.',

  // Booking
  'booking.title': 'Agende uma Consulta Profissional',
  'booking.description': 'Faça uma avaliação clínica completa com um profissional de saúde mental licenciado para discutir seus resultados.',
  'booking.descriptionWithClinic': 'Agende uma consulta com {clinic} para discutir seus resultados com um profissional de saúde mental licenciado.',
  'booking.cta': 'Agendar Consulta',

  // Footer links
  'footer.terms': 'Termos de Serviço',
  'footer.privacy': 'Política de Privacidade',

  // Reassessment limit
  'reassessment.limitTitle': 'Limite de Avaliações Atingido',
  'reassessment.limitDescription': 'Você usou suas 2 tentativas gratuitas. Faça upgrade para realizar avaliações adicionais.',
  'reassessment.upgradeToRetake': 'Upgrade para Refazer',
  'reassessment.attemptsUsed': 'Tentativas usadas',
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
