// Age-adapted cognitive game configurations
// Child (6-12): Simpler stimuli, fewer trials, slower pacing, parent-assisted
// Teen (13-17): Moderate complexity, standard pacing
// Adult (18+): Full complexity, fastest pacing

export type AgeGroup = 'child' | 'teen' | 'adult';

export interface CPTConfig {
  totalTrials: number;
  stimulusTime: number;      // ms the stimulus is shown
  isiTime: number;           // inter-stimulus interval ms
  targetProbability: number;
  stimuli: string[];         // what appears on screen
  targetStimulus: string;    // which one to click for
  useImages: boolean;        // use emoji/images instead of letters
  instructions: {
    en: string;
    'pt-BR': string;
  };
}

export interface WorkingMemoryConfig {
  startingLevel: number;
  maxLevel: number;
  trialsPerLevel: number;
  gridSize: number;
  displayTime: number;       // ms each cell is shown
  useColors: boolean;        // colored cells instead of plain
  instructions: {
    en: string;
    'pt-BR': string;
  };
}

export interface StroopConfig {
  totalTrials: number;
  useWords: boolean;         // false = use shapes/icons for young children
  colors: string[];
  instructions: {
    en: string;
    'pt-BR': string;
  };
}

export const getCPTConfig = (ageGroup: AgeGroup): CPTConfig => {
  switch (ageGroup) {
    case 'child':
      return {
        totalTrials: 20,
        stimulusTime: 800,
        isiTime: 2000,
        targetProbability: 0.3,
        stimuli: ['🐶', '🐱', '🐰', '🐸', '🦁', '⭐'],
        targetStimulus: '⭐',
        useImages: true,
        instructions: {
          en: 'A star ⭐ and different animals will appear on the screen one at a time. Press the button ONLY when you see the STAR ⭐. Do not press for any animal.',
          'pt-BR': 'Uma estrela ⭐ e diferentes animais aparecerão na tela um de cada vez. Aperte o botão APENAS quando vir a ESTRELA ⭐. Não aperte para nenhum animal.',
        },
      };
    case 'teen':
      return {
        totalTrials: 25,
        stimulusTime: 600,
        isiTime: 1800,
        targetProbability: 0.3,
        stimuli: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'X'],
        targetStimulus: 'X',
        useImages: false,
        instructions: {
          en: 'Letters will appear on the screen one at a time. Press the button ONLY when you see the letter "X". Ignore all other letters. Try to respond as fast as you can!',
          'pt-BR': 'Letras aparecerão na tela uma de cada vez. Aperte o botão APENAS quando vir a letra "X". Ignore todas as outras letras. Tente responder o mais rápido possível!',
        },
      };
    case 'adult':
      return {
        totalTrials: 30,
        stimulusTime: 500,
        isiTime: 1500,
        targetProbability: 0.3,
        stimuli: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'X'],
        targetStimulus: 'X',
        useImages: false,
        instructions: {
          en: 'Letters will flash on screen rapidly. Press the button ONLY when you see "X". Respond as quickly and accurately as possible. This measures sustained attention and impulse control.',
          'pt-BR': 'Letras aparecerão rapidamente na tela. Aperte o botão APENAS quando vir "X". Responda o mais rápido e preciso possível. Isto mede atenção sustentada e controle de impulsos.',
        },
      };
  }
};

export const getWorkingMemoryConfig = (ageGroup: AgeGroup): WorkingMemoryConfig => {
  switch (ageGroup) {
    case 'child':
      return {
        startingLevel: 2,
        maxLevel: 5,
        trialsPerLevel: 2,
        gridSize: 4, // 2x2 grid — much simpler
        displayTime: 1200,
        useColors: true,
        instructions: {
          en: 'Colored squares will light up one at a time. Watch carefully, then tap them in the SAME ORDER. It starts easy and gets harder!',
          'pt-BR': 'Quadrados coloridos acenderão um de cada vez. Observe com cuidado, depois toque neles na MESMA ORDEM. Começa fácil e fica mais difícil!',
        },
      };
    case 'teen':
      return {
        startingLevel: 3,
        maxLevel: 6,
        trialsPerLevel: 3,
        gridSize: 9, // 3x3 grid
        displayTime: 900,
        useColors: false,
        instructions: {
          en: 'Squares will light up in sequence. Memorize the pattern, then repeat it by clicking the squares in the same order. The sequences get longer as you progress.',
          'pt-BR': 'Quadrados acenderão em sequência. Memorize o padrão, depois repita clicando nos quadrados na mesma ordem. As sequências ficam mais longas conforme você avança.',
        },
      };
    case 'adult':
      return {
        startingLevel: 3,
        maxLevel: 7,
        trialsPerLevel: 3,
        gridSize: 9,
        displayTime: 800,
        useColors: false,
        instructions: {
          en: 'Cells in the grid will activate in sequence. Memorize the exact order and reproduce it. Difficulty increases progressively. This measures working memory capacity.',
          'pt-BR': 'Células na grade serão ativadas em sequência. Memorize a ordem exata e reproduza. A dificuldade aumenta progressivamente. Isto mede a capacidade de memória de trabalho.',
        },
      };
  }
};

export const getStroopConfig = (ageGroup: AgeGroup): StroopConfig => {
  switch (ageGroup) {
    case 'child':
      return {
        totalTrials: 16,
        useWords: false, // Use colored shapes instead of color words
        colors: ['red', 'blue', 'green'],
        instructions: {
          en: 'You will see colored shapes on the screen. Your job is to pick the COLOR of the shape, not what the shape is. For example, if you see a blue circle, pick "Blue".',
          'pt-BR': 'Você verá formas coloridas na tela. Sua tarefa é escolher a COR da forma, não qual é a forma. Por exemplo, se vir um círculo azul, escolha "Azul".',
        },
      };
    case 'teen':
      return {
        totalTrials: 20,
        useWords: true,
        colors: ['red', 'blue', 'green', 'yellow'],
        instructions: {
          en: 'Color words will appear written in different colors. Select the COLOR the word is displayed in, NOT the word itself. For example, if "RED" appears in blue text, select "Blue".',
          'pt-BR': 'Palavras de cores aparecerão escritas em cores diferentes. Selecione a COR em que a palavra está escrita, NÃO a palavra em si. Por exemplo, se "VERMELHO" aparecer em texto azul, selecione "Azul".',
        },
      };
    case 'adult':
      return {
        totalTrials: 24,
        useWords: true,
        colors: ['red', 'blue', 'green', 'yellow'],
        instructions: {
          en: 'Color words will flash in mismatched ink colors. Identify the INK COLOR as fast as possible, ignoring the word meaning. This measures cognitive flexibility and inhibition.',
          'pt-BR': 'Palavras de cores aparecerão em cores de tinta diferentes. Identifique a COR DA TINTA o mais rápido possível, ignorando o significado da palavra. Isto mede flexibilidade cognitiva e inibição.',
        },
      };
  }
};
