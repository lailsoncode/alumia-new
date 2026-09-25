import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MoodCalendar } from "./MoodCalendar";
import type { CareCheckinHistoryItem } from "@/types";

const item: CareCheckinHistoryItem = {
  id: "checkin-1",
  occurredAt: "2026-09-25T20:30:00.000Z",
  moodCategory: "slightly_positive",
  emotions: [{ code: "calm", label: "Calmo(a)", emoji: "😌" }],
  need: { code: "calm", label: "Preciso de calma" },
  suggestion: {
    code: "calm_positive",
    version: 1,
    title: "Cuide da calma que encontrou",
    body: "Momentos leves também merecem presença e atenção.",
    actionText: "Reserve alguns instantes longe da tela.",
    actionCategory: "pause",
  },
};

describe("MoodCalendar", () => {
  it("abre o registro selecionado pelo card", () => {
    const onSelect = vi.fn();
    render(<MoodCalendar items={[item]} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: /ver check-in céu claro com nuvens/i }));
    expect(onSelect).toHaveBeenCalledWith(item);
  });
});
