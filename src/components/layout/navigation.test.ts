import { describe, expect, it } from "vitest";
import { isItemActive } from "./navigation-utils";

describe("isItemActive", () => {
  it("mantém Início ativo somente na rota raiz", () => {
    expect(isItemActive("/", ["/"])).toBe(true);
    expect(isItemActive("/tarefas", ["/"])).toBe(false);
  });

  it("agrupa hidratação dentro de Cuidados", () => {
    expect(isItemActive("/hidratacao", ["/modulos", "/hidratacao"])).toBe(true);
    expect(isItemActive("/ajustes", ["/modulos", "/hidratacao"])).toBe(false);
  });
});
