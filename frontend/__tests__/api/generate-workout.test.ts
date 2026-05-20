import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/generate-workout/route";
import { NextRequest } from "next/server";

function makeRequest(body: object): NextRequest {
  return {
    json: () => Promise.resolve(body),
  } as unknown as NextRequest;
}

function makeGeminiResponse(text: string, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    text: () => Promise.resolve(text),
    json: () =>
      Promise.resolve({
        candidates: [{ content: { parts: [{ text }] } }],
      }),
  });
}

const VALID_WORKOUT_JSON = JSON.stringify({
  workouts: [
    {
      name: "Treino A — Peito",
      code: "A",
      schedule: "Seg, Qui",
      tags: ["Hipertrofia"],
      exercises: [
        {
          name: "Supino Reto",
          muscle: "Peitoral",
          restSeconds: 90,
          sets: [
            { reps: 10, weight: 60, done: false, prev: 0 },
          ],
        },
      ],
    },
  ],
});

describe("POST /api/generate-workout", () => {
  beforeEach(() => {
    vi.stubEnv("GEMINI_API_KEY", "fake-key-123");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("retorna 500 quando GEMINI_API_KEY não está configurada", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("GEMINI_API_KEY", "");

    const req = makeRequest({ level: "Iniciante", goal: "Hipertrofia", days: "3", equipment: "Academia", duration: "60min" });
    const res = await POST(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("GEMINI_API_KEY");
  });

  it("retorna workouts gerados quando Gemini responde corretamente", async () => {
    global.fetch = makeGeminiResponse(VALID_WORKOUT_JSON);

    const req = makeRequest({ level: "Iniciante", goal: "Hipertrofia", days: "3", equipment: "Academia", duration: "60min" });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.workouts).toHaveLength(1);
    expect(body.workouts[0].name).toBe("Treino A — Peito");
  });

  it("remove blocos ```json``` da resposta antes de parsear", async () => {
    const withMarkdown = "```json\n" + VALID_WORKOUT_JSON + "\n```";
    global.fetch = makeGeminiResponse(withMarkdown);

    const req = makeRequest({ level: "Iniciante", goal: "Hipertrofia", days: "3", equipment: "Academia", duration: "60min" });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.workouts).toHaveLength(1);
  });

  it("retorna 502 quando Gemini retorna JSON inválido", async () => {
    global.fetch = makeGeminiResponse("isso não é JSON");

    const req = makeRequest({ level: "Iniciante", goal: "Hipertrofia", days: "3", equipment: "Academia", duration: "60min" });
    const res = await POST(req);

    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toContain("Resposta inválida");
  });

  it("retorna 502 quando a chamada ao Gemini falha (não-ok)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve("Service Unavailable"),
    });

    const req = makeRequest({ level: "Avançado", goal: "Força", days: "5", equipment: "Academia", duration: "90min" });
    const res = await POST(req);

    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toContain("Gemini API error");
  });

  it("faz a requisição ao Gemini com o prompt correto", async () => {
    global.fetch = makeGeminiResponse(VALID_WORKOUT_JSON);

    const req = makeRequest({ level: "Intermediário", goal: "Emagrecimento", days: "4", equipment: "Halteres", duration: "45min" });
    await POST(req);

    const [url, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain("gemini-2.0-flash-lite");
    expect(url).toContain("fake-key-123");

    const reqBody = JSON.parse(options.body);
    const promptText = reqBody.contents[0].parts[0].text;
    expect(promptText).toContain("Intermediário");
    expect(promptText).toContain("Emagrecimento");
    expect(promptText).toContain("Halteres");
  });
});
