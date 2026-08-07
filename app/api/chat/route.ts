export const maxDuration = 10; // Reduzido já que não tem chamadas lentas de IA

// --- BASE DE CONHECIMENTO DO BOT (Regras) ---
const knowledgeBase = [
  {
    keywords: /(wms|warehouse management system)/i,
    response: "O **WMS (Warehouse Management System)** é o sistema central que gerencia estoque, recebimento, picking e expedição dentro de um Centro de Distribuição. É o cérebro da operação logística!"
  },
  {
    keywords: /(5s|cinco s|organização)/i,
    response: "O **5S** é uma metodologia de organização e limpeza: \n1. Seiri (Utilização)\n2. Seiton (Organização)\n3. Seiso (Limpeza)\n4. Seiketsu (Padronização)\n5. Shitsuke (Disciplina)"
  },
  {
    keywords: /(fifo|primeiro que entra)/i,
    response: "**FIFO (First In, First Out)** significa que o primeiro produto a entrar no estoque deve ser o primeiro a sair. É essencial para produtos com data de validade!"
  },
  {
    keywords: /(otif|on time in full)/i,
    response: "O **OTIF (On-Time In-Full)** é o indicador que mede se um pedido foi entregue no prazo correto (On-Time) e completo, sem faltas ou avarias (In-Full)."
  },
  {
    keywords: /(ola|olá|oi|bom dia|boa tarde|boa noite|eae)/i,
    response: "Olá! Como posso te ajudar hoje? Posso tirar dúvidas rápidas sobre processos como WMS, 5S, FIFO, ou OTIF."
  },
  {
    keywords: /(opção|opcoes|opções|menu|o que voce sabe|o que você faz|ajuda)/i,
    response: "Eu sou o Atlas, assistente rápido do LogiQ! Você pode me perguntar o significado de termos como: \n- WMS\n- 5S\n- FIFO\n- OTIF"
  }
];

// Resposta padrão (Fallback)
const defaultResponse = "🤖 Desculpe, não encontrei essa informação na minha base de regras. Sou um assistente automático configurado para termos básicos. Tente me perguntar sobre 'WMS', '5S', 'FIFO' ou 'OTIF'.";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    
    if (messages.length === 0) {
      return Response.json({ response: "Nenhuma mensagem recebida." });
    }

    // Pega a última mensagem (que é a mensagem do usuário)
    const ultimaMensagem = messages[messages.length - 1];
    const userText = ultimaMensagem.content;

    // Lógica do Cérebro (Rule-Based)
    let botReply = defaultResponse;
    for (let rule of knowledgeBase) {
      if (rule.keywords.test(userText)) {
        botReply = rule.response;
        break; // Para no primeiro match
      }
    }

    return Response.json({ response: botReply });
    
  } catch (error) {
    console.error("Erro na API Chat:", error);
    return Response.json({ response: "Ocorreu um erro no processamento da mensagem." }, { status: 500 });
  }
}
