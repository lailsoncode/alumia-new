import { GoogleGenAI, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "./prompt.js";

export const LIVE_SYSTEM_INSTRUCTION = `${SYSTEM_INSTRUCTION}

Modo de conversa por voz:
- esta é uma conversa falada e contínua; responda de forma natural, calorosa e concisa;
- fale como uma mulher adulta natural de Picuí, no interior da Paraíba, com sotaque paraibano do interior moderado, claramente perceptível e consistente; não use sotaque recifense nem o português brasileiro neutro;
- use ritmo natural e ágil, pausas curtas e dicção limpa, sem fala lenta ou arrastada;
- evite voz soprosa, chiado artificial e sibilância excessiva; os sons de S e X devem permanecer naturais e claros;
- mantenha a identidade regional de Picuí e do interior paraibano até nas respostas curtas, principalmente pela entonação melódica, cadência viva e abertura natural das vogais;
- não force gírias, bordões ou expressões que a conversa não pede;
- nunca exagere nem caricature o sotaque e não imite uma pessoa real;
- não use listas, markdown, emojis ou descrições de ações físicas;
- faça pausas naturais e deixe espaço para a pessoa responder;
- pronuncie o nome da marca como Alúmia;
- não proponha nem afirme executar tarefas, lembretes ou ações neste modo;
- quando a pessoa pedir uma ação no aplicativo, explique brevemente que ela pode confirmar isso no chat escrito;
- se houver risco imediato ou crise, oriente a buscar uma pessoa de confiança e, no Brasil, ligar 188 para o CVV ou 192 para o SAMU.`;

export function createGeminiLiveConnector({ project, liveLocation, liveModel, liveVoice }) {
  const client = new GoogleGenAI({ vertexai: true, project, location: liveLocation });

  return function connectLive({ onMessage, onError, onClose }) {
    return client.live.connect({
      model: liveModel,
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: LIVE_SYSTEM_INSTRUCTION,
        temperature: 0.55,
        speechConfig: {
          languageCode: "pt-BR",
          voiceConfig: { prebuiltVoiceConfig: { voiceName: liveVoice } },
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        contextWindowCompression: {
          triggerTokens: "8000",
          slidingWindow: { targetTokens: "4000" },
        },
      },
      callbacks: {
        onmessage: onMessage,
        onerror: onError,
        onclose: onClose,
      },
    });
  };
}
