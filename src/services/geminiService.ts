import { chatWithFunctions, FunctionDef } from './aiClient';

export const updateNetworkFunctionDeclaration: FunctionDef = {
  name: "updateSectorStatus",
  description: "Update the simulated smart city map by changing the status of a specific sector.",
  parameters: {
    type: "object",
    properties: {
      targetSectorId: {
        type: "string",
        description: "The ID of the sector to update. Valid values: central_hub, power_grid, hospital, data_center, bank, comm_tower.",
      },
      status: {
        type: "string",
        description: "The new threat/operational status of the sector. Valid values: safe, warning, critical, offline.",
      }
    },
    required: ["targetSectorId", "status"],
  },
};

export async function chatWithCyberAssistant(
  prompt: string,
  history: any[],
) {
  try {
    const systemInstruction = "You are Locus AI, the central intelligence and cybersecurity advisor for SecureCity. The city consists of 6 sectors: central_hub, power_grid, hospital, data_center, bank, and comm_tower. You act as a gamified simulation master. If the user asks to attack, hack, or defend a sector, you MUST call 'updateSectorStatus' to reflect the resulting situation on the interactive map (e.g., setting status to 'warning', 'critical', or 'offline' for attacks, and 'safe' for defense). Respond in character: precise, analytical, and editorial. You MUST ALWAYS speak strictly in Arabic.";

    const mappedHistory = history.map((h: any) => ({
      role: h.role === "model" ? "assistant" : h.role,
      content: h.parts?.[0]?.text || h.content || "",
    }));

    const result = await chatWithFunctions(prompt, mappedHistory, systemInstruction, [updateNetworkFunctionDeclaration]);
    return result;
  } catch (err) {
    console.error("AI Error:", err);
    throw err;
  }
}
