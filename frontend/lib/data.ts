export type SetData = { reps: number; weight: number; done: boolean; prev: number };
export type Exercise = { id: string; name: string; muscle: string; rest: number; sets: SetData[] };
export type Workout = {
  id: string; name: string; code: string;
  duration: number; exercises: number; sets: number; volume: number;
  tags: string[]; schedule: string; lastDone: string;
  items: Exercise[];
};

export const WORKOUTS: Workout[] = [
  {
    id: 'push', name: 'Peito & Tríceps', code: 'A',
    duration: 58, exercises: 6, sets: 22, volume: 4280,
    tags: ['Força', 'Hipertrofia'], schedule: 'Seg · Qui', lastDone: '2 dias',
    items: [
      { id: 'e1', name: 'Supino reto', muscle: 'Peitoral', rest: 90, sets: [
        { reps: 10, weight: 60, done: true, prev: 55 },
        { reps: 10, weight: 65, done: true, prev: 60 },
        { reps: 8, weight: 70, done: true, prev: 65 },
        { reps: 6, weight: 72.5, done: false, prev: 67.5 },
      ]},
      { id: 'e2', name: 'Supino inclinado halteres', muscle: 'Peitoral superior', rest: 75, sets: [
        { reps: 12, weight: 22, done: false, prev: 20 },
        { reps: 10, weight: 24, done: false, prev: 22 },
        { reps: 8, weight: 26, done: false, prev: 24 },
      ]},
      { id: 'e3', name: 'Crucifixo na polia', muscle: 'Peitoral', rest: 60, sets: [
        { reps: 12, weight: 15, done: false, prev: 14 },
        { reps: 12, weight: 15, done: false, prev: 14 },
        { reps: 12, weight: 15, done: false, prev: 14 },
      ]},
      { id: 'e4', name: 'Tríceps na corda', muscle: 'Tríceps', rest: 60, sets: [
        { reps: 12, weight: 25, done: false, prev: 22 },
        { reps: 10, weight: 27.5, done: false, prev: 25 },
        { reps: 10, weight: 27.5, done: false, prev: 25 },
      ]},
      { id: 'e5', name: 'Tríceps francês', muscle: 'Tríceps longo', rest: 60, sets: [
        { reps: 10, weight: 18, done: false, prev: 16 },
        { reps: 10, weight: 18, done: false, prev: 16 },
        { reps: 10, weight: 18, done: false, prev: 16 },
      ]},
      { id: 'e6', name: 'Mergulho', muscle: 'Tríceps · Peito', rest: 75, sets: [
        { reps: 12, weight: 0, done: false, prev: 0 },
        { reps: 10, weight: 0, done: false, prev: 0 },
        { reps: 8, weight: 0, done: false, prev: 0 },
      ]},
    ],
  },
  {
    id: 'pull', name: 'Costas & Bíceps', code: 'B',
    duration: 62, exercises: 6, sets: 21, volume: 4920,
    tags: ['Força', 'Hipertrofia'], schedule: 'Ter · Sex', lastDone: '1 dia', items: [],
  },
  {
    id: 'legs', name: 'Pernas & Glúteos', code: 'C',
    duration: 72, exercises: 7, sets: 25, volume: 6100,
    tags: ['Força', 'Volume'], schedule: 'Qua · Sáb', lastDone: '4 dias', items: [],
  },
  {
    id: 'shoulders', name: 'Ombros & Core', code: 'D',
    duration: 45, exercises: 5, sets: 18, volume: 2840,
    tags: ['Acessório'], schedule: 'Opcional', lastDone: '6 dias', items: [],
  },
];

export const WEEKLY_VOLUME = [12400,13200,12800,14100,15200,14800,16100,16800,16200,17400,18100,17900,19200,19800];
export const BENCH_PROGRESS  = [60,60,62.5,62.5,65,65,67.5,65,67.5,70,70,72.5];
export const SQUAT_PROGRESS  = [80,82.5,85,85,87.5,90,90,92.5,95,95,97.5,100];
export const DEADLIFT_PROGRESS = [100,105,105,110,110,115,115,120,120,122.5,125,130];
export const BODY_WEIGHT = [78.2,78.0,78.4,78.1,77.8,77.5,77.2,76.9];
export const BODY_FAT    = [18.2,18.0,17.8,17.5,17.2,17.0,16.7,16.4];

export const HISTORY_30: (string | null)[] = [
  null,'A',null,'B',null,'C',null,'A',null,'B',null,null,'C','D',null,'A',null,'B',null,'C',
  null,null,'A','B',null,'C',null,'A','B','C',null,null,null,null,'A',
];

export const PRS = [
  { exercise: 'Supino reto',       weight: 72.5, reps: 6, date: 'Há 2 dias',      delta: '+2.5kg' },
  { exercise: 'Agachamento',       weight: 100,  reps: 5, date: 'Semana passada',  delta: '+2.5kg' },
  { exercise: 'Levantamento terra',weight: 130,  reps: 3, date: 'Há 5 dias',      delta: '+5kg'   },
  { exercise: 'Desenvolvimento',   weight: 50,   reps: 8, date: 'Há 9 dias',      delta: '+2.5kg' },
  { exercise: 'Remada curvada',    weight: 75,   reps: 8, date: 'Há 12 dias',     delta: '+2.5kg' },
];
