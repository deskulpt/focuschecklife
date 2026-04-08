import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCPTConfig, type AgeGroup } from '@/data/gameConfig';

interface CPTResult {
  correctHits: number;
  missedTargets: number;
  falseAlarms: number;
  averageReactionTime: number;
  totalTrials: number;
}

interface CPTProps {
  onComplete: (result: CPTResult) => void;
  ageGroup: AgeGroup;
}

export const ContinuousPerformanceTest = ({ onComplete, ageGroup }: CPTProps) => {
  const { t, language } = useLanguage();
  const config = getCPTConfig(ageGroup);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete'>('intro');
  const [currentStimulus, setCurrentStimulus] = useState<string>('');
  const [isTarget, setIsTarget] = useState(false);
  const [trial, setTrial] = useState(0);
  const [results, setResults] = useState<CPTResult>({
    correctHits: 0, missedTargets: 0, falseAlarms: 0, averageReactionTime: 0, totalTrials: 0
  });
  
  const stimulusStartTime = useRef<number>(0);
  const reactionTimes = useRef<number[]>([]);
  const hasResponded = useRef(false);

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
      const isTargetTrial = Math.random() < config.targetProbability;
      const nonTargetStimuli = config.stimuli.filter(s => s !== config.targetStimulus);
      const stimulus = isTargetTrial ? config.targetStimulus : nonTargetStimuli[Math.floor(Math.random() * nonTargetStimuli.length)];
      setIsTarget(isTargetTrial);
      setCurrentStimulus(stimulus);
      stimulusStartTime.current = Date.now();
      setTimeout(() => {
        setCurrentStimulus('');
        if (isTargetTrial && !hasResponded.current) {
          setResults(prev => ({ ...prev, missedTargets: prev.missedTargets + 1 }));
        }
      }, config.stimulusTime);
      setTimeout(() => {
        const nextTrial = trial + 1;
        setTrial(nextTrial);
        if (nextTrial >= config.totalTrials) setGameState('complete');
      }, config.stimulusTime + config.isiTime);
    };
    runTrial();
  }, [trial, gameState]);

  useEffect(() => {
    if (gameState === 'complete') {
      const avgRT = reactionTimes.current.length > 0 ? reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length : 0;
      onComplete({ ...results, averageReactionTime: Math.round(avgRT), totalTrials: config.totalTrials });
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

  const lang = language as 'en' | 'pt-BR';

  if (gameState === 'intro') {
    return (
      <Card className="shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle>{t('cpt.title')}</CardTitle>
          {ageGroup === 'child' && (
            <p className="text-xs text-primary font-medium mt-1">
              {lang === 'pt-BR' ? '👨‍👩‍👧 Modo assistido por pais — ajude seu filho a entender as instruções' : '👨‍👩‍👧 Parent-assisted mode — help your child understand the instructions'}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{config.instructions[lang]}</p>
          {config.useImages && (
            <div className="p-4 bg-medical-light rounded-lg text-center">
              <p className="text-sm mb-3 font-medium">{lang === 'pt-BR' ? 'Procure por:' : 'Look for:'}</p>
              <div className="flex items-center justify-center gap-4 text-4xl">
                <span className="opacity-40">🐶</span>
                <span className="opacity-40">🐱</span>
                <span className="ring-4 ring-primary rounded-lg p-1">{config.targetStimulus}</span>
                <span className="opacity-40">🐰</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {lang === 'pt-BR' ? 'Aperte apenas para a ⭐!' : 'Press only for the ⭐!'}
              </p>
            </div>
          )}
          {!config.useImages && (
            <div className="p-4 bg-medical-light rounded-lg">
              <p className="text-sm">{t('cpt.instructions')}</p>
            </div>
          )}
          <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
            <strong>{lang === 'pt-BR' ? 'Detalhes:' : 'Details:'}</strong>{' '}
            {config.totalTrials} {lang === 'pt-BR' ? 'tentativas' : 'trials'} •{' '}
            {lang === 'pt-BR' ? 'Tempo de exibição:' : 'Display time:'} {config.stimulusTime}ms •{' '}
            {lang === 'pt-BR' ? 'Adaptado para' : 'Adapted for'} {ageGroup === 'child' ? (lang === 'pt-BR' ? 'crianças (6-12)' : 'children (6-12)') : ageGroup === 'teen' ? (lang === 'pt-BR' ? 'adolescentes (13-17)' : 'teens (13-17)') : (lang === 'pt-BR' ? 'adultos (18+)' : 'adults (18+)')}
          </div>
          <Button onClick={startGame} className="w-full">{t('cpt.start')}</Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'complete') return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{t('cpt.trial')} {trial + 1} / {config.totalTrials}</span>
        <Progress value={(trial / config.totalTrials) * 100} className="w-1/2 h-2" />
      </div>
      <Card className="shadow-[var(--shadow-soft)]">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className={`font-bold mb-8 h-32 flex items-center justify-center ${config.useImages ? 'text-[6rem]' : 'text-8xl'}`}>
              {currentStimulus && (
                <span className={currentStimulus === config.targetStimulus ? 'text-primary' : 'text-foreground'}>
                  {currentStimulus}
                </span>
              )}
            </div>
            <Button size="lg" onClick={handleResponse} disabled={!currentStimulus} className="min-w-[200px]">
              {config.useImages
                ? (lang === 'pt-BR' ? '⭐ É a estrela!' : '⭐ It\'s the star!')
                : t('cpt.respond')}
            </Button>
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
