"use server";

// ============================================================================
// Server Actions — WMS / Fluxo Logístico (LogiQ)
// ============================================================================
// Estas actions implementam o fluxo operacional do armazém simulado:
//
//   Recebimento (RECEBIDO) → Endereçamento (ESTOCADO) → Picking (SEPARADO) → Expedição (EXPEDIDO)
//
// Cada action avança um Item para o próximo estado do fluxo, validando que
// a transição é legal (ex: só se pode endereçar um item RECEBIDO, não um
// já EXPEDIDO). Isso evita que chamadas duplicadas ou fora de ordem corrompam
// o estado do turno.
// ============================================================================

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import type { Item, Turno, Slot, Prisma } from "@prisma/client";
import type { ActionResult } from "./types";

// ============================================================================
// Helper interno — buscar turno ativo de uma equipe
// ============================================================================
// Extraído como helper porque `receberItem` e `iniciarTurno` precisam
// localizar o turno ativo. Centralizar evita duplicação e garante que a
// mesma lógica de busca (com o índice `@@index([equipeId, ativo])`) seja
// usada consistentemente.
// ============================================================================

async function buscarTurnoAtivo(
  equipeId: string,
): Promise<(Turno & { equipe: { id: string } }) | null> {
  return prisma.turno.findFirst({
    where: { equipeId, ativo: true },
    // Incluímos a equipe para ter acesso ao equipeId sem query extra
    // ao montar o path de revalidação.
    include: { equipe: { select: { id: true } } },
  });
}

// ============================================================================
// 1. receberItem
// ============================================================================
// FLUXO:
//   1. Localiza o turno ativo da equipe.
//   2. Cria o item com status RECEBIDO vinculado a esse turno.
//
// POR QUE BUSCAR O TURNO ATIVO PELA EQUIPE E NÃO RECEBER `turnoId`?
//   O aluno no posto de recebimento não deveria precisar saber o ID interno
//   do turno. Ele sabe apenas sua equipe. A busca pelo turno ativo da equipe
//   é o contrato natural da interface. Além disso, garante que itens só
//   sejam criados em turnos ativos — se o turno foi encerrado entre o
//   carregamento da página e o submit, o aluno recebe erro claro.
// ============================================================================

const ReceberItemSchema = z.object({
  codigo: z.string().trim().min(1, "O código (EAN/SKU) é obrigatório."),
  descricao: z.string().trim().min(1, "A descrição é obrigatória."),
  quantidade: z.number().int("A quantidade deve ser um número inteiro.").positive("A quantidade deve ser positiva."),
  fornecedor: z.string().trim().min(1, "O fornecedor é obrigatório."),
});

export async function receberItem(
  equipeId: string,
  dados: {
    codigo: string;
    descricao: string;
    quantidade: number;
    fornecedor: string;
  },
  usuarioId: string
): Promise<ActionResult<Item>> {
  try {
    const erroPermissao = await verificarPermissao(usuarioId, "Recebimento");
    if (erroPermissao) return { sucesso: false, erro: erroPermissao };

    // ------- Validação com Zod -------
    const parsed = ReceberItemSchema.safeParse(dados);
    if (!parsed.success) {
      return { sucesso: false, erro: parsed.error.issues[0].message };
    }
    const dadosLimpos = parsed.data;

    // ------- Passo 1: Buscar turno ativo -------
    const turno = await buscarTurnoAtivo(equipeId);

    if (!turno) {
      return {
        sucesso: false,
        erro: "Nenhum turno ativo encontrado para esta equipe. Inicie um turno antes de receber itens.",
      };
    }

    // ------- Passo 2: Criar item no turno -------
    // O status default é RECEBIDO (definido no schema), mas explicitamos
    // aqui por clareza e para facilitar leitura do código.
    const item = await prisma.item.create({
      data: {
        turnoId: turno.id,
        codigo: dadosLimpos.codigo,
        descricao: dadosLimpos.descricao,
        quantidade: dadosLimpos.quantidade,
        fornecedor: dadosLimpos.fornecedor,
        status: "RECEBIDO",
      },
    });

    revalidatePath("/equipe");
    revalidatePath("/dashboard");

    return { sucesso: true, dados: item };
  } catch (erro) {
    console.error("[receberItem] Falha:", erro);
    return {
      sucesso: false,
      erro: "Não foi possível registrar o recebimento do item.",
    };
  }
}

