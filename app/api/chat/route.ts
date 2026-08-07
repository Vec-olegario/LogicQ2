import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || '';
const googleProvider = createGoogleGenerativeAI({
  apiKey: googleKey,
});

// Permitir tempo extra para resposta da IA
export const maxDuration = 30;

const FALLBACK_ANSWERS: Record<string, string> = {
  "wms": "O WMS (Warehouse Management System) é o Sistema de Gerenciamento de Armazém. Ele otimiza estoques, fluxos de recebimento, picking e expedição no Centro de Distribuição.",
  "5s": "O 5S é uma metodologia de organização baseada em 5 sensos japoneses: Seiri (Utilização), Seiton (Ordenação), Seiso (Limpeza), Seiketsu (Normalização) e Shitsuke (Disciplina).",
  "fifo": "O FIFO (First-In, First-Out ou PEPS) é o método onde o primeiro produto que entra no estoque é o primeiro a sair. Essencial para evitar a obsolescência ou vencimento de produtos.",
  "otif": "OTIF (On-Time In-Full) é o principal indicador de entregas logísticas. Mede se os pedidos chegaram no prazo combinado (On-Time) e na quantidade correta e sem avarias (In-Full)."
};

function getFallbackResponse(lastMessage: string): string {
  const msg = lastMessage.toLowerCase();
  for (const [key, answer] of Object.entries(FALLBACK_ANSWERS)) {
    if (msg.includes(key)) return answer;
  }
  return "🤖 Estou operando em modo offline temporário (sem conexão com a IA). Mas posso te responder perguntas básicas sobre: WMS, 5S, FIFO ou OTIF. Escolha uma das opções!";
}

export async function POST(req: Request) {
  let lastUserMessage = "";
  try {
    const { messages } = await req.json();
    
    // Normaliza todas as mensagens recebidas (suporta v3 content e v4 parts)
    const formattedMessages = (messages || []).map((m: any) => {
      let contentStr = "";
      if (typeof m.content === "string") {
        contentStr = m.content;
      } else if (Array.isArray(m.parts)) {
        contentStr = m.parts
          .map((p: any) => (p.type === "text" ? p.text : ""))
          .join("");
      }
      return {
        role: m.role === "assistant" ? "assistant" : "user",
        content: contentStr || "",
      };
    });

    // Extrai a última mensagem para o fallback
    const lastUser = formattedMessages.filter((m: any) => m.role === "user").pop();
    if (lastUser) {
      lastUserMessage = lastUser.content;
    }

    const result = streamText({
      model: googleProvider('gemini-1.5-flash'),
      system: `Você é o Atlas, um assistente especializado e simpático de suporte em Centro de Distribuição e WMS (Warehouse Management System).
Você atua na plataforma educacional LogiQ.
Seja conciso, direto e utilize formatação markdown quando necessário.
Ajude os alunos a entender conceitos de logística como 5S, FIFO, LIFO, Curva ABC, OTIF, inventário, picking, expedição e docas.
Mantenha suas respostas relativamente curtas (no máximo 3-4 parágrafos) a menos que o usuário peça muitos detalhes.`,
      messages: formattedMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('API Chat Error, usando fallback estático:', error);
    
    // Resposta de fallback caso a IA falhe ou não tenha chave API
    const fallbackText = getFallbackResponse(lastUserMessage);
    
    // Formata o texto no UI Message Stream Protocol (0:"texto")
    const streamText = `0:${JSON.stringify(fallbackText)}\n`;
    
    // Retorna a resposta como um stream estático compatível com UIMessageStream
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(streamText));
        controller.close();
      }
    });

    return new Response(stream, {
      status: 200,
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8',
        'x-vercel-ai-data-stream': 'v1'
      }
    });
  }
}
