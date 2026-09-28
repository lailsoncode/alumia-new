import assert from "node:assert/strict";
import test from "node:test";
import {
  createSpeechSynthesizer,
  prepareSpeechText,
} from "../src/text-to-speech.js";

test("marca a tonicidade de Alumia somente no texto falado", () => {
  assert.equal(prepareSpeechText("Eu sou a Alumia."), "Eu sou a Alúmia.");
  assert.equal(prepareSpeechText("Conheça a Alum.IA."), "Conheça a Alúmia.");
});

test("envia Alúmia ao TTS sem alterar a resposta original", async () => {
  let request;
  const client = {
    synthesizeSpeech: async (input) => {
      request = input;
      return [{ audioContent: Buffer.from("mp3") }];
    },
  };
  const synthesize = createSpeechSynthesizer({
    ttsModel: "gemini-2.5-flash-tts",
    ttsVoice: "Achernar",
    ttsPrompt: "direção",
  }, client);
  const originalText = "Oi, eu sou a Alumia.";

  const audio = await synthesize({ text: originalText });

  assert.equal(originalText, "Oi, eu sou a Alumia.");
  assert.equal(request.input.text, "Oi, eu sou a Alúmia.");
  assert.equal(request.input.prompt, "direção");
  assert.deepEqual(audio, Buffer.from("mp3"));
});
