import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, Briefcase } from 'lucide-react';
import type { AgeGroup } from './AssessmentApp';

interface AgeSelectionProps {
  onAgeSelect: (age: AgeGroup) => void;
}

export const AgeSelection = ({ onAgeSelect }: AgeSelectionProps) => {
  const ageGroups = [
    {
      id: 'child' as AgeGroup,
      title: 'Children (6-12 years)',
      description: 'Assessment based on parent/teacher observations using Conners\' Rating Scales and DSM-5 criteria',
      icon: Users,
      color: 'from-medical-blue to-primary',
      questions: '18 questions',
      time: '5-8 minutes'
    },
    {
      id: 'teen' as AgeGroup,
      title: 'Teenagers (13-17 years)',
      description: 'Self-report and parent questionnaire combining ADHD Rating Scale and behavioral observations',
      icon: GraduationCap,
      color: 'from-medical-teal to-medical-blue',
      questions: '24 questions',
      time: '8-12 minutes'
    },
    {
      id: 'adult' as AgeGroup,
      title: 'Adults (18+ years)',
      description: 'Adult ADHD Self-Report Scale (ASRS-v1.1) and retrospective childhood symptoms assessment',
      icon: Briefcase,
      color: 'from-primary to-medical-teal',
      questions: '28 questions',
      time: '10-15 minutes'
    }
  ];

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Select Age Group
        </h2>
        <p className="text-muted-foreground">
          Choose the appropriate age category to begin the research-validated assessment
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {ageGroups.map((group) => {
          const IconComponent = group.icon;
          
          return (
            <Card 
              key={group.id}
              className="group hover:shadow-[var(--shadow-card)] transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30"
              onClick={() => onAgeSelect(group.id)}
            >
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${group.color} mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {group.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="text-center space-y-4">
                <CardDescription className="text-sm leading-relaxed min-h-[60px]">
                  {group.description}
                </CardDescription>
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span className="font-medium">{group.questions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">{group.time}</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
                >
                  Begin Assessment
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-medical-light rounded-lg">
        <div className="text-center text-sm text-muted-foreground">
          <p className="font-medium mb-2">Research-Based Assessment Tools Used:</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <span>• DSM-5 Criteria</span>
            <span>• Conners' Rating Scales</span>
            <span>• ADHD Rating Scale (ADHD-RS)</span>
            <span>• Adult ADHD Self-Report Scale (ASRS-v1.1)</span>
            <span>• Vanderbilt Assessment Scales</span>
          </div>
        </div>
      </div>
    </div>
  );
};