import assert from "node:assert/strict";
import test from "node:test";
import { LIVE_SYSTEM_INSTRUCTION } from "../src/live.js";

test("direciona a voz ao vivo para a identidade regional da Alumia sem caricatura", () => {
  assert.match(LIVE_SYSTEM_INSTRUCTION, /natural de Picuí, no interior da Paraíba/i);
  assert.match(LIVE_SYSTEM_INSTRUCTION, /sotaque paraibano do interior moderado, claramente perceptível e consistente/i);
  assert.match(LIVE_SYSTEM_INSTRUCTION, /não use sotaque recifense nem o português brasileiro neutro/i);
  assert.match(LIVE_SYSTEM_INSTRUCTION, /ritmo natural e ágil/i);
  assert.match(LIVE_SYSTEM_INSTRUCTION, /evite voz soprosa, chiado artificial e sibilância excessiva/i);
  assert.match(LIVE_SYSTEM_INSTRUCTION, /mantenha a identidade regional de Picuí e do interior paraibano até nas respostas curtas/i);
  assert.match(LIVE_SYSTEM_INSTRUCTION, /não force gírias, bordões ou expressões/i);
  assert.match(LIVE_SYSTEM_INSTRUCTION, /nunca exagere nem caricature o sotaque/i);
});
