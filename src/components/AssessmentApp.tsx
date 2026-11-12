import { useState, useEffect, useCallback } from 'react';
import { AgeSelection } from './AgeSelection';
import { AssessmentSurvey } from './AssessmentSurvey';
import { AssessmentGames, GameResults } from './AssessmentGames';
import { AssessmentResults } from './AssessmentResults';
import { ConsentDialog } from './ConsentDialog';
import { Card } from '@/components/ui/card';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MAX_FREE_ATTEMPTS, hasReachedFreeLimit } from '@/lib/pricing';
import type { Json } from '@/integrations/supabase/types';

export type AgeGroup = 'child' | 'teen' | 'adult';

export interface AssessmentData {
  ageGroup: AgeGroup;
  responses: Record<string, number>;
  gameResults?: GameResults;
  completedAt: Date;
  id?: string;
}

const AssessmentApp = () => {
  const [currentStep, setCurrentStep] = useState<'age' | 'survey' | 'games' | 'results'>('age');
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(null);
  const [surveyResponses, setSurveyResponses] = useState<Record<string, number>>({});
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [pendingData, setPendingData] = useState<AssessmentData | null>(null);
  const { user, profile, signOut, refetchProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [assessmentCount, setAssessmentCount] = useState(0);

  const isFreeUser = !profile?.has_paid_full_test;
  const isMonitoringUser = profile?.plan === 'monitoring';
  const maxFreeAttempts = MAX_FREE_ATTEMPTS;
  const hasReachedLimit = hasReachedFreeLimit({ hasPaid: !isFreeUser, isMonitoring: isMonitoringUser, attempts: assessmentCount });

  // Load saved assessment on mount
  useEffect(() => {
    if (user) {
      loadSavedAssessment();
      loadAssessmentCount();
    }
  }, [user]);

  const loadSavedAssessment = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      const restored: AssessmentData = {
        ageGroup: data.age_group as AgeGroup,
        responses: (data.survey_responses as Record<string, number>) || {},
        gameResults: (data.game_results as unknown as GameResults) || undefined,
        completedAt: new Date(data.completed_at),
        id: data.id,
      };
      setAssessmentData(restored);
      setSelectedAge(data.age_group as AgeGroup);
      setCurrentStep('results');
    }
  };

  const loadAssessmentCount = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('assessment_count')
      .eq('user_id', user.id)
      .single();
    if (data) setAssessmentCount(data.assessment_count || 0);
  };

  const handleAgeSelection = (age: AgeGroup) => {
    setSelectedAge(age);
    setCurrentStep('survey');
  };

  const handleSurveyComplete = (responses: Record<string, number>) => {
    setSurveyResponses(responses);
    setCurrentStep('games');
  };

  const handleGamesComplete = (gameResults: GameResults) => {
    if (!selectedAge) return;
    const data: AssessmentData = {
      ageGroup: selectedAge,
      responses: surveyResponses,
      gameResults,
      completedAt: new Date(),
    };
    // Show consent dialog before saving
    setPendingData(data);
    setShowConsent(true);
  };

  const saveAssessment = async (data: AssessmentData): Promise<boolean> => {
    if (!user) return false;
    const { data: insertedData, error } = await supabase.from('user_assessments').insert({
      user_id: user.id,
      age_group: data.ageGroup,
      survey_responses: data.responses as unknown as Json,
      game_results: (data.gameResults ?? null) as unknown as Json,
      is_full_access: !isFreeUser,
      overall_score: null,
      risk_level: null,
    }).select('id').single();
    if (error || !insertedData) {
      toast.error('Your results could not be saved', {
        description: 'Check your connection and try again.',
        action: { label: 'Retry save', onClick: () => { void saveAssessment(data); } },
      });
      return false;
    }
    setAssessmentData(prev => prev ? { ...prev, id: insertedData.id } : prev);
    // Attempt count is incremented by the database when a result is saved
    setAssessmentCount(c => c + 1);
    toast.success('Your results are saved');
    return true;
  };

  const handleConsentAccepted = async () => {
    if (!pendingData || !user) return;
    setShowConsent(false);
    setAssessmentData(pendingData);
    setCurrentStep('results');

    const saved = await saveAssessment(pendingData);
    if (saved) setPendingData(null);
  };

  const handleConsentDeclined = () => {
    if (!pendingData) return;
    setShowConsent(false);
    // Still show results but don't save — they'll be lost on refresh
    setAssessmentData(pendingData);
    setCurrentStep('results');
    setPendingData(null);
  };

  const handlePromoRedeemed = () => {
    refetchProfile();
  };

  const resetAssessment = () => {
    if (hasReachedLimit) {
      toast.error(t('reassessment.limitTitle'), {
        description: t('reassessment.limitDescription'),
      });
      return;
    }
    setCurrentStep('age');
    setSelectedAge(null);
    setSurveyResponses({});
    setAssessmentData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-medical-light/20 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> {t('nav.home')}
            </Button>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              {user && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground hidden sm:inline">{user.email}</span>
                  <Button variant="ghost" size="icon" onClick={signOut} title={t('landing.logout')} aria-label={t('landing.logout') || 'Sign out'}>
                    <LogOut className="w-4 h-4" />
                    <span className="sr-only">{t('landing.logout') || 'Sign out'}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <img src="/logo.png" alt="FocusCheck" className="w-10 h-10" />
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">FocusCheck ADHD Assessment</h1>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              {t('app.subtitle')}
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

            {currentStep === 'games' && selectedAge && (
              <AssessmentGames
                ageGroup={selectedAge}
                onComplete={handleGamesComplete}
                onBack={() => setCurrentStep('survey')}
              />
            )}
            
            {currentStep === 'results' && assessmentData && (
              <AssessmentResults 
                data={assessmentData} 
                onRestart={resetAssessment}
                isFreePreview={isFreeUser}
                hasReachedLimit={hasReachedLimit}
                assessmentCount={assessmentCount}
                maxFreeAttempts={maxFreeAttempts}
                upgradeLoading={paymentLoading}
                onUpgrade={async () => {
                  setPaymentLoading(true);
                  try {
                    const { data, error } = await supabase.functions.invoke('create-payment');
                    if (error) throw error;
                    if (!data?.url) throw new Error('No checkout link returned');
                    window.open(data.url, '_blank');
                  } catch (err: unknown) {
                    toast.error(t('payment.errorTitle'), {
                      description: err instanceof Error ? err.message : 'Please try again in a moment.',
                    });
                  } finally {
                    setPaymentLoading(false);
                  }
                }}
                onPromoRedeemed={handlePromoRedeemed}
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
                <strong className="text-foreground">{t('disclaimer.title')}</strong> {t('disclaimer.text')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consent Dialog */}
      <ConsentDialog
        open={showConsent}
        onAccept={handleConsentAccepted}
        onDecline={handleConsentDeclined}
      />
    </div>
  );
};

export default AssessmentApp;
