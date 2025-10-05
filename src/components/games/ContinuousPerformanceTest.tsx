import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete'>('intro');
  const [currentStimulus, setCurrentStimulus] = useState<string>('');
  const [isTarget, setIsTarget] = useState(false);
  const [trial, setTrial] = useState(0);
  const [results, setResults] = useState<CPTResult>({
    correctHits: 0,
    missedTargets: 0,
    falseAlarms: 0,
    averageReactionTime: 0,
    totalTrials: 0
  });
  
  const totalTrials = 30;
  const stimulusTime = 500;
  const isiTime = 1500; // Inter-stimulus interval
  const targetProbability = 0.3;
  
  const stimulusStartTime = useRef<number>(0);
  const reactionTimes = useRef<number[]>([]);
  const hasResponded = useRef(false);

  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'X'];
  const targetLetter = 'X';

  // Keyboard support for spacebar
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameState === 'playing') {
        e.preventDefault();
        handleResponse();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, currentStimulus, isTarget]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const runTrial = () => {
      hasResponded.current = false;
      
      // Determine if this is a target trial
      const isTargetTrial = Math.random() < targetProbability;
      const stimulus = isTargetTrial ? targetLetter : letters[Math.floor(Math.random() * (letters.length - 1))];
      
      setIsTarget(isTargetTrial);
      setCurrentStimulus(stimulus);
      stimulusStartTime.current = Date.now();

      // Hide stimulus after stimulusTime
      setTimeout(() => {
        setCurrentStimulus('');
        
        // Check if target was missed
        if (isTargetTrial && !hasResponded.current) {
          setResults(prev => ({
            ...prev,
            missedTargets: prev.missedTargets + 1
          }));
        }
      }, stimulusTime);

      // Move to next trial after ISI
      setTimeout(() => {
        const nextTrial = trial + 1;
        setTrial(nextTrial);
        
        if (nextTrial >= totalTrials) {
          setGameState('complete');
        }
      }, stimulusTime + isiTime);
    };

    runTrial();
  }, [trial, gameState]);

  useEffect(() => {
    if (gameState === 'complete') {
      const avgRT = reactionTimes.current.length > 0 
        ? reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length 
        : 0;
      
      const finalResults = {
        ...results,
        averageReactionTime: Math.round(avgRT),
        totalTrials
      };
      
      onComplete(finalResults);
    }
  }, [gameState]);

  const handleResponse = () => {
    if (hasResponded.current || !currentStimulus) return;
    
    hasResponded.current = true;
    const reactionTime = Date.now() - stimulusStartTime.current;
    
    if (isTarget) {
      // Correct hit
      setResults(prev => ({
        ...prev,
        correctHits: prev.correctHits + 1
      }));
      reactionTimes.current.push(reactionTime);
    } else {
      // False alarm
      setResults(prev => ({
        ...prev,
        falseAlarms: prev.falseAlarms + 1
      }));
    }
  };

  const startGame = () => {
    setGameState('playing');
    setTrial(0);
  };

  if (gameState === 'intro') {
    return (
      <Card className="shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle>Continuous Performance Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This test measures sustained attention and impulse control. Letters will appear briefly on screen.
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Instructions:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Press the button (or spacebar) when you see the letter <strong className="text-primary">X</strong></li>
              <li>Do NOT respond to any other letters</li>
              <li>Respond as quickly and accurately as possible</li>
              <li>The test will take about 2 minutes</li>
            </ul>
          </div>
          <Button onClick={startGame} className="w-full">Start Test</Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'complete') {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Trial {trial + 1} / {totalTrials}
        </span>
        <Progress value={(trial / totalTrials) * 100} className="w-1/2 h-2" />
      </div>

      <Card className="shadow-[var(--shadow-soft)]">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="text-8xl font-bold mb-8 h-32 flex items-center justify-center">
              {currentStimulus && (
                <span className={currentStimulus === targetLetter ? 'text-primary' : 'text-foreground'}>
                  {currentStimulus}
                </span>
              )}
            </div>
            
            <Button
              size="lg"
              onClick={handleResponse}
              disabled={!currentStimulus}
              className="min-w-[200px]"
            >
              Press when you see X
            </Button>
            
            <p className="text-xs text-muted-foreground mt-4">Or press SPACEBAR</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="p-3 bg-success/10 rounded-lg text-center">
          <div className="font-semibold text-success">{results.correctHits}</div>
          <div className="text-xs text-muted-foreground">Correct Hits</div>
        </div>
        <div className="p-3 bg-warning/10 rounded-lg text-center">
          <div className="font-semibold text-warning">{results.missedTargets}</div>
          <div className="text-xs text-muted-foreground">Missed</div>
        </div>
        <div className="p-3 bg-destructive/10 rounded-lg text-center">
          <div className="font-semibold text-destructive">{results.falseAlarms}</div>
          <div className="text-xs text-muted-foreground">False Alarms</div>
        </div>
      </div>
    </div>
  );
};
