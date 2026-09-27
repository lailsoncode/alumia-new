import assert from "node:assert/strict";
import test from "node:test";
import { hasPossibleCrisisSignal, normalizeText } from "../src/safety.js";

test("normaliza texto em português", () => {
  assert.equal(normalizeText("  Não   quero viver "), "nao quero viver");
});

test("identifica uma expressão conservadora de possível crise", () => {
  assert.equal(hasPossibleCrisisSignal("Estou pensando: quero me matar"), true);
  assert.equal(hasPossibleCrisisSignal("Quero organizar minhas tarefas"), false);
});
