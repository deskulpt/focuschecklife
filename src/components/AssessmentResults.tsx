import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Download, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { getQuestionsForAge } from '@/data/assessmentQuestions';
import type { AssessmentData } from './AssessmentApp';

interface AssessmentResultsProps {
  data: AssessmentData;
  onRestart: () => void;
}

interface CategoryResult {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: 'low' | 'moderate' | 'high';
  description: string;
}

export const AssessmentResults = ({ data, onRestart }: AssessmentResultsProps) => {
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
      return sum + (3 * weight); // Maximum response is 3
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
  
  const getOverallAssessment = () => {
    if (overallPercentage >= 70) {
      return {
        level: 'high',
        title: 'Significant ADHD Symptoms Indicated',
        description: 'Your responses suggest a high likelihood of ADHD symptoms that may significantly impact daily functioning.',
        recommendation: 'We strongly recommend consulting with a healthcare professional for a comprehensive evaluation.',
        color: 'destructive'
      };
    } else if (overallPercentage >= 40) {
      return {
        level: 'moderate',
        title: 'Moderate ADHD Symptoms Indicated',
        description: 'Your responses suggest some ADHD symptoms that may be impacting your daily life.',
        recommendation: 'Consider discussing these symptoms with a healthcare professional for further evaluation.',
        color: 'warning'
      };
    } else {
      return {
        level: 'low',
        title: 'Low ADHD Symptoms Indicated',
        description: 'Your responses suggest minimal ADHD symptoms at this time.',
        recommendation: 'Continue monitoring symptoms and consult a professional if concerns develop.',
        color: 'success'
      };
    }
  };

  const overall = getOverallAssessment();

  const getAgeGroupTitle = () => {
    switch (data.ageGroup) {
      case 'child': return 'Child (6-12 years)';
      case 'teen': return 'Teen (13-17 years)';
      case 'adult': return 'Adult (18+ years)';
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-medical-teal bg-clip-text text-transparent mb-2">
          Assessment Results
        </h2>
        <p className="text-muted-foreground">
          {getAgeGroupTitle()} • Completed {data.completedAt.toLocaleDateString()}
        </p>
      </div>

      {/* Overall Assessment */}
      <Card className={`border-2 ${
        overall.color === 'destructive' ? 'border-destructive/20 bg-destructive/5' :
        overall.color === 'warning' ? 'border-warning/20 bg-warning/5' :
        'border-success/20 bg-success/5'
      }`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            {overall.color === 'destructive' && <AlertTriangle className="w-8 h-8 text-destructive" />}
            {overall.color === 'warning' && <AlertCircle className="w-8 h-8 text-warning" />}
            {overall.color === 'success' && <CheckCircle className="w-8 h-8 text-success" />}
            <div>
              <CardTitle className="text-xl">{overall.title}</CardTitle>
              <div className="text-sm text-muted-foreground">
                Overall Score: {Math.round(overallPercentage)}%
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={overallPercentage} className="h-3" />
            <p className="text-sm leading-relaxed">{overall.description}</p>
            <div className={`p-3 rounded-lg ${
              overall.color === 'destructive' ? 'bg-destructive/10' :
              overall.color === 'warning' ? 'bg-warning/10' :
              'bg-success/10'
            }`}>
              <p className="text-sm font-medium">{overall.recommendation}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        {categoryResults.map((category) => (
          <Card key={category.category} className="shadow-[var(--shadow-soft)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg capitalize">{category.category}</CardTitle>
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
                  <span>{category.percentage}%</span>
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

      {/* Research Sources */}
      <Card className="bg-medical-light">
        <CardHeader>
          <CardTitle className="text-lg">Assessment Based On</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Clinical Criteria:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• DSM-5 Diagnostic Criteria for ADHD</li>
                <li>• American Psychiatric Association Guidelines</li>
                <li>• WHO International Classification</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Validated Scales:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Adult ADHD Self-Report Scale (ASRS-v1.1)</li>
                <li>• Conners' Rating Scales</li>
                <li>• ADHD Rating Scale (ADHD-RS)</li>
                <li>• Vanderbilt Assessment Scales</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onRestart} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Take Assessment Again
        </Button>
        <Button 
          onClick={() => window.print()} 
          variant="secondary" 
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Save Results
        </Button>
      </div>

      {/* Important Disclaimer */}
      <div className="mt-8 p-6 bg-destructive/5 border border-destructive/20 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="flex-shrink-0 w-5 h-5 text-destructive mt-0.5" />
          <div className="text-sm">
            <h4 className="font-semibold text-destructive mb-2">Medical Disclaimer</h4>
            <p className="text-foreground/80 leading-relaxed">
              This assessment is for educational and informational purposes only. It is not intended to diagnose, treat, 
              or replace professional medical advice. ADHD diagnosis requires comprehensive evaluation by a qualified 
              healthcare professional, including clinical interviews, medical history, and sometimes additional testing. 
              If you have concerns about ADHD symptoms, please consult with a licensed healthcare provider.
            </p>
          </div>
        </div>
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