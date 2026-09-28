import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startMindfulnessAmbientSound } from "@/lib/mindfulnessAmbient";
import { synthesizeAlumiaSpeech } from "@/services/alumiaAIService";
import type { MindfulnessPractice } from "@/types";
import { MindfulnessPlayer } from "./MindfulnessPlayer";

vi.mock("@/services/alumiaAIService", () => ({ synthesizeAlumiaSpeech: vi.fn() }));
vi.mock("@/lib/mindfulnessAmbient", () => ({ startMindfulnessAmbientSound: vi.fn() }));

const practice: MindfulnessPractice = {
  id: "practice-1",
  code: "ground",
  version: 1,
  title: "Aterrissar no presente",
  description: "Notar o ambiente.",
  durationMinutes: 3,
  category: "grounding",
  formats: ["audio", "text"],
  instructions: ["Observe o ambiente.", "Perceba os sons."],
  sortOrder: 10,
};

describe("MindfulnessPlayer", () => {
  const play = vi.fn().mockResolvedValue(undefined);
  const pause = vi.fn();
  const revokeObjectURL = vi.fn();
  const ambientHandle = { pause: vi.fn(), resume: vi.fn(), setVolume: vi.fn(), stop: vi.fn() };

  beforeEach(() => {
    vi.mocked(synthesizeAlumiaSpeech).mockResolvedValue(new Blob(["audio"], { type: "audio/mpeg" }));
    vi.mocked(startMindfulnessAmbientSound).mockReturnValue(ambientHandle);
    vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:mindfulness-audio"), revokeObjectURL });
    vi.stubGlobal("Audio", class {
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      play = play;
      pause = pause;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("usa a voz configurada da Alumia ao abrir uma prática em áudio", async () => {
    render(<MindfulnessPlayer practice={practice} initialFormat="audio" onAlternative={() => undefined} onFinish={() => undefined} />);

    await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
    expect(synthesizeAlumiaSpeech).toHaveBeenCalledWith("Observe o ambiente.");
    expect(screen.getByText("Narração com a voz da Alumia")).toBeInTheDocument();
  });

  it("mantém o roteiro completo disponível no modo texto", () => {
    render(<MindfulnessPlayer practice={practice} initialFormat="text" onAlternative={() => undefined} onFinish={() => undefined} />);

    expect(synthesizeAlumiaSpeech).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Roteiro da prática" })).toBeInTheDocument();
    expect(screen.getAllByText("Observe o ambiente.")).toHaveLength(2);
    expect(screen.getByText("Perceba os sons.")).toBeInTheDocument();
  });

  it("recorre ao texto quando a voz configurada está indisponível", async () => {
    vi.mocked(synthesizeAlumiaSpeech).mockRejectedValueOnce(new Error("TTS_UNAVAILABLE"));

    render(<MindfulnessPlayer practice={practice} initialFormat="audio" onAlternative={() => undefined} onFinish={() => undefined} />);

    expect(await screen.findByText(/não foi possível gerar a voz da Alumia/i)).toBeInTheDocument();
    expect(screen.getByText("Orientação atual")).toBeInTheDocument();
    expect(screen.getByText("Perceba os sons.")).toBeInTheDocument();
  });

  it("permite som ambiente sem ligar a narração", () => {
    render(<MindfulnessPlayer practice={practice} initialFormat="text" onAlternative={() => undefined} onFinish={() => undefined} />);

    fireEvent.click(screen.getByRole("button", { name: "Chuva suave" }));

    expect(startMindfulnessAmbientSound).toHaveBeenCalledWith("rain", 0.35);
    expect(synthesizeAlumiaSpeech).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Narração da Alumia: desligada/i })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("slider", { name: "Volume do ambiente" })).toBeInTheDocument();
  });

  it("permite desligar a narração sem interromper o ambiente", async () => {
    render(<MindfulnessPlayer practice={practice} initialFormat="audio" onAlternative={() => undefined} onFinish={() => undefined} />);
    await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: "Chuva suave" }));

    fireEvent.click(screen.getByRole("button", { name: /Narração da Alumia: ligada/i }));

    expect(pause).toHaveBeenCalled();
    expect(ambientHandle.stop).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Narração da Alumia: desligada/i })).toHaveAttribute("aria-pressed", "false");
  });
});
