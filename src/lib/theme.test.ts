import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyTheme, getStoredTheme, subscribeToThemeChanges } from "./theme";

describe("theme", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("aplica e persiste o tema escuro", () => {
    applyTheme("dark");
    expect(document.documentElement).toHaveClass("dark");
    expect(getStoredTheme()).toBe("dark");
  });

  it("remove o tema escuro ao voltar para o claro", () => {
    applyTheme("dark");
    applyTheme("light");
    expect(document.documentElement).not.toHaveClass("dark");
    expect(getStoredTheme()).toBe("light");
  });

  it("sincroniza controles que observam a troca de tema", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToThemeChanges(listener);

    applyTheme("dark");

    expect(listener).toHaveBeenCalledWith("dark");
    unsubscribe();
  });
});
