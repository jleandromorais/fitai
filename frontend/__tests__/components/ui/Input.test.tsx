import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Input from "@/components/ui/Input";

describe("Input", () => {
  it("renderiza um campo de input", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("passa placeholder para o input", () => {
    render(<Input placeholder="Digite aqui..." />);
    expect(screen.getByPlaceholderText("Digite aqui...")).toBeInTheDocument();
  });

  it("renderiza o ícone quando fornecido", () => {
    render(<Input icon={<span data-testid="icone">@</span>} />);
    expect(screen.getByTestId("icone")).toBeInTheDocument();
  });

  it("aplica padding-left maior quando há ícone", () => {
    render(<Input icon={<span>@</span>} />);
    expect(screen.getByRole("textbox").className).toContain("pl-10");
  });

  it("aplica padding-left padrão quando não há ícone", () => {
    render(<Input />);
    expect(screen.getByRole("textbox").className).toContain("pl-4");
  });

  it("renderiza rightElement quando fornecido", () => {
    render(<Input rightElement={<button data-testid="btn-direita">X</button>} />);
    expect(screen.getByTestId("btn-direita")).toBeInTheDocument();
  });

  it("mescla className externo", () => {
    render(<Input className="extra-class" />);
    expect(screen.getByRole("textbox").className).toContain("extra-class");
  });

  it("chama onChange ao digitar", () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "abc" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("passa atributo type correto", () => {
    render(<Input type="password" />);
    expect(screen.getByDisplayValue("")).toHaveAttribute("type", "password");
  });

  it("renderiza com value controlado", () => {
    render(<Input value="valor fixo" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("valor fixo")).toBeInTheDocument();
  });
});
