import { NextRequest, NextResponse } from "next/server";

export interface GenerateRequest {
  level: string;
  goal: string;
  days: string;
  equipment: string;
  duration: string;
}

export interface GeneratedWorkout {
  name: string;
  code: string;
  schedule: string;
  tags: string[];
  exercises: {
    name: string;
    muscle: string;
    restSeconds: number;
    sets: { reps: number; weight: number; done: boolean; prev: number }[];
  }[];
}

export interface GenerateResponse {
  workouts: GeneratedWorkout[];
}

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

function buildPrompt(req: GenerateRequest): string {
  return `Você é um personal trainer especialista. Crie um plano de treino personalizado em JSON.

Perfil do aluno:
- Nível: ${req.level}
- Objetivo: ${req.goal}
- Dias disponíveis: ${req.days}
- Equipamentos: ${req.equipment}
- Duração por sessão: ${req.duration}

Retorne APENAS um JSON válido, sem markdown, sem explicações, com este formato exato:
{
  "workouts": [
    {
      "name": "Treino A — Peito e Tríceps",
      "code": "A",
      "schedule": "Seg, Qui",
      "tags": ["Hipertrofia", "Peito"],
      "exercises": [
        {
          "name": "Supino Reto",
          "muscle": "Peitoral",
          "restSeconds": 90,
          "sets": [
            { "reps": 10, "weight": 60, "done": false, "prev": 0 },
            { "reps": 10, "weight": 60, "done": false, "prev": 0 },
            { "reps": 10, "weight": 60, "done": false, "prev": 0 }
          ]
        }
      ]
    }
  ]
}

Regras:
- Crie exatamente o número de treinos correspondente aos dias informados
- Use códigos A, B, C, D... para cada treino
- Cada treino deve ter entre 4 e 6 exercícios
- Cada exercício deve ter entre 3 e 4 séries
- Adapte os pesos ao nível do aluno (iniciante = pesos baixos, avançado = pesos altos)
- Use nomes de exercícios em português
- Os músculos devem ser: Peitoral, Costas, Ombros, Bíceps, Tríceps, Pernas, Glúteos, Abdômen ou Panturrilha
- Se o equipamento for apenas peso corporal, use weight: 0`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY não configurada." }, { status: 500 });
  }

  const body: GenerateRequest = await req.json();

  const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(body) }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
  });

  if (!geminiRes.ok) {
    const err = await geminiRes.text();
    return NextResponse.json({ error: `Gemini API error: ${err}` }, { status: 502 });
  }

  const geminiData = await geminiRes.json();
  const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  let parsed: GenerateResponse;
  try {
    // Remove possíveis blocos ```json``` que o modelo às vezes inclui
    const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    return NextResponse.json({ error: "Resposta inválida da IA. Tente novamente." }, { status: 502 });
  }

  return NextResponse.json(parsed);
}
