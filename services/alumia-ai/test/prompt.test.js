import assert from "node:assert/strict";
import test from "node:test";
import { SYSTEM_INSTRUCTION } from "../src/prompt.js";

test("prioriza a conversa antes de produtividade", () => {
  assert.match(SYSTEM_INSTRUCTION, /Responda a essa intenção sem desviar para produtividade/i);
  assert.match(SYSTEM_INSTRUCTION, /não transforme desabafos em tarefas/i);
  assert.match(SYSTEM_INSTRUCTION, /não apresente menus/i);
  assert.match(SYSTEM_INSTRUCTION, /Nunca disfarce um menu/i);
  assert.match(SYSTEM_INSTRUCTION, /Não atribua emoções que a pessoa não declarou/i);
  assert.match(SYSTEM_INSTRUCTION, /somente uma pergunta aberta e natural por vez/i);
});

test("mantém ações e opiniões sob controle da pessoa", () => {
  assert.match(SYSTEM_INSTRUCTION, /ajude a pessoa a pensar sem decidir por ela/i);
  assert.match(SYSTEM_INSTRUCTION, /Só ofereça organização quando a pessoa pedir/i);
  assert.match(SYSTEM_INSTRUCTION, /Uma proposta de tarefa sempre será confirmada/i);
  assert.match(SYSTEM_INSTRUCTION, /lembrança não sensível pode ser gravada automaticamente/i);
});
