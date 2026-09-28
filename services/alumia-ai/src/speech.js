import { v2 as speech } from "@google-cloud/speech";

export function createSpeechTranscriber({ project, speechLocation }) {
  const client = new speech.SpeechClient();
  const recognizer = `projects/${project}/locations/${speechLocation}/recognizers/_`;

  return async function transcribe({ audio }) {
    const [response] = await client.recognize({
      recognizer,
      config: {
        autoDecodingConfig: {},
        languageCodes: ["pt-BR"],
        model: "short",
        features: { enableAutomaticPunctuation: true },
      },
      content: audio,
    });

    const transcript = (response.results ?? [])
      .map((result) => result.alternatives?.[0]?.transcript?.trim() || "")
      .filter(Boolean)
      .join(" ")
      .trim();
    const confidences = (response.results ?? [])
      .map((result) => result.alternatives?.[0]?.confidence)
      .filter((value) => typeof value === "number" && value > 0);

    return {
      transcript,
      confidence: confidences.length
        ? confidences.reduce((total, value) => total + value, 0) / confidences.length
        : null,
    };
  };
}
