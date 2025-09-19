// Research-based ADHD assessment questions derived from validated clinical tools
// Sources: DSM-5, Conners' Rating Scales, ADHD-RS, ASRS-v1.1, Vanderbilt Assessment Scales

export interface Question {
  id: string;
  text: string;
  category: 'inattention' | 'hyperactivity' | 'impulsivity' | 'functional_impairment';
  source: string;
  weight?: number; // Some questions are more diagnostically significant
}

export interface ScaleOptions {
  never: 0;
  rarely: 1;
  sometimes: 2;
  often: 3;
  very_often: 4;
}

export const scaleLabels = {
  0: 'Never or Rarely',
  1: 'Sometimes',
  2: 'Often',
  3: 'Very Often'
};

// Child Assessment (6-12 years) - Parent/Teacher Report
export const childQuestions: Question[] = [
  // Inattention Symptoms (DSM-5 based)
  {
    id: 'child_1',
    text: 'Fails to give close attention to details or makes careless mistakes in schoolwork',
    category: 'inattention',
    source: 'DSM-5 Criterion A1',
    weight: 1.2
  },
  {
    id: 'child_2',
    text: 'Has difficulty sustaining attention in tasks or play activities',
    category: 'inattention',
    source: 'DSM-5 Criterion A2',
    weight: 1.3
  },
  {
    id: 'child_3',
    text: 'Does not seem to listen when spoken to directly',
    category: 'inattention',
    source: 'DSM-5 Criterion A3'
  },
  {
    id: 'child_4',
    text: 'Does not follow through on instructions and fails to finish schoolwork or chores',
    category: 'inattention',
    source: 'DSM-5 Criterion A4'
  },
  {
    id: 'child_5',
    text: 'Has difficulty organizing tasks and activities',
    category: 'inattention',
    source: 'DSM-5 Criterion A5'
  },
  {
    id: 'child_6',
    text: 'Avoids or dislikes tasks requiring sustained mental effort (like homework)',
    category: 'inattention',
    source: 'DSM-5 Criterion A6',
    weight: 1.1
  },
  {
    id: 'child_7',
    text: 'Loses things necessary for tasks or activities (school materials, toys)',
    category: 'inattention',
    source: 'DSM-5 Criterion A7'
  },
  {
    id: 'child_8',
    text: 'Is easily distracted by extraneous stimuli',
    category: 'inattention',
    source: 'DSM-5 Criterion A8',
    weight: 1.2
  },
  {
    id: 'child_9',
    text: 'Is forgetful in daily activities',
    category: 'inattention',
    source: 'DSM-5 Criterion A9'
  },

  // Hyperactivity-Impulsivity Symptoms (DSM-5 based)
  {
    id: 'child_10',
    text: 'Fidgets with hands or feet or squirms in seat',
    category: 'hyperactivity',
    source: 'DSM-5 Criterion B1'
  },
  {
    id: 'child_11',
    text: 'Leaves seat in classroom or situations where remaining seated is expected',
    category: 'hyperactivity',
    source: 'DSM-5 Criterion B2',
    weight: 1.3
  },
  {
    id: 'child_12',
    text: 'Runs about or climbs excessively in inappropriate situations',
    category: 'hyperactivity',
    source: 'DSM-5 Criterion B3'
  },
  {
    id: 'child_13',
    text: 'Has difficulty playing or engaging in leisure activities quietly',
    category: 'hyperactivity',
    source: 'DSM-5 Criterion B4'
  },
  {
    id: 'child_14',
    text: 'Is "on the go" or acts as if "driven by a motor"',
    category: 'hyperactivity',
    source: 'DSM-5 Criterion B5',
    weight: 1.2
  },
  {
    id: 'child_15',
    text: 'Talks excessively',
    category: 'hyperactivity',
    source: 'DSM-5 Criterion B6'
  },
  {
    id: 'child_16',
    text: 'Blurts out answers before questions have been completed',
    category: 'impulsivity',
    source: 'DSM-5 Criterion B7',
    weight: 1.1
  },
  {
    id: 'child_17',
    text: 'Has difficulty waiting their turn',
    category: 'impulsivity',
    source: 'DSM-5 Criterion B8'
  },
  {
    id: 'child_18',
    text: 'Interrupts or intrudes on others (butts into conversations/games)',
    category: 'impulsivity',
    source: 'DSM-5 Criterion B9',
    weight: 1.2
  }
];

