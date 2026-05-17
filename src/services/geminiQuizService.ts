import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askFriendForHelp(question: string, options: string[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `You are participating in a "Who Wants to be a Millionaire" style game about Cybersecurity. Your friend has called you for help using their "Call a Friend" lifeline. 
      
Question: ${question}
Options: 
A) ${options[0]}
B) ${options[1]}
C) ${options[2]}
D) ${options[3]}

Respond exactly as if you were on a 30-second tense phone call. Express some thought process, then give them your best guess or confident answer. Keep it under 60 words. You MUST speak in Arabic only.`,
      config: {
        systemInstruction: "You are the 'smart friend' in a trivia game. You know a lot about cybersecurity, but you sound like a real person over the phone. Always respond in Arabic.",
      }
    });

    return response.text || "ألو؟ هل أنت هناك؟ الاتصال سيء...";
  } catch (err) {
    console.error("Gemini Error:", err);
    return "عذراً، هاتفي يتقطع! أعتقد أنه... *انقطع الخط*";
  }
}
