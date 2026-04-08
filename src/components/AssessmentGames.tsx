import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Brain, Target, Zap, Palette, CheckCircle2 } from 'lucide-react';
import { ContinuousPerformanceTest } from './games/ContinuousPerformanceTest';
import { WorkingMemoryTest } from './games/WorkingMemoryTest';
import { StroopTest } from './games/StroopTest';
import { useLanguage } from '@/contexts/LanguageContext';

export interface GameResults {
  cpt: { correctHits: number; missedTargets: number; falseAlarms: number; averageReactionTime: number; totalTrials: number; };
  workingMemory: { correctResponses: number; incorrectResponses: number; maxNLevel: number; totalTrials: number; };
  stroop: { correctResponses: number; incorrectResponses: number; averageReactionTime: number; congruentAccuracy: number; incongruentAccuracy: number; totalTrials: number; };
}

interface AssessmentGamesProps {
  onComplete: (results: GameResults) => void;
  onBack: () => void;
  ageGroup: 'child' | 'teen' | 'adult';
}

type GameType = 'menu' | 'cpt' | 'memory' | 'stroop';

export const AssessmentGames = ({ onComplete, onBack, ageGroup }: AssessmentGamesProps) => {
  const { t } = useLanguage();
  const [currentGame, setCurrentGame] = useState<GameType>('menu');
  const [completedGames, setCompletedGames] = useState<Set<string>>(new Set());
  const [gameResults, setGameResults] = useState<Partial<GameResults>>({});

  const games = [
    { id: 'cpt', nameKey: 'games.test1.title', descriptionKey: 'games.test1.description', icon: Target, color: 'from-blue-500 to-blue-600', scientificName: 'Continuous Performance Test (CPT)' },
    { id: 'memory', nameKey: 'games.test2.title', descriptionKey: 'games.test2.description', icon: Brain, color: 'from-purple-500 to-purple-600', scientificName: 'N-Back Working Memory Test' },
    { id: 'stroop', nameKey: 'games.test3.title', descriptionKey: 'games.test3.description', icon: Palette, color: 'from-pink-500 to-pink-600', scientificName: 'Stroop Color-Word Test' }
  ];

  const handleGameComplete = (gameId: string, resultKey: string, result: any) => {
    const newResults = { ...gameResults, [resultKey]: result };
    setGameResults(newResults);
    setCompletedGames(prev => new Set([...prev, gameId]));
    setCurrentGame('menu');
    if (completedGames.size + 1 === games.length) {
      onComplete(newResults as GameResults);
    }
  };

  if (currentGame === 'menu') {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">{t('games.progress')}</span>
            <span className="text-sm text-muted-foreground">
              {completedGames.size}/{games.length} {t('games.completed')}
            </span>
          </div>
          <Progress value={(completedGames.size / games.length) * 100} className="h-3" />
          <div className="flex justify-between mt-2">
            {games.map((game) => {
              const isCompleted = completedGames.has(game.id);
              return (
                <div key={game.id} className="flex items-center gap-1.5 text-xs">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <span className={isCompleted ? 'text-success font-medium' : 'text-muted-foreground'}>
                    {t(game.nameKey)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" /> {t('games.back')}
          </Button>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg"><Zap className="w-6 h-6 text-primary" /></div>
              <div>
                <h2 className="text-2xl font-semibold">{t('games.title')}</h2>
                <p className="text-sm text-muted-foreground">{t('games.game')} {completedGames.size}/{games.length}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {games.map(game => {
            const Icon = game.icon;
            const isCompleted = completedGames.has(game.id);
            return (
              <Card key={game.id} className={`relative overflow-hidden transition-all hover:shadow-lg ${isCompleted ? 'border-success' : ''}`}>
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${game.color}`} />
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${game.color}`}><Icon className="w-6 h-6 text-white" /></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 flex items-center gap-2">
                        {t(game.nameKey)}
                        {isCompleted && <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">✓ {t('games.complete')}</span>}
                      </h3>
                      <p className="text-sm text-muted-foreground">{t(game.descriptionKey)}</p>
                    </div>
                  </div>
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground"><strong>{t('games.basedOn')}</strong> {game.scientificName}</p>
                  </div>
                  <Button onClick={() => setCurrentGame(game.id as GameType)} disabled={isCompleted} className="w-full" variant={isCompleted ? 'outline' : 'default'}>
                    {isCompleted ? t('games.complete') : t('games.start')}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {completedGames.size === games.length && (
          <Card className="border-success bg-success/5">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4"><Zap className="w-8 h-8 text-success" /></div>
              <h3 className="text-xl font-semibold mb-2">{t('games.allComplete')}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t('games.research')}</p>
              <Button onClick={() => onComplete(gameResults as GameResults)} size="lg">{t('games.viewResults')}</Button>
            </CardContent>
          </Card>
        )}
        <div className="mt-6 p-4 bg-medical-light rounded-lg">
          <p className="text-xs text-muted-foreground"><strong>{t('games.note')}</strong> {t('games.research')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Button variant="ghost" onClick={() => setCurrentGame('menu')} className="flex items-center gap-2 mb-6">
        <ArrowLeft className="w-4 h-4" /> {t('games.backToMenu')}
      </Button>
      {currentGame === 'cpt' && <ContinuousPerformanceTest ageGroup={ageGroup} onComplete={(result) => handleGameComplete('cpt', 'cpt', result)} />}
      {currentGame === 'memory' && <WorkingMemoryTest ageGroup={ageGroup} onComplete={(result) => handleGameComplete('memory', 'workingMemory', result)} />}
      {currentGame === 'stroop' && <StroopTest ageGroup={ageGroup} onComplete={(result) => handleGameComplete('stroop', 'stroop', result)} />}
    </div>
  );
};
