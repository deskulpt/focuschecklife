import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getQuestionsForAge, scaleLabels } from '@/data/assessmentQuestions';
import type { AgeGroup } from './AssessmentApp';
import { useLanguage } from '@/contexts/LanguageContext';

interface AssessmentSurveyProps {
  ageGroup: AgeGroup;
  onComplete: (responses: Record<string, number>) => void;
  onBack: () => void;
}

export const AssessmentSurvey = ({ ageGroup, onComplete, onBack }: AssessmentSurveyProps) => {
  const { t } = useLanguage();
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
        return t('age.child.title');
      case 'teen':
        return t('age.teen.title');
      case 'adult':
        return t('age.adult.title');
    }
  };

  const getInstructions = () => {
    switch (ageGroup) {
      case 'child':
        return t('survey.instructions.child');
      case 'teen':
        return t('survey.instructions.teen');
      case 'adult':
        return t('survey.instructions.adult');
    }
  };

  const getScaleLabel = (value: number) => {
    const scaleKeys = ['scale.never', 'scale.rarely', 'scale.sometimes', 'scale.often', 'scale.veryOften'];
    return t(scaleKeys[value]);
  };

  const getCategoryLabel = (category: string) => {
    return t(`survey.category.${category}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('survey.back')}
          </Button>
          <div className="text-sm text-muted-foreground">
            {t('survey.question')} {currentQuestion + 1} {t('survey.of')} {questions.length}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{getAgeGroupTitle()}</h2>
            <div className="text-right text-sm text-muted-foreground">
              <div>{Math.round(progress)}%</div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-muted-foreground text-sm">{getInstructions()}</p>
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-8 shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg leading-relaxed">
            {currentQ.text}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 bg-medical-light rounded whitespace-nowrap">
              {currentQ.category.replace('_', ' ')}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="break-all sm:break-normal">{currentQ.source}</span>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {Object.entries(scaleLabels).map(([value, label]) => {
              const numValue = parseInt(value);
              const isSelected = responses[currentQ.id] === numValue;
              
              return (
                <Button
                  key={value}
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full justify-start h-auto p-3 sm:p-4 text-left transition-all ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground shadow-[var(--shadow-soft)]' 
                      : 'hover:bg-medical-light hover:border-primary/30'
                  }`}
                  onClick={() => handleResponse(numValue)}
                >
                  <div className="flex items-start gap-2 sm:gap-3 w-full min-w-0">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                      isSelected 
                        ? 'bg-primary-foreground border-primary-foreground' 
                        : 'border-muted-foreground'
                    }`}>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-primary m-0.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm sm:text-base break-words">{getScaleLabel(numValue)}</div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button 
          variant="outline" 
          onClick={goToPrevious}
          disabled={currentQuestion === 0}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('survey.previous')}
        </Button>
        
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground w-full sm:w-auto justify-center sm:justify-end">
          {responses[currentQ.id] !== undefined ? (
            <>
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Answered</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              <span className="text-center">Select an answer to continue</span>
            </>
          )}
        </div>
      </div>

      {/* Category Progress */}
      <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-medical-light rounded-lg">
        <div className="text-xs sm:text-sm text-muted-foreground mb-2">{t('survey.progress')}:</div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1 sm:gap-2">
          {['inattention', 'hyperactivity', 'impulsivity', 'functional_impairment'].map(category => {
            const categoryQuestions = questions.filter(q => q.category === category);
            const answeredCount = categoryQuestions.filter(q => responses[q.id] !== undefined).length;
            const totalCount = categoryQuestions.length;
            
            if (totalCount === 0) return null;
            
            return (
              <div key={category} className="text-xs px-2 py-1 rounded bg-white/50 text-center">
                <div className="font-medium">{getCategoryLabel(category)}</div>
                <div className="text-muted-foreground">{answeredCount}/{totalCount}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};