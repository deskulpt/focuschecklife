import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';

interface StroopResult {
  correctResponses: number;
  incorrectResponses: number;
  averageReactionTime: number;
  congruentAccuracy: number;
  incongruentAccuracy: number;
  totalTrials: number;
}

interface StroopTestProps {
  onComplete: (result: StroopResult) => void;
}

export const StroopTest = ({ onComplete }: StroopTestProps) => {
  const { t, language } = useLanguage();
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete'>('intro');
  const [currentWord, setCurrentWord] = useState('');
  const [currentColor, setCurrentColor] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [trial, setTrial] = useState(0);
  const [isCongruent, setIsCongruent] = useState(true);
  const [results, setResults] = useState({
    correctResponses: 0,
    incorrectResponses: 0,
    congruentCorrect: 0,
    congruentTotal: 0,
    incongruentCorrect: 0,
    incongruentTotal: 0,
    reactionTimes: [] as number[]
  });

  const totalTrials = 24;
  const colors = ['red', 'blue', 'green', 'yellow'];
  const colorNames: Record<string, Record<string, string>> = {
    red: { en: 'RED', 'pt-BR': 'VERMELHO' },
    blue: { en: 'BLUE', 'pt-BR': 'AZUL' },
    green: { en: 'GREEN', 'pt-BR': 'VERDE' },
    yellow: { en: 'YELLOW', 'pt-BR': 'AMARELO' },
  };
  const colorLabels: Record<string, Record<string, string>> = {
    red: { en: 'Red', 'pt-BR': 'Vermelho' },
    blue: { en: 'Blue', 'pt-BR': 'Azul' },
    green: { en: 'Green', 'pt-BR': 'Verde' },
    yellow: { en: 'Yellow', 'pt-BR': 'Amarelo' },
  };
  const colorMap: Record<string, string> = {
    red: 'hsl(var(--destructive))',
    blue: 'hsl(220, 90%, 50%)',
    green: 'hsl(var(--success))',
    yellow: 'hsl(45, 90%, 50%)'
  };

  const trialStartTime = useRef<number>(0);

  const generateTrial = () => {
    const wordIndex = Math.floor(Math.random() * colors.length);
    const colorIndex = Math.floor(Math.random() * colors.length);
    const congruent = Math.random() < 0.5;
    const word = colors[wordIndex];
    const color = congruent ? word : colors[colorIndex];
    setCurrentWord(word);
    setCurrentColor(color);
    setCorrectAnswer(color);
    setIsCongruent(congruent);
    trialStartTime.current = Date.now();
  };

  const startGame = () => {
    setGameState('playing');
    setTrial(0);
    generateTrial();
  };

  const handleResponse = (selectedColor: string) => {
    const reactionTime = Date.now() - trialStartTime.current;
    const isCorrect = selectedColor === correctAnswer;
    setResults(prev => ({
      ...prev,
      correctResponses: prev.correctResponses + (isCorrect ? 1 : 0),
      incorrectResponses: prev.incorrectResponses + (isCorrect ? 0 : 1),
      congruentCorrect: prev.congruentCorrect + (isCongruent && isCorrect ? 1 : 0),
      congruentTotal: prev.congruentTotal + (isCongruent ? 1 : 0),
      incongruentCorrect: prev.incongruentCorrect + (!isCongruent && isCorrect ? 1 : 0),
      incongruentTotal: prev.incongruentTotal + (!isCongruent ? 1 : 0),
      reactionTimes: [...prev.reactionTimes, reactionTime]
    }));
    const nextTrial = trial + 1;
    setTrial(nextTrial);
    if (nextTrial >= totalTrials) {
      setGameState('complete');
    } else {
      setTimeout(() => generateTrial(), 500);
    }
  };

  useEffect(() => {
    if (gameState === 'complete') {
      const avgRT = results.reactionTimes.reduce((a, b) => a + b, 0) / results.reactionTimes.length;
      onComplete({
        correctResponses: results.correctResponses,
        incorrectResponses: results.incorrectResponses,
        averageReactionTime: Math.round(avgRT),
        congruentAccuracy: results.congruentTotal > 0 ? results.congruentCorrect / results.congruentTotal : 0,
        incongruentAccuracy: results.incongruentTotal > 0 ? results.incongruentCorrect / results.incongruentTotal : 0,
        totalTrials
      });
    }
  }, [gameState]);

  if (gameState === 'intro') {
    return (
      <Card className="shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle>{t('stroop.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{t('stroop.description')}</p>
          <div className="space-y-2 text-sm">
            <p><strong>{t('stroop.instructions.title')}</strong></p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>{t('stroop.instructions.1')}</li>
              <li><strong>{t('stroop.instructions.2')}</strong></li>
              <li>{t('stroop.instructions.3')}</li>
            </ul>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm mb-2"><strong>{language === 'pt-BR' ? 'Exemplo:' : 'Example:'}</strong></p>
            <p style={{ color: colorMap.blue, fontSize: '2rem', fontWeight: 'bold' }}>
              {colorNames.red[language]}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {language === 'pt-BR'
                ? 'A palavra diz "VERMELHO" mas está colorida de AZUL, então você clicaria "Azul"'
                : 'The word says "RED" but it\'s colored BLUE, so you would click "Blue"'}
            </p>
          </div>
          <Button onClick={startGame} className="w-full">{t('stroop.start')}</Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'complete') return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{t('stroop.trial')} {trial + 1} / {totalTrials}</span>
        <Progress value={(trial / totalTrials) * 100} className="w-1/2 h-2" />
      </div>
      <Card className="shadow-[var(--shadow-soft)]">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <p className="text-sm text-muted-foreground mb-8">{t('stroop.selectColor')}</p>
            <div className="text-7xl font-bold mb-12" style={{ color: colorMap[currentColor] }}>
              {colorNames[currentWord]?.[language] || currentWord.toUpperCase()}
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {colors.map(color => (
                <Button
                  key={color}
                  onClick={() => handleResponse(color)}
                  variant="outline"
                  className="h-16 text-lg"
                  style={{ borderColor: colorMap[color], borderWidth: '2px' }}
                >
                  <span style={{ color: colorMap[color], fontWeight: 'bold' }}>
                    {colorLabels[color]?.[language] || color}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="p-3 bg-success/10 rounded-lg text-center">
          <div className="font-semibold text-success">{results.correctResponses}</div>
          <div className="text-xs text-muted-foreground">{t('stroop.correct')}</div>
        </div>
        <div className="p-3 bg-primary/10 rounded-lg text-center">
          <div className="font-semibold text-primary">
            {results.reactionTimes.length > 0
              ? Math.round(results.reactionTimes.reduce((a, b) => a + b, 0) / results.reactionTimes.length)
              : 0}ms
          </div>
          <div className="text-xs text-muted-foreground">{t('stroop.avgTime')}</div>
        </div>
      </div>
    </div>
  );
};
