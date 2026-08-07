import { GoogleGenerativeAI } from '@google/generative-ai';

// Permitir tempo extra para resposta da IA
export const maxDuration = 30;

const FALLBACK_ANSWERS: Record<string, string> = {
  "wms": "O WMS (Warehouse Management System) é o Sistema de Gerenciamento de Armazém. Ele otimiza estoques, fluxos de recebimento, picking e expedição no Centro de Distribuição.",
  "5s": "O 5S é uma metodologia de organização baseada em 5 sensos japoneses: Seiri (Utilização), Seiton (Ordenação), Seiso (Limpeza), Seiketsu (Normalização) e Shitsuke (Disciplina).",
  "fifo": "O FIFO (First-In, First-Out ou PEPS) é o método onde o primeiro produto que entra no estoque é o primeiro a sair. Essencial para evitar a obsolescência ou vencimento de produtos.",
  "otif": "OTIF (On-Time In-Full) é o principal indicador de entregas logísticas. Mede se os pedidos chegaram no prazo combinado (On-Time) e na quantidade correta e sem avarias (In-Full)."
};

export async function POST(req: Request) {
  let lastUserMessage = "";
  
  try {
    const { messages } = await req.json();
    lastUserMessage = messages.filter((m: any) => m.role === "user").pop()?.content || "";

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || '';
    if (!apiKey) throw new Error("Chave de API não configurada");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      systemInstruction: `Você é o Atlas, um assistente especializado e simpático de suporte em Centro de Distribuição e WMS (Warehouse Management System).
Você atua na plataforma educacional LogiQ.
Seja conciso, direto e utilize formatação markdown quando necessário.
Ajude os alunos a entender conceitos de logística como 5S, FIFO, LIFO, Curva ABC, OTIF, inventário, picking, expedição e docas.
Mantenha suas respostas relativamente curtas (no máximo 3-4 parágrafos) a menos que o usuário peça muitos detalhes.`
    });

    // Constrói o histórico, ignorando a mensagem inicial do bot e a última mensagem do usuário (que é enviada solta)
    const history = messages
      .filter((m: any) => m.id !== "1") 
      .slice(0, -1)
      .map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content || "" }]
      }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastUserMessage);
    const responseText = result.response.text();

    return Response.json({ response: responseText });
  } catch (error) {
    console.error('API Chat Error:', error);
    
    let fallbackText = "🤖 Estou operando em modo offline temporário. Posso te responder perguntas básicas sobre: WMS, 5S, FIFO ou OTIF.";
    for (const [key, answer] of Object.entries(FALLBACK_ANSWERS)) {
      if (lastUserMessage.toLowerCase().includes(key)) {
        fallbackText = answer;
        break;
      }
    }

    // Mesmo no erro, devolvemos um JSON certinho com a resposta estática
    return Response.json({ response: fallbackText });
  }
}
