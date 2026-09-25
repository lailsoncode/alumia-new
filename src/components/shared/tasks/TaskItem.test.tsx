import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TaskItem } from "./TaskItem";

describe("TaskItem", () => {
  it("preserva tema e identificação do módulo de origem", () => {
    render(
      <ul>
        <TaskItem task={{ id: "water-task", title: "Beber água", moduleKey: "hydration" }} />
      </ul>,
    );

    const item = screen.getByRole("listitem");
    expect(item).toHaveAttribute("data-module", "hydration");
    expect(item).toHaveClass("module-theme-hydration", "module-whisper");
    expect(item).not.toHaveClass("module-surface");
    expect(screen.getByText("Hidratação")).toBeInTheDocument();
  });
});
