// URL base da API. Usa variável de ambiente ou fallback para localhost.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

// Lê o token JWT do localStorage (retorna null no servidor, pois não há window).
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// Função central de requisição. Todas as chamadas da API passam por aqui.
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // Injeta o header de autenticação apenas se o token existir.
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Headers extras passados pelo chamador têm prioridade.
      ...options.headers,
    },
  });

  // Tratamento de erro HTTP (4xx / 5xx).
  if (!res.ok) {
    const body = await res.text();
    let message = `Erro ${res.status}`;
    try {
      // Tenta extrair a mensagem de erro de um corpo JSON.
      const json = JSON.parse(body);
      message = json.message || json.error || message;
    } catch {
      // Corpo não é JSON (ex: página HTML do Spring Whitelabel Error).
      // Usa os primeiros 120 caracteres do texto para diagnóstico.
      if (body) message = `Erro ${res.status}: ${body.slice(0, 120)}`;
    }
    throw new Error(message);
  }

  // 204 No Content: sem corpo para deserializar.
  if (res.status === 204) return null as T;

  // Deserializa e retorna o JSON da resposta.
  return res.json();
}

// Objeto público com os métodos HTTP mais comuns.
// O tipo genérico T define o formato esperado da resposta.
export const api = {
  get:    <T>(path: string)                => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: "POST",   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: "PUT",    body: JSON.stringify(body) }),
  delete: <T>(path: string)                => request<T>(path, { method: "DELETE" }),
};
