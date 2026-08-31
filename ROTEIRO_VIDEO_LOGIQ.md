# 🎬 Roteiro e Regras do Projeto - LogiQ WMS
**Guia de referência para gravação do vídeo de apresentação/fala.**

Este documento consolida todas as regras de negócio, arquitetura e fluxo do sistema LogiQ para facilitar a explicação e estruturar o seu roteiro durante a gravação do vídeo.

---

## 1. Visão Geral (O que é o LogiQ?)
- **Conceito:** O LogiQ é um simulador educacional de WMS (Warehouse Management System).
- **Objetivo:** Unir a teoria (videoaulas) com a prática (simulação em tempo real). Ele permite que os alunos de logística vivenciem o dia a dia de um Centro de Distribuição.
- **Diferencial:** O aluno aprende na prática, em um ambiente gamificado onde o erro é uma ferramenta controlada de aprendizado. Cada ação no sistema reflete em indicadores reais de performance (KPIs).

---

## 2. Stack Tecnológica e Arquitetura
Para o vídeo, destaque que o LogiQ possui uma arquitetura moderna, focada em performance e em uma experiência de usuário (UX) impecável:
- **Frontend:** Next.js (App Router), React e Tailwind CSS. Estética moderna (glassmorphism, micro-interações, estilo Stripe).
- **Backend:** Next.js Server Actions (RPC seguro, substituindo rotas de API REST tradicionais).
- **Banco de Dados:** Neon Serverless (Postgres) utilizando connection pooling, arquitetura ideal para ambientes serverless (como a Vercel).
- **ORM & Validação:** Prisma para lidar com o banco de dados e Zod para garantir que nenhum dado inválido ou malformado chegue ao backend.

---

## 3. Dinâmica de Acesso e Multiplayer (Equipes)
Como os alunos interagem simultaneamente:
- **Sem Fricção (Zero Login):** Não há necessidade de e-mail e senha. O acesso é feito por **sessão local vinculada à equipe (turma)**.
- **Sistema de Slots (Vagas):** A equipe possui 5 cargos operacionais: *Líder, Recebimento, Estoque, Picking e Expedição*.
- **Lock Otimista (Segurança de Concorrência):** Se dois alunos tentarem pegar a mesma vaga ao mesmo tempo, o sistema garante o cargo para o primeiro e avisa o segundo de forma amigável, sem travar a aplicação.
- **Expiração Automática:** As vagas expiram sozinhas após 4 horas (lazy expiration), mantendo a manutenção simplificada.

---

## 4. O Coração do WMS: A Máquina de Estados
Este é o ponto mais prático para demonstrar no vídeo. O produto segue um fluxo rigoroso (máquina de estados) e nenhuma etapa pode ser pulada.

### Pilar 1: Recebimento (Status: `RECEBIDO`)
- **Ação:** O aluno da doca simula a entrada da mercadoria (Recebimento Cego).
- **Regra:** O item entra vinculado ao **Turno Ativo** da equipe. Uma conferência inicial bem feita é o que garante a acurácia de toda a cadeia.

### Pilar 2: Estoque (Status: `ESTOCADO`)
- **Ação:** O aluno define onde o item vai ser guardado fisicamente (Rua, Nível e Coluna no porta-pallets).
- **Regras de Inteligência Ensinadas:**
  - **Curva ABC:** Itens de alto giro (Curva A) ficam no chão (Nível 1) para acesso rápido.
  - **Estratégias de Giro:** FIFO (primeiro a entrar, primeiro a sair) e FEFO (primeiro a vencer, primeiro a sair - essencial para perecíveis).

### Pilar 3: Picking / Separação (Status: `SEPARADO`)
- **Ação:** A etapa mais crítica e cara do CD. O aluno utiliza um **Coletor RF Virtual**.
- **Regra do Bipe:** Para garantir rastreabilidade, o aluno deve "bipar" primeiro o endereço de origem e, em seguida, o código (EAN) do produto.
- **Gamificação:** Se o aluno bipa o item certo, ganha 1 ponto de Acerto para o turno. Se errar, ganha 1 Erro e a operação é bloqueada até que ele corrija.

### Pilar 4: Expedição (Status: `EXPEDIDO`)
- **Ação:** Direcionamento da carga separada para a doca de saída correspondente.
- **A Métrica Rei (OTIF):** O sucesso é medido pelo indicador On-Time In-Full (entregue no prazo e completo, sem avarias).

---

## 5. Ferramentas de Gestão, Monitoramento e Gamificação
Como a performance é avaliada (visão de Dashboard e Liderança):
- **KPIs em Tempo Real:** Duração do turno atual, taxa de acertos/erros no picking e Acurácia Geral de inventário.
- **Timeline Logística:** Uma trilha de auditoria (histórico completo). Permite ver quem movimentou o quê e quando, rastreando falhas na operação.
- **Quiz de Gamificação:** Após a simulação, o aluno responde perguntas teóricas. O relatório aponta suas fraquezas e indica quais videoaulas ele precisa rever.
- **Chatbot Atlas:** O "cérebro" assistente do ecossistema, disponível para sanar dúvidas teóricas sobre fluxo, metodologias (5S) e regras de WMS a qualquer momento.

---

## 💡 Dicas Adicionais para a "Fala" no Vídeo
1. **Foque no "Por Quê" e não só no "Como":** Quando mencionar o Zod, diga que ele *protege a operação de alunos curiosos*. Quando falar do Neon, diga que ele *permite que milhares de alunos acessem ao mesmo tempo sem derrubar o banco*.
2. **Destaque a UX Didática:** Frise que as mensagens de erro não são "estouros de código", mas sim instruções educacionais (ex: "Esse item já foi bipado, tente outro"). Tudo foca no aprendizado.
3. **Mostre o Fluxo Ininterrupto:** No vídeo, reforce que uma mercadoria nunca chega na Expedição sem antes ter sido Recebida, Estocada e Separada. O LogiQ força o aluno a entender a cadeia como um todo interligado.
