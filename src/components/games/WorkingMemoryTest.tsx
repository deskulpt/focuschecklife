import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';

interface WorkingMemoryResult {
  correctResponses: number;
  incorrectResponses: number;
  maxNLevel: number;
  totalTrials: number;
}

interface WorkingMemoryTestProps {
  onComplete: (result: WorkingMemoryResult) => void;
}

export const WorkingMemoryTest = ({ onComplete }: WorkingMemoryTestProps) => {
  const { t } = useLanguage();
  const [gameState, setGameState] = useState<'intro' | 'memorize' | 'recall' | 'complete'>('intro');
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [level, setLevel] = useState(3);
  const [trial, setTrial] = useState(0);
  const [results, setResults] = useState<WorkingMemoryResult>({
    correctResponses: 0,
    incorrectResponses: 0,
    maxNLevel: 3,
    totalTrials: 0
  });

  const totalTrialsPerLevel = 3;
  const maxLevel = 7;
  const gridSize = 9;

  const generateSequence = (length: number) => {
    const seq: number[] = [];
    for (let i = 0; i < length; i++) {
      seq.push(Math.floor(Math.random() * gridSize));
    }
    return seq;
  };

  const startGame = () => {
    setGameState('memorize');
    const newSeq = generateSequence(level);
    setSequence(newSeq);
    setCurrentIndex(0);
    setUserSequence([]);
  };

  useEffect(() => {
    if (gameState === 'memorize' && sequence.length > 0) {
      if (currentIndex < sequence.length) {
        const timer = setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
        }, 800);
        return () => clearTimeout(timer);
      } else {
        setTimeout(() => {
          setGameState('recall');
          setCurrentIndex(0);
        }, 500);
      }
    }
  }, [gameState, currentIndex, sequence]);

  const handleCellClick = (index: number) => {
    if (gameState !== 'recall') return;

    const newUserSeq = [...userSequence, index];
    setUserSequence(newUserSeq);

    if (newUserSeq.length === sequence.length) {
      // Check if correct
      const isCorrect = newUserSeq.every((val, idx) => val === sequence[idx]);
      
      setResults(prev => ({
        ...prev,
        correctResponses: prev.correctResponses + (isCorrect ? 1 : 0),
        incorrectResponses: prev.incorrectResponses + (isCorrect ? 0 : 1),
        maxNLevel: isCorrect ? Math.max(prev.maxNLevel, level) : prev.maxNLevel,
        totalTrials: prev.totalTrials + 1
      }));

      const nextTrial = trial + 1;
      setTrial(nextTrial);

      if (nextTrial >= totalTrialsPerLevel) {
        if (isCorrect && level < maxLevel) {
          // Level up
          setLevel(prev => prev + 1);
          setTrial(0);
        } else {
          // End game
          setGameState('complete');
          return;
        }
      }

      // Next trial
      setTimeout(() => {
        setGameState('memorize');
        const newSeq = generateSequence(level);
        setSequence(newSeq);
        setCurrentIndex(0);
        setUserSequence([]);
      }, 1000);
    }
  };

  useEffect(() => {
    if (gameState === 'complete') {
      onComplete(results);
    }
  }, [gameState]);

  if (gameState === 'intro') {
    return (
      <Card className="shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle>{t('wm.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t('wm.description')}
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>{t('wm.instructions.title')}</strong></p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>{t('wm.instructions.1')}</li>
              <li>{t('wm.instructions.2')}</li>
              <li>{t('wm.instructions.3')}</li>
              <li>{t('wm.instructions.4')}</li>
            </ul>
          </div>
          <Button onClick={startGame} className="w-full">{t('wm.start')}</Button>
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
          {t('wm.level')} {level} - {t('wm.trial')} {trial + 1} / {totalTrialsPerLevel}
        </span>
        <Progress value={(trial / totalTrialsPerLevel) * 100} className="w-1/2 h-2" />
      </div>

      <Card className="shadow-[var(--shadow-soft)]">
        <CardContent className="p-8">
          <div className="space-y-4">
            <div className="text-center">
              {gameState === 'memorize' && (
                <p className="text-sm text-muted-foreground mb-4">{t('wm.watch')}</p>
              )}
              {gameState === 'recall' && (
                <p className="text-sm text-muted-foreground mb-4">
                  {t('wm.repeat')} ({userSequence.length}/{sequence.length})
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              {Array.from({ length: gridSize }).map((_, index) => {
                const isCurrentlyShowing = gameState === 'memorize' && 
                  currentIndex > 0 && 
                  sequence[currentIndex - 1] === index;
                const isInUserSequence = userSequence.includes(index);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    disabled={gameState !== 'recall'}
                    className={`
                      aspect-square rounded-lg transition-all duration-200
                      ${isCurrentlyShowing 
                        ? 'bg-primary scale-95' 
                        : isInUserSequence
                        ? 'bg-primary/30'
                        : 'bg-muted hover:bg-muted/80'
                      }
                      ${gameState === 'recall' ? 'cursor-pointer' : 'cursor-not-allowed'}
                    `}
                  />
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="p-3 bg-success/10 rounded-lg text-center">
          <div className="font-semibold text-success">{results.correctResponses}</div>
          <div className="text-xs text-muted-foreground">{t('wm.correct')}</div>
        </div>
        <div className="p-3 bg-primary/10 rounded-lg text-center">
          <div className="font-semibold text-primary">{results.maxNLevel}</div>
          <div className="text-xs text-muted-foreground">{t('wm.maxLevel')}</div>
        </div>
      </div>
    </div>
  );
};
