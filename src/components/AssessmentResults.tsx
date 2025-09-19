import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Download, AlertTriangle } from 'lucide-react';
import type { AssessmentData } from './AssessmentApp';
import { AssessmentResultsDashboard } from './AssessmentResultsDashboard';

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
  const getAgeGroupTitle = () => {
    switch (data.ageGroup) {
      case 'child': return 'Child (6-12 years)';
      case 'teen': return 'Teen (13-17 years)';
      case 'adult': return 'Adult (18+ years)';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-medical-teal bg-clip-text text-transparent mb-2">
          Assessment Results
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          {getAgeGroupTitle()} • Completed {data.completedAt.toLocaleDateString()}
        </p>
      </div>

      {/* Visual Dashboard */}
      <AssessmentResultsDashboard data={data} />

      {/* Research Sources */}
      <Card className="bg-medical-light">
        <CardHeader>
          <CardTitle className="text-lg">Assessment Based On</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
          <span className="hidden sm:inline">Take Assessment Again</span>
          <span className="sm:hidden">Retake</span>
        </Button>
        <Button 
          onClick={() => window.print()} 
          variant="secondary" 
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Save Results</span>
          <span className="sm:hidden">Save</span>
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