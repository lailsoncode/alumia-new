import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DatePickerSheet } from "./DatePickerSheet";

describe("DatePickerSheet", () => {
  it("não renderiza o overlay quando está fechado", () => {
    render(<DatePickerSheet open={false} onClose={() => undefined} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("abre com nome acessível e fecha pelo controle principal", () => {
    const onClose = vi.fn();
    render(<DatePickerSheet open onClose={onClose} initialDate={new Date(2026, 8, 22)} />);

    expect(screen.getByRole("dialog", { name: "Data e horário" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Fechar$/ }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
