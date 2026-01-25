import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';

interface CPTResult {
  correctHits: number;
  missedTargets: number;
  falseAlarms: number;
  averageReactionTime: number;
  totalTrials: number;
}

interface CPTProps {
  onComplete: (result: CPTResult) => void;
}

export const ContinuousPerformanceTest = ({ onComplete }: CPTProps) => {
  const { t } = useLanguage();
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete'>('intro');
  const [currentStimulus, setCurrentStimulus] = useState<string>('');
  const [isTarget, setIsTarget] = useState(false);
  const [trial, setTrial] = useState(0);
  const [results, setResults] = useState<CPTResult>({
    correctHits: 0, missedTargets: 0, falseAlarms: 0, averageReactionTime: 0, totalTrials: 0
  });
  
  const totalTrials = 30;
  const stimulusTime = 500;
  const isiTime = 1500;
  const targetProbability = 0.3;
  
  const stimulusStartTime = useRef<number>(0);
  const reactionTimes = useRef<number[]>([]);
  const hasResponded = useRef(false);

  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'X'];
  const targetLetter = 'X';

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameState === 'playing') { e.preventDefault(); handleResponse(); }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, currentStimulus, isTarget]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const runTrial = () => {
      hasResponded.current = false;
      const isTargetTrial = Math.random() < targetProbability;
      const stimulus = isTargetTrial ? targetLetter : letters[Math.floor(Math.random() * (letters.length - 1))];
      setIsTarget(isTargetTrial);
      setCurrentStimulus(stimulus);
      stimulusStartTime.current = Date.now();
      setTimeout(() => {
        setCurrentStimulus('');
        if (isTargetTrial && !hasResponded.current) {
          setResults(prev => ({ ...prev, missedTargets: prev.missedTargets + 1 }));
        }
      }, stimulusTime);
      setTimeout(() => {
        const nextTrial = trial + 1;
        setTrial(nextTrial);
        if (nextTrial >= totalTrials) setGameState('complete');
      }, stimulusTime + isiTime);
    };
    runTrial();
  }, [trial, gameState]);

  useEffect(() => {
    if (gameState === 'complete') {
      const avgRT = reactionTimes.current.length > 0 ? reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length : 0;
      onComplete({ ...results, averageReactionTime: Math.round(avgRT), totalTrials });
    }
  }, [gameState]);

  const handleResponse = () => {
    if (hasResponded.current || !currentStimulus) return;
    hasResponded.current = true;
    const reactionTime = Date.now() - stimulusStartTime.current;
    if (isTarget) {
      setResults(prev => ({ ...prev, correctHits: prev.correctHits + 1 }));
      reactionTimes.current.push(reactionTime);
    } else {
      setResults(prev => ({ ...prev, falseAlarms: prev.falseAlarms + 1 }));
    }
  };

  const startGame = () => { setGameState('playing'); setTrial(0); };

  if (gameState === 'intro') {
    return (
      <Card className="shadow-[var(--shadow-soft)]">
        <CardHeader><CardTitle>{t('cpt.title')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{t('cpt.description')}</p>
          <div className="p-4 bg-medical-light rounded-lg"><p className="text-sm">{t('cpt.instructions')}</p></div>
          <Button onClick={startGame} className="w-full">{t('cpt.start')}</Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'complete') return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{t('cpt.trial')} {trial + 1} / {totalTrials}</span>
        <Progress value={(trial / totalTrials) * 100} className="w-1/2 h-2" />
      </div>
      <Card className="shadow-[var(--shadow-soft)]">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="text-8xl font-bold mb-8 h-32 flex items-center justify-center">
              {currentStimulus && <span className={currentStimulus === targetLetter ? 'text-primary' : 'text-foreground'}>{currentStimulus}</span>}
            </div>
            <Button size="lg" onClick={handleResponse} disabled={!currentStimulus} className="min-w-[200px]">{t('cpt.respond')}</Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="p-3 bg-success/10 rounded-lg text-center"><div className="font-semibold text-success">{results.correctHits}</div><div className="text-xs text-muted-foreground">{t('cpt.hits')}</div></div>
        <div className="p-3 bg-warning/10 rounded-lg text-center"><div className="font-semibold text-warning">{results.missedTargets}</div><div className="text-xs text-muted-foreground">{t('cpt.misses')}</div></div>
        <div className="p-3 bg-destructive/10 rounded-lg text-center"><div className="font-semibold text-destructive">{results.falseAlarms}</div><div className="text-xs text-muted-foreground">{t('cpt.falseAlarms')}</div></div>
      </div>
    </div>
  );
};
