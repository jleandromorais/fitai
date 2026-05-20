import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

function TestConsumer() {
  const { user, token, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.name : "null"}</span>
      <span data-testid="token">{token ?? "null"}</span>
      <button onClick={logout}>Sair</button>
    </div>
  );
}

describe("AuthContext", () => {
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    localStorageMock = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => localStorageMock[key] ?? null,
      setItem: (key: string, value: string) => { localStorageMock[key] = value; },
      removeItem: (key: string) => { delete localStorageMock[key]; },
    });
    mockPush.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("inicia com user e token nulos quando localStorage está vazio", async () => {
    await act(async () => {
      render(<AuthProvider><TestConsumer /></AuthProvider>);
    });
    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(screen.getByTestId("token").textContent).toBe("null");
  });

  it("carrega user e token do localStorage na montagem", async () => {
    localStorageMock["token"] = "abc123";
    localStorageMock["user"] = JSON.stringify({ name: "João", email: "joao@email.com" });

    await act(async () => {
      render(<AuthProvider><TestConsumer /></AuthProvider>);
    });

    expect(screen.getByTestId("user").textContent).toBe("João");
    expect(screen.getByTestId("token").textContent).toBe("abc123");
  });

  it("logout limpa localStorage e redireciona para /login", async () => {
    localStorageMock["token"] = "abc123";
    localStorageMock["user"] = JSON.stringify({ name: "João", email: "joao@email.com" });

    await act(async () => {
      render(<AuthProvider><TestConsumer /></AuthProvider>);
    });

    await act(async () => {
      screen.getByRole("button", { name: "Sair" }).click();
    });

    expect(localStorageMock["token"]).toBeUndefined();
    expect(localStorageMock["user"]).toBeUndefined();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("logout zera user e token no estado", async () => {
    localStorageMock["token"] = "abc123";
    localStorageMock["user"] = JSON.stringify({ name: "João", email: "joao@email.com" });

    await act(async () => {
      render(<AuthProvider><TestConsumer /></AuthProvider>);
    });

    await act(async () => {
      screen.getByRole("button", { name: "Sair" }).click();
    });

    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(screen.getByTestId("token").textContent).toBe("null");
  });

  it("não carrega user se só tiver token (sem user no localStorage)", async () => {
    localStorageMock["token"] = "abc123";

    await act(async () => {
      render(<AuthProvider><TestConsumer /></AuthProvider>);
    });

    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(screen.getByTestId("token").textContent).toBe("null");
  });
});
