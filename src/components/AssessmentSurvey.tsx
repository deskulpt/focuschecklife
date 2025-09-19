import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getQuestionsForAge, scaleLabels } from '@/data/assessmentQuestions';
import type { AgeGroup } from './AssessmentApp';

interface AssessmentSurveyProps {
  ageGroup: AgeGroup;
  onComplete: (responses: Record<string, number>) => void;
  onBack: () => void;
}

export const AssessmentSurvey = ({ ageGroup, onComplete, onBack }: AssessmentSurveyProps) => {
  const questions = getQuestionsForAge(ageGroup);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const currentQ = questions[currentQuestion];

  const handleResponse = (value: number) => {
    const newResponses = {
      ...responses,
      [currentQ.id]: value
    };
    setResponses(newResponses);

    // Auto-advance to next question after a brief delay
    setTimeout(() => {
      if (isLastQuestion) {
        onComplete(newResponses);
      } else {
        setCurrentQuestion(prev => prev + 1);
      }
    }, 150);
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const getAgeGroupTitle = () => {
    switch (ageGroup) {
      case 'child':
        return 'Children (6-12 years)';
      case 'teen':
        return 'Teenagers (13-17 years)';
      case 'adult':
        return 'Adults (18+ years)';
    }
  };

  const getInstructions = () => {
    switch (ageGroup) {
      case 'child':
        return 'Please answer based on your observations of the child over the past 6 months.';
      case 'teen':
        return 'Please answer based on how often these situations occur in your daily life.';
      case 'adult':
        return 'Please answer based on how you have felt and conducted yourself over the past 6 months.';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Age Selection
          </Button>
          <div className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Assessment: {getAgeGroupTitle()}</h2>
            <div className="text-right text-sm text-muted-foreground">
              <div>{Math.round(progress)}% Complete</div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-muted-foreground text-sm">{getInstructions()}</p>
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-8 shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">
            {currentQ.text}
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 bg-medical-light rounded">
              {currentQ.category.replace('_', ' ')}
            </span>
            <span>•</span>
            <span>{currentQ.source}</span>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-3">
            {Object.entries(scaleLabels).map(([value, label]) => {
              const numValue = parseInt(value);
              const isSelected = responses[currentQ.id] === numValue;
              
              return (
                <Button
                  key={value}
                  variant={isSelected ? "default" : "outline"}
                  className={`justify-start h-auto p-4 text-left transition-all ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground shadow-[var(--shadow-soft)]' 
                      : 'hover:bg-medical-light hover:border-primary/30'
                  }`}
                  onClick={() => handleResponse(numValue)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      isSelected 
                        ? 'bg-primary-foreground border-primary-foreground' 
                        : 'border-muted-foreground'
                    }`}>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-primary m-0.5" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground">
                        {numValue === 0 && 'This situation does not occur or occurs very rarely'}
                        {numValue === 1 && 'This situation occurs occasionally, but not frequently'}
                        {numValue === 2 && 'This situation occurs regularly and is noticeable'}
                        {numValue === 3 && 'This situation occurs very frequently and causes significant problems'}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={goToPrevious}
          disabled={currentQuestion === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {responses[currentQ.id] !== undefined ? (
            <>
              <div className="w-2 h-2 rounded-full bg-success" />
              Answered
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              Select an answer to continue
            </>
          )}
        </div>
      </div>

      {/* Category Progress */}
      <div className="mt-8 p-4 bg-medical-light rounded-lg">
        <div className="text-sm text-muted-foreground mb-2">Assessment Categories:</div>
        <div className="flex flex-wrap gap-2">
          {['inattention', 'hyperactivity', 'impulsivity', 'functional_impairment'].map(category => {
            const categoryQuestions = questions.filter(q => q.category === category);
            const answeredCount = categoryQuestions.filter(q => responses[q.id] !== undefined).length;
            const totalCount = categoryQuestions.length;
            
            if (totalCount === 0) return null;
            
            return (
              <div key={category} className="text-xs px-2 py-1 rounded bg-white/50">
                {category.replace('_', ' ')}: {answeredCount}/{totalCount}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};