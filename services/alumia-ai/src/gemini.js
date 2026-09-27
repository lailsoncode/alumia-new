import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "./prompt.js";

export function createGeminiGenerator({ project, location, model }) {
  const client = new GoogleGenAI({ vertexai: true, project, location });

  return async function generate({ message, history }) {
    const contents = [
      ...history.map((item) => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.text }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const response = await client.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.35,
        maxOutputTokens: 500,
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      },
    });

    const text = response.text?.trim();
    if (!text) throw new Error("MODEL_EMPTY_RESPONSE");
    return text;
  };
}
