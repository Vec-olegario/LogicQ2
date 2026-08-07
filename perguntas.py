"""
=============================================================================
  BANCO DE PERGUNTAS DO QUIZ (perguntas.py) — LogiQ
  Armazena as 32 questões didáticas sobre os 4 setores do Centro de Distribuição
  e fornece métodos tipados para consulta e filtragem.
=============================================================================
"""
from typing import List, Dict, Any, Optional

# ─────────────────────────────────────────────
# BANCO DE PERGUNTAS (32 questões / 4 tópicos — 8 por setor)
# ─────────────────────────────────────────────
BANCO_PERGUNTAS: List[Dict[str, Any]] = [
    # ══════════════════════════════════════════════
    # ── RECEBIMENTO (8 perguntas) ──
    # ══════════════════════════════════════════════
    {
        "id": "R01", "topico": "Recebimento", "dificuldade": "Fácil",
        "pergunta": "Qual é a primeira etapa do processo de recebimento de mercadorias em um CD?",
        "opcoes": [
            "Conferência física dos produtos.",
            "Endereçamento no porta-pallets.",
            "Agendamento de doca e conferência documental (NF-e).",
            "Separação de pedidos (Picking).",
        ],
        "correta": 2,
        "explicacao": "Antes de descarregar qualquer mercadoria, é necessário agendar a doca e realizar a conferência documental para garantir que o que chegou está correto.",
    },
    {
        "id": "R02", "topico": "Recebimento", "dificuldade": "Médio",
        "pergunta": "O que significa 'Cross-Docking' no contexto do recebimento?",
        "opcoes": [
            "Armazenar mercadorias por longos períodos no estoque.",
            "Transferir mercadorias da doca de recebimento diretamente para a doca de expedição, sem armazenagem.",
            "Cruzar dados de diferentes notas fiscais.",
            "Empilhar paletes usando empilhadeiras retráteis.",
        ],
        "correta": 1,
        "explicacao": "Cross-docking é uma prática ágil onde o produto é recebido e já preparado para expedição imediatamente, eliminando o tempo de armazenagem.",
    },
    {
        "id": "R03", "topico": "Recebimento", "dificuldade": "Difícil",
        "pergunta": "Em 'Blind Receiving' (Recebimento Cego), o conferente:",
        "opcoes": [
            "Não utiliza EPIs durante a operação.",
            "Recebe uma lista de itens sem as quantidades para contar fisicamente e evitar fraudes.",
            "Aceita a carga sem conferir os documentos.",
            "Utiliza óculos de realidade virtual para escanear os produtos.",
        ],
        "correta": 1,
        "explicacao": "No recebimento cego, o sistema omite as quantidades esperadas, forçando o conferente a contar cada item e garantindo maior precisão.",
    },
    {
        "id": "R04", "topico": "Recebimento", "dificuldade": "Fácil",
        "pergunta": "Qual documento fiscal é obrigatório para iniciar o processo de recebimento no Brasil?",
        "opcoes": [
            "Romaneio de carga.",
            "Nota Fiscal Eletrônica (NF-e).",
            "Conhecimento de Transporte (CT-e).",
            "Ordem de compra interna.",
        ],
        "correta": 1,
        "explicacao": "A NF-e é o documento fiscal principal que ampara a entrada da mercadoria. Sem ela, o recebimento não pode ser formalizado.",
    },
    {
        "id": "R05", "topico": "Recebimento", "dificuldade": "Médio",
        "pergunta": "O que é 'Dwell Time' no contexto de recebimento?",
        "opcoes": [
            "O tempo que o produto fica na prateleira antes de ser vendido.",
            "O tempo total que o caminhão permanece na doca durante o descarregamento.",
            "O intervalo entre dois pedidos do mesmo cliente.",
            "O tempo de validade de produtos perecíveis.",
        ],
        "correta": 1,
        "explicacao": "Dwell Time mede quanto tempo o veículo fica ocupando a doca. Quanto menor, mais caminhões o galpão consegue processar por dia.",
    },
    {
        "id": "R06", "topico": "Recebimento", "dificuldade": "Fácil",
        "pergunta": "Ao receber um palete com caixas avariadas, o conferente deve:",
        "opcoes": [
            "Aceitar tudo e resolver depois com o estoque.",
            "Registrar a avaria no sistema e separar os itens danificados para devolução ao fornecedor.",
            "Descartar os produtos danificados sem registrar.",
            "Enviar diretamente para o cliente mais próximo.",
        ],
        "correta": 1,
        "explicacao": "Produtos avariados devem ser registrados, separados e devolvidos ao fornecedor. Nunca devem ser misturados com o estoque regular.",
    },
    {
        "id": "R07", "topico": "Recebimento", "dificuldade": "Difícil",
        "pergunta": "Qual é a principal função do 'agendamento de doca' (dock scheduling)?",
        "opcoes": [
            "Garantir que todos os caminhões cheguem no mesmo horário.",
            "Distribuir os horários de chegada dos veículos para evitar filas e otimizar o uso das docas.",
            "Definir quais produtos serão vendidos na semana.",
            "Programar a manutenção das empilhadeiras.",
        ],
        "correta": 1,
        "explicacao": "O agendamento de doca organiza os horários de chegada para que cada caminhão tenha uma doca pronta, reduzindo tempo de espera e otimizando recursos.",
    },
    {
        "id": "R08", "topico": "Recebimento", "dificuldade": "Médio",
        "pergunta": "Quando a quantidade física recebida é MAIOR que a quantidade da NF-e, isso se chama:",
        "opcoes": [
            "Sobra de recebimento.",
            "Falta de recebimento.",
            "Inventário rotativo.",
            "Reposição automática.",
        ],
        "correta": 0,
        "explicacao": "Quando chega mais produto do que o registrado na NF-e, temos uma 'sobra'. O excedente deve ser registrado e devolvido ou regularizado com NF complementar.",
    },

    # ══════════════════════════════════════════════
    # ── ESTOQUE (8 perguntas) ──
    # ══════════════════════════════════════════════
    {
        "id": "E01", "topico": "Estoque", "dificuldade": "Fácil",
        "pergunta": "O que é WMS (Warehouse Management System)?",
        "opcoes": [
            "Um modelo de empilhadeira elétrica.",
            "Sistema de Gerenciamento de Armazém que otimiza as operações logísticas.",
            "Um tipo de embalagem sustentável.",
            "World Monitoring System, para rastreio global de frotas.",
        ],
        "correta": 1,
        "explicacao": "WMS é o sistema central que gerencia estoque, recebimento, picking e expedição dentro de um CD.",
    },
    {
        "id": "E02", "topico": "Estoque", "dificuldade": "Médio",
        "pergunta": "Qual estrutura é recomendada para alta densidade, onde a empilhadeira entra na própria estrutura (LIFO)?",
        "opcoes": [
            "Porta-Pallets Convencional",
            "Drive-in",
            "Estanteria Leve",
            "Mezanino",
        ],
        "correta": 1,
        "explicacao": "O sistema Drive-in permite que a empilhadeira entre nos corredores da estrutura, operando em LIFO para grandes volumes do mesmo SKU.",
    },
    {
        "id": "E03", "topico": "Estoque", "dificuldade": "Difícil",
        "pergunta": "Na curva ABC de estoque, os itens da classe 'A' representam:",
        "opcoes": [
            "Menor valor de faturamento, mas maior volume físico.",
            "Cerca de 20% dos itens que correspondem a aproximadamente 80% do valor/faturamento.",
            "Produtos avariados aguardando devolução.",
            "Itens de prateleira superior.",
        ],
        "correta": 1,
        "explicacao": "Pelo Princípio de Pareto (80/20), itens A são minoria em SKUs (~20%), mas representam a maior parte do valor (~80%).",
    },
    {
        "id": "E04", "topico": "Estoque", "dificuldade": "Fácil",
        "pergunta": "O que é um 'inventário rotativo'?",
        "opcoes": [
            "Contar todos os produtos do galpão de uma só vez no fim do ano.",
            "Contar pequenas amostras de produtos todos os dias ou semanas, de forma contínua.",
            "Girar os produtos nas prateleiras para evitar poeira.",
            "Trocar os produtos de endereço toda semana.",
        ],
        "correta": 1,
        "explicacao": "O inventário rotativo faz contagens parciais frequentes, mantendo a acuracidade do estoque sem precisar parar toda a operação.",
    },
    {
        "id": "E05", "topico": "Estoque", "dificuldade": "Médio",
        "pergunta": "O que significa FIFO no controle de estoque?",
        "opcoes": [
            "Fast In, Fast Out — produtos rápidos de vender.",
            "First In, First Out — o primeiro que entrou é o primeiro que sai.",
            "Full Inventory For Orders — inventário completo para pedidos.",
            "Final Item For Outbound — último item para expedição.",
        ],
        "correta": 1,
        "explicacao": "FIFO (Primeiro que Entra, Primeiro que Sai) é essencial para produtos com data de validade, garantindo que os mais antigos sejam vendidos primeiro.",
    },
    {
        "id": "E06", "topico": "Estoque", "dificuldade": "Fácil",
        "pergunta": "Qual é a função principal do 'endereçamento' no estoque?",
        "opcoes": [
            "Enviar e-mails para os fornecedores.",
            "Atribuir uma localização específica (Rua, Prateleira, Nível) a cada produto no galpão.",
            "Definir o preço de venda dos produtos.",
            "Cadastrar os endereços dos clientes.",
        ],
        "correta": 1,
        "explicacao": "O endereçamento cria um 'CEP interno' para cada posição do galpão, permitindo localizar qualquer produto em segundos.",
    },
    {
        "id": "E07", "topico": "Estoque", "dificuldade": "Difícil",
        "pergunta": "O que é o 'Giro de Estoque' e o que um giro BAIXO indica?",
        "opcoes": [
            "É a velocidade de renovação do estoque. Giro baixo indica alta demanda.",
            "É a velocidade de renovação do estoque. Giro baixo indica produtos encalhados, gerando custo de armazenagem.",
            "É a quantidade de funcionários no estoque. Giro baixo indica pouca rotatividade de pessoal.",
            "É a velocidade das empilhadeiras. Giro baixo indica manutenção em dia.",
        ],
        "correta": 1,
        "explicacao": "Giro de Estoque = Vendas / Estoque Médio. Um giro baixo indica que os produtos demoram muito para serem vendidos, ocupando espaço e gerando custo.",
    },
    {
        "id": "E08", "topico": "Estoque", "dificuldade": "Médio",
        "pergunta": "O que é 'estoque de segurança' (safety stock)?",
        "opcoes": [
            "Um estoque de EPIs para os funcionários.",
            "Uma quantidade extra de produto mantida para evitar falta em caso de atraso do fornecedor ou aumento inesperado de demanda.",
            "Um cofre para guardar produtos de alto valor.",
            "O estoque mínimo necessário para fechar o galpão no fim do expediente.",
        ],
        "correta": 1,
        "explicacao": "O estoque de segurança é uma 'reserva estratégica' que protege a operação contra imprevistos como atrasos de entrega ou picos de venda.",
    },

    # ══════════════════════════════════════════════
    # ── PICKING (8 perguntas) ──
    # ══════════════════════════════════════════════
    {
        "id": "P01", "topico": "Picking", "dificuldade": "Fácil",
        "pergunta": "O que é o processo de 'Picking'?",
        "opcoes": [
            "Embalar os produtos nas caixas.",
            "Separar e coletar os produtos no estoque para atender a um pedido.",
            "Limpar o galpão.",
            "Receber mercadorias de devolução.",
        ],
        "correta": 1,
        "explicacao": "Picking (Separação) é a coleta dos itens corretos, nas quantidades corretas, dos seus locais de armazenagem para atender pedidos.",
    },
    {
        "id": "P02", "topico": "Picking", "dificuldade": "Médio",
        "pergunta": "No modelo 'Goods-to-Person', como o processo ocorre?",
        "opcoes": [
            "O operador anda pelo galpão empurrando um carrinho.",
            "O operador dirige uma empilhadeira até a prateleira.",
            "Sistemas automatizados trazem o produto até a estação do operador.",
            "O cliente entra no galpão para pegar a mercadoria.",
        ],
        "correta": 2,
        "explicacao": "Em sistemas 'Goods-to-Person', robôs ou esteiras transportam o item até o separador, eliminando tempo de deslocamento a pé.",
    },
    {
        "id": "P03", "topico": "Picking", "dificuldade": "Difícil",
        "pergunta": "O que é 'Batch Picking' (Separação por Lote)?",
        "opcoes": [
            "Separar um único pedido por vez do início ao fim.",
            "Coletar itens para vários pedidos simultaneamente em uma única viagem pelo estoque.",
            "Separar apenas produtos que estão prestes a vencer.",
            "Embalar todos os itens do galpão no mesmo tipo de caixa.",
        ],
        "correta": 1,
        "explicacao": "O Batch Picking agrupa vários pedidos para que o operador colete todos os itens em uma única rota, aumentando muito a produtividade.",
    },
    {
        "id": "P04", "topico": "Picking", "dificuldade": "Fácil",
        "pergunta": "Qual ferramenta ou tecnologia é comumente usada para auxiliar no picking?",
        "opcoes": [
            "Coletor de dados (scanner de código de barras ou RF).",
            "Calculadora financeira.",
            "Balança rodoviária.",
            "Termômetro a laser.",
        ],
        "correta": 0,
        "explicacao": "O coletor de dados por radiofrequência (RF) orienta o operador até o endereço certo e valida o código de barras do item em tempo real.",
    },
    {
        "id": "P05", "topico": "Picking", "dificuldade": "Médio",
        "pergunta": "O que é o indicador 'Picking Accuracy' (Acurácia de Separação)?",
        "opcoes": [
            "A velocidade máxima da empilhadeira.",
            "O percentual de pedidos separados sem nenhum erro de item ou quantidade.",
            "O número total de caixas no galpão.",
            "O tempo gasto para almoçar.",
        ],
        "correta": 1,
        "explicacao": "A Acurácia de Separação mede a precisão do picking. Um índice abaixo de 99% pode gerar custos significativos com devoluções e retrabalho.",
    },
    {
        "id": "P06", "topico": "Picking", "dificuldade": "Fácil",
        "pergunta": "O que é 'Pick-to-Light'?",
        "opcoes": [
            "Trabalhar no estoque apenas durante o dia.",
            "Um sistema onde luzes e displays nas prateleiras indicam qual item e quantidade pegar.",
            "Usar lanternas para ler códigos de barras.",
            "Separar apenas produtos leves.",
        ],
        "correta": 1,
        "explicacao": "O Pick-to-Light usa sinalizadores visuais nas prateleiras para guiar o separador rapidamente, ideal para alta rotatividade de itens pequenos.",
    },
    {
        "id": "P07", "topico": "Picking", "dificuldade": "Difícil",
        "pergunta": "Em 'Zone Picking' (Separação por Zona), como o galpão é organizado?",
        "opcoes": [
            "O galpão é dividido em zonas quentes e frias apenas.",
            "Cada operador é responsável por uma área específica; o pedido passa por várias zonas até ser completado.",
            "Os clientes são divididos por CEP.",
            "Os produtos são separados por cor.",
        ],
        "correta": 1,
        "explicacao": "No Zone Picking, cada operador cuida exclusivamente da sua zona. Os itens parciais de cada zona são reunidos em uma estação de consolidação para montar o pedido completo.",
    },
    {
        "id": "P08", "topico": "Picking", "dificuldade": "Médio",
        "pergunta": "O que é 'Voice Picking' (Picking por Voz)?",
        "opcoes": [
            "O operador grita o nome do produto para o colega encontrar.",
            "O operador usa um fone com microfone e recebe instruções por voz do sistema WMS, ficando com as mãos livres.",
            "Um robô que fala o nome dos produtos enquanto separa.",
            "O sistema reproduz músicas para motivar os separadores.",
        ],
        "correta": 1,
        "explicacao": "No Voice Picking, o WMS envia comandos de voz ao headset do operador, que confirma verbalmente. Isso libera as mãos e aumenta a produtividade.",
    },

    # ══════════════════════════════════════════════
    # ── EXPEDIÇÃO (8 perguntas) ──
    # ══════════════════════════════════════════════
    {
        "id": "EX01", "topico": "Expedição", "dificuldade": "Fácil",
        "pergunta": "Qual é a última etapa antes da mercadoria sair no caminhão?",
        "opcoes": [
            "Endereçamento",
            "Conferência final de volumes e emissão de documentação (CT-e, Romaneio).",
            "Voice Picking",
            "Reposição de estoque",
        ],
        "correta": 1,
        "explicacao": "A expedição realiza a checagem final e garante que todos os documentos fiscais e de transporte acompanhem a carga.",
    },
    {
        "id": "EX02", "topico": "Expedição", "dificuldade": "Médio",
        "pergunta": "O que é TMS (Transportation Management System)?",
        "opcoes": [
            "Sistema para gerenciar apenas manutenções de caminhões.",
            "Sistema de Gerenciamento de Transporte, focado em roteirização, fretes e rastreio.",
            "Um rádio comunicador usado nas docas.",
            "Total Management Safety, software de segurança do trabalho.",
        ],
        "correta": 1,
        "explicacao": "O TMS gerencia a logística externa (fretes, rotas, rastreamento), complementando o WMS que foca na operação interna.",
    },
    {
        "id": "EX03", "topico": "Expedição", "dificuldade": "Difícil",
        "pergunta": "O que é POD (Proof of Delivery)?",
        "opcoes": [
            "Um formato de contêiner cilíndrico.",
            "O comprovante de entrega, assinado pelo recebedor, garantindo a conclusão do ciclo logístico.",
            "Ponto de Origem Direta.",
            "Programa Operacional de Docas.",
        ],
        "correta": 1,
        "explicacao": "Proof of Delivery (Prova de Entrega) é o documento que atesta legalmente que a carga foi recebida pelo cliente final.",
    },
    {
        "id": "EX04", "topico": "Expedição", "dificuldade": "Fácil",
        "pergunta": "O que é 'unitização' de carga na expedição?",
        "opcoes": [
            "Vender os produtos por unidade.",
            "Agrupar várias caixas ou volumes em um único palete ou contêiner para facilitar o transporte.",
            "Medir o peso unitário de cada produto.",
            "Separar cada item individualmente no caminhão.",
        ],
        "correta": 1,
        "explicacao": "Unitizar significa juntar vários volumes menores em uma unidade maior (palete, contêiner), agilizando carga/descarga e reduzindo avarias.",
    },
    {
        "id": "EX05", "topico": "Expedição", "dificuldade": "Médio",
        "pergunta": "O que é OTIF (On-Time In-Full)?",
        "opcoes": [
            "Um tipo de embalagem térmica para produtos refrigerados.",
            "O indicador que mede se o pedido foi entregue no prazo (On-Time) e completo (In-Full).",
            "Online Tracking of Internal Freight — rastreamento de carga interna.",
            "Operação Total de Inventário Físico.",
        ],
        "correta": 1,
        "explicacao": "OTIF é o KPI mais importante da expedição. Mede a qualidade da entrega sob duas dimensões: pontualidade e completude do pedido.",
    },
    {
        "id": "EX06", "topico": "Expedição", "dificuldade": "Fácil",
        "pergunta": "O que é um 'romaneio de carga'?",
        "opcoes": [
            "Um tipo de estante para guardar documentos.",
            "Uma lista detalhada dos volumes, quantidades e pesos embarcados em cada veículo.",
            "O nome do motorista responsável pela entrega.",
            "Um relatório de vendas mensal.",
        ],
        "correta": 1,
        "explicacao": "O romaneio é o documento que descreve exatamente o que foi colocado dentro do caminhão, servindo como checklist para conferência na entrega.",
    },
    {
        "id": "EX07", "topico": "Expedição", "dificuldade": "Difícil",
        "pergunta": "O que é 'roteirização' e qual seu impacto na expedição?",
        "opcoes": [
            "Definir a rota que os funcionários percorrem dentro do galpão.",
            "Planejar a melhor sequência de entregas para o caminhão, minimizando distância, tempo e custo de frete.",
            "Rotacionar os produtos nas prateleiras.",
            "Definir o horário de trabalho dos motoristas.",
        ],
        "correta": 1,
        "explicacao": "A roteirização otimiza a sequência das entregas, impactando diretamente no custo do frete, prazo de entrega e satisfação do cliente.",
    },
    {
        "id": "EX08", "topico": "Expedição", "dificuldade": "Médio",
        "pergunta": "Por que a conferência de volumes na doca é crítica antes do embarque?",
        "opcoes": [
            "Para verificar se o caminhão está limpo.",
            "Para garantir que a quantidade certa de volumes está sendo embarcada e evitar entregas incompletas ou trocadas.",
            "Para pesar o motorista antes da viagem.",
            "Para testar o funcionamento do GPS do caminhão.",
        ],
        "correta": 1,
        "explicacao": "A conferência na doca é a última barreira contra erros. Embarcar volumes errados gera custos de devolução, reenvio e insatisfação do cliente.",
    },
]


def get_pergunta_by_index(idx: int) -> Optional[Dict[str, Any]]:
    """
    Retorna o dicionário de uma pergunta a partir de seu índice no banco.

    Args:
        idx (int): Índice da pergunta (0 a 31).

    Returns:
        Optional[Dict[str, Any]]: Dicionário com os dados da pergunta ou None se fora dos limites.
    """
    if 0 <= idx < len(BANCO_PERGUNTAS):
        return BANCO_PERGUNTAS[idx]
    return None


def get_perguntas_by_topico(topico: str) -> List[int]:
    """
    Retorna os índices das perguntas que pertencem ao tópico especificado.

    Args:
        topico (str): Nome do setor (ex: 'Recebimento', 'Estoque', 'Picking', 'Expedição').

    Returns:
        List[int]: Lista dos índices correspondentes em BANCO_PERGUNTAS.
    """
    return [i for i, p in enumerate(BANCO_PERGUNTAS) if p["topico"] == topico]


def get_all_perguntas_indices() -> List[int]:
    """
    Retorna todos os índices possíveis do banco de perguntas.

    Returns:
        List[int]: Lista completa de 0 até len(BANCO_PERGUNTAS) - 1.
    """
    return list(range(len(BANCO_PERGUNTAS)))
