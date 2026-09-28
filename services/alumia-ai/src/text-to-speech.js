import textToSpeech from "@google-cloud/text-to-speech";

export function prepareSpeechText(text) {
  return text
    .replace(/Alum\.IA/giu, "Alúmia")
    .replace(/Alumia/giu, "Alúmia");
}

export function createSpeechSynthesizer(
  { ttsModel, ttsVoice, ttsPrompt },
  client = new textToSpeech.TextToSpeechClient(),
) {
  const usesGeminiTts = ttsModel.startsWith("gemini-");

  return async function synthesize({ text }) {
    const speechText = prepareSpeechText(text);
    const [response] = await client.synthesizeSpeech({
      input: usesGeminiTts
        ? { text: speechText, prompt: ttsPrompt }
        : { text: speechText },
      voice: usesGeminiTts
        ? { languageCode: "pt-BR", name: ttsVoice, modelName: ttsModel }
        : { languageCode: "pt-BR", name: ttsVoice },
      audioConfig: { audioEncoding: "MP3", speakingRate: 1.08 },
    });

    if (!response.audioContent) throw new Error("TTS_EMPTY_RESPONSE");
    return Buffer.isBuffer(response.audioContent)
      ? response.audioContent
      : Buffer.from(response.audioContent);
  };
}
