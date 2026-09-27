import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { MindfulnessPractice } from "@/types";
import { PracticeLibrary } from "./PracticeLibrary";

const practices: MindfulnessPractice[] = [
  {
    id: "practice-1",
    code: "ground",
    version: 1,
    title: "Aterrissar no presente",
    description: "Notar o ambiente.",
    durationMinutes: 3,
    category: "grounding",
    formats: ["audio", "text"],
    instructions: ["Observe."],
    sortOrder: 10,
  },
  {
    id: "practice-2",
    code: "night",
    version: 1,
    title: "Desacelerar à noite",
    description: "Diminuir estímulos.",
    durationMinutes: 5,
    category: "sleep",
    formats: ["text"],
    instructions: ["Perceba."],
    sortOrder: 20,
  },
];

describe("PracticeLibrary", () => {
  it("filtra práticas pela busca e inicia no formato disponível", () => {
    const onStart = vi.fn();
    render(<PracticeLibrary practices={practices} onBack={() => undefined} onStart={onStart} />);

    fireEvent.change(screen.getByPlaceholderText("Buscar uma prática"), { target: { value: "noite" } });
    expect(screen.queryByText("Aterrissar no presente")).not.toBeInTheDocument();
    expect(screen.getByText("Desacelerar à noite")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Começar" }));
    expect(onStart).toHaveBeenCalledWith(practices[1], "text");
  });

  it("aplica filtro de áudio", () => {
    render(<PracticeLibrary practices={practices} onBack={() => undefined} onStart={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Áudio" }));
    expect(screen.getByText("Aterrissar no presente")).toBeInTheDocument();
    expect(screen.queryByText("Desacelerar à noite")).not.toBeInTheDocument();
  });
});
