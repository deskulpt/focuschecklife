import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { getWorkingMemoryConfig, type AgeGroup } from '@/data/gameConfig';

interface WorkingMemoryResult {
  correctResponses: number;
  incorrectResponses: number;
  maxNLevel: number;
  totalTrials: number;
}

interface WorkingMemoryTestProps {
  onComplete: (result: WorkingMemoryResult) => void;
  ageGroup: AgeGroup;
}

const childColors = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--success))', 'hsl(45, 90%, 50%)'];

export const WorkingMemoryTest = ({ onComplete, ageGroup }: WorkingMemoryTestProps) => {
  const { t, language } = useLanguage();
  const config = getWorkingMemoryConfig(ageGroup);
  const [gameState, setGameState] = useState<'intro' | 'memorize' | 'recall' | 'complete'>('intro');
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [level, setLevel] = useState(config.startingLevel);
  const [trial, setTrial] = useState(0);
  const [results, setResults] = useState<WorkingMemoryResult>({
    correctResponses: 0, incorrectResponses: 0, maxNLevel: config.startingLevel, totalTrials: 0
  });

  const lang = language as 'en' | 'pt-BR';
  const gridCols = config.gridSize === 4 ? 'grid-cols-2' : 'grid-cols-3';

  const generateSequence = (length: number) => {
    const seq: number[] = [];
    for (let i = 0; i < length; i++) {
      seq.push(Math.floor(Math.random() * config.gridSize));
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
        }, config.displayTime);
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
      if (nextTrial >= config.trialsPerLevel) {
        if (isCorrect && level < config.maxLevel) {
          setLevel(prev => prev + 1);
          setTrial(0);
        } else {
          setGameState('complete');
          return;
        }
      }
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
          {ageGroup === 'child' && (
            <p className="text-xs text-primary font-medium mt-1">
              {lang === 'pt-BR' ? '👨‍👩‍👧 Modo simplificado para crianças — grade 2×2 com cores' : '👨‍👩‍👧 Simplified mode for children — 2×2 grid with colors'}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{config.instructions[lang]}</p>
          <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
            <strong>{lang === 'pt-BR' ? 'Detalhes:' : 'Details:'}</strong>{' '}
            {lang === 'pt-BR' ? 'Começa no nível' : 'Starts at level'} {config.startingLevel} •{' '}
            {lang === 'pt-BR' ? 'Máximo:' : 'Max:'} {config.maxLevel} •{' '}
            {config.gridSize === 4 ? '2×2' : '3×3'} {lang === 'pt-BR' ? 'grade' : 'grid'}
          </div>
          <Button onClick={startGame} className="w-full">{t('wm.start')}</Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'complete') return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {t('wm.level')} {level} - {t('wm.trial')} {trial + 1} / {config.trialsPerLevel}
        </span>
        <Progress value={(trial / config.trialsPerLevel) * 100} className="w-1/2 h-2" />
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
            <div className={`grid ${gridCols} gap-3 max-w-sm mx-auto`}>
              {Array.from({ length: config.gridSize }).map((_, index) => {
                const isCurrentlyShowing = gameState === 'memorize' && 
                  currentIndex > 0 && 
                  sequence[currentIndex - 1] === index;
                const isInUserSequence = userSequence.includes(index);
                const cellColor = config.useColors && isCurrentlyShowing
                  ? childColors[index % childColors.length]
                  : undefined;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    disabled={gameState !== 'recall'}
                    className={`
                      aspect-square rounded-lg transition-all duration-200
                      ${config.gridSize === 4 ? 'min-h-[100px]' : ''}
                      ${isCurrentlyShowing && !config.useColors
                        ? 'bg-primary scale-95' 
                        : isInUserSequence
                        ? 'bg-primary/30'
                        : 'bg-muted hover:bg-muted/80'
                      }
                      ${gameState === 'recall' ? 'cursor-pointer' : 'cursor-not-allowed'}
                    `}
                    style={cellColor ? { backgroundColor: cellColor, transform: 'scale(0.95)' } : undefined}
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
