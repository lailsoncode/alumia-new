import assert from "node:assert/strict";
import test from "node:test";
import { normalizeTaskProposal } from "../src/task-proposal.js";

test("normaliza uma proposta estruturada sem inventar campos ausentes", () => {
  assert.deepEqual(normalizeTaskProposal({
    name: "propose_create_task",
    args: { title: "  Pagar a conta  ", date: "2026-09-28", priority: "alta" },
  }), {
    type: "create_task",
    title: "Pagar a conta",
    description: undefined,
    date: "2026-09-28",
    time: undefined,
    priority: "alta",
    reminder: null,
  });
});

test("recusa horário sem data e lembrete incompleto", () => {
  assert.equal(normalizeTaskProposal({ name: "propose_create_task", args: { title: "Ligar", time: "14:00" } }), null);
  assert.equal(normalizeTaskProposal({ name: "propose_create_task", args: { title: "Ligar", reminder: "na_hora" } }), null);
});

test("recusa chamada desconhecida ou payload fora do contrato", () => {
  assert.equal(normalizeTaskProposal({ name: "delete_task", args: { title: "Tudo" } }), null);
  assert.equal(normalizeTaskProposal({ name: "propose_create_task", args: { title: "", date: "amanhã" } }), null);
});
