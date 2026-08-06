# LogiQ — Documentação e Arquitetura do Simulador WMS

Este documento detalha toda a lógica de negócio, fluxo de dados e stack tecnológica do LogiQ, um simulador de Centro de Distribuição educacional.

---

## 1. Stack Tecnológica (O que estamos usando)

O projeto adota uma arquitetura fullstack baseada em React e Serverless, focada em performance e facilidade de deploy:

* **Frontend:** 
  * **Next.js (App Router)**: Framework principal para as páginas.
  * **React & Tailwind CSS**: Para construção de componentes dinâmicos com estilização nativa (sem arquivos CSS externos para cada componente). O design segue uma estética moderna (Stripe-like) com glassmorphism, sombras suaves e micro-interações.
  * **Lucide React**: Biblioteca de ícones.
* **Backend:** 
  * **Next.js Server Actions**: Funções TypeScript (`"use server"`) que rodam no servidor. Substituem as antigas rotas de API REST, permitindo que componentes React chamem o banco de dados diretamente através de RPC seguro.
* **Banco de Dados & Dados:**
  * **Neon Serverless (Postgres)**: Banco de dados relacional desenhado para ambientes serverless (Vercel).
  * **Prisma ORM**: Responsável por comunicar-se com o banco de forma tipada, lidando com migrações e consultas (queries).
  * **Zod**: Biblioteca de validação de schemas de entrada. Usada para garantir que nenhum aluno envie dados falsos, vazios ou errados para o backend.

---

## 2. A Lógica de Sessão e Equipes (Identity)

Para manter a fricção baixa (sem precisar criar contas de e-mail e senhas longas para os alunos na sala de aula), a identidade no LogiQ funciona através de **Sessões Locais (localStorage) por Equipe**:

1. **Acesso Dinâmico:** O aluno acessa o site e clica em "Equipe" no menu superior. Ele digita o nome de sua turma (ex: "Logística A").
2. **Criação / Resgate:** O backend verifica se a equipe já existe. Se não existir, ele a cria no banco e preenche automaticamente as **5 vagas padrões** de operação (Líder, Recebimento, Estoque, Picking, Expedição).
3. **Persistência:** O ID e o Nome da equipe são salvos no `localStorage` do navegador do aluno através de um hook customizado (`hooks/use-equipe.ts`).
4. **Isolamento:** A partir desse momento, todas as telas do LogiQ (WMS, Dashboard, Equipes) lerão esse ID e exibirão apenas os dados referentes à turma atual. Se não houver equipe, o site bloqueia o acesso às áreas sensíveis pedindo seleção.

---

## 3. Sistema de Vagas (Slots)

Em vez de contas fixas, a equipe trabalha com "Cadeiras Rotativas":
* **Locks Otimistas:** Se dois alunos tentarem assumir o cargo de "Líder" no exato mesmo milissegundo, a Server Action (`ocuparSlot`) utiliza um mecanismo de `updateMany` atômico no Postgres. O primeiro a chegar bloqueia o cargo; o segundo recebe uma mensagem de erro sem derrubar o sistema.
* **Lazy Expiration (Expiração Preguiçosa):** Não existe um servidor rodando 24 horas para deslogar alunos. Sempre que alguém faz uma leitura na página da Equipe, o sistema executa um "filtro" silencioso que libera todas as vagas cujo tempo (4 horas) já expirou.

---

## 4. Máquina de Estados Operacional (WMS)

A espinha dorsal do projeto é a **Operação Logística**. Todo item cadastrado não pode "pular" etapas; ele respeita uma Máquina de Estados Finita. O ciclo de vida de uma mercadoria é:

1. **`RECEBIDO` (Recebimento):**
   - **Ação:** `receberItem`
   - O aluno da doca cadastra os dados de um item e do fornecedor. Ele entra atrelado ao **Turno Ativo** da equipe.
2. **`ESTOCADO` (Armazenagem):**
   - **Ação:** `enderecarItem`
   - O sistema valida que o item está "RECEBIDO". O aluno define onde o item será guardado (Rua e Nível) no armazém físico.
3. **`SEPARADO` (Picking / Separação):**
   - **Ação:** `validarPicking`
   - O aluno precisa "bipar" (escrever ou usar leitor) o código de barras correto do item. 
   - **Lógica de KPI:** O sistema faz a comparação. Se acertar, o turno ganha `1` ponto em "Acertos"; se errar, o turno ganha `1` ponto em "Erros", e o item *não avança* até ser bipado corretamente.
4. **`EXPEDIDO` (Expedição):**
   - **Ação:** `expedirItem`
   - Com o item "SEPARADO", o expedidor só precisa dizer em qual Doca de Saída o produto embarcou.

Qualquer tentativa de um operador expedir um item que não passou pelo picking será automaticamente barrada (com Zod e validações de lógica no backend).

---

## 5. Arquitetura do Banco de Dados

* **Equipe**: Entidade pai (Turma).
* **Turno**: Entidade filha. Representa a sessão do dia ("Turno Matutino"). Possui os KPIs de pontos (`acertosPicking` e `errosPicking`). Ao clicar em "Iniciar Turno", o atual é desativado e um novo zerado é aberto.
* **Item**: A carga / mercadoria. Só existe se pertencer a um Turno.
* **Slot**: Os "Cargos" dos alunos, que pertencem estritamente à Equipe.

## 6. Fluxo de Estado e Revalidação

O Next.js faz forte uso de Cache para ser rápido. Sempre que uma ação de WMS (como endereçar um item) é concluída com sucesso:
1. Os dados são modificados na nuvem (Postgres Neon).
2. O sistema executa o método `revalidatePath("/equipe")` (ou `/dashboard`).
3. Imediatamente, o frontend limpa o cache daquela rota, resultando em uma tela que "se atualiza sozinha", eliminando a necessidade do aluno ficar dando F5 na página para ver as mudanças na carga.
