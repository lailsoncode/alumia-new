import { v2 as speech } from "@google-cloud/speech";

const ALUMIA_PHRASES = [
  { value: "Alumia", boost: 20 },
  { value: "Alúmia", boost: 20 },
  { value: "Oi, Alumia", boost: 20 },
  { value: "Eu sou a Alumia", boost: 20 },
  { value: "Quero falar com a Alumia", boost: 18 },
  { value: "Alumia, me ajude", boost: 18 },
];

export function normalizeAlumiaTranscript(transcript) {
  return transcript
    .replace(/\ba\s+l[uú]mia\b/giu, "Alumia")
    .replace(/\bal[uú]mia\b/giu, "Alumia");
}

export function createSpeechTranscriber(
  { project, speechLocation },
  client = new speech.SpeechClient(),
) {
  const recognizer = `projects/${project}/locations/${speechLocation}/recognizers/_`;

  return async function transcribe({ audio }) {
    const [response] = await client.recognize({
      recognizer,
      config: {
        autoDecodingConfig: {},
        languageCodes: ["pt-BR"],
        model: "short",
        features: { enableAutomaticPunctuation: true },
        adaptation: {
          phraseSets: [{
            inlinePhraseSet: { phrases: ALUMIA_PHRASES },
          }],
        },
      },
      content: audio,
    });

    const transcript = normalizeAlumiaTranscript((response.results ?? [])
      .map((result) => result.alternatives?.[0]?.transcript?.trim() || "")
      .filter(Boolean)
      .join(" ")
      .trim());
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
