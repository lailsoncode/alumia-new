import { beforeEach, describe, expect, it } from "vitest";
import {
  ALUMIA_PRESENCE_CHANGE_EVENT,
  getAlumiaPresenceContext,
  getAlumiaPresenceEnabled,
  setAlumiaPresenceEnabled,
} from "./alumia-presence";

describe("alumia presence", () => {
  beforeEach(() => window.localStorage.clear());

  it("uses non-punitive contextual copy for each module", () => {
    expect(getAlumiaPresenceContext("/tarefas").title).toBe("Um passo de cada vez.");
    expect(getAlumiaPresenceContext("/financeiro").message).toContain("nunca como julgamento");
    expect(getAlumiaPresenceContext("/mindfulness").secondaryAction.to).toBe("/check-in");
  });

  it("keeps the avatar enabled by default and persists the preference", () => {
    expect(getAlumiaPresenceEnabled()).toBe(true);
    setAlumiaPresenceEnabled(false);
    expect(getAlumiaPresenceEnabled()).toBe(false);
  });

  it("notifies the shell when the preference changes", () => {
    let enabled = true;
    window.addEventListener(ALUMIA_PRESENCE_CHANGE_EVENT, (event) => {
      enabled = (event as CustomEvent<{ enabled: boolean }>).detail.enabled;
    }, { once: true });

    setAlumiaPresenceEnabled(false);
    expect(enabled).toBe(false);
  });
});
