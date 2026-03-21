import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { getQuestionsForAge } from '@/data/assessmentQuestions';
import type { AgeGroup } from './AssessmentApp';

interface AssessmentRecord {
  id: string;
  age_group: string;
  completed_at: string;
  survey_responses: Record<string, number> | null;
  game_results: any;
  ai_interpretation: string | null;
}

interface CategoryScore {
  category: string;
  percentage: number;
  level: string;
}

const computeCategoryScores = (record: AssessmentRecord): CategoryScore[] => {
  const questions = getQuestionsForAge(record.age_group as AgeGroup);
  const responses = record.survey_responses || {};
  return ['inattention', 'hyperactivity', 'impulsivity', 'functional_impairment'].map(category => {
    const catQuestions = questions.filter(q => q.category === category);
    const totalScore = catQuestions.reduce((sum, q) => sum + ((responses[q.id] || 0) * (q.weight || 1)), 0);
    const maxScore = catQuestions.reduce((sum, q) => sum + (3 * (q.weight || 1)), 0);
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const level = percentage >= 70 ? 'high' : percentage >= 40 ? 'moderate' : 'low';
    return { category: category.replace('_', ' '), percentage, level };
  }).filter(c => c.percentage > 0 || true);
};

export const AssessmentHistory = () => {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  const canViewHistory = profile?.has_paid_full_test;

  useEffect(() => {
    if (user && canViewHistory) loadHistory();
    else setLoading(false);
  }, [user, canViewHistory]);

  const loadHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_assessments')
      .select('id, age_group, completed_at, survey_responses, game_results, ai_interpretation')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(20);
    if (data) setAssessments(data as any);
    setLoading(false);
  };

  if (!canViewHistory || loading || assessments.length < 2) return null;

  const latest = assessments[0];
  const previous = assessments[1];
  const latestScores = computeCategoryScores(latest);
  const previousScores = computeCategoryScores(previous);

  const getTrend = (cat: string) => {
    const curr = latestScores.find(s => s.category === cat)?.percentage || 0;
    const prev = previousScores.find(s => s.category === cat)?.percentage || 0;
    const diff = curr - prev;
    return { diff, direction: diff > 3 ? 'up' : diff < -3 ? 'down' : 'same' };
  };

  const levelColor = (level: string) => {
    if (level === 'high') return 'text-destructive';
    if (level === 'moderate') return 'text-warning';
    return 'text-success';
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">
                {language === 'pt-BR' ? 'Histórico de Avaliações' : 'Assessment History'}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {language === 'pt-BR' ? `${assessments.length} avaliações registradas` : `${assessments.length} assessments recorded`}
              </p>
            </div>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4">
          {/* Comparison: Latest vs Previous */}
          <div>
            <h4 className="text-sm font-semibold mb-3">
              {language === 'pt-BR' ? 'Comparação: Último vs Anterior' : 'Comparison: Latest vs Previous'}
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {latestScores.map(score => {
                const trend = getTrend(score.category);
                return (
                  <div key={score.category} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm capitalize font-medium">{score.category}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${levelColor(score.level)}`}>{score.percentage}%</span>
                      <div className="flex items-center gap-1">
                        {trend.direction === 'up' && <TrendingUp className="w-4 h-4 text-destructive" />}
                        {trend.direction === 'down' && <TrendingDown className="w-4 h-4 text-success" />}
                        {trend.direction === 'same' && <Minus className="w-4 h-4 text-muted-foreground" />}
                        <span className={`text-xs ${trend.diff > 0 ? 'text-destructive' : trend.diff < 0 ? 'text-success' : 'text-muted-foreground'}`}>
                          {trend.diff > 0 ? '+' : ''}{trend.diff}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="text-sm font-semibold mb-3">
              {language === 'pt-BR' ? 'Todas as Avaliações' : 'All Assessments'}
            </h4>
            <div className="space-y-2">
              {assessments.map((a, idx) => {
                const scores = computeCategoryScores(a);
                const overallPct = scores.length > 0 ? Math.round(scores.reduce((s, c) => s + c.percentage, 0) / scores.length) : 0;
                const overallLevel = overallPct >= 70 ? 'high' : overallPct >= 40 ? 'moderate' : 'low';
                return (
                  <div key={a.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">
                        {idx === 0 ? (language === 'pt-BR' ? '🟢 Mais recente' : '🟢 Latest') : `#${assessments.length - idx}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${levelColor(overallLevel)}`}>{overallPct}%</span>
                      <Badge variant={overallLevel === 'high' ? 'destructive' : overallLevel === 'moderate' ? 'secondary' : 'outline'} className="text-xs">
                        {overallLevel}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
