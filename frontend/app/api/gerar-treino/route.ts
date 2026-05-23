import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { nivel, objetivo, dias, equipamentos, tempo } = await req.json();

  const prompt = `Você é um personal trainer experiente. Monte um plano de treino personalizado para a seguinte pessoa:
- Nível: ${nivel}
- Objetivo: ${objetivo}
- Dias por semana: ${dias}
- Equipamentos: ${equipamentos}
- Tempo por sessão: ${tempo}

Responda APENAS com um JSON válido no seguinte formato (sem markdown, sem explicações fora do JSON):
{
  "titulo": "nome do método de treino (ex: Push-Pull-Legs)",
  "resumo": "resumo curto (ex: 4 dias/semana · ~60 min)",
  "dias": ["Dia A — descrição", "Dia B — descrição", "Dia C — descrição", "Dia D — descrição"]
}

Use no máximo 4 dias no array. Os nomes dos dias devem ser curtos e descritivos. Escreva tudo em português brasileiro.`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const plan = JSON.parse(text);
    return NextResponse.json(plan);
  } catch {
    return NextResponse.json({ error: "Falha ao interpretar resposta da IA" }, { status: 500 });
  }
}