// ============================================================================
// 2. enderecarItem
// ============================================================================
// FLUXO:
//   1. Busca o item com `select` enxuto (apenas campos necessários).
//   2. Valida que o item está no status RECEBIDO (pré-condição do fluxo).
//   3. Atualiza posição e status para ESTOCADO.
//
// POR QUE VALIDAR STATUS?
//   Sem essa checagem, um item já EXPEDIDO poderia ser "re-endereçado",
//   corrompendo o histórico do fluxo. Cada transição de status funciona
//   como uma máquina de estados finita:
//     RECEBIDO → ESTOCADO → SEPARADO → EXPEDIDO
//   Só transições para frente são permitidas, e cada action só aceita o
//   status imediatamente anterior.
//
// POR QUE `include: { turno: { select: { equipeId } } }`?
//   Precisamos do `equipeId` para o `revalidatePath`, mas o Item não tem
//   `equipeId` diretamente — ele está no Turno. Usar `include` com `select`
//   resolve isso em uma única query (JOIN), evitando um SELECT separado
//   que seria N+1.
// ============================================================================

const EnderecarItemSchema = z.object({
  posicao: z.string().trim().min(1, "A posição de armazenamento é obrigatória (ex: \"Rua A, Nível 2\")."),
});

export async function enderecarItem(
  itemId: string,
  dados: { posicao: string },
  usuarioId: string
): Promise<ActionResult<Item>> {
  try {
    const erroPermissao = await verificarPermissao(usuarioId, "Estoque");
    if (erroPermissao) return { sucesso: false, erro: erroPermissao };

    // ------- Validação -------
    const parsed = EnderecarItemSchema.safeParse(dados);
    if (!parsed.success) {
      return { sucesso: false, erro: parsed.error.issues[0].message };
    }
    const dadosLimpos = parsed.data;

    // ------- Passo 1: Buscar item -------
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return { sucesso: false, erro: "Item não encontrado." };
    }

    // ------- Passo 2: Validar transição de status -------
    if (item.status !== "RECEBIDO") {
      return {
        sucesso: false,
        erro: `Este item não pode ser endereçado porque está com status "${item.status}". Apenas itens RECEBIDOS podem ser endereçados.`,
      };
    }

    // ------- Passo 3: Atualizar posição e status -------
    const itemAtualizado = await prisma.item.update({
      where: { id: itemId },
      data: {
        posicao: dadosLimpos.posicao,
        status: "ESTOCADO",
      },
    });

    revalidatePath("/equipe");
    revalidatePath("/dashboard");

    return { sucesso: true, dados: itemAtualizado };
  } catch (erro) {
    console.error("[enderecarItem] Falha:", erro);
    return {
      sucesso: false,
      erro: "Não foi possível endereçar o item.",
    };
  }
}

// ============================================================================
// 3. validarPicking
// ============================================================================
// FLUXO:
//   1. Busca o item (com turnoId para atualizar o placar).
//   2. Valida que o item está ESTOCADO (pré-condição do picking).
//   3. Compara código esperado com código bipado.
//   4. Se bater: muda status para SEPARADO e incrementa `acertosPicking`.
//      Se não bater: incrementa `errosPicking` (status NÃO muda — o aluno
//      deve tentar bipar novamente o item correto).
//
// POR QUE TRANSAÇÃO?
//   A atualização do Item (status) e do Turno (placar) devem ser atômicas.
//   Se o status mudasse para SEPARADO mas o incremento de `acertosPicking`
//   falhasse, o placar ficaria inconsistente com o estado real dos itens.
//   `$transaction` garante tudo-ou-nada.
//
// POR QUE COMPARAÇÃO CASE-INSENSITIVE + TRIM?
//   Códigos de barras podem ser digitados manualmente (sem leitor). Pequenas
//   diferenças de caixa ou espaços não deveriam penalizar o aluno.
// ============================================================================

