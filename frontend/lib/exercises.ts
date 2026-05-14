export interface ExerciseSuggestion {
  name: string;
  muscle: string;
  group: string;
  defaultSets: number;
  defaultReps: number;
  defaultWeight: number;
  defaultRest: number;
  tips: string;
}

export const MUSCLE_GROUPS = [
  "Peito",
  "Costas",
  "Ombros",
  "Bíceps",
  "Tríceps",
  "Pernas",
  "Glúteos",
  "Abdômen",
  "Panturrilha",
] as const;

// Array mutável para uso nos modais (sem `as const`)
export const ALL_GROUPS = [
  "Peito", "Costas", "Ombros", "Bíceps", "Tríceps",
  "Pernas", "Glúteos", "Abdômen", "Panturrilha",
];

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const EXERCISE_CATALOG: ExerciseSuggestion[] = [
  // ── PEITO ──────────────────────────────────────────────────────────────
  { name: "Supino Reto com Barra",      group: "Peito", muscle: "Peitoral maior (porção médio)", defaultSets: 4, defaultReps: 8,  defaultWeight: 60, defaultRest: 90, tips: "Mantenha os cotovelos a ~45° do tronco. Desça a barra até tocar levemente o peito." },
  { name: "Supino Inclinado com Barra", group: "Peito", muscle: "Peitoral maior (porção superior)", defaultSets: 4, defaultReps: 8,  defaultWeight: 50, defaultRest: 90, tips: "Banco a 30–45°. Foco na porção clavicular do peitoral." },
  { name: "Supino Declinado com Barra", group: "Peito", muscle: "Peitoral maior (porção inferior)", defaultSets: 3, defaultReps: 10, defaultWeight: 55, defaultRest: 90, tips: "Banco em declive de 15–30°. Cuidado com a pressão no pescoço." },
  { name: "Supino Reto com Halteres",   group: "Peito", muscle: "Peitoral maior (porção médio)", defaultSets: 4, defaultReps: 10, defaultWeight: 24, defaultRest: 75, tips: "Amplitude maior que a barra. Cotovelos paralelos ao chão no ponto baixo." },
  { name: "Crucifixo com Halteres",     group: "Peito", muscle: "Peitoral maior (ênfase no alongamento)", defaultSets: 3, defaultReps: 12, defaultWeight: 14, defaultRest: 60, tips: "Leve flexão nos cotovelos. Sinta o alongamento, não a dor." },
  { name: "Crossover no Cabo",          group: "Peito", muscle: "Peitoral maior (ênfase no encurtamento)", defaultSets: 3, defaultReps: 15, defaultWeight: 12, defaultRest: 60, tips: "Cruce os punhos no final para máxima contração. Controle a volta." },
  { name: "Flexão de Braço",            group: "Peito", muscle: "Peitoral + Tríceps", defaultSets: 3, defaultReps: 15, defaultWeight: 0, defaultRest: 60, tips: "Corpo reto como prancha. Cotovelos a ~45° do tronco." },
  { name: "Peck Deck (Voador)",         group: "Peito", muscle: "Peitoral maior (isolamento)", defaultSets: 3, defaultReps: 15, defaultWeight: 40, defaultRest: 60, tips: "Não hiper-estenda os cotovelos. Pausa de 1s na contração máxima." },
  { name: "Supino Inclinado com Halteres", group: "Peito", muscle: "Peitoral superior", defaultSets: 4, defaultReps: 10, defaultWeight: 20, defaultRest: 75, tips: "Banco a 30°. Foco em empurrar para cima e levemente para dentro." },

  // ── COSTAS ─────────────────────────────────────────────────────────────
  { name: "Puxada Frontal (Pulley)",    group: "Costas", muscle: "Grande dorsal", defaultSets: 4, defaultReps: 10, defaultWeight: 60, defaultRest: 90, tips: "Puxe até o queixo. Cotovel os para baixo e para trás. Não balance o tronco." },
  { name: "Remada Curvada com Barra",   group: "Costas", muscle: "Grande dorsal + Romboides", defaultSets: 4, defaultReps: 8,  defaultWeight: 50, defaultRest: 90, tips: "Tronco a ~45°. Puxe o cotovelo para trás e para cima. Escápulas juntas no topo." },
  { name: "Remada Unilateral com Haltere", group: "Costas", muscle: "Grande dorsal + Romboides", defaultSets: 3, defaultReps: 10, defaultWeight: 20, defaultRest: 75, tips: "Apoie uma mão no banco. Puxe o cotovelo reto para cima." },
  { name: "Levantamento Terra",         group: "Costas", muscle: "Eretores da espinha + Lombar", defaultSets: 4, defaultReps: 5,  defaultWeight: 80, defaultRest: 120, tips: "Coluna neutra. Empurre o chão com os pés, não puxe a barra para cima." },
  { name: "Barra Fixa",                 group: "Costas", muscle: "Grande dorsal (peso corporal)", defaultSets: 4, defaultReps: 8,  defaultWeight: 0, defaultRest: 90, tips: "Pegada supinada ativa mais bíceps; pronada ativa mais dorsal." },
  { name: "Serrote com Haltere",        group: "Costas", muscle: "Grande dorsal (unilateral)", defaultSets: 3, defaultReps: 12, defaultWeight: 18, defaultRest: 60, tips: "Cotovelo colado ao tronco na subida. Rotação leve do tronco é OK." },
  { name: "Remada no Cabo (Seated Row)", group: "Costas", muscle: "Grande dorsal + Romboides", defaultSets: 3, defaultReps: 12, defaultWeight: 55, defaultRest: 75, tips: "Peito para frente. Puxe o manípulo até o umbigo." },
  { name: "Pullover com Haltere",       group: "Costas", muscle: "Grande dorsal + Serrilhado", defaultSets: 3, defaultReps: 12, defaultWeight: 16, defaultRest: 60, tips: "Braços levemente fletidos. Desça até sentir o alongamento da axila." },
  { name: "Good Morning",               group: "Costas", muscle: "Isquiotibiais + Eretores", defaultSets: 3, defaultReps: 10, defaultWeight: 30, defaultRest: 75, tips: "Barra nos trapézios. Incline o tronco à frente mantendo as costas retas." },

  // ── OMBROS ─────────────────────────────────────────────────────────────
  { name: "Desenvolvimento com Barra",  group: "Ombros", muscle: "Deltóide (porção anterior + medial)", defaultSets: 4, defaultReps: 8,  defaultWeight: 40, defaultRest: 90, tips: "Empurre a barra em linha reta sobre a cabeça. Não arquee a lombar." },
  { name: "Desenvolvimento com Halteres", group: "Ombros", muscle: "Deltóide (ênfase medial)", defaultSets: 3, defaultReps: 10, defaultWeight: 14, defaultRest: 75, tips: "Cotovelos a 90° no início. Suba até os braços ficarem quase retos." },
  { name: "Elevação Lateral com Halteres", group: "Ombros", muscle: "Deltóide medial", defaultSets: 4, defaultReps: 15, defaultWeight: 8, defaultRest: 60, tips: "Leve inclinação do tronco para frente. Polegar levemente para baixo no topo." },
  { name: "Elevação Frontal com Halteres", group: "Ombros", muscle: "Deltóide anterior", defaultSets: 3, defaultReps: 12, defaultWeight: 8, defaultRest: 60, tips: "Suba até a altura dos ombros. Evite balançar o tronco." },
  { name: "Face Pull no Cabo",          group: "Ombros", muscle: "Deltóide posterior + Manguito", defaultSets: 3, defaultReps: 15, defaultWeight: 20, defaultRest: 60, tips: "Puxe em direção ao rosto. Cotovelos acima dos ombros no final." },
  { name: "Arnold Press",               group: "Ombros", muscle: "Deltóide (3 porções)", defaultSets: 3, defaultReps: 10, defaultWeight: 12, defaultRest: 75, tips: "Inicie com as palmas para você e gire durante a extensão." },
  { name: "Encolhimento de Ombros",     group: "Ombros", muscle: "Trapézio superior", defaultSets: 4, defaultReps: 12, defaultWeight: 25, defaultRest: 60, tips: "Suba direto, sem girar. Pausa no topo por 1s." },

  // ── BÍCEPS ─────────────────────────────────────────────────────────────
  { name: "Rosca Direta com Barra",     group: "Bíceps", muscle: "Bíceps braquial (porção longa + curta)", defaultSets: 4, defaultReps: 10, defaultWeight: 30, defaultRest: 75, tips: "Cotovelos fixos ao tronco. Desça completamente para alongar." },
  { name: "Rosca Alternada com Halteres", group: "Bíceps", muscle: "Bíceps braquial + Braquiorradial", defaultSets: 3, defaultReps: 12, defaultWeight: 12, defaultRest: 60, tips: "Supine o punho na subida para máxima ativação do bíceps." },
  { name: "Rosca Martelo",              group: "Bíceps", muscle: "Braquial + Braquiorradial", defaultSets: 3, defaultReps: 12, defaultWeight: 12, defaultRest: 60, tips: "Pegada neutra (polegar para cima). Cotovelo fixo." },
  { name: "Rosca Scott",                group: "Bíceps", muscle: "Bíceps (porção curta — isolamento)", defaultSets: 3, defaultReps: 10, defaultWeight: 25, defaultRest: 75, tips: "Tríceps apoia o banco. Não solte o peso no ponto baixo — mantenha tensão." },
  { name: "Rosca Concentrada",          group: "Bíceps", muscle: "Bíceps braquial (pico)", defaultSets: 3, defaultReps: 12, defaultWeight: 10, defaultRest: 60, tips: "Cotovelo na parte interna da coxa. Gire o punho para fora no topo." },
  { name: "Rosca no Cabo",              group: "Bíceps", muscle: "Bíceps (tensão constante)", defaultSets: 3, defaultReps: 15, defaultWeight: 15, defaultRest: 60, tips: "Cabo mantem tensão no ponto baixo — vantagem sobre halteres." },

  // ── TRÍCEPS ────────────────────────────────────────────────────────────
  { name: "Tríceps Testa com Barra",    group: "Tríceps", muscle: "Tríceps braquial (3 cabeças)", defaultSets: 4, defaultReps: 10, defaultWeight: 25, defaultRest: 75, tips: "Cotovelos apontados para o teto. Desça a barra até a testa, não além." },
  { name: "Tríceps Pulley (Corda)",     group: "Tríceps", muscle: "Tríceps (cabeça lateral)", defaultSets: 4, defaultReps: 12, defaultWeight: 25, defaultRest: 60, tips: "Abra a corda na descida para maior contração. Cotovelos fixos." },
  { name: "Tríceps Francês com Haltere", group: "Tríceps", muscle: "Tríceps (cabeça longa)", defaultSets: 3, defaultReps: 12, defaultWeight: 14, defaultRest: 60, tips: "Cotovelos apontados para frente e para cima. Não deixe os cotovelos abrirem." },
  { name: "Mergulho nas Paralelas",     group: "Tríceps", muscle: "Tríceps + Peitoral inferior", defaultSets: 3, defaultReps: 10, defaultWeight: 0, defaultRest: 75, tips: "Tronco levemente inclinado para frente. Desça até 90° nos cotovelos." },
  { name: "Kickback com Haltere",       group: "Tríceps", muscle: "Tríceps (cabeça lateral — isolamento)", defaultSets: 3, defaultReps: 15, defaultWeight: 8, defaultRest: 60, tips: "Tronco paralelo ao chão. Cotovelo a 90° no início, estenda completamente." },
  { name: "Supino Fechado",             group: "Tríceps", muscle: "Tríceps + Peitoral (pegada estreita)", defaultSets: 4, defaultReps: 8,  defaultWeight: 50, defaultRest: 90, tips: "Pegada na largura dos ombros. Cotovelos colados ao tronco na descida." },

  // ── PERNAS ─────────────────────────────────────────────────────────────
  { name: "Agachamento Livre",          group: "Pernas", muscle: "Quadríceps + Glúteos + Isquiotibiais", defaultSets: 4, defaultReps: 8,  defaultWeight: 60, defaultRest: 120, tips: "Joelhos no alinhamento dos pés. Desça até as coxas paralelas ao chão." },
  { name: "Leg Press 45°",              group: "Pernas", muscle: "Quadríceps + Glúteos", defaultSets: 4, defaultReps: 10, defaultWeight: 120, defaultRest: 90, tips: "Pés na largura dos quadris. Não trave os joelhos no topo." },
  { name: "Cadeira Extensora",          group: "Pernas", muscle: "Quadríceps (isolamento)", defaultSets: 3, defaultReps: 15, defaultWeight: 50, defaultRest: 60, tips: "Estenda completamente. Pausa de 1s no topo. Desça devagar (3s)." },
  { name: "Mesa Flexora",               group: "Pernas", muscle: "Isquiotibiais (isolamento)", defaultSets: 3, defaultReps: 12, defaultWeight: 40, defaultRest: 60, tips: "Calcanhar deve atingir o glúteo. Não levante o quadril da mesa." },
  { name: "Stiff com Barra",            group: "Pernas", muscle: "Isquiotibiais + Glúteos", defaultSets: 4, defaultReps: 10, defaultWeight: 50, defaultRest: 90, tips: "Joelhos levemente flexionados. Sinta o alongamento dos isquiotibiais." },
  { name: "Agachamento Búlgaro",        group: "Pernas", muscle: "Quadríceps + Glúteos (unilateral)", defaultSets: 3, defaultReps: 10, defaultWeight: 16, defaultRest: 90, tips: "Pé traseiro apoiado num banco. Joelho da frente não ultrapasse o dedão." },
  { name: "Avanço com Halteres",        group: "Pernas", muscle: "Quadríceps + Glúteos (unilateral)", defaultSets: 3, defaultReps: 12, defaultWeight: 12, defaultRest: 75, tips: "Passo largo. Joelho traseiro quase toca o chão. Tronco ereto." },
  { name: "Leg Curl em Pé (Cabo)",      group: "Pernas", muscle: "Isquiotibiais (unilateral)", defaultSets: 3, defaultReps: 12, defaultWeight: 15, defaultRest: 60, tips: "Quadril fixo. Traga o calcanhar até o glúteo com controle." },

  // ── GLÚTEOS ────────────────────────────────────────────────────────────
  { name: "Hip Thrust com Barra",       group: "Glúteos", muscle: "Glúteo máximo", defaultSets: 4, defaultReps: 10, defaultWeight: 60, defaultRest: 90, tips: "Ombros apoiados no banco. Suba o quadril até a linha joelhos–tronco ficar reta." },
  { name: "Glúteo no Cabo (Kickback)",  group: "Glúteos", muscle: "Glúteo máximo (isolamento)", defaultSets: 3, defaultReps: 15, defaultWeight: 20, defaultRest: 60, tips: "Tronco fixo, só o quadril move. Pausa no topo por 1s." },
  { name: "Abdução de Quadril (Máquina)", group: "Glúteos", muscle: "Glúteo médio + mínimo", defaultSets: 3, defaultReps: 15, defaultWeight: 40, defaultRest: 60, tips: "Não use impulso. Controle a volta para mais tempo sob tensão." },
  { name: "Agachamento Sumô",           group: "Glúteos", muscle: "Glúteos + Adutores + Quadríceps", defaultSets: 4, defaultReps: 10, defaultWeight: 50, defaultRest: 90, tips: "Pés a 45° para fora, afastados acima da largura dos ombros." },
  { name: "Elevação Pélvica (Peso Corporal)", group: "Glúteos", muscle: "Glúteo máximo (iniciante)", defaultSets: 3, defaultReps: 20, defaultWeight: 0, defaultRest: 60, tips: "Deite no chão. Suba o quadril espremendo os glúteos no topo." },

  // ── ABDÔMEN ────────────────────────────────────────────────────────────
  { name: "Abdominal Supra",            group: "Abdômen", muscle: "Reto abdominal (porção superior)", defaultSets: 3, defaultReps: 20, defaultWeight: 0, defaultRest: 45, tips: "Mãos na nuca sem puxar o pescoço. Suba até as escápulas saírem do chão." },
  { name: "Abdominal Infra (Elevação de Pernas)", group: "Abdômen", muscle: "Reto abdominal (porção inferior)", defaultSets: 3, defaultReps: 15, defaultWeight: 0, defaultRest: 45, tips: "Lombar pressionada no chão. Suba as pernas retas até 90°." },
  { name: "Prancha",                    group: "Abdômen", muscle: "Core completo", defaultSets: 3, defaultReps: 1,  defaultWeight: 0, defaultRest: 45, tips: "Quadril no alinhamento do tronco. Sem ceder a lombar. Respire." },
  { name: "Abdominal na Polia",         group: "Abdômen", muscle: "Reto abdominal (com carga)", defaultSets: 3, defaultReps: 15, defaultWeight: 20, defaultRest: 60, tips: "Joelhos no chão. Curve a coluna levando os cotovelos aos joelhos." },
  { name: "Rotação Russa",              group: "Abdômen", muscle: "Oblíquos", defaultSets: 3, defaultReps: 20, defaultWeight: 5, defaultRest: 45, tips: "Tronco inclinado a 45°. Gire de lado a lado tocando o peso no chão." },
  { name: "Mountain Climber",           group: "Abdômen", muscle: "Core + Cardio", defaultSets: 3, defaultReps: 20, defaultWeight: 0, defaultRest: 45, tips: "Quadril baixo. Alterne os joelhos em direção ao peito rápido e ritmado." },

  // ── PANTURRILHA ────────────────────────────────────────────────────────
  { name: "Gêmeos em Pé (Máquina)",     group: "Panturrilha", muscle: "Gastrocnêmio", defaultSets: 4, defaultReps: 15, defaultWeight: 80, defaultRest: 60, tips: "Amplitude completa: calcanhar bem abaixo e ponta do pé bem alta. Pausa no topo." },
  { name: "Gêmeos Sentado (Máquina)",   group: "Panturrilha", muscle: "Sóleo", defaultSets: 4, defaultReps: 15, defaultWeight: 50, defaultRest: 60, tips: "Joelhos a 90°. O sóleo é mais ativado com joelhos flexionados." },
  { name: "Gêmeos no Leg Press",        group: "Panturrilha", muscle: "Gastrocnêmio + Sóleo", defaultSets: 3, defaultReps: 20, defaultWeight: 100, defaultRest: 60, tips: "Só os dedos dos pés na plataforma. Amplitude máxima." },
  { name: "Gêmeos Unilateral com Haltere", group: "Panturrilha", muscle: "Gastrocnêmio (unilateral)", defaultSets: 3, defaultReps: 15, defaultWeight: 16, defaultRest: 60, tips: "Apoie numa parede. Trabalha o equilíbrio e corrige assimetrias." },
];
