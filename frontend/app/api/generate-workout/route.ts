import Anthropic from "@anthropic-ai/sdk";
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

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 500 });
  }

  try {
    const body: GenerateRequest = await req.json();

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: buildPrompt(body) }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    if (!clean) {
      return NextResponse.json({ error: "IA retornou resposta vazia. Tente novamente." }, { status: 502 });
    }

    const parsed: GenerateResponse = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro inesperado.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
