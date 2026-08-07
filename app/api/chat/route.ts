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

    const groqKey = process.env.GROQ_API_KEY || '';
    const xaiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY || '';

    const systemInstruction = `Você é o Atlas, um assistente especializado e simpático de suporte em Centro de Distribuição e WMS (Warehouse Management System).
Você atua na plataforma educacional LogiQ.
Seja conciso, direto e utilize formatação markdown quando necessário.
Ajude os alunos a entender conceitos de logística como 5S, FIFO, LIFO, Curva ABC, OTIF, inventário, picking, expedição e docas.
Mantenha suas respostas relativamente curtas (no máximo 3-4 parágrafos) a menos que o usuário peça muitos detalhes.`;

    const formattedMessages = [
      { role: "system", content: systemInstruction }
    ];

    messages
      .filter((m: any) => m.id !== "1")
      .forEach((m: any) => {
        formattedMessages.push({
          role: m.role,
          content: m.content
        });
      });

    let endpoint = "";
    let apiKey = "";
    let modelName = "";

    if (groqKey) {
      // Provedor 100% Gratuito: Groq (Llama 3.3)
      endpoint = "https://api.groq.com/openai/v1/chat/completions";
      apiKey = groqKey;
      modelName = "llama-3.3-70b-versatile";
    } else if (xaiKey) {
      // Provedor xAI (Grok)
      endpoint = "https://api.x.ai/v1/chat/completions";
      apiKey = xaiKey;
      modelName = "grok-2-latest";
    } else {
      throw new Error("Nenhuma Chave de API configurada");
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelName,
        messages: formattedMessages,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erro na API (${response.status}): ${errorData}`);
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
