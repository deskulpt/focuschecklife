import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Brain, Target, Zap, Palette } from 'lucide-react';
import { ContinuousPerformanceTest } from './games/ContinuousPerformanceTest';
import { WorkingMemoryTest } from './games/WorkingMemoryTest';
import { StroopTest } from './games/StroopTest';

export interface GameResults {
  cpt: {
    correctHits: number;
    missedTargets: number;
    falseAlarms: number;
    averageReactionTime: number;
    totalTrials: number;
  };
  workingMemory: {
    correctResponses: number;
    incorrectResponses: number;
    maxNLevel: number;
    totalTrials: number;
  };
  stroop: {
    correctResponses: number;
    incorrectResponses: number;
    averageReactionTime: number;
    congruentAccuracy: number;
    incongruentAccuracy: number;
    totalTrials: number;
  };
}

interface AssessmentGamesProps {
  onComplete: (results: GameResults) => void;
  onBack: () => void;
}

type GameType = 'menu' | 'cpt' | 'memory' | 'stroop';

export const AssessmentGames = ({ onComplete, onBack }: AssessmentGamesProps) => {
  const [currentGame, setCurrentGame] = useState<GameType>('menu');
  const [completedGames, setCompletedGames] = useState<Set<string>>(new Set());
  const [gameResults, setGameResults] = useState<Partial<GameResults>>({});

  const games = [
    {
      id: 'cpt',
      name: 'Attention Test',
      description: 'Measures sustained attention and impulse control',
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      scientificName: 'Continuous Performance Test (CPT)'
    },
    {
      id: 'memory',
      name: 'Memory Test',
      description: 'Assesses working memory capacity',
      icon: Brain,
      color: 'from-purple-500 to-purple-600',
      scientificName: 'N-Back Working Memory Test'
    },
    {
      id: 'stroop',
      name: 'Flexibility Test',
      description: 'Evaluates cognitive flexibility and inhibition',
      icon: Palette,
      color: 'from-pink-500 to-pink-600',
      scientificName: 'Stroop Color-Word Test'
    }
  ];

  const handleGameComplete = (gameId: string, result: any) => {
    const newResults = { ...gameResults, [gameId]: result };
    setGameResults(newResults);
    setCompletedGames(prev => new Set([...prev, gameId]));
    setCurrentGame('menu');

    // Check if all games are complete
    if (completedGames.size + 1 === games.length) {
      onComplete(newResults as GameResults);
    }
  };

  if (currentGame === 'menu') {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Survey
          </Button>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Cognitive Assessment Games</h2>
                <p className="text-sm text-muted-foreground">
                  Complete {games.length} interactive tests ({completedGames.size} of {games.length} done)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {games.map(game => {
            const Icon = game.icon;
            const isCompleted = completedGames.has(game.id);
            
            return (
              <Card 
                key={game.id}
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  isCompleted ? 'border-success' : ''
                }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${game.color}`} />
                
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${game.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 flex items-center gap-2">
                        {game.name}
                        {isCompleted && (
                          <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                            ✓ Complete
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {game.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <strong>Based on:</strong> {game.scientificName}
                    </p>
                  </div>

                  <Button
                    onClick={() => setCurrentGame(game.id as GameType)}
                    disabled={isCompleted}
                    className="w-full"
                    variant={isCompleted ? 'outline' : 'default'}
                  >
                    {isCompleted ? 'Completed' : 'Start Test'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {completedGames.size === games.length && (
          <Card className="border-success bg-success/5">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">All Tests Complete!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Great job! Click continue to see your comprehensive results.
              </p>
              <Button onClick={() => onComplete(gameResults as GameResults)} size="lg">
                View Results
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 p-4 bg-medical-light rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> These computerized tests are based on clinically validated assessments 
            like those used in Creyos Health and other professional ADHD diagnostic tools. They provide 
            objective data about attention, memory, and executive function.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Button 
        variant="ghost" 
        onClick={() => setCurrentGame('menu')} 
        className="flex items-center gap-2 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Game Menu
      </Button>

      {currentGame === 'cpt' && (
        <ContinuousPerformanceTest 
          onComplete={(result) => handleGameComplete('cpt', result)} 
        />
      )}
      
      {currentGame === 'memory' && (
        <WorkingMemoryTest 
          onComplete={(result) => handleGameComplete('workingMemory', result)} 
        />
      )}
      
      {currentGame === 'stroop' && (
        <StroopTest 
          onComplete={(result) => handleGameComplete('stroop', result)} 
        />
      )}
    </div>
  );
};
