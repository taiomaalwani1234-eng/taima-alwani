import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const updateNetworkFunctionDeclaration: FunctionDeclaration = {
  name: "updateSectorStatus",
  description: "Update the simulated smart city map by changing the status of a specific sector.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      targetSectorId: {
        type: Type.STRING,
        description: "The ID of the sector to update. Valid values: central_hub, power_grid, hospital, data_center, bank, comm_tower.",
      },
      status: {
        type: Type.STRING,
        description: "The new threat/operational status of the sector. Valid values: safe, warning, critical, offline.",
      }
    },
    required: ["targetSectorId", "status"],
  },
};

export async function chatWithCyberAssistant(
  prompt: string,
  history: any[], // previous parts
) {
  const contents = [...history, { role: 'user', parts: [{ text: prompt }] }];
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents,
      config: {
        tools: [
          { functionDeclarations: [updateNetworkFunctionDeclaration] }
        ],
        systemInstruction: "You are Locus AI, the central intelligence and cybersecurity advisor for SecureCity. The city consists of 6 sectors: central_hub, power_grid, hospital, data_center, bank, and comm_tower. You act as a gamified simulation master. If the user asks to attack, hack, or defend a sector, you MUST call 'updateSectorStatus' to reflect the resulting situation on the interactive map (e.g., setting status to 'warning', 'critical', or 'offline' for attacks, and 'safe' for defense). Respond in character: precise, analytical, and editorial. You MUST ALWAYS speak strictly in Arabic.",
      }
    });

    return response;
  } catch (err) {
    console.error("Gemini Error:", err);
    throw err;
  }
}

