# LogiQ — Documentação e Arquitetura do Simulador WMS

Este documento detalha a lógica de negócio, o fluxo de dados e a stack tecnológica do LogiQ, um simulador de Centro de Distribuição educacional para treinamento prático de alunos em logística.

---

## 1. Stack Tecnológica

Arquitetura fullstack baseada em React e Serverless, priorizando performance e facilidade de deploy:

**Frontend**

- **Next.js (App Router)** — framework principal das páginas.
- **React & Tailwind CSS** — componentes dinâmicos com estilização utilitária (sem arquivos CSS externos por componente). Estética moderna (estilo Stripe), com glassmorphism, sombras suaves e micro-interações.
- **Lucide React** — biblioteca de ícones.

**Backend**

- **Next.js Server Actions** — funções TypeScript (`"use server"`) executadas no servidor, chamadas diretamente pelos componentes React via RPC seguro. Substituem rotas de API REST tradicionais.

**Banco de Dados & Validação**

- **Neon Serverless (Postgres)** — banco relacional desenhado para ambiente serverless (Vercel). A conexão usa a _connection string_ com pooling (host contendo `-pooler`), essencial para não esgotar conexões em funções serverless.
- **Prisma ORM** — comunicação tipada com o banco, migrações e queries.
- **Zod** — validação de todo dado recebido do cliente, garantindo que nenhum aluno envie dados vazios, malformados ou fora do esperado para o backend.

---

## 2. Identidade e Sessão por Equipe

Para manter a fricção baixa em sala de aula (sem contas de e-mail/senha), a identidade no LogiQ funciona por **sessão local vinculada à equipe**:

1. **Acesso:** o aluno entra no site, clica em "Equipe" no menu e digita o nome da turma (ex: "Logística A").
2. **Criação ou resgate:** o backend verifica se a equipe já existe.
   - Se não existir, cria a equipe e popula automaticamente as **5 vagas padrão**: Líder, Recebimento, Estoque, Picking, Expedição.
   - Se já existir, apenas carrega os slots atuais.
3. **Persistência local:** o ID e o nome da equipe ficam salvos no `localStorage` do navegador, através do hook `hooks/use-equipe.ts`.
4. **Isolamento de dados:** todas as telas (WMS, Dashboard, Equipe) leem esse ID salvo e exibem apenas dados da turma atual. Sem equipe selecionada, o acesso às áreas operacionais fica bloqueado, com um convite claro para selecionar/criar uma equipe.

---

## 3. Sistema de Vagas (Slots)

Em vez de contas fixas, cada aluno ocupa temporariamente um "cargo" dentro da equipe:

- **Concorrência segura (lock otimista):** se dois alunos tentarem assumir o mesmo cargo (ex: "Líder") ao mesmo tempo, a Server Action `ocuparSlot` usa `updateMany` atômico no Postgres, condicionado a `ocupado: false`. Quem chega primeiro ocupa o cargo; o segundo recebe um erro claro, sem que o sistema quebre.
- **Expiração preguiçosa (lazy expiration):** não há processo rodando 24h para liberar vagas. A cada leitura da página da Equipe, o sistema roda um filtro silencioso que libera automaticamente todas as vagas cujo tempo (4 horas) já expirou.

---

## 4. Máquina de Estados Operacional (WMS)

O núcleo do projeto é a operação logística. Cada item cadastrado segue uma máquina de estados finita — nenhuma etapa pode ser pulada:

| Etapa | Status     | Ação             | O que acontece                                                                                                                                                       |
| ----- | ---------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `RECEBIDO` | `receberItem`    | O aluno da doca cadastra os dados do item e do fornecedor. O item entra vinculado ao **Turno Ativo** da equipe.                                                      |
| 2     | `ESTOCADO` | `enderecarItem`  | O sistema valida que o item está `RECEBIDO`. O aluno define onde o item será guardado (rua e nível).                                                                 |
| 3     | `SEPARADO` | `validarPicking` | O aluno "bipa" o código do item. Se acertar, o turno ganha 1 ponto em Acertos; se errar, ganha 1 ponto em Erros e o item **não avança** até ser bipado corretamente. |
| 4     | `EXPEDIDO` | `expedirItem`    | Com o item já `SEPARADO`, o expedidor informa a doca de saída.                                                                                                       |

Qualquer tentativa de pular etapa (ex: expedir um item que não passou pelo picking) é barrada tanto pela validação de Zod quanto pela lógica de negócio no backend.

---

## 5. Arquitetura do Banco de Dados

- **Equipe** — entidade pai (turma).
- **Turno** — sessão do dia (ex: "Turno Matutino"). Guarda os KPIs `acertosPicking` e `errosPicking`. Ao iniciar um novo turno, o anterior é desativado e um novo, zerado, é aberto — essa troca deve ocorrer dentro de uma transação (`prisma.$transaction`) para garantir que nunca existam dois turnos ativos ao mesmo tempo.
- **Item** — a mercadoria simulada. Só existe vinculada a um Turno.
- **Slot** — os "cargos" dos alunos, vinculados estritamente a uma Equipe.

---

## 6. Padrão de Retorno das Server Actions

Para manter o tratamento de erro previsível em todas as telas, toda Server Action retorna o mesmo formato:

```typescript
type ActionResult<T> =
  | { sucesso: true; dados: T }
  | { sucesso: false; erro: string };
```

Isso evita que cada componente do frontend precise lidar com um formato de erro diferente dependendo de qual action foi chamada.

---

## 7. Administração e Reset

Existe um único papel de Admin, sem tabela própria — a autenticação é feita por senha simples guardada em variável de ambiente (`process.env.ADMIN_PASSWORD`).

- **`resetarEquipe(equipeId, senhaAdmin)`**: valida a senha e, se correta, limpa todos os slots e encerra os turnos da equipe, ignorando o tempo de expiração.
- Uso típico: reiniciar uma turma para uma nova turma/aula, ou corrigir um estado travado sem esperar a expiração natural.

---

## 8. Fluxo de Atualização e Revalidação

O Next.js cacheia agressivamente por padrão. Após qualquer mutação bem-sucedida (endereçar item, ocupar slot, resetar equipe):

1. O dado é gravado no Postgres (Neon).
2. O sistema chama `revalidatePath("/equipe")` (ou a rota correspondente, como `/dashboard`).
3. O frontend limpa o cache daquela rota e a tela se atualiza sozinha — o aluno nunca precisa dar F5 pra ver a mudança.

---

## 9. Diretriz de Linguagem (requisito obrigatório de UX)

Como o público-alvo são alunos em treinamento, **todo texto visível no site precisa usar linguagem simples e didática** — não só nas telas de conteúdo explicativo, mas também em:

- Mensagens de erro (ex: em vez de "Constraint violation", usar algo como "Essa vaga já foi ocupada por outra pessoa, escolha outra")
- Rótulos de botões e campos de formulário
- Textos de status e feedback (ex: ao errar no picking, explicar o que aconteceu, não só mostrar um "Erro")
- Tooltips e instruções de cada etapa do fluxo (Recebimento, Estoque, Picking, Expedição)

O objetivo é que um aluno sem nenhum conhecimento técnico entenda o que está acontecendo no sistema só de ler a tela, sem precisar de explicação externa. Isso vale tanto para o conteúdo educacional das páginas quanto para qualquer mensagem gerada pelo backend (erros, confirmações, avisos).
