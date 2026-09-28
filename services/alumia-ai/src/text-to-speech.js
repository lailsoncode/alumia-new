import textToSpeech from "@google-cloud/text-to-speech";

export function createSpeechSynthesizer({ ttsModel, ttsVoice, ttsPrompt }) {
  const client = new textToSpeech.TextToSpeechClient();

  return async function synthesize({ text }) {
    const [response] = await client.synthesizeSpeech({
      input: { text, prompt: ttsPrompt },
      voice: { languageCode: "pt-BR", name: ttsVoice, modelName: ttsModel },
      audioConfig: { audioEncoding: "MP3" },
    });

    if (!response.audioContent) throw new Error("TTS_EMPTY_RESPONSE");
    return Buffer.isBuffer(response.audioContent)
      ? response.audioContent
      : Buffer.from(response.audioContent);
  };
}
