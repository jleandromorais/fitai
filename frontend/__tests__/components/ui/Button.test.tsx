import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "@/components/ui/Button";

describe("Button", () => {
  it("renderiza o texto filho corretamente", () => {
    render(<Button>Salvar</Button>);
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });

  it("usa variant 'primary' por padrão", () => {
    render(<Button>Clique</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-[var(--accent)]");
  });

  it("aplica classes da variant 'outline'", () => {
    render(<Button variant="outline">Outline</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("border");
    expect(btn.className).not.toContain("bg-[var(--accent)]");
  });

  it("aplica classes da variant 'ghost'", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).not.toContain("bg-[var(--accent)]");
    expect(btn.className).not.toContain("border border-[var(--border)]");
  });

  it("aplica w-full quando fullWidth=true", () => {
    render(<Button fullWidth>Largo</Button>);
    expect(screen.getByRole("button").className).toContain("w-full");
  });

  it("não aplica w-full por padrão", () => {
    render(<Button>Normal</Button>);
    expect(screen.getByRole("button").className).not.toContain("w-full");
  });

  it("mescla className externo", () => {
    render(<Button className="minha-classe">Teste</Button>);
    expect(screen.getByRole("button").className).toContain("minha-classe");
  });

  it("chama onClick ao ser clicado", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Clique</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("não chama onClick quando disabled", () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Desabilitado</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("passa atributos HTML nativos como type", () => {
    render(<Button type="submit">Enviar</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
