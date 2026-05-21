const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    // Tenta JSON primeiro; se falhar, usa o texto puro para diagnóstico
    const body = await res.text();
    let message = `Erro ${res.status}`;
    try {
      const json = JSON.parse(body);
      message = json.message || json.error || message;
    } catch {
      // corpo não é JSON (ex: HTML do Spring Whitelabel Error)
      if (body) message = `Erro ${res.status}: ${body.slice(0, 120)}`;
    }
    throw new Error(message);
  }

  // 204 No Content
  if (res.status === 204) return null as T;
  return res.json();
}

export const api = {
  get:    <T>(path: string) => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: "PUT",  body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
