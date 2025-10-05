import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, AlertCircle, TrendingUp, Target, Brain, Activity } from 'lucide-react';
import { getQuestionsForAge } from '@/data/assessmentQuestions';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import type { AssessmentData } from './AssessmentApp';

interface AssessmentResultsDashboardProps {
  data: AssessmentData;
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

export const AssessmentResultsDashboard = ({ data }: AssessmentResultsDashboardProps) => {
  const questions = getQuestionsForAge(data.ageGroup);
  
  // Calculate category scores
  const categoryResults: CategoryResult[] = [
    'inattention',
    'hyperactivity', 
    'impulsivity',
    'functional_impairment'
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
      description: getCategoryDescription(category, level)
    };
  }).filter(result => result.maxScore > 0);

  // Calculate overall assessment
  const totalScore = categoryResults.reduce((sum, cat) => sum + cat.score, 0);
  const totalMaxScore = categoryResults.reduce((sum, cat) => sum + cat.maxScore, 0);
  const overallPercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

  // Prepare chart data
  const pieChartData = categoryResults.map(result => ({
    name: result.category,
    value: result.percentage,
    color: COLORS[result.level]
  }));

  const barChartData = categoryResults.map(result => ({
    category: result.category.charAt(0).toUpperCase() + result.category.slice(1),
    score: result.score,
    maxScore: result.maxScore,
    percentage: result.percentage
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
        level: 'high',
        title: 'Significant ADHD Symptoms Indicated',
        description: 'Your responses suggest a high likelihood of ADHD symptoms that may significantly impact daily functioning.',
        recommendation: 'We strongly recommend consulting with a healthcare professional for a comprehensive evaluation.',
        color: 'destructive',
        icon: <AlertTriangle className="w-8 h-8" />
      };
    } else if (overallPercentage >= 40) {
      return {
        level: 'moderate',
        title: 'Moderate ADHD Symptoms Indicated',
        description: 'Your responses suggest some ADHD symptoms that may be impacting your daily life.',
        recommendation: 'Consider discussing these symptoms with a healthcare professional for further evaluation.',
        color: 'warning',
        icon: <AlertCircle className="w-8 h-8" />
      };
    } else {
      return {
        level: 'low',
        title: 'Low ADHD Symptoms Indicated',
        description: 'Your responses suggest minimal ADHD symptoms at this time.',
        recommendation: 'Continue monitoring symptoms and consult a professional if concerns develop.',
        color: 'success',
        icon: <CheckCircle className="w-8 h-8" />
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
              overall.color === 'warning' ? 'bg-warning/10' :
              'bg-success/10'
            }`}>
              <div className={`${
                overall.color === 'destructive' ? 'text-destructive' :
                overall.color === 'warning' ? 'text-warning' :
                'text-success'
              }`}>
                {overall.icon}
              </div>
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl sm:text-2xl">{overall.title}</CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                Overall Score: <span className="font-semibold">{Math.round(overallPercentage)}%</span>
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

      {/* Cognitive Performance Tests Results */}
      {data.gameResults && (
        <Card className="shadow-[var(--shadow-card)] border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Cognitive Performance Tests</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Objective measures of attention, memory, and executive function
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CPT Results */}
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Attention Test (CPT)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-white dark:bg-gray-900 p-2 rounded">
                      <div className="text-success font-semibold">{data.gameResults.cpt.correctHits}</div>
                      <div className="text-xs text-muted-foreground">Correct Hits</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-2 rounded">
                      <div className="text-destructive font-semibold">{data.gameResults.cpt.falseAlarms}</div>
                      <div className="text-xs text-muted-foreground">False Alarms</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-2 rounded">
                      <div className="text-warning font-semibold">{data.gameResults.cpt.missedTargets}</div>
                      <div className="text-xs text-muted-foreground">Missed</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-2 rounded">
                      <div className="text-primary font-semibold">{data.gameResults.cpt.averageReactionTime}ms</div>
                      <div className="text-xs text-muted-foreground">Avg Time</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      <strong>Accuracy:</strong> {Math.round((data.gameResults.cpt.correctHits / data.gameResults.cpt.totalTrials) * 100)}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Working Memory Results */}
              <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Memory Test
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-white dark:bg-gray-900 p-2 rounded">
                      <div className="text-success font-semibold">{data.gameResults.workingMemory.correctResponses}</div>
                      <div className="text-xs text-muted-foreground">Correct</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-2 rounded">
                      <div className="text-destructive font-semibold">{data.gameResults.workingMemory.incorrectResponses}</div>
                      <div className="text-xs text-muted-foreground">Incorrect</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-2 rounded col-span-2">
                      <div className="text-primary font-semibold text-lg">{data.gameResults.workingMemory.maxNLevel}</div>
                      <div className="text-xs text-muted-foreground">Max Level Achieved</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      <strong>Accuracy:</strong> {Math.round((data.gameResults.workingMemory.correctResponses / data.gameResults.workingMemory.totalTrials) * 100)}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stroop Test Results */}
              <Card className="bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Flexibility Test
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-white dark:bg-gray-900 p-2 rounded">
                      <div className="text-success font-semibold">{data.gameResults.stroop.correctResponses}</div>
                      <div className="text-xs text-muted-foreground">Correct</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-2 rounded">
                      <div className="text-primary font-semibold">{data.gameResults.stroop.averageReactionTime}ms</div>
                      <div className="text-xs text-muted-foreground">Avg Time</div>
                    </div>
                  </div>
                  <div className="space-y-1 pt-2 border-t text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Congruent:</span>
                      <span className="font-semibold">{Math.round(data.gameResults.stroop.congruentAccuracy * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Incongruent:</span>
                      <span className="font-semibold">{Math.round(data.gameResults.stroop.incongruentAccuracy * 100)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cognitive Performance Chart */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          test: 'Attention',
                          accuracy: Math.round((data.gameResults.cpt.correctHits / data.gameResults.cpt.totalTrials) * 100),
                          speed: 100 - Math.min(100, (data.gameResults.cpt.averageReactionTime / 10))
                        },
                        {
                          test: 'Memory',
                          accuracy: Math.round((data.gameResults.workingMemory.correctResponses / data.gameResults.workingMemory.totalTrials) * 100),
                          speed: (data.gameResults.workingMemory.maxNLevel / 7) * 100
                        },
                        {
                          test: 'Flexibility',
                          accuracy: Math.round((data.gameResults.stroop.correctResponses / data.gameResults.stroop.totalTrials) * 100),
                          speed: 100 - Math.min(100, (data.gameResults.stroop.averageReactionTime / 10))
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="test" 
                        tick={{ fontSize: 12 }} 
                        stroke="hsl(var(--foreground))"
                      />
                      <YAxis 
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }} 
                        stroke="hsl(var(--foreground))"
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${Math.round(value)}%`, '']}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="accuracy" fill="hsl(var(--success))" name="Accuracy %" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="speed" fill="hsl(var(--primary))" name="Performance Score" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-medical-light rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Clinical Note:</strong> These computerized tests provide objective measurements similar to 
                those used by professionals in ADHD assessment. The Continuous Performance Test (CPT) measures 
                sustained attention, the Working Memory Test assesses memory capacity, and the Stroop Test 
                evaluates cognitive flexibility and inhibition control.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Chart */}
        <Card className="shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="text-lg">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Score Comparison Chart */}
        <Card className="shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="text-lg">Score Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: 12 }} 
                    stroke="hsl(var(--foreground))"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    stroke="hsl(var(--foreground))"
                  />
                  <Tooltip 
                    formatter={(value, name) => [value, name === 'percentage' ? 'Percentage' : 'Score']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Radar Chart */}
      <Card className="shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle className="text-lg">Symptom Profile Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} 
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Radar 
                  name="Score %" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Score']}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categoryResults.map((category) => (
          <Card key={category.category} className="shadow-[var(--shadow-soft)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    category.level === 'high' ? 'bg-destructive/10' :
                    category.level === 'moderate' ? 'bg-warning/10' :
                    'bg-success/10'
                  }`}>
                    <div className={`${
                      category.level === 'high' ? 'text-destructive' :
                      category.level === 'moderate' ? 'text-warning' :
                      'text-success'
                    }`}>
                      {getCategoryIcon(category.category)}
                    </div>
                  </div>
                  <CardTitle className="text-base sm:text-lg capitalize">{category.category}</CardTitle>
                </div>
                <Badge variant={
                  category.level === 'high' ? 'destructive' :
                  category.level === 'moderate' ? 'secondary' :
                  'outline'
                }>
                  {category.level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Score: {category.score}/{category.maxScore}</span>
                  <span className="font-semibold">{category.percentage}%</span>
                </div>
                <Progress value={category.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {category.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

function getCategoryDescription(category: string, level: 'low' | 'moderate' | 'high'): string {
  const descriptions = {
    inattention: {
      low: 'Attention and focus appear to be within typical ranges.',
      moderate: 'Some difficulties with attention, focus, and task completion may be present.',
      high: 'Significant attention difficulties that likely impact daily functioning.'
    },
    hyperactivity: {
      low: 'Activity levels appear to be within typical ranges.',
      moderate: 'Some signs of restlessness or excessive activity may be present.',
      high: 'Significant hyperactivity that likely impacts daily functioning.'
    },
    impulsivity: {
      low: 'Impulse control appears to be within typical ranges.',
      moderate: 'Some impulsive behaviors may be present.',
      high: 'Significant impulsivity that likely impacts daily functioning.'
    },
    functional_impairment: {
      low: 'Minimal impact on daily life and functioning.',
      moderate: 'Some challenges with daily tasks and responsibilities.',
      high: 'Significant impact on work, school, or relationship functioning.'
    }
  };

  return descriptions[category as keyof typeof descriptions]?.[level] || 'Assessment data available.';
}