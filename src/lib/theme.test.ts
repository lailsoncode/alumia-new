import { beforeEach, describe, expect, it } from "vitest";
import { applyTheme, getStoredTheme } from "./theme";

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
});
