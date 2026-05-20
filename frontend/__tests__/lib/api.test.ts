import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api } from "@/lib/api";

const BASE_URL = "http://localhost:8081";

function mockFetch(status: number, body: unknown, ok = status >= 200 && status < 300) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return vi.fn().mockResolvedValue({
    ok,
    status,
    text: () => Promise.resolve(text),
    json: () => Promise.resolve(body),
  });
}

describe("api", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("get", () => {
    it("chama fetch com método GET e URL correta", async () => {
      global.fetch = mockFetch(200, { id: 1 });

      await api.get("/workouts");

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/workouts`,
        expect.objectContaining({ headers: expect.objectContaining({ "Content-Type": "application/json" }) })
      );
    });

    it("inclui o header Authorization quando há token no localStorage", async () => {
      vi.stubGlobal("localStorage", {
        getItem: vi.fn().mockReturnValue("meu-token-123"),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      });
      global.fetch = mockFetch(200, []);

      await api.get("/workouts");

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: "Bearer meu-token-123" }),
        })
      );
    });

    it("não inclui Authorization quando não há token", async () => {
      global.fetch = mockFetch(200, []);

      await api.get("/workouts");

      const call = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
      expect(call.headers).not.toHaveProperty("Authorization");
    });

    it("retorna null em respostas 204", async () => {
      global.fetch = mockFetch(204, "", true);

      const result = await api.get("/workouts/1");

      expect(result).toBeNull();
    });

    it("lança erro com mensagem JSON quando resposta não é ok", async () => {
      global.fetch = mockFetch(404, { message: "Treino não encontrado" }, false);

      await expect(api.get("/workouts/999")).rejects.toThrow("Treino não encontrado");
    });

    it("lança erro com campo 'error' do JSON quando não há 'message'", async () => {
      global.fetch = mockFetch(400, { error: "Requisição inválida" }, false);

      await expect(api.get("/invalid")).rejects.toThrow("Requisição inválida");
    });

    it("lança erro com status quando body não é JSON", async () => {
      global.fetch = mockFetch(500, "Internal Server Error", false);

      await expect(api.get("/crash")).rejects.toThrow(/Erro 500/);
    });
  });

  describe("post", () => {
    it("chama fetch com método POST e body serializado", async () => {
      global.fetch = mockFetch(201, { id: 42, name: "Treino A" });
      const payload = { name: "Treino A", code: "A" };

      await api.post("/workouts", payload);

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/workouts`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(payload),
        })
      );
    });
  });

  describe("put", () => {
    it("chama fetch com método PUT e body serializado", async () => {
      global.fetch = mockFetch(200, { id: 1, name: "Treino Atualizado" });
      const payload = { name: "Treino Atualizado" };

      await api.put("/workouts/1", payload);

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/workouts/1`,
        expect.objectContaining({ method: "PUT", body: JSON.stringify(payload) })
      );
    });
  });

  describe("delete", () => {
    it("chama fetch com método DELETE", async () => {
      global.fetch = mockFetch(204, "", true);

      await api.delete("/workouts/1");

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/workouts/1`,
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });
});
