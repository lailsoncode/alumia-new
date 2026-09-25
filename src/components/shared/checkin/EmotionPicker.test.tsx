import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmotionPicker } from "./EmotionPicker";
import type { CheckinEmotion } from "@/types";

const emotions: CheckinEmotion[] = [
  { code: "calm", label: "Calmo(a)", emoji: "😌", valence: "positive", sortOrder: 1 },
  { code: "happy", label: "Feliz", emoji: "😀", valence: "positive", sortOrder: 2 },
  { code: "grateful", label: "Grato(a)", emoji: "🙏", valence: "positive", sortOrder: 3 },
  { code: "hopeful", label: "Esperançoso(a)", emoji: "🤞", valence: "positive", sortOrder: 4 },
  { code: "anxious", label: "Ansioso(a)", emoji: "😰", valence: "difficult", sortOrder: 5 },
];

describe("EmotionPicker", () => {
  it("impede uma quarta escolha no mesmo grupo", () => {
    const onChange = vi.fn();
    render(
      <EmotionPicker
        emotions={emotions}
        value={["calm", "happy", "grateful"]}
        onChange={onChange}
      />,
    );

    expect(screen.getByRole("button", { name: /esperançoso/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /ansioso/i })).toBeEnabled();
  });

  it("permite remover uma emoção selecionada", () => {
    const onChange = vi.fn();
    render(<EmotionPicker emotions={emotions} value={["calm"]} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /calmo/i }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
