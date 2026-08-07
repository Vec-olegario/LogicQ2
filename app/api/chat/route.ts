import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Permitir tempo extra para resposta da IA
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: google('gemini-1.5-flash'),
      system: `Você é o Atlas, um assistente especializado e simpático de suporte em Centro de Distribuição e WMS (Warehouse Management System).
Você atua na plataforma educacional LogiQ.
Seja conciso, direto e utilize formatação markdown quando necessário.
Ajude os alunos a entender conceitos de logística como 5S, FIFO, LIFO, Curva ABC, OTIF, inventário, picking, expedição e docas.
Mantenha suas respostas relativamente curtas (no máximo 3-4 parágrafos) a menos que o usuário peça muitos detalhes.`,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('API Chat Error:', error);
    return new Response('Error Processing Request', { status: 500 });
  }
}