// Teen Assessment (13-17 years) - Self Report + Parent Input
export const teenQuestions: Question[] = [
  // All DSM-5 criteria plus additional functional impairment questions
  ...childQuestions.map(q => ({
    ...q,
    id: q.id.replace('child_', 'teen_'),
    text: q.text.replace(/schoolwork|school materials/, 'homework or assignments')
  })),
  
  // Additional teen-specific questions (Vanderbilt & Conners' based)
  {
    id: 'teen_19',
    text: 'Has difficulty completing homework assignments on time',
    category: 'functional_impairment',
    source: 'Vanderbilt Assessment Scale'
  },
  {
    id: 'teen_20',
    text: 'Has problems with relationships with peers',
    category: 'functional_impairment',
    source: 'Conners\' Rating Scale'
  },
  {
    id: 'teen_21',
    text: 'Has difficulty following rules or instructions at school',
    category: 'functional_impairment',
    source: 'Vanderbilt Assessment Scale'
  },
  {
    id: 'teen_22',
    text: 'Gets into trouble for not following directions',
    category: 'functional_impairment',
    source: 'Conners\' Rating Scale'
  },
  {
    id: 'teen_23',
    text: 'Has difficulty managing time and meeting deadlines',
    category: 'functional_impairment',
    source: 'ADHD Rating Scale'
  },
  {
    id: 'teen_24',
    text: 'Procrastinates or puts off doing things until the last minute',
    category: 'functional_impairment',
    source: 'Clinical observation criteria'
  }
];

// Adult Assessment (18+ years) - ASRS-v1.1 based
export const adultQuestions: Question[] = [
  // ASRS-v1.1 Part A (6 most predictive questions)
  {
    id: 'adult_1',
    text: 'How often do you have trouble wrapping up final details of a project, once the challenging parts have been done?',
    category: 'inattention',
    source: 'ASRS-v1.1 Part A, Question 1',
    weight: 1.5
  },
  {
    id: 'adult_2',
    text: 'How often do you have difficulty getting things in order when you have to do a task that requires organization?',
    category: 'inattention',
    source: 'ASRS-v1.1 Part A, Question 2',
    weight: 1.4
  },
  {
    id: 'adult_3',
    text: 'How often do you have problems remembering appointments or obligations?',
    category: 'inattention',
    source: 'ASRS-v1.1 Part A, Question 3',
    weight: 1.3
  },
  {
    id: 'adult_4',
    text: 'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
    category: 'inattention',
    source: 'ASRS-v1.1 Part A, Question 4',
    weight: 1.4
  },
  {
    id: 'adult_5',
    text: 'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
    category: 'hyperactivity',
    source: 'ASRS-v1.1 Part A, Question 5',
    weight: 1.2
  },
  {
    id: 'adult_6',
    text: 'How often do you feel overly active and compelled to do things, like you were driven by a motor?',
    category: 'hyperactivity',
    source: 'ASRS-v1.1 Part A, Question 6',
    weight: 1.5
  },

  // ASRS-v1.1 Part B (Additional questions)
  {
    id: 'adult_7',
    text: 'How often do you make careless mistakes when you have to work on a boring or difficult project?',
    category: 'inattention',
    source: 'ASRS-v1.1 Part B, Question 1'
  },
  {
    id: 'adult_8',
    text: 'How often do you have difficulty keeping your attention when you are doing boring or repetitive work?',
    category: 'inattention',
    source: 'ASRS-v1.1 Part B, Question 2'
  },
  {
    id: 'adult_9',
    text: 'How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?',
    category: 'inattention',
    source: 'ASRS-v1.1 Part B, Question 3'
  },
  {
    id: 'adult_10',
    text: 'How often do you misplace or have difficulty finding things at home or at work?',
    category: 'inattention',
    source: 'ASRS-v1.1 Part B, Question 4'
  },
  {
    id: 'adult_11',
    text: 'How often are you distracted by activity or noise around you?',
    category: 'inattention',
    source: 'ASRS-v1.1 Part B, Question 5'
  },
  {
    id: 'adult_12',
    text: 'How often do you leave your seat in meetings or other situations where you are expected to remain seated?',
    category: 'hyperactivity',
    source: 'ASRS-v1.1 Part B, Question 6'
  },
  {
    id: 'adult_13',
    text: 'How often do you feel restless or fidgety?',
    category: 'hyperactivity',
    source: 'ASRS-v1.1 Part B, Question 7'
  },
  {
    id: 'adult_14',
    text: 'How often do you have difficulty unwinding and relaxing when you have time to yourself?',
    category: 'hyperactivity',
    source: 'ASRS-v1.1 Part B, Question 8'
  },
  {
    id: 'adult_15',
    text: 'How often do you find yourself talking too much when you are in social situations?',
    category: 'hyperactivity',
    source: 'ASRS-v1.1 Part B, Question 9'
  },
  {
    id: 'adult_16',
    text: 'When you\'re in a conversation, how often do you find yourself finishing the sentences of the people you are talking to, before they can finish them themselves?',
    category: 'impulsivity',
    source: 'ASRS-v1.1 Part B, Question 10'
  },
  {
    id: 'adult_17',
    text: 'How often do you have difficulty waiting your turn in situations when turn taking is required?',
    category: 'impulsivity',
    source: 'ASRS-v1.1 Part B, Question 11'
  },
  {
    id: 'adult_18',
    text: 'How often do you interrupt others when they are busy?',
    category: 'impulsivity',
    source: 'ASRS-v1.1 Part B, Question 12'
  },

  // Additional functional impairment questions
  {
    id: 'adult_19',
    text: 'How often do you have problems at work or school because of difficulty concentrating?',
    category: 'functional_impairment',
    source: 'Clinical assessment criteria'
  },
  {
    id: 'adult_20',
    text: 'How often do you have relationship problems because of not completing tasks or not following through?',
    category: 'functional_impairment',
    source: 'Clinical assessment criteria'
  },
  {
    id: 'adult_21',
    text: 'How often do you avoid social activities because you worry about your behavior or attention problems?',
    category: 'functional_impairment',
    source: 'Clinical assessment criteria'
  },
  {
    id: 'adult_22',
    text: 'How often do you feel overwhelmed by daily tasks and responsibilities?',
    category: 'functional_impairment',
    source: 'Clinical assessment criteria'
  },
  {
    id: 'adult_23',
    text: 'How often do you start multiple projects but struggle to complete them?',
    category: 'functional_impairment',
    source: 'Clinical assessment criteria'
  },
  {
    id: 'adult_24',
    text: 'How often do you have trouble managing money, paying bills, or meeting financial obligations on time?',
    category: 'functional_impairment',
    source: 'Clinical assessment criteria'
  },
  {
    id: 'adult_25',
    text: 'How often do you lose track of time and arrive late to appointments or meetings?',
    category: 'functional_impairment',
    source: 'Clinical assessment criteria'
  },
  {
    id: 'adult_26',
    text: 'How often do you make impulsive decisions that you later regret?',
    category: 'functional_impairment',
    source: 'Clinical assessment criteria'
  },
  {
    id: 'adult_27',
    text: 'How often do you have difficulty sleeping due to racing thoughts or restlessness?',
    category: 'functional_impairment',
    source: 'Clinical assessment criteria'
  },
  {
    id: 'adult_28',
    text: 'How often do childhood memories suggest you had attention or hyperactivity problems before age 12?',
    category: 'functional_impairment',
    source: 'DSM-5 Criterion B (Childhood onset)',
    weight: 1.3
  }
];

export const getQuestionsForAge = (ageGroup: 'child' | 'teen' | 'adult') => {
  switch (ageGroup) {
    case 'child':
      return childQuestions;
    case 'teen':
      return teenQuestions;
    case 'adult':
      return adultQuestions;
    default:
      return [];
  }
};