import textToSpeech from "@google-cloud/text-to-speech";

export function createSpeechSynthesizer({ ttsModel, ttsVoice, ttsPrompt }) {
  const client = new textToSpeech.TextToSpeechClient();
  const usesGeminiTts = ttsModel.startsWith("gemini-");

  return async function synthesize({ text }) {
    const [response] = await client.synthesizeSpeech({
      input: usesGeminiTts ? { text, prompt: ttsPrompt } : { text },
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
