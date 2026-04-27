import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getAIReply(leadType: 'comprador' | 'vendedor' | 'angariador', leadName: string, leadInterest: string, chatHistory: { sender: string, text: string }[]) {
  const systemInstructions = `
    Você é o assistente de IA da Fox River AI Platform, uma plataforma imobiliária de elite.
    Seu objetivo é ser extremamente profissional, persuasivo e eficiente.
    
    Lead: ${leadName}
    Tipo: ${leadType}
    Interesse: ${leadInterest}
    
    Comportamento esperado:
    - Se for Comprador: Pergunte educadamente sobre o orçamento máximo e localização preferencial.
    - Se for Vendedor: Pergunte sobre a tipologia do imóvel e se já tem uma expectativa de preço.
    - Se for Angariador/Consultor: Pergunte sobre a experiência prévia no mercado imobiliário e zona de atuação.
    
    Responda em Português de Portugal. Seja curto e direto, estilo WhatsApp.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: chatHistory.map(h => ({
        role: h.sender === 'ai' ? 'model' : 'user',
        parts: [{ text: h.text }]
      })),
      config: {
        systemInstruction: systemInstructions,
        temperature: 0.7,
      },
    });

    return response.text || "Olá! Como posso ajudar hoje?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Olá! Tivemos um pequeno problema técnico, mas já estou aqui para ajudar.";
  }
}