export async function validarPicking(
  itemId: string,
  codigoBipado: string,
  usuarioId: string
): Promise<ActionResult<Item>> {
  try {
    const erroPermissao = await verificarPermissao(usuarioId, "Picking");
    if (erroPermissao) return { sucesso: false, erro: erroPermissao };

    // ------- Passo 1: Buscar item + turno -------
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { turno: true }
    });

    if (!item) {
      return { sucesso: false, erro: "Item não encontrado." };
    }

    // ------- Passo 2: Validar transição de status -------
    if (item.status !== "ESTOCADO") {
      return {
        sucesso: false,
        erro: `Este item não pode ser separado porque está com status "${item.status}". Apenas itens ESTOCADOS podem passar pelo picking.`,
      };
    }

    // ------- Passo 3: Comparar códigos -------
    // Normalização: trim + lowercase para tolerar variações de digitação.
    const esperadoNorm = item.codigo.trim().toLowerCase();
    const bipadoNorm = codigoBipado.trim().toLowerCase();
    
    // Se a situação de aprendizagem exige SKU exato, comparamos. Senão, assumimos acerto automático.
    const acertou = item.turno.exigirSkuExato ? (esperadoNorm === bipadoNorm) : true;

    // ------- Passo 4: Atualizar item + placar do turno atomicamente -------
    let itemResultado: Item;
    if (acertou) {
      // Bipagem correta: avança o item para SEPARADO e registra acerto.
      const [updatedItem] = await prisma.$transaction([
        prisma.item.update({
          where: { id: itemId },
          data: { status: "SEPARADO" },
        }),
        prisma.turno.update({
          where: { id: item.turnoId },
          data: { acertosPicking: { increment: 1 } },
        }),
      ]);
      itemResultado = updatedItem;
    } else {
      // Bipagem incorreta: apenas registra o erro no turno.
      // O item permanece ESTOCADO para que o aluno tente novamente.
      await prisma.turno.update({
        where: { id: item.turnoId },
        data: { errosPicking: { increment: 1 } },
      });
      itemResultado = item;
    }

    revalidatePath("/equipe");
    revalidatePath("/dashboard");

    return { sucesso: true, dados: itemResultado };
  } catch (erro) {
    console.error("[validarPicking] Falha:", erro);
    return {
      sucesso: false,
      erro: "Não foi possível validar o picking.",
    };
  }
}

// ============================================================================
// 4. expedirItem
// ============================================================================
// FLUXO:
//   1. Busca o item (com equipeId para revalidação).
//   2. Valida que o item está SEPARADO.
//   3. Define `docaSaida` e muda status para EXPEDIDO.
//
// Segue o mesmo padrão das actions anteriores: validação de status como
// máquina de estados, include para evitar N+1, revalidatePath no final.
// ============================================================================

const ExpedirItemSchema = z.object({
  docaSaida: z.string().trim().min(1, "A doca de saída é obrigatória (ex: \"Doca 3\")."),
});

export async function expedirItem(
  itemId: string,
  dados: { docaSaida: string },
  usuarioId: string
): Promise<ActionResult<Item>> {
  try {
    const erroPermissao = await verificarPermissao(usuarioId, "Expedição");
    if (erroPermissao) return { sucesso: false, erro: erroPermissao };

    // ------- Validação -------
    const parsed = ExpedirItemSchema.safeParse(dados);
    if (!parsed.success) {
      return { sucesso: false, erro: parsed.error.issues[0].message };
    }
    const dadosLimpos = parsed.data;

    // ------- Passo 1: Buscar item -------
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return { sucesso: false, erro: "Item não encontrado." };
    }

    // ------- Passo 2: Validar transição de status -------
    if (item.status !== "SEPARADO") {
      return {
        sucesso: false,
        erro: `Este item não pode ser expedido porque está com status "${item.status}". Apenas itens SEPARADOS podem ser expedidos.`,
      };
    }

    // ------- Passo 3: Atualizar doca e status -------
    const itemAtualizado = await prisma.item.update({
      where: { id: itemId },
      data: {
        docaSaida: dadosLimpos.docaSaida,
        status: "EXPEDIDO",
      },
    });

    revalidatePath("/equipe");
    revalidatePath("/dashboard");

    return { sucesso: true, dados: itemAtualizado };
  } catch (erro) {
    console.error("[expedirItem] Falha:", erro);
    return {
      sucesso: false,
      erro: "Não foi possível expedir o item.",
    };
  }
}

