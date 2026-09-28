import assert from "node:assert/strict";
import test from "node:test";
import {
  createSpeechTranscriber,
  normalizeAlumiaTranscript,
} from "../src/speech.js";

test("padroniza somente variações inequívocas do nome Alumia", () => {
  assert.equal(normalizeAlumiaTranscript("oi alúmia"), "oi Alumia");
  assert.equal(normalizeAlumiaTranscript("falei com a Lumia hoje"), "falei com Alumia hoje");
  assert.equal(normalizeAlumiaTranscript("uma luz alumia a sala"), "uma luz Alumia a sala");
});

test("envia vocabulário contextual da Alumia ao Speech-to-Text", async () => {
  let request;
  const client = {
    recognize: async (input) => {
      request = input;
      return [{
        results: [{ alternatives: [{ transcript: "Oi, Alúmia", confidence: 0.92 }] }],
      }];
    },
  };
  const transcribe = createSpeechTranscriber({
    project: "alumia-app",
    speechLocation: "global",
  }, client);

  const result = await transcribe({ audio: Buffer.from("audio") });

  assert.equal(result.transcript, "Oi, Alumia");
  assert.equal(result.confidence, 0.92);
  assert.deepEqual(request.config.adaptation.phraseSets[0].inlinePhraseSet.phrases, [
    { value: "Alumia", boost: 20 },
    { value: "Alúmia", boost: 20 },
    { value: "Oi, Alumia", boost: 20 },
    { value: "Eu sou a Alumia", boost: 20 },
    { value: "Quero falar com a Alumia", boost: 18 },
    { value: "Alumia, me ajude", boost: 18 },
  ]);
});
