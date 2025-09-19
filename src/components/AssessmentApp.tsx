import { useState } from 'react';
import { AgeSelection } from './AgeSelection';
import { AssessmentSurvey } from './AssessmentSurvey';
import { AssessmentResults } from './AssessmentResults';
import { Card } from '@/components/ui/card';

export type AgeGroup = 'child' | 'teen' | 'adult';

export interface AssessmentData {
  ageGroup: AgeGroup;
  responses: Record<string, number>;
  completedAt: Date;
}

const AssessmentApp = () => {
  const [currentStep, setCurrentStep] = useState<'age' | 'survey' | 'results'>('age');
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);

  const handleAgeSelection = (age: AgeGroup) => {
    setSelectedAge(age);
    setCurrentStep('survey');
  };

  const handleSurveyComplete = (responses: Record<string, number>) => {
    if (!selectedAge) return;
    
    const data: AssessmentData = {
      ageGroup: selectedAge,
      responses,
      completedAt: new Date(),
    };
    
    setAssessmentData(data);
    setCurrentStep('results');
  };

  const resetAssessment = () => {
    setCurrentStep('age');
    setSelectedAge(null);
    setAssessmentData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-medical-light/20 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-medical-teal bg-clip-text text-transparent mb-4">
              ADHD Assessment Tool
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              A comprehensive, research-based assessment tool using validated clinical questionnaires 
              to help identify potential ADHD symptoms across different age groups.
            </p>
          </div>

          {/* Main Assessment Card */}
          <Card className="shadow-[var(--shadow-card)] border-0 bg-card/80 backdrop-blur-sm overflow-hidden">
            {currentStep === 'age' && (
              <AgeSelection onAgeSelect={handleAgeSelection} />
            )}
            
            {currentStep === 'survey' && selectedAge && (
              <AssessmentSurvey 
                ageGroup={selectedAge} 
                onComplete={handleSurveyComplete}
                onBack={() => setCurrentStep('age')}
              />
            )}
            
            {currentStep === 'results' && assessmentData && (
              <AssessmentResults 
                data={assessmentData} 
                onRestart={resetAssessment}
              />
            )}
          </Card>

          {/* Important Notice */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center mt-1">
                <span className="text-warning text-sm font-semibold">!</span>
              </div>
              <div className="text-sm text-foreground/80">
                <strong className="text-foreground">Important Disclaimer:</strong> This assessment is for informational purposes only and is not a substitute for professional medical diagnosis. 
                If you have concerns about ADHD symptoms, please consult with a qualified healthcare professional or mental health provider.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentApp;