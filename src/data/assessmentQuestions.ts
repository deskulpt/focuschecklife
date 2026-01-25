// Research-based ADHD assessment questions derived from validated clinical tools
// Sources: DSM-5, Conners' Rating Scales, ADHD-RS, ASRS-v1.1, Vanderbilt Assessment Scales

export interface Question {
  id: string;
  text: {
    en: string;
    'pt-BR': string;
  };
  category: 'inattention' | 'hyperactivity' | 'impulsivity' | 'functional_impairment';
  source: string;
  weight?: number;
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
  {
    id: 'child_1',
    text: {
      en: 'Fails to give close attention to details or makes careless mistakes in schoolwork',
      'pt-BR': 'Não presta atenção a detalhes ou comete erros por descuido nos trabalhos escolares'
    },
    category: 'inattention',
    source: 'DSM-5 Criterion A1',
    weight: 1.2
  },
  {
    id: 'child_2',
    text: {
      en: 'Has difficulty sustaining attention in tasks or play activities',
      'pt-BR': 'Tem dificuldade em manter a atenção em tarefas ou atividades lúdicas'
    },
    category: 'inattention',
    source: 'DSM-5 Criterion A2',
    weight: 1.3
  },
  {
    id: 'child_3',
    text: {
      en: 'Does not seem to listen when spoken to directly',
      'pt-BR': 'Parece não ouvir quando falam diretamente com ele/ela'
    },
    category: 'inattention',
    source: 'DSM-5 Criterion A3'
  },
  {
    id: 'child_4',
    text: {
      en: 'Does not follow through on instructions and fails to finish schoolwork or chores',
      'pt-BR': 'Não segue instruções e não termina trabalhos escolares ou tarefas domésticas'
    },
    category: 'inattention',
    source: 'DSM-5 Criterion A4'
  },
  {
    id: 'child_5',
    text: {
      en: 'Has difficulty organizing tasks and activities',
      'pt-BR': 'Tem dificuldade em organizar tarefas e atividades'
    },
    category: 'inattention',
    source: 'DSM-5 Criterion A5'
  },
  {
    id: 'child_6',
    text: {
      en: 'Avoids or dislikes tasks requiring sustained mental effort (like homework)',
      'pt-BR': 'Evita ou reluta em se envolver em tarefas que exijam esforço mental prolongado (como lições de casa)'
    },
    category: 'inattention',
    source: 'DSM-5 Criterion A6',
    weight: 1.1
  },
  {
    id: 'child_7',
    text: {
      en: 'Loses things necessary for tasks or activities (school materials, toys)',
      'pt-BR': 'Perde objetos necessários para tarefas ou atividades (materiais escolares, brinquedos)'
    },
    category: 'inattention',
    source: 'DSM-5 Criterion A7'
  },
  {
    id: 'child_8',
    text: {
      en: 'Is easily distracted by extraneous stimuli',
      'pt-BR': 'É facilmente distraído por estímulos externos'
    },
    category: 'inattention',
    source: 'DSM-5 Criterion A8',
    weight: 1.2
  },
  {
    id: 'child_9',
    text: {
      en: 'Is forgetful in daily activities',
      'pt-BR': 'É esquecido nas atividades do dia a dia'
    },
    category: 'inattention',
    source: 'DSM-5 Criterion A9'
  },
  {
    id: 'child_10',
    text: {
      en: 'Fidgets with hands or feet or squirms in seat',
      'pt-BR': 'Mexe as mãos ou os pés ou se contorce na cadeira'
    },
    category: 'hyperactivity',
    source: 'DSM-5 Criterion B1'
  },
  {
    id: 'child_11',
    text: {
      en: 'Leaves seat in classroom or situations where remaining seated is expected',
      'pt-BR': 'Levanta da cadeira na sala de aula ou em situações onde se espera que permaneça sentado'
    },
    category: 'hyperactivity',
    source: 'DSM-5 Criterion B2',
    weight: 1.3
  },
  {
    id: 'child_12',
    text: {
      en: 'Runs about or climbs excessively in inappropriate situations',
      'pt-BR': 'Corre ou escala em situações inadequadas'
    },
    category: 'hyperactivity',
    source: 'DSM-5 Criterion B3'
  },
  {
    id: 'child_13',
    text: {
      en: 'Has difficulty playing or engaging in leisure activities quietly',
      'pt-BR': 'Tem dificuldade em brincar ou se envolver em atividades de lazer calmamente'
    },
    category: 'hyperactivity',
    source: 'DSM-5 Criterion B4'
  },
  {
    id: 'child_14',
    text: {
      en: 'Is "on the go" or acts as if "driven by a motor"',
      'pt-BR': 'Está sempre "a mil" ou age como se estivesse "ligado a um motor"'
    },
    category: 'hyperactivity',
    source: 'DSM-5 Criterion B5',
    weight: 1.2
  },
  {
    id: 'child_15',
    text: {
      en: 'Talks excessively',
      'pt-BR': 'Fala excessivamente'
    },
    category: 'hyperactivity',
    source: 'DSM-5 Criterion B6'
  },
  {
    id: 'child_16',
    text: {
      en: 'Blurts out answers before questions have been completed',
      'pt-BR': 'Dá respostas precipitadas antes que as perguntas tenham sido completadas'
    },
    category: 'impulsivity',
    source: 'DSM-5 Criterion B7',
    weight: 1.1
  },
  {
    id: 'child_17',
    text: {
      en: 'Has difficulty waiting their turn',
      'pt-BR': 'Tem dificuldade em esperar sua vez'
    },
    category: 'impulsivity',
    source: 'DSM-5 Criterion B8'
  },
  {
    id: 'child_18',
    text: {
      en: 'Interrupts or intrudes on others (butts into conversations/games)',
      'pt-BR': 'Interrompe ou se intromete (intromete-se em conversas ou jogos)'
    },
    category: 'impulsivity',
    source: 'DSM-5 Criterion B9',
    weight: 1.2
  }
];

// Teen Assessment (13-17 years) - Self Report + Parent Input
export const teenQuestions: Question[] = [
  ...childQuestions.map(q => ({
    ...q,
    id: q.id.replace('child_', 'teen_'),
    text: {
      en: q.text.en.replace(/schoolwork|school materials/, 'homework or assignments'),
      'pt-BR': q.text['pt-BR'].replace(/trabalhos escolares|materiais escolares/, 'deveres de casa ou tarefas')
    }
  })),
  {
    id: 'teen_19',
    text: {
      en: 'Has difficulty completing homework assignments on time',
      'pt-BR': 'Tem dificuldade em completar tarefas de casa no prazo'
    },
    category: 'functional_impairment',
    source: 'Vanderbilt Assessment Scale'
  },
  {
    id: 'teen_20',
    text: {
      en: 'Has problems with relationships with peers',
      'pt-BR': 'Tem problemas de relacionamento com colegas'
    },
    category: 'functional_impairment',
    source: "Conners' Rating Scale"
  },
  {
    id: 'teen_21',
    text: {
      en: 'Has difficulty following rules or instructions at school',
      'pt-BR': 'Tem dificuldade em seguir regras ou instruções na escola'
    },
    category: 'functional_impairment',
    source: 'Vanderbilt Assessment Scale'
  },
  {
    id: 'teen_22',
    text: {
      en: 'Gets into trouble for not following directions',
      'pt-BR': 'Tem problemas por não seguir instruções'
    },
    category: 'functional_impairment',
    source: "Conners' Rating Scale"
  },
  {
    id: 'teen_23',
    text: {
      en: 'Has difficulty managing time and meeting deadlines',
      'pt-BR': 'Tem dificuldade em gerenciar o tempo e cumprir prazos'
    },
    category: 'functional_impairment',
    source: 'ADHD Rating Scale'
  },
  {
    id: 'teen_24',
    text: {
      en: 'Procrastinates or puts off doing things until the last minute',
      'pt-BR': 'Procrastina ou deixa as coisas para a última hora'
    },
    category: 'functional_impairment',
    source: 'Clinical observation criteria'
  }
];

// Adult Assessment (18+ years) - ASRS-v1.1 based
export const adultQuestions: Question[] = [
  {
    id: 'adult_1',
    text: {
      en: 'How often do you have trouble wrapping up final details of a project, once the challenging parts have been done?',
      'pt-BR': 'Com que frequência você tem dificuldade em finalizar os detalhes finais de um projeto, depois que as partes desafiadoras foram concluídas?'
    },
    category: 'inattention',
    source: 'ASRS-v1.1 Part A, Question 1',
    weight: 1.5
  },
  {
    id: 'adult_2',
    text: {
      en: 'How often do you have difficulty getting things in order when you have to do a task that requires organization?',
      'pt-BR': 'Com que frequência você tem dificuldade em organizar as coisas quando precisa fazer uma tarefa que requer organização?'
    },
    category: 'inattention',
    source: 'ASRS-v1.1 Part A, Question 2',
    weight: 1.4
  },
  {
    id: 'adult_3',
    text: {
      en: 'How often do you have problems remembering appointments or obligations?',
      'pt-BR': 'Com que frequência você tem problemas para lembrar de compromissos ou obrigações?'
    },
    category: 'inattention',
    source: 'ASRS-v1.1 Part A, Question 3',
    weight: 1.3
  },
  {
    id: 'adult_4',
    text: {
      en: 'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
      'pt-BR': 'Quando você tem uma tarefa que requer muito pensamento, com que frequência você evita ou adia começar?'
    },
    category: 'inattention',
    source: 'ASRS-v1.1 Part A, Question 4',
    weight: 1.4
  },
  {
    id: 'adult_5',
    text: {
      en: 'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
      'pt-BR': 'Com que frequência você fica inquieto ou se contorce com as mãos ou pés quando precisa ficar sentado por muito tempo?'
    },
    category: 'hyperactivity',
    source: 'ASRS-v1.1 Part A, Question 5',
    weight: 1.2
  },
  {
    id: 'adult_6',
    text: {
      en: 'How often do you feel overly active and compelled to do things, like you were driven by a motor?',
      'pt-BR': 'Com que frequência você se sente excessivamente ativo e compelido a fazer coisas, como se estivesse ligado a um motor?'
    },
    category: 'hyperactivity',
    source: 'ASRS-v1.1 Part A, Question 6',
    weight: 1.5
  },
  {
    id: 'adult_7',
    text: {
      en: 'How often do you make careless mistakes when you have to work on a boring or difficult project?',
      'pt-BR': 'Com que frequência você comete erros por descuido quando trabalha em um projeto chato ou difícil?'
    },
    category: 'inattention',
    source: 'ASRS-v1.1 Part B, Question 1'
  },
  {
    id: 'adult_8',
    text: {
      en: 'How often do you have difficulty keeping your attention when you are doing boring or repetitive work?',
      'pt-BR': 'Com que frequência você tem dificuldade em manter a atenção quando está fazendo um trabalho chato ou repetitivo?'
    },
    category: 'inattention',
    source: 'ASRS-v1.1 Part B, Question 2'
  },
  {
    id: 'adult_9',
    text: {
      en: 'How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?',
      'pt-BR': 'Com que frequência você tem dificuldade em se concentrar no que as pessoas dizem, mesmo quando estão falando diretamente com você?'
    },
    category: 'inattention',
    source: 'ASRS-v1.1 Part B, Question 3'
  },
  {
    id: 'adult_10',
    text: {
      en: 'How often do you misplace or have difficulty finding things at home or at work?',
      'pt-BR': 'Com que frequência você perde ou tem dificuldade em encontrar coisas em casa ou no trabalho?'
    },
    category: 'inattention',
    source: 'ASRS-v1.1 Part B, Question 4'
  },
  {
    id: 'adult_11',
    text: {
      en: 'How often are you distracted by activity or noise around you?',
      'pt-BR': 'Com que frequência você se distrai com atividades ou barulho ao seu redor?'
    },
    category: 'inattention',
    source: 'ASRS-v1.1 Part B, Question 5'
  },
  {
    id: 'adult_12',
    text: {
      en: 'How often do you leave your seat in meetings or other situations where you are expected to remain seated?',
      'pt-BR': 'Com que frequência você se levanta em reuniões ou outras situações onde se espera que permaneça sentado?'
    },
    category: 'hyperactivity',
    source: 'ASRS-v1.1 Part B, Question 6'
  },
  {
    id: 'adult_13',
    text: {
      en: 'How often do you feel restless or fidgety?',
      'pt-BR': 'Com que frequência você se sente inquieto ou agitado?'
    },
    category: 'hyperactivity',
    source: 'ASRS-v1.1 Part B, Question 7'
  },
  {
    id: 'adult_14',
    text: {
      en: 'How often do you have difficulty unwinding and relaxing when you have time to yourself?',
      'pt-BR': 'Com que frequência você tem dificuldade em relaxar quando tem tempo livre?'
    },
    category: 'hyperactivity',
    source: 'ASRS-v1.1 Part B, Question 8'
  },
  {
    id: 'adult_15',
    text: {
      en: 'How often do you find yourself talking too much when you are in social situations?',
      'pt-BR': 'Com que frequência você percebe que fala demais em situações sociais?'
    },
    category: 'hyperactivity',
    source: 'ASRS-v1.1 Part B, Question 9'
  },
  {
    id: 'adult_16',
    text: {
      en: "When you're in a conversation, how often do you find yourself finishing the sentences of the people you are talking to, before they can finish them themselves?",
      'pt-BR': 'Quando está em uma conversa, com que frequência você se pega completando as frases das pessoas antes que elas possam terminá-las?'
    },
    category: 'impulsivity',
    source: 'ASRS-v1.1 Part B, Question 10'
  },
  {
    id: 'adult_17',
    text: {
      en: 'How often do you have difficulty waiting your turn in situations when turn taking is required?',
      'pt-BR': 'Com que frequência você tem dificuldade em esperar sua vez em situações que requerem isso?'
    },
    category: 'impulsivity',
    source: 'ASRS-v1.1 Part B, Question 11'
  },
  {
    id: 'adult_18',
    text: {
      en: 'How often do you interrupt others when they are busy?',
      'pt-BR': 'Com que frequência você interrompe os outros quando estão ocupados?'
    },
    category: 'impulsivity',
    source: 'ASRS-v1.1 Part B, Question 12'
  },
  {
    id: 'adult_19',
    text: {
      en: 'How often do you have problems at work or school because of difficulty concentrating?',
      'pt-BR': 'Com que frequência você tem problemas no trabalho ou escola por dificuldade de concentração?'
    },
    category: 'functional_impairment',
    source: 'Clinical assessment criteria'
  },
  {
    id: 'adult_20',
    text: {
      en: 'How often do you have relationship problems because of not completing tasks or not following through?',
      'pt-BR': 'Com que frequência você tem problemas de relacionamento por não completar tarefas ou não cumprir compromissos?'
    },
    category: 'functional_impairment',
    source: 'Clinical assessment criteria'
  },
  {
    id: 'adult_21',
    text: {
      en: 'How often do you avoid social activities because you worry about your behavior or attention problems?',
      'pt-BR': 'Com que frequência você evita atividades sociais por se preocupar com seu comportamento ou problemas de atenção?'
    },
    category: 'functional_impairment',
    source: 'Clinical assessment criteria'
  },
  {
    id: 'adult_22',
    text: {
      en: 'How often do you feel overwhelmed by daily tasks and responsibilities?',
      'pt-BR': 'Com que frequência você se sente sobrecarregado por tarefas e responsabilidades diárias?'
    },
    category: 'functional_impairment',
    source: 'Clinical assessment criteria'
  },
  {
    id: 'adult_23',
    text: {
      en: 'How often do you start multiple projects but struggle to complete them?',
      'pt-BR': 'Com que frequência você começa vários projetos, mas tem dificuldade em completá-los?'
    },
    category: 'functional_impairment',
    source: 'Clinical assessment criteria'
  },
  {
    id: 'adult_24',
    text: {
      en: 'How often do you have trouble managing money, paying bills, or meeting financial obligations on time?',
      'pt-BR': 'Com que frequência você tem problemas para gerenciar dinheiro, pagar contas ou cumprir obrigações financeiras no prazo?'
    },
    category: 'functional_impairment',
    source: 'Clinical assessment criteria'
  },
  {
    id: 'adult_25',
    text: {
      en: 'How often do you lose track of time and arrive late to appointments or meetings?',
      'pt-BR': 'Com que frequência você perde a noção do tempo e chega atrasado a compromissos ou reuniões?'
    },
    category: 'functional_impairment',
    source: 'Clinical assessment criteria'
  },
  {
    id: 'adult_26',
    text: {
      en: 'How often do you make impulsive decisions that you later regret?',
      'pt-BR': 'Com que frequência você toma decisões impulsivas das quais se arrepende depois?'
    },
    category: 'functional_impairment',
    source: 'Clinical assessment criteria'
  },
  {
    id: 'adult_27',
    text: {
      en: 'How often do you have difficulty sleeping due to racing thoughts or restlessness?',
      'pt-BR': 'Com que frequência você tem dificuldade para dormir devido a pensamentos acelerados ou inquietação?'
    },
    category: 'functional_impairment',
    source: 'Clinical assessment criteria'
  },
  {
    id: 'adult_28',
    text: {
      en: 'How often do childhood memories suggest you had attention or hyperactivity problems before age 12?',
      'pt-BR': 'Com que frequência suas memórias de infância sugerem que você tinha problemas de atenção ou hiperatividade antes dos 12 anos?'
    },
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