// ============================================================================
// 5. iniciarTurno
// ============================================================================
// FLUXO:
//   1. Verifica se a equipe existe.
//   2. Em uma transação:
//      a) Desativa qualquer turno ativo anterior (ativo = false).
//      b) Cria um novo turno com ativo = true.
//   3. Retorna o turno recém-criado.
//
// POR QUE TRANSAÇÃO INTERATIVA (`$transaction(async (tx) => ...)`)?
//   Precisamos de uma transação que faça UPDATE e depois CREATE, usando o
//   resultado do CREATE como retorno. A transação sequencial (batch array)
//   do Prisma não permite capturar o resultado intermediário das operações.
//   A transação interativa resolve isso: o Prisma abre uma transação SQL
//   real (BEGIN ... COMMIT), executa as queries dentro dela, e se qualquer
//   uma falhar, faz ROLLBACK automático.
//
// POR QUE NÃO VALIDAR "JÁ EXISTE UM TURNO ATIVO" FORA DA TRANSAÇÃO?
//   Se dois alunos clicarem "Iniciar Turno" ao mesmo tempo e a verificação
//   fosse feita fora da transação, ambos veriam "não tem turno ativo" e
//   criariam dois turnos ativos simultaneamente. Ao desativar o turno
//   anterior DENTRO da transação (com updateMany, que é idempotente se
//   não houver nenhum), evitamos essa race condition: o segundo request
//   simplesmente não encontra nenhum turno para desativar (count=0) e
//   cria o seu normalmente, enquanto o turno do primeiro request já foi
//   desativado pelo segundo.
//
// POR QUE `updateMany` EM VEZ DE `update`?
//   Pode haver 0 ou 1 turno ativo. `update` exige que exatamente 1 registro
//   exista e lança P2025 se não encontrar. `updateMany` com count=0 é
//   silencioso e idempotente — perfeito para o caso "não havia turno ativo
//   anterior" (primeira vez que a equipe inicia um turno).
// ============================================================================

export async function iniciarTurno(
  equipeId: string,
): Promise<ActionResult<Turno>> {
  try {
    // ------- Passo 1: Verificar se a equipe existe -------
    const equipe = await prisma.equipe.findUnique({
      where: { id: equipeId },
      select: { id: true },
    });

    if (!equipe) {
      return { sucesso: false, erro: "Equipe não encontrada." };
    }

    // ------- Passo 2: Transação interativa — encerrar antigo + criar novo -------
    const novoTurno = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 2a. Desativar qualquer turno ativo anterior desta equipe.
      // `updateMany` é seguro mesmo se não houver nenhum (count=0).
      // Não deletamos o turno antigo — ele preserva o histórico de acertos
      // e erros de picking, que pode ser útil para o professor revisar.
      await tx.turno.updateMany({
        where: { equipeId, ativo: true },
        data: { ativo: false },
      });

      // 2b. Buscar configuração global (ou usar fallback)
      const configGlobal = await tx.configuracaoGlobal.findUnique({
        where: { id: "global" }
      });

      // 2c. Criar novo turno ativo.
      // `acertosPicking` e `errosPicking` começam em 0 (default do schema),
      // e `iniciadoEm` recebe `now()` automaticamente.
      return tx.turno.create({
        data: {
          equipeId,
          ativo: true,
          titulo: configGlobal?.titulo ?? "Operação Padrão",
          contexto: configGlobal?.contexto ?? "Fluxo normal do dia a dia.",
          exigirSkuExato: configGlobal?.exigirSkuExato ?? true,
          metaAcuracia: configGlobal?.metaAcuracia ?? 98,
          metaErros: configGlobal?.metaErros ?? 0,
          metaItensDesc: configGlobal?.metaItensDesc ?? "Fluxo Contínuo",
          dificuldade: configGlobal?.dificuldade ?? "Normal",
          tempoSLA: configGlobal?.tempoSLA ?? 5,
          metaVolume: configGlobal?.metaVolume ?? 500,
        },
      });
    });

    revalidatePath("/equipe");
    revalidatePath("/dashboard");

    return { sucesso: true, dados: novoTurno };
  } catch (erro) {
    console.error("[iniciarTurno] Falha:", erro);
    return {
      sucesso: false,
      erro: "Não foi possível iniciar o turno.",
    };
  }
}

// ============================================================================
// 6. getTurnoAtivoComItens
// ============================================================================
// Helper: Verificar Permissão de Setor
// ============================================================================
async function verificarPermissao(usuarioId: string, setorNecessario: string): Promise<string | null> {
  if (!usuarioId) return "Acesso Negado: O ID do usuário é obrigatório.";
  
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    include: { slotAtual: true }
  });

  if (!usuario) return "Usuário não encontrado.";
  if (usuario.isLider) return null; // Líder tem acesso total
  
  if (!usuario.slotAtual || usuario.slotAtual.papel !== setorNecessario) {
    return `Acesso Negado: Você está no setor "${usuario.slotAtual?.papel || "Nenhum"}". Apenas o Líder ou o operador de ${setorNecessario} pode usar este coletor.`;
  }
  
  return null; // Liberado
}

// ============================================================================
// Helper: Buscar Turno Ativo da equipe com todos os seus itens e slots em uma única chamada.
// ============================================================================

export async function getTurnoAtivoComItens(
  equipeId: string,
): Promise<
  ActionResult<{
    turno: (Turno & { itens: Item[] }) | null;
    slots: Slot[];
  }>
