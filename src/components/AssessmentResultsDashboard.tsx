import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, AlertCircle, TrendingUp, Target, Brain, Activity, Sparkles, Clock, Zap, Eye, Shield, ArrowRight, Info, Loader2 } from 'lucide-react';
import { getQuestionsForAge } from '@/data/assessmentQuestions';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, AreaChart, Area } from 'recharts';
import type { AssessmentData } from './AssessmentApp';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BookAppointment } from '@/components/BookAppointment';
import { useAuth } from '@/hooks/useAuth';

interface AssessmentResultsDashboardProps {
  data: AssessmentData;
  isFreePreview?: boolean;
  assessmentId?: string;
}

interface CategoryResult {
  category: string;
  rawCategory: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: 'low' | 'moderate' | 'high';
  description: string;
}

const LEVEL_COLORS = {
  low: 'hsl(var(--success))',
  moderate: 'hsl(var(--warning))',
  high: 'hsl(var(--destructive))'
};

const CATEGORY_COLORS = [
  'hsl(210, 90%, 55%)',   // blue
  'hsl(340, 80%, 55%)',   // rose
  'hsl(270, 70%, 55%)',   // purple
  'hsl(30, 90%, 55%)',    // amber
];

export const AssessmentResultsDashboard = ({ data, isFreePreview = false, assessmentId }: AssessmentResultsDashboardProps) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const questions = getQuestionsForAge(data.ageGroup);
  
  const categoryResults: CategoryResult[] = [
    'inattention', 'hyperactivity', 'impulsivity', 'functional_impairment'
  ].map((category, idx) => {
    const categoryQuestions = questions.filter(q => q.category === category);
    const totalScore = categoryQuestions.reduce((sum, q) => {
      const response = data.responses[q.id] || 0;
      const weight = q.weight || 1;
      return sum + (response * weight);
    }, 0);
    const maxPossibleScore = categoryQuestions.reduce((sum, q) => {
      const weight = q.weight || 1;
      return sum + (3 * weight);
    }, 0);
    const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    let level: 'low' | 'moderate' | 'high' = 'low';
    if (percentage >= 70) level = 'high';
    else if (percentage >= 40) level = 'moderate';
    return {
      category: category.replace('_', ' '),
      rawCategory: category,
      score: Math.round(totalScore),
      maxScore: Math.round(maxPossibleScore),
      percentage: Math.round(percentage),
      level,
      description: t(`category.${category}.${level}`)
    };
  }).filter(result => result.maxScore > 0);

  const totalScore = categoryResults.reduce((sum, cat) => sum + cat.score, 0);
  const totalMaxScore = categoryResults.reduce((sum, cat) => sum + cat.maxScore, 0);
  const overallPercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

  // Fetch AI interpretation — use cached version if available
  useEffect(() => {
    if (!isFreePreview && data.gameResults) {
      loadOrFetchAiInterpretation();
    }
  }, [isFreePreview, data, assessmentId]);

  const loadOrFetchAiInterpretation = async () => {
    // Try to load cached interpretation from DB first
    if (assessmentId && user) {
      const { data: assessment } = await supabase
        .from('user_assessments')
        .select('ai_interpretation')
        .eq('id', assessmentId)
        .single();
      
      if (assessment?.ai_interpretation) {
        setAiInterpretation(assessment.ai_interpretation);
        return;
      }
    }
    
    // No cached version — call AI
    fetchAiInterpretation();
  };

  const fetchAiInterpretation = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const categoryScores: Record<string, { percentage: number; level: string }> = {};
      categoryResults.forEach(r => {
        categoryScores[r.rawCategory] = { percentage: r.percentage, level: r.level };
      });

      const { data: funcData, error } = await supabase.functions.invoke('interpret-results', {
        body: {
          assessmentData: {
            ageGroup: data.ageGroup,
            categoryScores,
            cpt: data.gameResults?.cpt,
            workingMemory: data.gameResults?.workingMemory,
            stroop: data.gameResults?.stroop,
          },
          language,
        },
      });

      if (error) throw error;
      if (funcData?.interpretation) {
        setAiInterpretation(funcData.interpretation);
        // Cache the interpretation in the database
        if (assessmentId && user) {
          await supabase
            .from('user_assessments')
            .update({ ai_interpretation: funcData.interpretation } as any)
            .eq('id', assessmentId);
        }
      } else if (funcData?.error) {
        setAiError(funcData.error);
      }
    } catch (e: any) {
      console.error('AI interpretation error:', e);
      setAiError('Unable to generate AI interpretation at this time.');
    } finally {
      setAiLoading(false);
    }
  };

  const getOverallAssessment = () => {
    if (overallPercentage >= 70) {
      return {
        level: 'high', title: t('dashboard.high.title'), description: t('dashboard.high.description'),
        recommendation: t('dashboard.high.recommendation'), color: 'destructive', icon: <AlertTriangle className="w-8 h-8" />
      };
    } else if (overallPercentage >= 40) {
      return {
        level: 'moderate', title: t('dashboard.moderate.title'), description: t('dashboard.moderate.description'),
        recommendation: t('dashboard.moderate.recommendation'), color: 'warning', icon: <AlertCircle className="w-8 h-8" />
      };
    } else {
      return {
        level: 'low', title: t('dashboard.low.title'), description: t('dashboard.low.description'),
        recommendation: t('dashboard.low.recommendation'), color: 'success', icon: <CheckCircle className="w-8 h-8" />
      };
    }
  };

  const overall = getOverallAssessment();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inattention': return <Eye className="w-5 h-5" />;
      case 'hyperactivity': return <Zap className="w-5 h-5" />;
      case 'impulsivity': return <TrendingUp className="w-5 h-5" />;
      case 'functional impairment': return <Shield className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getCategoryExplanation = (cat: string, level: string) => {
    const explanations: Record<string, Record<string, string>> = {
      inattention: {
        low: language === 'pt-BR'
          ? 'Seus resultados indicam boa capacidade de manter foco e atenção. Você demonstra habilidade adequada para acompanhar tarefas e instruções.'
          : 'Your results suggest a strong ability to maintain focus and sustain attention. You demonstrate adequate skills for following through on tasks and instructions.',
        moderate: language === 'pt-BR'
          ? 'Seus resultados indicam dificuldades ocasionais com foco e atenção. Você pode se distrair com mais facilidade ou ter dificuldade em completar tarefas longas.'
          : 'Your results indicate occasional difficulties with focus and sustained attention. You may find yourself getting distracted more easily or struggling to complete longer tasks.',
        high: language === 'pt-BR'
          ? 'Seus resultados sugerem dificuldades significativas com atenção. Isso pode afetar atividades diárias como trabalho, estudos e organização pessoal.'
          : 'Your results suggest significant difficulties with attention. This may affect daily activities like work, studying, and personal organization.'
      },
      hyperactivity: {
        low: language === 'pt-BR'
          ? 'Você demonstra níveis normais de atividade física e inquietação. Sua capacidade de ficar parado quando necessário está dentro do esperado.'
          : 'You show typical levels of physical activity and restlessness. Your ability to stay still when needed is within expected ranges.',
        moderate: language === 'pt-BR'
          ? 'Você pode sentir inquietação frequente ou dificuldade em permanecer sentado por períodos prolongados. Isso é comum e pode ser gerenciado com estratégias adequadas.'
          : 'You may experience frequent restlessness or difficulty remaining seated for extended periods. This is common and can be managed with appropriate strategies.',
        high: language === 'pt-BR'
          ? 'Seus resultados indicam níveis elevados de hiperatividade. Você pode sentir necessidade constante de movimento e dificuldade em relaxar, o que pode impactar sua rotina.'
          : 'Your results indicate elevated levels of hyperactivity. You may feel a constant need to move and difficulty relaxing, which can impact your daily routine.'
      },
      impulsivity: {
        low: language === 'pt-BR'
          ? 'Você demonstra boa capacidade de controlar impulsos e pensar antes de agir. Suas respostas indicam habilidade adequada de autorregulação.'
          : 'You demonstrate good impulse control and the ability to think before acting. Your responses indicate adequate self-regulation skills.',
        moderate: language === 'pt-BR'
          ? 'Ocasionalmente você pode agir sem pensar completamente ou interromper outros. Com consciência, essas tendências podem ser gerenciadas.'
          : 'You may occasionally act without fully thinking things through or interrupt others. With awareness, these tendencies can be managed effectively.',
        high: language === 'pt-BR'
          ? 'Seus resultados sugerem dificuldades significativas com controle de impulsos. Isso pode se manifestar como decisões precipitadas ou dificuldade em esperar sua vez.'
          : 'Your results suggest significant difficulties with impulse control. This may manifest as hasty decisions or difficulty waiting your turn in conversations and activities.'
      },
      'functional impairment': {
        low: language === 'pt-BR'
          ? 'Suas respostas indicam que quaisquer sintomas presentes não estão impactando significativamente seu funcionamento diário em áreas como trabalho, escola ou relacionamentos.'
          : 'Your responses indicate that any symptoms present are not significantly impacting your daily functioning in areas like work, school, or relationships.',
        moderate: language === 'pt-BR'
          ? 'Alguns aspectos do seu dia a dia podem estar sendo afetados. Você pode notar impacto no desempenho acadêmico/profissional ou nos relacionamentos.'
          : 'Some aspects of your daily life may be affected. You may notice impacts on academic/work performance or relationships.',
        high: language === 'pt-BR'
          ? 'Seus resultados indicam impacto significativo no funcionamento diário. Múltiplas áreas da vida podem estar sendo afetadas, sugerindo a importância de buscar orientação profissional.'
          : 'Your results indicate significant impact on daily functioning. Multiple life areas may be affected, suggesting the importance of seeking professional guidance.'
      }
    };
    return explanations[cat]?.[level] || '';
  };

  // Compute cognitive performance insights
  const getCptInsight = () => {
    if (!data.gameResults?.cpt) return null;
    const { correctHits, missedTargets, falseAlarms, averageReactionTime, totalTrials } = data.gameResults.cpt;
    const hitRate = totalTrials > 0 ? (correctHits / (correctHits + missedTargets)) * 100 : 0;
    const faRate = totalTrials > 0 ? (falseAlarms / totalTrials) * 100 : 0;
    
    let attentionQuality = language === 'pt-BR' ? 'Boa' : 'Good';
    let attentionDesc = '';
    if (hitRate < 50) {
      attentionQuality = language === 'pt-BR' ? 'Abaixo do Esperado' : 'Below Expected';
      attentionDesc = language === 'pt-BR'
        ? 'Você perdeu muitos alvos, o que pode indicar dificuldade em manter a atenção sustentada ao longo do tempo.'
        : 'You missed many targets, which may indicate difficulty maintaining sustained attention over time.';
    } else if (hitRate < 75) {
      attentionQuality = language === 'pt-BR' ? 'Moderada' : 'Moderate';
      attentionDesc = language === 'pt-BR'
        ? 'Sua atenção sustentada é razoável, mas houve lapsos que podem refletir flutuações na concentração.'
        : 'Your sustained attention is fair, but there were lapses that may reflect fluctuations in concentration.';
    } else {
      attentionDesc = language === 'pt-BR'
        ? 'Sua atenção sustentada está dentro da faixa normal, demonstrando boa vigilância ao longo do teste.'
        : 'Your sustained attention is within normal range, demonstrating good vigilance throughout the test.';
    }

    let impulseDesc = '';
    if (faRate > 30) {
      impulseDesc = language === 'pt-BR'
        ? 'A taxa alta de alarmes falsos sugere dificuldade em inibir respostas — um marcador comum de impulsividade.'
        : 'The high false alarm rate suggests difficulty inhibiting responses — a common marker of impulsivity.';
    } else if (faRate > 15) {
      impulseDesc = language === 'pt-BR'
        ? 'Alguns alarmes falsos foram registrados, sugerindo tendência ocasional de responder antes de processar completamente o estímulo.'
        : 'Some false alarms were recorded, suggesting an occasional tendency to respond before fully processing the stimulus.';
    } else {
      impulseDesc = language === 'pt-BR'
        ? 'Baixa taxa de alarmes falsos indica bom controle inibitório durante o teste.'
        : 'Low false alarm rate indicates good inhibitory control during the test.';
    }

    let speedDesc = '';
    if (averageReactionTime < 300) {
      speedDesc = language === 'pt-BR'
        ? 'Tempo de reação muito rápido — pode indicar respostas impulsivas sem processamento completo.'
        : 'Very fast reaction time — may indicate impulsive responding without full processing.';
    } else if (averageReactionTime < 500) {
      speedDesc = language === 'pt-BR'
        ? 'Tempo de reação dentro da faixa normal, indicando processamento adequado.'
        : 'Reaction time within normal range, indicating adequate processing speed.';
    } else {
      speedDesc = language === 'pt-BR'
        ? 'Tempo de reação mais lento, o que pode refletir cautela excessiva ou dificuldade de processamento.'
        : 'Slower reaction time, which may reflect excessive caution or processing difficulties.';
    }

    return { hitRate: Math.round(hitRate), faRate: Math.round(faRate), attentionQuality, attentionDesc, impulseDesc, speedDesc, averageReactionTime };
  };

  const getMemoryInsight = () => {
    if (!data.gameResults?.workingMemory) return null;
    const { correctResponses, incorrectResponses, maxNLevel, totalTrials } = data.gameResults.workingMemory;
    const accuracy = totalTrials > 0 ? (correctResponses / totalTrials) * 100 : 0;
    
    let quality = language === 'pt-BR' ? 'Boa' : 'Good';
    let desc = '';
    if (maxNLevel <= 2) {
      quality = language === 'pt-BR' ? 'Abaixo do Esperado' : 'Below Expected';
      desc = language === 'pt-BR'
        ? 'Capacidade limitada de memória de trabalho. Isso pode afetar sua habilidade de manter e manipular informações mentalmente, como seguir instruções complexas.'
        : 'Limited working memory capacity. This may affect your ability to hold and manipulate information mentally, such as following complex instructions.';
    } else if (maxNLevel <= 4) {
      quality = language === 'pt-BR' ? 'Dentro da Média' : 'Average';
      desc = language === 'pt-BR'
        ? 'Capacidade típica de memória de trabalho. Você consegue manter um número razoável de itens em mente simultaneamente.'
        : 'Typical working memory capacity. You can hold a reasonable number of items in mind simultaneously.';
    } else {
      quality = language === 'pt-BR' ? 'Acima da Média' : 'Above Average';
      desc = language === 'pt-BR'
        ? 'Excelente memória de trabalho! Isso indica forte capacidade de processamento mental e pode ser um ponto de força significativo.'
        : 'Excellent working memory! This indicates strong mental processing capacity and may be a significant strength.';
    }

    return { accuracy: Math.round(accuracy), quality, desc, maxNLevel, correctResponses, incorrectResponses };
  };

  const getStroopInsight = () => {
    if (!data.gameResults?.stroop) return null;
    const { correctResponses, totalTrials, averageReactionTime, congruentAccuracy, incongruentAccuracy } = data.gameResults.stroop;
    const accuracy = totalTrials > 0 ? (correctResponses / totalTrials) * 100 : 0;
    const stroopEffect = Math.round(((congruentAccuracy || 0) - (incongruentAccuracy || 0)) * 100);
    
    let quality = language === 'pt-BR' ? 'Bom' : 'Good';
    let desc = '';
    if (accuracy < 60) {
      quality = language === 'pt-BR' ? 'Abaixo do Esperado' : 'Below Expected';
      desc = language === 'pt-BR'
        ? 'Dificuldade significativa com flexibilidade cognitiva e controle inibitório. Processar informações conflitantes pode ser desafiador.'
        : 'Significant difficulty with cognitive flexibility and inhibitory control. Processing conflicting information may be challenging.';
    } else if (accuracy < 85) {
      quality = language === 'pt-BR' ? 'Moderado' : 'Moderate';
      desc = language === 'pt-BR'
        ? 'Capacidade razoável de flexibilidade cognitiva. Você consegue alternar entre tarefas, mas pode notar alguma lentidão com informações conflitantes.'
        : 'Fair cognitive flexibility. You can switch between tasks, but may notice some slowdown when processing conflicting information.';
    } else {
      desc = language === 'pt-BR'
        ? 'Boa flexibilidade cognitiva e controle inibitório. Você processa informações conflitantes de forma eficiente.'
        : 'Good cognitive flexibility and inhibitory control. You process conflicting information efficiently.';
    }

    return { accuracy: Math.round(accuracy), quality, desc, stroopEffect, averageReactionTime, congruentAccuracy: Math.round((congruentAccuracy || 0) * 100), incongruentAccuracy: Math.round((incongruentAccuracy || 0) * 100) };
  };

  const cptInsight = getCptInsight();
  const memoryInsight = getMemoryInsight();
  const stroopInsight = getStroopInsight();

  // Radar data with descriptions
  const radarData = categoryResults.map(result => ({
    category: result.category.charAt(0).toUpperCase() + result.category.slice(1),
    score: result.percentage,
    fullMark: 100
  }));

  // Build risk gauge value
  const riskLevel = overallPercentage >= 70 ? 'high' : overallPercentage >= 40 ? 'moderate' : 'low';
  const riskLabel = riskLevel === 'high'
    ? (language === 'pt-BR' ? 'Indicação Elevada' : 'Elevated Indication')
    : riskLevel === 'moderate'
    ? (language === 'pt-BR' ? 'Indicação Moderada' : 'Moderate Indication')
    : (language === 'pt-BR' ? 'Indicação Baixa' : 'Low Indication');

  return (
    <div className="space-y-6">
      {/* ===== HERO: Overall Risk Indicator ===== */}
      <Card className={`border-2 overflow-hidden ${
        overall.color === 'destructive' ? 'border-destructive/30' :
        overall.color === 'warning' ? 'border-warning/30' : 'border-success/30'
      }`}>
        <div className={`px-6 py-4 ${
          overall.color === 'destructive' ? 'bg-gradient-to-r from-destructive/10 to-destructive/5' :
          overall.color === 'warning' ? 'bg-gradient-to-r from-warning/10 to-warning/5' :
          'bg-gradient-to-r from-success/10 to-success/5'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${
              overall.color === 'destructive' ? 'bg-destructive/15' :
              overall.color === 'warning' ? 'bg-warning/15' : 'bg-success/15'
            }`}>
              <div className={`${
                overall.color === 'destructive' ? 'text-destructive' :
                overall.color === 'warning' ? 'text-warning' : 'text-success'
              }`}>{overall.icon}</div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold">{overall.title}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{riskLabel}</p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-black ${
                overall.color === 'destructive' ? 'text-destructive' :
                overall.color === 'warning' ? 'text-warning' : 'text-success'
              }`}>{Math.round(overallPercentage)}%</div>
              <p className="text-xs text-muted-foreground">{language === 'pt-BR' ? 'pontuação geral' : 'overall score'}</p>
            </div>
          </div>
        </div>
        <CardContent className="pt-4 pb-5">
          {/* Visual risk bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{language === 'pt-BR' ? 'Baixo' : 'Low'}</span>
              <span>{language === 'pt-BR' ? 'Moderado' : 'Moderate'}</span>
              <span>{language === 'pt-BR' ? 'Elevado' : 'Elevated'}</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden relative">
              <div className="absolute inset-0 flex">
                <div className="w-[40%] bg-success/40" />
                <div className="w-[30%] bg-warning/40" />
                <div className="w-[30%] bg-destructive/40" />
              </div>
              <div
                className={`absolute top-0 h-full w-1 rounded-full shadow-lg ${
                  overall.color === 'destructive' ? 'bg-destructive' :
                  overall.color === 'warning' ? 'bg-warning' : 'bg-success'
                }`}
                style={{ left: `${Math.min(overallPercentage, 98)}%`, transition: 'left 1s ease-out' }}
              />
            </div>
          </div>
          <p className="text-sm leading-relaxed text-foreground/80">{overall.description}</p>
          <div className={`mt-3 p-3 rounded-lg text-sm font-medium ${
            overall.color === 'destructive' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
            overall.color === 'warning' ? 'bg-warning/10 text-warning border border-warning/20' :
            'bg-success/10 text-success border border-success/20'
          }`}>
            <ArrowRight className="w-4 h-4 inline mr-2" />
            {overall.recommendation}
          </div>
        </CardContent>
      </Card>

      {/* ===== FREE PREVIEW PAYWALL ===== */}
      {isFreePreview && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/95 z-10 flex items-center justify-center">
            <Card className="shadow-[var(--shadow-card)] border-primary/30 max-w-md mx-4">
              <CardContent className="p-6 text-center">
                <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">{t('paywall.unlockTitle') || 'Unlock Full Results'}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'pt-BR'
                    ? 'Desbloqueie análise detalhada por categoria, insights cognitivos com explicações, interpretação por IA, perfil de sintomas e recomendações personalizadas.'
                    : 'Unlock detailed category analysis, cognitive insights with explanations, AI-powered interpretation, symptom radar profile, and personalized recommendations.'}
                </p>
                <p className="text-2xl font-bold text-primary mb-4">
                  {language === 'pt-BR' ? 'R$25' : '$5'} <span className="text-sm font-normal text-muted-foreground">{t('paywall.oneTime') || 'one-time'}</span>
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="filter blur-sm pointer-events-none select-none">
            <DetailedResults
              data={data}
              categoryResults={categoryResults}
              radarData={radarData}
              getCategoryIcon={getCategoryIcon}
              getCategoryExplanation={getCategoryExplanation}
              cptInsight={cptInsight}
              memoryInsight={memoryInsight}
              stroopInsight={stroopInsight}
              aiInterpretation={null}
              aiLoading={false}
              aiError={null}
              onRetryAi={() => {}}
              t={t}
              language={language}
            />
          </div>
        </div>
      )}

      {!isFreePreview && (
        <DetailedResults
          data={data}
          categoryResults={categoryResults}
          radarData={radarData}
          getCategoryIcon={getCategoryIcon}
          getCategoryExplanation={getCategoryExplanation}
          cptInsight={cptInsight}
          memoryInsight={memoryInsight}
          stroopInsight={stroopInsight}
          aiInterpretation={aiInterpretation}
          aiLoading={aiLoading}
          aiError={aiError}
          onRetryAi={fetchAiInterpretation}
          t={t}
          language={language}
        />
      )}
    </div>
  );
};

// ===== DETAILED RESULTS SUB-COMPONENT =====
const DetailedResults = ({
  data, categoryResults, radarData, getCategoryIcon, getCategoryExplanation,
  cptInsight, memoryInsight, stroopInsight,
  aiInterpretation, aiLoading, aiError, onRetryAi,
  t, language
}: any) => {
  return (
    <>
      {/* ===== AI INTERPRETATION ===== */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5 overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {language === 'pt-BR' ? 'Interpretação Personalizada por IA' : 'AI-Powered Personal Interpretation'}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {language === 'pt-BR' ? 'Análise gerada por inteligência artificial com base nos seus resultados' : 'AI-generated analysis based on your unique results'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {aiLoading && (
            <div className="flex items-center gap-3 py-8 justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                {language === 'pt-BR' ? 'Analisando seus resultados...' : 'Analyzing your results...'}
              </span>
            </div>
          )}
          {aiError && (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm text-destructive">{aiError}</p>
              <Button variant="outline" size="sm" onClick={onRetryAi}>
                {language === 'pt-BR' ? 'Tentar novamente' : 'Try again'}
              </Button>
            </div>
          )}
          {aiInterpretation && (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {aiInterpretation.split('\n').filter((l: string) => l.trim()).map((paragraph: string, i: number) => (
                <p key={i} className="text-sm leading-relaxed text-foreground/85 mb-3 last:mb-0">{paragraph}</p>
              ))}
            </div>
          )}
          {!aiLoading && !aiError && !aiInterpretation && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {language === 'pt-BR' ? 'Interpretação por IA disponível após completar todos os testes.' : 'AI interpretation available after completing all tests.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ===== CATEGORY DEEP DIVE ===== */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          {language === 'pt-BR' ? 'Análise Detalhada por Categoria' : 'Detailed Category Analysis'}
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {categoryResults.map((cat: CategoryResult, idx: number) => (
            <Card key={cat.rawCategory} className="overflow-hidden">
              <div className="flex">
                <div className="w-1.5" style={{ backgroundColor: CATEGORY_COLORS[idx] }} />
                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${CATEGORY_COLORS[idx]}15` }}>
                        <div style={{ color: CATEGORY_COLORS[idx] }}>{getCategoryIcon(cat.category)}</div>
                      </div>
                      <div>
                        <h4 className="font-semibold capitalize text-base">{cat.category}</h4>
                        <p className="text-xs text-muted-foreground">
                          {language === 'pt-BR' ? 'Pontuação' : 'Score'}: {cat.score}/{cat.maxScore}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={cat.level === 'high' ? 'destructive' : cat.level === 'moderate' ? 'secondary' : 'outline'} className="mb-1">
                        {t(`results.${cat.level}`)}
                      </Badge>
                      <div className="text-2xl font-bold" style={{ color: LEVEL_COLORS[cat.level] }}>{cat.percentage}%</div>
                    </div>
                  </div>
                  <Progress value={cat.percentage} className="h-2 mb-3" />
                  <p className="text-sm text-foreground/75 leading-relaxed">
                    {getCategoryExplanation(cat.rawCategory, cat.level)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ===== SYMPTOM RADAR ===== */}
      <Card className="shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle className="text-lg">{language === 'pt-BR' ? 'Perfil de Sintomas' : 'Symptom Profile'}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {language === 'pt-BR'
              ? 'Este gráfico radar mostra como seus resultados se distribuem nas 4 dimensões avaliadas. Pontos mais distantes do centro indicam maior presença de sintomas.'
              : 'This radar chart shows how your results are distributed across the 4 assessed dimensions. Points further from the center indicate greater symptom presence.'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Radar name="%" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(var(--primary))' }} />
                <Tooltip formatter={(value: any) => [`${value}%`, language === 'pt-BR' ? 'Pontuação' : 'Score']}
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ===== COGNITIVE TESTS DEEP DIVE ===== */}
      {data.gameResults && data.gameResults.cpt && data.gameResults.workingMemory && data.gameResults.stroop && (
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            {language === 'pt-BR' ? 'Desempenho Cognitivo Detalhado' : 'Detailed Cognitive Performance'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {language === 'pt-BR'
              ? 'Estes testes computadorizados medem aspectos objetivos do funcionamento cognitivo, semelhantes aos utilizados em avaliações profissionais de TDAH.'
              : 'These computerized tests measure objective aspects of cognitive functioning, similar to those used in professional ADHD assessments.'}
          </p>

          {/* CPT Card */}
          {cptInsight && (
            <Card className="mb-4 border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    {language === 'pt-BR' ? 'Teste de Atenção Sustentada (CPT)' : 'Sustained Attention Test (CPT)'}
                  </CardTitle>
                  <Badge variant={cptInsight.hitRate >= 75 ? 'outline' : cptInsight.hitRate >= 50 ? 'secondary' : 'destructive'}>
                    {cptInsight.attentionQuality}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === 'pt-BR'
                    ? 'Mede sua capacidade de manter atenção por período prolongado e controlar respostas impulsivas.'
                    : 'Measures your ability to sustain attention over time and control impulsive responses.'}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MetricCard label={language === 'pt-BR' ? 'Taxa de Acerto' : 'Hit Rate'} value={`${cptInsight.hitRate}%`} color="text-success" />
                  <MetricCard label={language === 'pt-BR' ? 'Alarmes Falsos' : 'False Alarms'} value={`${cptInsight.faRate}%`} color="text-destructive" />
                  <MetricCard label={language === 'pt-BR' ? 'Tempo Médio' : 'Avg Time'} value={`${cptInsight.averageReactionTime}ms`} color="text-primary" />
                  <MetricCard label={language === 'pt-BR' ? 'Alvos Perdidos' : 'Missed'} value={`${data.gameResults.cpt.missedTargets}`} color="text-warning" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                      {language === 'pt-BR' ? '🎯 Atenção Sustentada' : '🎯 Sustained Attention'}
                    </p>
                    <p className="text-foreground/75 text-xs">{cptInsight.attentionDesc}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                    <p className="font-medium text-orange-700 dark:text-orange-300 mb-1">
                      {language === 'pt-BR' ? '⚡ Controle de Impulsos' : '⚡ Impulse Control'}
                    </p>
                    <p className="text-foreground/75 text-xs">{cptInsight.impulseDesc}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <p className="font-medium text-purple-700 dark:text-purple-300 mb-1">
                      {language === 'pt-BR' ? '⏱ Velocidade de Processamento' : '⏱ Processing Speed'}
                    </p>
                    <p className="text-foreground/75 text-xs">{cptInsight.speedDesc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Memory Card */}
          {memoryInsight && (
            <Card className="mb-4 border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    {language === 'pt-BR' ? 'Teste de Memória de Trabalho' : 'Working Memory Test'}
                  </CardTitle>
                  <Badge variant={memoryInsight.maxNLevel >= 5 ? 'outline' : memoryInsight.maxNLevel >= 3 ? 'secondary' : 'destructive'}>
                    {memoryInsight.quality}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === 'pt-BR'
                    ? 'Avalia sua capacidade de manter e manipular informações na memória de curto prazo — essencial para seguir instruções e resolver problemas.'
                    : 'Evaluates your ability to hold and manipulate information in short-term memory — essential for following instructions and problem-solving.'}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <MetricCard label={language === 'pt-BR' ? 'Precisão' : 'Accuracy'} value={`${memoryInsight.accuracy}%`} color="text-success" />
                  <MetricCard label={language === 'pt-BR' ? 'Nível Máximo' : 'Max Level'} value={`${memoryInsight.maxNLevel}`} color="text-primary" />
                  <MetricCard label={language === 'pt-BR' ? 'Corretas/Erradas' : 'Correct/Wrong'} value={`${memoryInsight.correctResponses}/${memoryInsight.incorrectResponses}`} color="text-foreground" />
                </div>
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                  <p className="font-medium text-purple-700 dark:text-purple-300 mb-1">
                    {language === 'pt-BR' ? '🧠 O que isso significa' : '🧠 What this means'}
                  </p>
                  <p className="text-foreground/75 text-xs">{memoryInsight.desc}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stroop Card */}
          {stroopInsight && (
            <Card className="mb-4 border-l-4 border-l-emerald-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    {language === 'pt-BR' ? 'Teste de Flexibilidade Cognitiva (Stroop)' : 'Cognitive Flexibility Test (Stroop)'}
                  </CardTitle>
                  <Badge variant={stroopInsight.accuracy >= 85 ? 'outline' : stroopInsight.accuracy >= 60 ? 'secondary' : 'destructive'}>
                    {stroopInsight.quality}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === 'pt-BR'
                    ? 'Mede sua capacidade de processar informações conflitantes e inibir respostas automáticas — habilidades frequentemente afetadas no TDAH.'
                    : 'Measures your ability to process conflicting information and inhibit automatic responses — skills frequently affected in ADHD.'}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MetricCard label={language === 'pt-BR' ? 'Precisão Geral' : 'Overall Accuracy'} value={`${stroopInsight.accuracy}%`} color="text-success" />
                  <MetricCard label={language === 'pt-BR' ? 'Tempo Médio' : 'Avg Time'} value={`${stroopInsight.averageReactionTime}ms`} color="text-primary" />
                  <MetricCard label={language === 'pt-BR' ? 'Congruente' : 'Congruent'} value={`${stroopInsight.congruentAccuracy}%`} color="text-emerald-600" />
                  <MetricCard label={language === 'pt-BR' ? 'Incongruente' : 'Incongruent'} value={`${stroopInsight.incongruentAccuracy}%`} color="text-amber-600" />
                </div>
                {stroopInsight.stroopEffect > 5 && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                    <p className="font-medium text-amber-700 dark:text-amber-300 mb-1">
                      {language === 'pt-BR' ? '🔄 Efeito Stroop Detectado' : '🔄 Stroop Effect Detected'}
                    </p>
                    <p className="text-foreground/75 text-xs">
                      {language === 'pt-BR'
                        ? `Diferença de ${stroopInsight.stroopEffect}% entre tarefas congruentes e incongruentes. Isso é normal — quanto maior a diferença, mais esforço mental é necessário para processar informações conflitantes.`
                        : `${stroopInsight.stroopEffect}% difference between congruent and incongruent tasks. This is normal — the larger the gap, the more mental effort required to process conflicting information.`}
                    </p>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300 mb-1">
                    {language === 'pt-BR' ? '🧩 O que isso significa' : '🧩 What this means'}
                  </p>
                  <p className="text-foreground/75 text-xs">{stroopInsight.desc}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cognitive Comparison Chart */}
          {data.gameResults.cpt && data.gameResults.workingMemory && data.gameResults.stroop && (
            <Card className="shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle className="text-base">
                  {language === 'pt-BR' ? 'Comparação de Desempenho Cognitivo' : 'Cognitive Performance Comparison'}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {language === 'pt-BR'
                    ? 'Comparação da precisão e desempenho nos três testes cognitivos. Barras mais altas indicam melhor desempenho.'
                    : 'Comparison of accuracy and performance across the three cognitive tests. Higher bars indicate better performance.'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          test: language === 'pt-BR' ? 'Atenção' : 'Attention',
                          accuracy: cptInsight?.hitRate || 0,
                          speed: Math.max(0, 100 - Math.min(100, (data.gameResults.cpt.averageReactionTime / 10)))
                        },
                        {
                          test: language === 'pt-BR' ? 'Memória' : 'Memory',
                          accuracy: memoryInsight?.accuracy || 0,
                          speed: ((data.gameResults.workingMemory.maxNLevel / 7) * 100)
                        },
                        {
                          test: language === 'pt-BR' ? 'Flexibilidade' : 'Flexibility',
                          accuracy: stroopInsight?.accuracy || 0,
                          speed: Math.max(0, 100 - Math.min(100, (data.gameResults.stroop.averageReactionTime / 20)))
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="test" tick={{ fontSize: 12 }} stroke="hsl(var(--foreground))" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--foreground))" tickFormatter={(v) => `${v}%`} />
                      <Tooltip
                        formatter={(value: any, name: string) => [`${Math.round(value as number)}%`, name]}
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Bar dataKey="accuracy" fill="hsl(142, 71%, 45%)" name={language === 'pt-BR' ? 'Precisão' : 'Accuracy'} radius={[6, 6, 0, 0]} />
                      <Bar dataKey="speed" fill="hsl(210, 90%, 55%)" name={language === 'pt-BR' ? 'Desempenho' : 'Performance'} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ===== WHAT'S NEXT ===== */}
      <Card className="bg-muted/30 border-dashed border-2">
        <CardContent className="p-5">
          <h3 className="font-bold text-base mb-3">
            {language === 'pt-BR' ? '📋 Próximos Passos Recomendados' : '📋 Recommended Next Steps'}
          </h3>
          <div className="space-y-2.5">
            {[
              language === 'pt-BR'
                ? 'Agende uma consulta com um profissional de saúde mental para discutir estes resultados'
                : 'Schedule an appointment with a mental health professional to discuss these results',
              language === 'pt-BR'
                ? 'Leve estes resultados para sua consulta — eles fornecem informações úteis para o profissional'
                : 'Bring these results to your appointment — they provide useful information for the clinician',
              language === 'pt-BR'
                ? 'Lembre-se: este é um rastreamento, não um diagnóstico. Somente um profissional qualificado pode diagnosticar TDAH'
                : 'Remember: this is a screening, not a diagnosis. Only a qualified professional can diagnose ADHD',
              language === 'pt-BR'
                ? 'Considere manter um diário de sintomas por 2 semanas para complementar esta avaliação'
                : 'Consider keeping a symptom diary for 2 weeks to complement this assessment',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-sm text-foreground/80">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Book Appointment CTA */}
      <BookAppointment />

      {/* Important Note */}
      <div className="p-4 bg-medical-light rounded-lg border border-primary/10">
        <p className="text-xs text-muted-foreground">
          <strong>{t('dashboard.clinicalNote')}</strong> {t('dashboard.clinicalNoteText')}
        </p>
      </div>
    </>
  );
};

// ===== METRIC CARD COMPONENT =====
const MetricCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="bg-muted/50 rounded-lg p-3 text-center">
    <div className={`text-lg font-bold ${color}`}>{value}</div>
    <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{label}</div>
  </div>
);
