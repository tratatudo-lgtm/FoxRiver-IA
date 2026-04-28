import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function getAIReply(leadType: 'comprador' | 'vendedor' | 'angariador', leadName: string, leadInterest: string, chatHistory: { sender: string, text: string }[]) {
  const ai = getAI();
  
  if (!ai) {
    console.warn("Gemini API not configured, using fallback logic.");
    return getFallbackReply(leadType);
  }

  const systemInstructions = `
    Você é o assistente de IA da Fox River AI Platform.
    Profissional, persuasivo e eficiente.
    
    Lead: ${leadName} (${leadType})
    Interesse: ${leadInterest}
    
    Responda em Português de Portugal. Curto e direto.
    Se for Comprador: Orçamento e zona.
    Se for Vendedor: Tipologia e preço.
    Se for Angariador: Experiência e zona.
  `;

  let contents = chatHistory.map(h => ({
    role: h.sender === 'ai' ? 'model' : 'user',
    parts: [{ text: h.text }]
  }));

  if (contents.length === 0 || contents[0].role === 'model') {
    contents.unshift({ 
      role: 'user', 
      parts: [{ text: `Olá, sou o ${leadName}. Tenho interesse em: ${leadInterest}` }] 
    });
  }

  try {
    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstructions
    });

    const conversation = model.startChat({
      history: contents.slice(0, -1).map(c => ({
        role: c.role === 'model' ? 'model' : 'user',
        parts: [{ text: (c.parts[0] as any).text }]
      }))
    });

    const lastMsg = contents[contents.length - 1];
    const result = await conversation.sendMessage((lastMsg.parts[0] as any).text);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error Detail:", error);
    return getFallbackReply(leadType);
  }
}

function getFallbackReply(leadType: string) {
  if (leadType === 'comprador') {
    return "Olá! Sou o assistente da Fox River. Qual seria o seu orçamento aproximado e a zona de preferência?";
  } else if (leadType === 'vendedor') {
    return "Com certeza, posso ajudar na venda. Qual é a tipologia do imóvel e já tem algum valor em mente para a venda?";
  } else {
    return "Olá! Ficamos felizes com o seu interesse. Tem experiência prévia no setor imobiliário ou em que zona gostaria de atuar?";
  }
}