> {
  try {
    if (!equipeId) {
      return { sucesso: false, erro: "ID da equipe é obrigatório." };
    }

    // Lazy expiration nos slots da equipe
    await prisma.slot.updateMany({
      where: {
        equipeId,
        ocupado: true,
        expiraEm: { lt: new Date() },
      },
      data: {
        ocupado: false,
        nomeDisplay: null,
        ocupadoEm: null,
        expiraEm: null,
      },
    });

    const [turno, slots] = await Promise.all([
      prisma.turno.findFirst({
        where: { equipeId, ativo: true },
        include: {
          itens: {
            orderBy: { criadoEm: "desc" },
          },
        },
      }),
      prisma.slot.findMany({
        where: { equipeId },
        orderBy: { papel: "asc" },
      }),
    ]);

    return {
      sucesso: true,
      dados: {
        turno,
        slots,
      },
    };
  } catch (erro) {
    console.error("[getTurnoAtivoComItens] Falha:", erro);
    return {
      sucesso: false,
      erro: "Não foi possível carregar os dados operacionais da equipe.",
    };
  }
}

export async function getVisaoGeralVisitante(): Promise<ActionResult<any>> {
  try {
    const equipes = await prisma.equipe.findMany({
      select: {
        id: true,
        nome: true,
        cor: true,
        usuarios: {
          select: { id: true }
        },
        turnos: {
          select: {
            ativo: true,
            acertosPicking: true,
            errosPicking: true,
            itens: {
              select: { status: true }
            }
          }
        }
      },
      orderBy: { nome: "asc" }
    });

    const dadosMapeados = equipes.map((equipe) => {
      const usuariosCount = equipe.usuarios.length;
      const turnosConcluidos = equipe.turnos.filter(t => !t.ativo).length;
      const turnoAtivo = equipe.turnos.find(t => t.ativo);

      // Calcular acurácia global (todos os turnos)
      let acertosTotal = 0;
      let errosTotal = 0;
      equipe.turnos.forEach(t => {
        acertosTotal += t.acertosPicking;
        errosTotal += t.errosPicking;
      });
      const totalBipagens = acertosTotal + errosTotal;
      const acuraciaGeral = totalBipagens > 0 ? (acertosTotal / totalBipagens) * 100 : 100;

      // Progresso do turno ativo
      let progresso = {
        recebidos: 0,
        estocados: 0,
        separados: 0,
        expedidos: 0,
        total: 0
      };

      if (turnoAtivo) {
        progresso.total = turnoAtivo.itens.length;
        turnoAtivo.itens.forEach(item => {
          if (item.status === "RECEBIDO") progresso.recebidos++;
          if (item.status === "ESTOCADO") progresso.estocados++;
          if (item.status === "SEPARADO") progresso.separados++;
          if (item.status === "EXPEDIDO") progresso.expedidos++;
        });
      }

      return {
        id: equipe.id,
        nome: equipe.nome,
        cor: equipe.cor,
        usuariosCount,
        turnosConcluidos,
        acuraciaGeral: Math.round(acuraciaGeral * 10) / 10,
        progresso,
        temTurnoAtivo: !!turnoAtivo
      };
    });

    return { sucesso: true, dados: dadosMapeados };
  } catch (erro) {
    console.error("[getVisaoGeralVisitante] Falha:", erro);
    return { sucesso: false, erro: "Não foi possível carregar a visão geral." };
  }
}

// ============================================================================
// 8. encerrarTurnoAdmin
// ============================================================================
export async function encerrarTurnoAdmin(
  senhaAdmin: string,
  equipeId: string
): Promise<ActionResult<void>> {
  try {
    const senhaCorreta = process.env.ADMIN_PASSWORD || "instrutor-adm";
    if (senhaAdmin !== senhaCorreta) {
      return { sucesso: false, erro: "Senha de administrador incorreta." };
    }

    const turnoAtivo = await prisma.turno.findFirst({
      where: { equipeId, ativo: true },
    });

    if (!turnoAtivo) {
      return { sucesso: false, erro: "Nenhum turno ativo encontrado para esta equipe." };
    }

    await prisma.turno.update({
      where: { id: turnoAtivo.id },
      data: { ativo: false },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/situacao");
    revalidatePath("/dashboard");
    revalidatePath("/equipe");

    return { sucesso: true };
  } catch (erro) {
    console.error("[encerrarTurnoAdmin] Falha:", erro);
    return { sucesso: false, erro: "Não foi possível encerrar o turno." };
  }
}
