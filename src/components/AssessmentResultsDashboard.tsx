import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, AlertCircle, TrendingUp, Target, Brain, Activity } from 'lucide-react';
import { getQuestionsForAge } from '@/data/assessmentQuestions';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import type { AssessmentData } from './AssessmentApp';
import { useLanguage } from '@/contexts/LanguageContext';

interface AssessmentResultsDashboardProps {
  data: AssessmentData;
  isFreePreview?: boolean;
}

interface CategoryResult {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: 'low' | 'moderate' | 'high';
  description: string;
}

const COLORS = {
  low: 'hsl(var(--success))',
  moderate: 'hsl(var(--warning))',
  high: 'hsl(var(--destructive))'
};

export const AssessmentResultsDashboard = ({ data, isFreePreview = false }: AssessmentResultsDashboardProps) => {
  const { t } = useLanguage();
  const questions = getQuestionsForAge(data.ageGroup);
  
  const categoryResults: CategoryResult[] = [
    'inattention', 'hyperactivity', 'impulsivity', 'functional_impairment'
  ].map(category => {
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

  const pieChartData = categoryResults.map(result => ({
    name: result.category, value: result.percentage, color: COLORS[result.level]
  }));
  const barChartData = categoryResults.map(result => ({
    category: result.category.charAt(0).toUpperCase() + result.category.slice(1),
    score: result.score, maxScore: result.maxScore, percentage: result.percentage
  }));
  const radarData = categoryResults.map(result => ({
    category: result.category.charAt(0).toUpperCase() + result.category.slice(1),
    score: result.percentage
  }));

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inattention': return <Brain className="w-5 h-5" />;
      case 'hyperactivity': return <Activity className="w-5 h-5" />;
      case 'impulsivity': return <TrendingUp className="w-5 h-5" />;
      case 'functional impairment': return <Target className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
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

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className={`border-2 ${
        overall.color === 'destructive' ? 'border-destructive/20 bg-destructive/5' :
        overall.color === 'warning' ? 'border-warning/20 bg-warning/5' :
        'border-success/20 bg-success/5'
      }`}>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full ${
              overall.color === 'destructive' ? 'bg-destructive/10' :
              overall.color === 'warning' ? 'bg-warning/10' : 'bg-success/10'
            }`}>
              <div className={`${
                overall.color === 'destructive' ? 'text-destructive' :
                overall.color === 'warning' ? 'text-warning' : 'text-success'
              }`}>{overall.icon}</div>
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl sm:text-2xl">{overall.title}</CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                {t('results.overallScore')}: <span className="font-semibold">{Math.round(overallPercentage)}%</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-medical-teal bg-clip-text text-transparent">
                {Math.round(overallPercentage)}%
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallPercentage} className="h-4 mb-4" />
          <p className="text-sm leading-relaxed mb-4">{overall.description}</p>
          <div className={`p-3 rounded-lg ${
            overall.color === 'destructive' ? 'bg-destructive/10 border border-destructive/20' :
            overall.color === 'warning' ? 'bg-warning/10 border border-warning/20' :
            'bg-success/10 border border-success/20'
          }`}>
            <p className="text-sm font-medium">{overall.recommendation}</p>
          </div>
        </CardContent>
      </Card>

      {/* Free preview stops here - show blur overlay for rest */}
      {isFreePreview && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/95 z-10 flex items-center justify-center">
            <Card className="shadow-[var(--shadow-card)] border-primary/30 max-w-md mx-4">
              <CardContent className="p-6 text-center">
                <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">{t('paywall.unlockTitle') || 'Unlock Full Results'}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('paywall.unlockDescription') || 'Get detailed category breakdown, cognitive performance analysis, symptom radar chart, and clinical recommendations.'}
                </p>
                <p className="text-2xl font-bold text-primary mb-4">$5 <span className="text-sm font-normal text-muted-foreground">{t('paywall.oneTime') || 'one-time'}</span></p>
              </CardContent>
            </Card>
          </div>
          <div className="filter blur-sm pointer-events-none select-none">
            <CognitiveAndDetailedResults data={data} categoryResults={categoryResults} pieChartData={pieChartData} barChartData={barChartData} radarData={radarData} getCategoryIcon={getCategoryIcon} t={t} />
          </div>
        </div>
      )}

      {!isFreePreview && (
        <CognitiveAndDetailedResults data={data} categoryResults={categoryResults} pieChartData={pieChartData} barChartData={barChartData} radarData={radarData} getCategoryIcon={getCategoryIcon} t={t} />
      )}
    </div>
  );
};

// Extracted the detailed results into a sub-component
const CognitiveAndDetailedResults = ({ data, categoryResults, pieChartData, barChartData, radarData, getCategoryIcon, t }: any) => (
  <>
    {/* Cognitive Performance Tests Results */}
    {data.gameResults && (
      <Card className="shadow-[var(--shadow-card)] border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{t('results.cognitivePerformance')}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{t('results.cognitiveDescription')}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4" /> {t('dashboard.attentionTest')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white dark:bg-gray-900 p-2 rounded">
                    <div className="text-success font-semibold">{data.gameResults.cpt.correctHits}</div>
                    <div className="text-xs text-muted-foreground">{t('dashboard.correctHits')}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-2 rounded">
                    <div className="text-destructive font-semibold">{data.gameResults.cpt.falseAlarms}</div>
                    <div className="text-xs text-muted-foreground">{t('dashboard.falseAlarms')}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-2 rounded">
                    <div className="text-warning font-semibold">{data.gameResults.cpt.missedTargets}</div>
                    <div className="text-xs text-muted-foreground">{t('dashboard.missed')}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-2 rounded">
                    <div className="text-primary font-semibold">{data.gameResults.cpt.averageReactionTime}ms</div>
                    <div className="text-xs text-muted-foreground">{t('dashboard.avgTime')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="w-4 h-4" /> {t('dashboard.memoryTest')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white dark:bg-gray-900 p-2 rounded">
                    <div className="text-success font-semibold">{data.gameResults.workingMemory.correctResponses}</div>
                    <div className="text-xs text-muted-foreground">{t('dashboard.correct')}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-2 rounded">
                    <div className="text-destructive font-semibold">{data.gameResults.workingMemory.incorrectResponses}</div>
                    <div className="text-xs text-muted-foreground">{t('dashboard.incorrect')}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-2 rounded col-span-2">
                    <div className="text-primary font-semibold text-lg">{data.gameResults.workingMemory.maxNLevel}</div>
                    <div className="text-xs text-muted-foreground">{t('dashboard.maxLevelAchieved')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4" /> {t('dashboard.flexibilityTest')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white dark:bg-gray-900 p-2 rounded">
                    <div className="text-success font-semibold">{data.gameResults.stroop.correctResponses}</div>
                    <div className="text-xs text-muted-foreground">{t('dashboard.correct')}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-2 rounded">
                    <div className="text-primary font-semibold">{data.gameResults.stroop.averageReactionTime}ms</div>
                    <div className="text-xs text-muted-foreground">{t('dashboard.avgTime')}</div>
                  </div>
                </div>
                <div className="space-y-1 pt-2 border-t text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('dashboard.congruent')}:</span>
                    <span className="font-semibold">{Math.round(data.gameResults.stroop.congruentAccuracy * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('dashboard.incongruent')}:</span>
                    <span className="font-semibold">{Math.round(data.gameResults.stroop.incongruentAccuracy * 100)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-base">{t('results.performanceComparison')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { test: t('dashboard.attention'), accuracy: Math.round((data.gameResults.cpt.correctHits / data.gameResults.cpt.totalTrials) * 100), speed: 100 - Math.min(100, (data.gameResults.cpt.averageReactionTime / 10)) },
                      { test: t('dashboard.memory'), accuracy: Math.round((data.gameResults.workingMemory.correctResponses / data.gameResults.workingMemory.totalTrials) * 100), speed: (data.gameResults.workingMemory.maxNLevel / 7) * 100 },
                      { test: t('dashboard.flexibility'), accuracy: Math.round((data.gameResults.stroop.correctResponses / data.gameResults.stroop.totalTrials) * 100), speed: 100 - Math.min(100, (data.gameResults.stroop.averageReactionTime / 10)) }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="test" tick={{ fontSize: 12 }} stroke="hsl(var(--foreground))" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--foreground))" />
                    <Tooltip
                      formatter={(value: any) => [`${Math.round(value)}%`, '']}
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }}
                    />
                    <Legend />
                    <Bar dataKey="accuracy" fill="hsl(var(--success))" name={t('dashboard.accuracyPercent')} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="speed" fill="hsl(var(--primary))" name={t('dashboard.performanceScore')} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 bg-medical-light rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>{t('dashboard.clinicalNote')}</strong> {t('dashboard.clinicalNoteText')}
            </p>
          </div>
        </CardContent>
      </Card>
    )}

    {/* Charts Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle className="text-lg">{t('results.categoryBreakdown')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value}%`, t('results.score')]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle className="text-lg">{t('results.yourScore')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} stroke="hsl(var(--foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--foreground))" />
                <Tooltip
                  formatter={(value: any, name: any) => [value, name === 'percentage' ? '%' : t('results.score')]}
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }}
                />
                <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Radar */}
    <Card className="shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle className="text-lg">{t('results.symptomProfile')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Radar name={t('results.score') + ' %'} dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip formatter={(value: any) => [`${value}%`, t('results.score')]} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>

    {/* Category Details */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categoryResults.map((category: any) => (
        <Card key={category.category} className="shadow-[var(--shadow-soft)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  category.level === 'high' ? 'bg-destructive/10' :
                  category.level === 'moderate' ? 'bg-warning/10' : 'bg-success/10'
                }`}>
                  <div className={`${
                    category.level === 'high' ? 'text-destructive' :
                    category.level === 'moderate' ? 'text-warning' : 'text-success'
                  }`}>{getCategoryIcon(category.category)}</div>
                </div>
                <CardTitle className="text-base sm:text-lg capitalize">{category.category}</CardTitle>
              </div>
              <Badge variant={
                category.level === 'high' ? 'destructive' :
                category.level === 'moderate' ? 'secondary' : 'outline'
              }>
                {t(`results.${category.level}`)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{t('results.score')}: {category.score}/{category.maxScore}</span>
                <span className="font-semibold">{category.percentage}%</span>
              </div>
              <Progress value={category.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground leading-relaxed">{category.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </>
);
