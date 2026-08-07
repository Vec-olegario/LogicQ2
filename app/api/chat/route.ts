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

    const apiKey = process.env.GROK_API_KEY || '';
    if (!apiKey) throw new Error("Chave de API não configurada");

    const systemInstruction = `Você é o Atlas, um assistente especializado e simpático de suporte em Centro de Distribuição e WMS (Warehouse Management System).
Você atua na plataforma educacional LogiQ.
Seja conciso, direto e utilize formatação markdown quando necessário.
Ajude os alunos a entender conceitos de logística como 5S, FIFO, LIFO, Curva ABC, OTIF, inventário, picking, expedição e docas.
Mantenha suas respostas relativamente curtas (no máximo 3-4 parágrafos) a menos que o usuário peça muitos detalhes.`;

    // Constrói o histórico formatado para a API do Grok (padrão OpenAI)
    const formattedMessages = [
      { role: "system", content: systemInstruction }
    ];

    // Adiciona o histórico ignorando a saudação inicial
    messages
      .filter((m: any) => m.id !== "1")
      .forEach((m: any) => {
        formattedMessages.push({
          role: m.role, // 'user' ou 'assistant'
          content: m.content
        });
      });

    // Fazemos a requisição direta (fetch) sem depender de bibliotecas problemáticas
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "grok-2-latest", // Modelo super inteligente da xAI
        messages: formattedMessages,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erro na API do Grok: ${errorData}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;

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

    return Response.json({ response: fallbackText });
  }
}
