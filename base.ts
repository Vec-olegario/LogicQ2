/**
 * Base de Conhecimento para o Chatbot Atlas - Plataforma LogiQ
 * 
 * Este arquivo contém as regras de resposta baseadas em expressões regulares (Regex)
 * mapeando termos teóricos e práticos da plataforma LogiQ, incluindo os 4 pilares
 * (Recebimento, Estoque, Picking, Expedição), ferramentas do sistema (Dashboard, Quiz, Equipes)
 * e metodologias cruciais (5S, Diagrama de Pareto, Curva ABC).
 * 
 * Formato compatível com o arquivo app/api/chat/route.ts.
 */

interface ChatRule {
  keywords: RegExp;
  response: string;
}

export const knowledgeBase: ChatRule[] = [
  // 1. DÚVIDAS GERAIS & SAUDAÇÕES
  {
    keywords: /\\b(oi|ola|olá|bom dia|boa tarde|boa noite|ola atlas|oi atlas|ajuda|help)\\b/i,
    response: "Olá! Eu sou o **Atlas**, seu assistente virtual de inteligência logística aqui no **LogiQ**. 🤖\n\nEstou aqui para tirar suas dúvidas sobre a plataforma, o funcionamento dos turnos e os principais conceitos teóricos de logística (como **5S**, **Curva ABC**, **FIFO**, **OTIF** e muito mais) enquanto você simula!\n\nComo posso ajudar na sua operação hoje?"
  },
  {
    keywords: /(quem e voce|quem e você|o que voce faz|o que você faz|como funciona o bot|atlas)/i,
    response: "Eu sou o **Atlas**, o assistente inteligente do **LogiQ**!\n\nMeu papel é ser o seu mentor em tempo real. Você pode me perguntar sobre:\n- **Os 4 setores do CD**: Recebimento, Estoque, Picking e Expedição.\n- **Conceitos de Qualidade**: Metodologia 5S, Diagrama de Pareto e Curva ABC.\n- **Regras do Simulador**: Uso do Coletor RF, formação de equipes, funcionamento do Quiz e acompanhamento de KPIs no Dashboard.\n\nFique à vontade para me mandar termos operacionais ou dúvidas práticas da simulação!"
  },
  {
    keywords: /(equipe|time|multiplayer|grupo|amigo|parceiro|codigo|convite|sala)/i,
    response: "No **LogiQ**, a simulação é cooperativa e em tempo real (**multiplayer**)! 👥\n\n- **Como funciona**: Para iniciar um turno, você precisa criar ou entrar em uma equipe.\n- **Código de convite**: O criador da equipe gera um código único que deve ser compartilhado com os outros membros para que eles ocupem as vagas/cargos da equipe.\n- **Sincronia**: Todos os integrantes trabalham no mesmo Centro de Distribuição ao mesmo tempo nas docas, prateleiras e expedição. A cooperação é a chave para uma alta acurácia operacional!"
  },

  // 2. SETOR 1: RECEBIMENTO
  {
    keywords: /(recebimento|receber|entrada|docas de entrada|descarregar)/i,
    response: "O **Recebimento** é o primeiro setor operacional do galpão no **LogiQ**! 🚚\n\nNesta etapa, você é responsável por:\n- Controlar a chegada de caminhões nas docas de entrada.\n- Conferir fisicamente as mercadorias que estão sendo descarregadas.\n- Cruzar os dados físicos com os dados da **Nota Fiscal Eletrônica (NF-e)**.\n- Realizar o **Recebimento Cego (Blind Receiving)** para evitar fraudes ou erros de contagem."
  },
  {
    keywords: /(nfe|nota fiscal|nf-e|nota fiscal eletronica|documento fiscal)/i,
    response: "A **Nota Fiscal Eletrônica (NF-e)** é o documento fiscal crucial na entrada do armazém. 📄\n\nNo **LogiQ**, ela serve como o padrão de comparação oficial. Tudo o que é descarregado fisicamente nas docas deve ser minuciosamente confrontado com as quantidades e descrições declaradas na NF-e para evitar faturamento incorreto, avarias ou recebimento de mercadorias não solicitadas."
  },
  {
    keywords: /(recebimento cego|receber cego|blind receiving|conferencia cega|conferência cega)/i,
    response: "O **Recebimento Cego (Blind Receiving)** é uma técnica de auditoria e segurança logística altamente eficaz! 👁️❌\n\n- **Como funciona**: O conferente de docas faz a contagem física das mercadorias sem ter acesso prévio à quantidade declarada na Nota Fiscal (NF-e).\n- **Por que é crucial**: Isso obriga o operador a contar de fato cada caixa ou palete, evitando a 'conferência por preguiça' (apenas assinar o papel confiando no que está escrito). Isso protege a acurácia do estoque desde o primeiro minuto da operação."
  },
  {
    keywords: /(cross-docking|crossdocking|cross docking|fluxo direto)/i,
    response: "O **Cross-Docking** é um processo logístico focado na velocidade e eliminação de custos de estocagem! ⚡\n\nNesse modelo, as mercadorias recebidas na doca de entrada não passam pelo processo tradicional de armazenagem (guardar no porta-paletes). Elas são imediatamente preparadas, consolidadas e direcionadas para as docas de expedição (saída) para serem enviadas ao cliente final. Reduz custos de movimentação física e o tempo de ciclo do pedido!"
  },

  // 3. SETOR 2: ESTOQUE (ARMAZENAGEM)
  {
    keywords: /(estoque|armazenar|armazenagem|guardar|guardado|porta-palete)/i,
    response: "O setor de **Estoque (Armazenagem)** do **LogiQ** cuida da organização física das mercadorias! 📦\n\n- **A atividade**: Você deve direcionar os paletes aprovados no recebimento para as posições corretas do porta-paletes.\n- **O desafio**: É preciso seguir as regras de endereçamento logístico e posicionar os itens de acordo com o giro de estoque (**Curva ABC**) e regras de movimentação (**FIFO, LIFO, FEFO**), otimizando o espaço e agilizando o picking futuro."
  },
  {
    keywords: /(endereçamento|enderecamento|rua nivel coluna|rua nível coluna|onde guardar|localizacao|localização)/i,
    response: "O **Endereçamento Logístico** é a 'coordenada GPS' de cada mercadoria no armazém! 📍\n\nNo **LogiQ**, adotamos o padrão de indexação tridimensional:\n- **Rua**: O corredor onde o produto está localizado.\n- **Coluna (ou Vão)**: A posição horizontal ao longo da rua.\n- **Nível**: A altura do porta-paletes (nível do chão até o topo).\n\nEste endereçamento garante que qualquer operador encontre o produto instantaneamente na hora da separação, mantendo a acurácia geral em 100%."
  },
  {
    keywords: /(fifo|peps|first in first out|primeiro que entra)/i,
    response: "A regra **FIFO (First-In, First-Out)**, também conhecida como **PEPS** (Primeiro que Entra, Primeiro que Sai), é uma metodologia de giro de estoque! 🔄\n\n- **Como funciona**: O produto que foi armazenado há mais tempo deve ser o primeiro a ser retirado para faturamento.\n- **Aplicação**: Essencial para evitar obsolescência de produtos que podem ficar ultrapassados no fundo do galpão ou sofrer deterioração física."
  },
  {
    keywords: /(lifo|ueps|last in first out|ultimo que entra)/i,
    response: "A regra **LIFO (Last-In, First-Out)**, ou **UEPS** (Último que Entra, Primeiro que Sai), dita o giro inverso do estoque! 🧱\n\n- **Como funciona**: O produto mais recentemente armazenado é o primeiro a ser retirado.\n- **Aplicação**: Muito restrito na logística moderna. É aceitável para mercadorias homogêneas e sem data de validade (como materiais de construção pesados ou pilhas de blocos de carvão), onde a movimentação do estoque antigo seria excessivamente trabalhosa ou cara."
  },
  {
    keywords: /(fefo|pvps|first expired first out|primeiro a vencer)/i,
    response: "A regra **FEFO (First-Expired, First-Out)**, ou **PVPS** (Primeiro a Vencer, Primeiro que Sai), é obrigatória para produtos perecíveis! 🍎⏳\n\n- **Como funciona**: A prioridade de saída do estoque é definida estritamente pela data de validade (lote mais próximo do vencimento), independentemente de quando o lote entrou no Centro de Distribuição.\n- **Aplicação**: Crítico no segmento farmacêutico, cosmético, químico e de alimentos e bebidas para evitar o vencimento de produtos estocados."
  },

  // 4. SETOR 3: PICKING (SEPARAÇÃO)
  {
    keywords: /(picking|separacao|separação|pegar item|separar pedido)/i,
    response: "O **Picking** é o processo de separação e coleta de pedidos individuais do estoque para atender às demandas dos clientes! 🛒\n\nNo **LogiQ**, esta é uma das etapas mais dinâmicas da simulação. O operador utiliza um **Coletor RF virtual** para encontrar os itens exatos nas prateleiras. Erros no picking reduzem o indicador de **Acertos no Picking** e a eficiência global da operação, gerando retrabalho."
  },
  {
    keywords: /(coletor rf|coletor de radiofrequencia|coletor de radiofrequência|bipar|bipador|leitor de barras|ean)/i,
    response: "O **Coletor de Radiofrequência (RF)** é o equipamento móvel mais importante do operador de picking! 📱⚡\n\n- **No LogiQ**: Você utiliza a tela do coletor virtual para escanear o código de barras (**EAN**) correto do produto na prateleira.\n- **Por que bipar?**: A leitura ótica elimina erros humanos de digitação e confirma eletronicamente e em tempo real que você pegou o item exato no endereço correto, atualizando o sistema WMS instantaneamente."
  },
  {
    keywords: /(picking por zona|picking por onda|picking discreto|wave picking|zone picking|metodos de picking|métodos de picking)/i,
    response: "Existem diferentes métodos de picking para maximizar a velocidade de separação:\n\n- **Picking Discreto**: Um único operador coleta todos os itens de um único pedido do início ao fim (baixo índice de erro, mas menor velocidade).\n- **Picking por Zona (Zone Picking)**: O armazém é dividido em setores (zonas). O operador fica responsável apenas pela sua zona, coletando os itens daquele pedido que estão nela e passando a caixa para a próxima zona (reduz deslocamento físico).\n- **Picking por Onda (Wave Picking)**: Agrupa-se os pedidos por critérios comuns (ex: mesma transportadora, mesma rota ou horário de saída), liberando as tarefas em 'ondas' organizadas para otimizar os recursos do galpão."
  },
  {
    keywords: /(voice picking|pick to light|separacao por voz|separação por voz|luz de separacao|luz de separação)/i,
    response: "São tecnologias avançadas de assistência ao picking que aumentam a ergonomia e produtividade:\n\n- **Voice Picking (Separação por Voz)**: O operador recebe as instruções de picking (endereço e quantidade) por meio de uma voz sintética nos fones de ouvido e confirma a tarefa executada por comandos de voz. Deixa as mãos e os olhos livres!\n- **Pick-to-Light**: Displays luminosos instalados diretamente nas prateleiras se acendem e indicam visualmente ao operador de onde retirar o produto e a quantidade exata. Praticamente elimina erros de separação!"
  },

  // 5. SETOR 4: EXPEDIÇÃO
  {
    keywords: /(expedição|expedicao|enviar|carregar caminhao|carregar caminhão|docas de saida|docas de saída)/i,
    response: "A **Expedição** é a última etapa física do ciclo logístico no Centro de Distribuição! 📦🚛\n\nNela, os paletes separados no picking chegam às docas de saída onde você deve:\n- Conferir o romaneio de carga para garantir o embarque dos itens corretos.\n- Organizar e consolidar os produtos em volumes unitizados.\n- Realizar a roteirização do transporte.\n- Liberar o caminhão para entrega e calcular o nível de serviço final (**OTIF**)."
  },
  {
    keywords: /(romaneio|unitização|unitizacao|consolidacao|consolidação)/i,
    response: "Dois conceitos vitais na preparação para o transporte final:\n\n- **Unitização de Carga**: O ato de agrupar diversos volumes pequenos em um único bloco padrão (geralmente sobre um palete ou dentro de um contêiner). Facilita e acelera a movimentação física durante a carga e descarga.\n- **Romaneio de Carga (Packing List)**: O documento logístico que lista detalhadamente todas as mercadorias embarcadas em um veículo, especificando pesos, dimensões, volumes e embalagens. Essencial para fiscalização nas estradas e conferência no destino."
  },
  {
    keywords: /(tms|sistema de transporte|transportation management)/i,
    response: "O **TMS (Transportation Management System)** é o sistema responsável por planejar, executar e otimizar as atividades de transporte fora das paredes do Centro de Distribuição! 🗺️🚚\n\nEnquanto o WMS gerencia o que acontece dentro do armazém, o TMS cuida de:\n- Roteirização inteligente de frotas (escolha das melhores rotas para economizar combustível).\n- Auditoria de fretes contratados.\n- Rastreamento em tempo real das entregas na estrada.\n- Redução do tempo de entrega final ao cliente."
  },
  {
    keywords: /(pod|proof of delivery|comprovante de entrega)/i,
    response: "O **POD (Proof of Delivery)**, ou **Comprovante de Entrega**, é o documento que encerra juridicamente a responsabilidade da transportadora! 📝🔒\n\nEle é assinado e datado pelo cliente destinatário no momento em que a mercadoria é descarregada sem avarias. Atualmente, o POD é frequentemente eletrônico, enviando uma foto da assinatura ou do canhoto diretamente para o sistema WMS/TMS em tempo real para liberação do pagamento do frete."
  },

  // 6. GESTÃO DE QUALIDADE & EFICIÊNCIA (5S & PARETO)
  {
    keywords: /(5s|cinco s|metodologia 5s|qualidade no galpao|organizacao e limpeza)/i,
    response: "A **Metodologia 5S** é a base de organização e qualidade japonesa indispensável para a logística! 🧹📋\n\nEla é composta por cinco sensos operacionais:\n1. **Seiri (Utilização)**: Descartar o que não é útil do armazém.\n2. **Seiton (Organização)**: Organizar ferramentas (como Coletores RF) e demarcar visualmente os corredores e docas.\n3. **Seiso (Limpeza)**: Manter o local limpo para evitar poeira nas mercadorias e acidentes.\n4. **Seiketsu (Padronização)**: Criar regras visuais e rotinas claras para todos os operadores.\n5. **Shitsuke (Autodisciplina)**: Estimular a responsabilidade individual para manter os sensos ativos.\n\nNo **LogiQ**, aplicar o 5S reduz diretamente o indicador de **Duração do Turno**, pois evita desperdício de tempo procurando paletes ou desatravancando o fluxo."
  },
  {
    keywords: /(pareto|diagrama de pareto|regra 80\/20|regra 80 20|principio de pareto|princípio de pareto)/i,
    response: "O **Diagrama de Pareto (Regra 80/20)** é uma ferramenta estatística crucial que revolucionou a armazenagem! 📊\n\n- **O Princípio**: Ele indica que cerca de **80% dos efeitos vêm de 20% das causas**.\n- **Na Logística**: Isso significa que aproximadamente **80% do giro de vendas do armazém é composto por apenas 20% do mix de produtos (itens Classe A)**.\n- **Aplicação no LogiQ**: Ao aplicar Pareto através da **Curva ABC**, agrupamos esses 20% de alta demanda em locais estratégicos próximos às docas de expedição, otimizando drasticamente os movimentos físicos do galpão."
  },
  {
    keywords: /(curva abc|curva de prioridade|classe a b c)/i,
    response: "A **Curva ABC** é a aplicação do Princípio de Pareto para categorizar o estoque por importância operacional e financeira! 📈\n\n- **Classe A (Alta rotatividade - ~20% dos itens, ~80% do fluxo)**: Devem ficar estocados perto das docas de expedição para reduzir o tempo de deslocamento do picking.\n- **Classe B (Média rotatividade - ~30% dos itens, ~15% do fluxo)**: Estocados em áreas intermediárias.\n- **Classe C (Baixa rotatividade - ~50% dos itens, ~5% do fluxo)**: Podem ocupar posições mais distantes ou níveis superiores das prateleiras, pois saem pouco.\n\nIgnorar a Curva ABC no **LogiQ** penaliza gravemente o indicador de Duração do Turno e cansa os operadores desnecessariamente."
  },

  // 7. DESEMPENHO, KPIS E QUIZ
  {
    keywords: /(otif|on time in full|nivel de servico|nível de serviço)/i,
    response: "O **OTIF (On-Time In-Full)** é o indicador padrão de ouro na logística internacional para medir a satisfação do cliente! 🏆⭐\n\nEle é composto por duas variáveis multiplicadas:\n- **On-Time (No Prazo)**: O pedido foi entregue exatamente na data e hora acordados com o cliente.\n- **In-Full (Completo)**: O pedido foi entregue completo, nas quantidades corretas, sem avarias, erros ou devoluções.\n\nNo **LogiQ**, a eficiência da sua equipe em todas as etapas operacionais determinará a pontuação do OTIF no fechamento da expedição!"
  },
  {
    keywords: /(kpi|indicadores|acuracia|desempenho|duracao do turno|duração do turno|performance|dashboard)/i,
    response: "O **Dashboard do LogiQ** exibe os KPIs (Key Performance Indicators) em tempo real da sua operação! 📈💻\n\nPreste atenção nesses indicadores de sucesso:\n- **Acurácia Geral da Operação (%)**: Mede o quão preciso foi o seu recebimento, estocagem e picking. Divergências e bipe de código de barras errado reduzem essa taxa.\n- **Duração do Turno**: O tempo total gasto para concluir os pedidos. Quanto mais organizada a logística (5S, ABC), menor o tempo.\n- **Acertos no Picking**: A taxa de assertividade no uso do Coletor RF.\n- **Timeline Logística**: O registro vertical em tempo real que exibe quem fez o que no armazém (ex: 'Palete 10 estocado por João')."
  },
  {
    keywords: /(quiz|perguntas do quiz|modos do quiz|modo rapido|modo padrao|modo completo)/i,
    response: "O **Quiz Logístico** é a ferramenta ideal para consolidar seus conhecimentos e fixar as teorias estudadas! 🧠🎯\n\n- **Os Modos**: Você pode jogar no modo **Rápido (5 perguntas)**, **Padrão (15 perguntas)** ou **Completo (todas as 32 perguntas complexas)**.\n- **Relatório de Desempenho**: Ao final de cada partida, o sistema analisa os seus erros e acertos de forma inteligente e divide os resultados setor por setor (Recebimento, Estoque, Picking e Expedição), apontando exatamente qual área você precisa estudar mais nas videoaulas integradas!"
  }
];
