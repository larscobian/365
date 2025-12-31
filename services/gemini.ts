import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

interface GeminiConfig {
  systemInstruction?: string;
}

export const askGemini = async (prompt: string, config?: GeminiConfig): Promise<string> => {
  if (!apiKey) {
    return "API Key missing. Please configure process.env.API_KEY to use the AI features.";
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: config?.systemInstruction,
      }
    });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, something went wrong while contacting the AI.";
  }
};