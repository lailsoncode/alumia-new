import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthInput } from "./AuthInput";

function PasswordField() {
  const [value, setValue] = useState("");
  return (
    <AuthInput
      id="password"
      label="Senha"
      type="password"
      placeholder="Digite sua senha"
      value={value}
      onChange={setValue}
      error="A senha é obrigatória."
    />
  );
}

describe("AuthInput", () => {
  it("associa label, erro e estado inválido ao campo", () => {
    render(<PasswordField />);
    const input = screen.getByLabelText("Senha");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("A senha é obrigatória.");
    expect(screen.getByRole("alert")).toHaveTextContent("A senha é obrigatória.");
  });

  it("alterna a visibilidade da senha", () => {
    render(<PasswordField />);
    const input = screen.getByLabelText("Senha");

    expect(input).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar senha" })).toBeInTheDocument();
  });
});
