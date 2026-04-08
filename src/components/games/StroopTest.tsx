import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { getStroopConfig, type AgeGroup } from '@/data/gameConfig';

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
  ageGroup: AgeGroup;
}

// Shapes for child mode (SVG-based colored shapes)
const childShapes = ['●', '■', '▲']; // circle, square, triangle

export const StroopTest = ({ onComplete, ageGroup }: StroopTestProps) => {
  const { t, language } = useLanguage();
  const config = getStroopConfig(ageGroup);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete'>('intro');
  const [currentWord, setCurrentWord] = useState('');
  const [currentColor, setCurrentColor] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [trial, setTrial] = useState(0);
  const [isCongruent, setIsCongruent] = useState(true);
  const [currentShape, setCurrentShape] = useState('');
  const [results, setResults] = useState({
    correctResponses: 0,
    incorrectResponses: 0,
    congruentCorrect: 0,
    congruentTotal: 0,
    incongruentCorrect: 0,
    incongruentTotal: 0,
    reactionTimes: [] as number[]
  });

  const lang = language as 'en' | 'pt-BR';
  const colors = config.colors;
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
    const colorIndex = Math.floor(Math.random() * colors.length);
    const displayColor = colors[colorIndex];

    if (!config.useWords) {
      // Child mode: show a colored shape
      const shape = childShapes[Math.floor(Math.random() * childShapes.length)];
      setCurrentShape(shape);
      setCurrentWord('');
      setCurrentColor(displayColor);
      setCorrectAnswer(displayColor);
      setIsCongruent(true); // shapes are always "congruent" — just pick the color
    } else {
      // Standard Stroop: color word in mismatched ink
      const wordIndex = Math.floor(Math.random() * colors.length);
      const congruent = Math.random() < 0.5;
      const word = colors[wordIndex];
      const color = congruent ? word : displayColor;
      setCurrentWord(word);
      setCurrentColor(color);
      setCorrectAnswer(color);
      setIsCongruent(congruent);
      setCurrentShape('');
    }
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
    if (nextTrial >= config.totalTrials) {
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
        totalTrials: config.totalTrials
      });
    }
  }, [gameState]);

  if (gameState === 'intro') {
    return (
      <Card className="shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle>{t('stroop.title')}</CardTitle>
          {ageGroup === 'child' && (
            <p className="text-xs text-primary font-medium mt-1">
              {lang === 'pt-BR' ? '👨‍👩‍👧 Modo simplificado — formas coloridas em vez de palavras' : '👨‍👩‍👧 Simplified mode — colored shapes instead of words'}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{config.instructions[lang]}</p>
          {!config.useWords ? (
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm mb-2"><strong>{lang === 'pt-BR' ? 'Exemplo:' : 'Example:'}</strong></p>
              <p style={{ color: colorMap.blue, fontSize: '4rem' }}>●</p>
              <p className="text-xs text-muted-foreground mt-2">
                {lang === 'pt-BR' ? 'Este círculo é AZUL, então clique "Azul"' : 'This circle is BLUE, so click "Blue"'}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm mb-2"><strong>{lang === 'pt-BR' ? 'Exemplo:' : 'Example:'}</strong></p>
              <p style={{ color: colorMap.blue, fontSize: '2rem', fontWeight: 'bold' }}>
                {colorNames.red[lang]}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {lang === 'pt-BR'
                  ? 'A palavra diz "VERMELHO" mas está colorida de AZUL, então você clicaria "Azul"'
                  : 'The word says "RED" but it\'s colored BLUE, so you would click "Blue"'}
              </p>
            </div>
          )}
          <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
            <strong>{lang === 'pt-BR' ? 'Detalhes:' : 'Details:'}</strong>{' '}
            {config.totalTrials} {lang === 'pt-BR' ? 'tentativas' : 'trials'} •{' '}
            {colors.length} {lang === 'pt-BR' ? 'cores' : 'colors'}
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
        <span className="text-sm text-muted-foreground">{t('stroop.trial')} {trial + 1} / {config.totalTrials}</span>
        <Progress value={(trial / config.totalTrials) * 100} className="w-1/2 h-2" />
      </div>
      <Card className="shadow-[var(--shadow-soft)]">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <p className="text-sm text-muted-foreground mb-8">{t('stroop.selectColor')}</p>
            <div className="text-7xl font-bold mb-12" style={{ color: colorMap[currentColor] }}>
              {currentShape || (colorNames[currentWord]?.[lang] || currentWord.toUpperCase())}
            </div>
            <div className={`grid ${colors.length <= 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-3 w-full max-w-md`}>
              {colors.map(color => (
                <Button
                  key={color}
                  onClick={() => handleResponse(color)}
                  variant="outline"
                  className="h-16 text-lg"
                  style={{ borderColor: colorMap[color], borderWidth: '2px' }}
                >
                  <span style={{ color: colorMap[color], fontWeight: 'bold' }}>
                    {colorLabels[color]?.[lang] || color}
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
