"use server";

// ============================================================================
// Server Actions — Slots (LogiQ)
// ============================================================================
// Estas actions gerenciam o ciclo de vida dos slots de uma equipe:
// ocupação, expiração lazy e reset administrativo.
//
// Por que Server Actions (e não Route Handlers)?
//   → Server Actions são invocadas diretamente por componentes React sem
//     precisar de fetch manual. O Next.js cuida do POST, CSRF e serialização.
//
// Por que adapter Neon/serverless?
//   → Cada invocação na Vercel pode rodar numa lambda distinta.
//     O adapter usa WebSocket sobre HTTP, evitando o custo de TCP handshake
//     e respeitando o pool de conexões do Neon.
// ============================================================================

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import type { Slot } from "@prisma/client";
import type { ActionResult } from "./types";

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Duração de ocupação de um slot em milissegundos (4 horas). */
const DURACAO_SLOT_MS = 4 * 60 * 60 * 1000;

// ============================================================================
// 1. getSlotsDaEquipe
// ============================================================================
// FLUXO:
//   1. Limpa slots expirados (lazy expiration).
//   2. Retorna todos os slots da equipe já atualizados.
//
// POR QUE LAZY EXPIRATION?
//   Em ambiente serverless (Vercel) não existe um processo de longa duração
//   (cron, worker) que rode continuamente verificando expirações. A forma
//   mais simples e confiável é limpar os slots expirados "on-demand" — toda
//   vez que alguém consulta os slots, os expirados são liberados antes da
//   leitura. Isso garante consistência sem depender de infra extra.
//
// POR QUE `updateMany` EM VEZ DE LOOP?
//   `updateMany` gera um único `UPDATE ... WHERE` no banco. Se usássemos
//   `findMany` + loop de `update`, teríamos N+1 queries (1 SELECT + N UPDATEs),
//   o que é ineficiente e introduz janelas de inconsistência entre as queries.
// ============================================================================

export async function getSlotsDaEquipe(
  equipeId: string,
): Promise<ActionResult<Slot[]>> {
  try {
    // ------- Passo 1: Limpar slots expirados (lazy expiration) -------
    // Uma única query atômica: "libere todos os slots desta equipe que
    // estão ocupados E cuja data de expiração já passou".
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

    // ------- Passo 2: Buscar slots atualizados -------
    const slots = await prisma.slot.findMany({
      where: { equipeId },
      orderBy: { papel: "asc" },
    });

    return { sucesso: true, dados: slots };
  } catch (erro) {
    console.error("[getSlotsDaEquipe] Falha:", erro);
    return {
      sucesso: false,
      erro: "Não foi possível carregar os slots da equipe.",
    };
  }
}

// ============================================================================
// 2. ocuparSlot
// ============================================================================
// FLUXO:
//   1. Limpa slots expirados (mesma lazy expiration — necessária aqui também
//      porque o slot que o aluno quer ocupar pode estar "ocupado" mas já
//      expirado; sem essa limpeza, o aluno receberia erro desnecessário).
//   2. Tenta ocupar o slot via `updateMany` atômico.
//   3. Verifica `count` para saber se a ocupação teve sucesso.
//
// POR QUE `updateMany` COM `where: { id, ocupado: false }` EM VEZ DE `update`?
//   → `update` lança exceção se o registro não for encontrado (Prisma P2025),
//     mas o problema aqui não é "registro inexistente" — é "já ocupado".
//   → `updateMany` retorna `{ count: 0 }` se nenhuma linha casar com o WHERE.
//     Isso nos permite distinguir de forma limpa entre "slot livre → ocupado
//     com sucesso" (count=1) e "slot já ocupado por outra pessoa" (count=0),
//     sem try/catch para fluxo de controle.
//   → Mais importante: essa abordagem é ATÔMICA a nível de banco. O WHERE
//     `ocupado = false` funciona como um lock otimista — se dois alunos
//     clicarem "Ocupar" ao mesmo tempo, apenas o UPDATE que executar primeiro
//     encontrará `ocupado = false` e casará o WHERE. O segundo encontrará
//     `ocupado = true` (já atualizado pelo primeiro) e retornará count=0.
//     Sem essa técnica, teríamos que usar transações com serializable
//     isolation ou SELECT FOR UPDATE, que são mais complexos e lentos.
// ============================================================================

import { z } from "zod";

const OcuparSlotSchema = z.object({
  slotId: z.string().min(1, "O ID do slot é obrigatório."),
  nome: z.string().trim()
    .min(1, "O nome de exibição não pode ser vazio.")
    .max(50, "O nome de exibição deve ter no máximo 50 caracteres."),
});

export async function ocuparSlot(
  slotId: string,
  nome: string,
): Promise<ActionResult<{ slotId: string }>> {
  try {
    // Validação com Zod
    const parsed = OcuparSlotSchema.safeParse({ slotId, nome });
    if (!parsed.success) {
      return { sucesso: false, erro: parsed.error.issues[0].message };
    }
    const { slotId: idValido, nome: nomeLimpo } = parsed.data;

    const agora = new Date();

    // ------- Passo 1: Limpar slots expirados antes de tentar ocupar -------
    await prisma.slot.updateMany({
      where: {
        ocupado: true,
        expiraEm: { lt: agora },
      },
      data: {
        ocupado: false,
        nomeDisplay: null,
        ocupadoEm: null,
        expiraEm: null,
      },
    });

    // ------- Passo 2: Tentativa atômica de ocupação -------
    const resultado = await prisma.slot.updateMany({
      where: {
        id: idValido,
        ocupado: false, // ← Lock otimista: só casa se ninguém ocupou antes.
      },
      data: {
        ocupado: true,
        nomeDisplay: nomeLimpo,
        ocupadoEm: agora,
        expiraEm: new Date(agora.getTime() + DURACAO_SLOT_MS),
      },
    });

    // ------- Passo 3: Verificar se a ocupação teve efeito -------
    if (resultado.count === 0) {
      return {
        sucesso: false,
        erro: "Este slot já foi ocupado por outra pessoa. Escolha outro ou aguarde a liberação.",
      };
    }

    // ------- Passo 4: Revalidar cache -------
    revalidatePath("/equipe");
    revalidatePath("/dashboard");

    return { sucesso: true, dados: { slotId: idValido } };
  } catch (erro) {
    console.error("[ocuparSlot] Falha:", erro);
    return {
      sucesso: false,
      erro: "Não foi possível ocupar o slot. Tente novamente.",
    };
  }
}

// ============================================================================
// 3. resetarEquipe
// ============================================================================
// FLUXO:
//   1. Valida a senha de admin contra a variável de ambiente.
//   2. Em uma transação, limpa TODOS os slots e deleta TODOS os turnos
//      (e seus itens em cascata) da equipe.
//
// POR QUE TRANSAÇÃO?
//   Se o reset dos slots funcionasse mas a deleção dos turnos falhasse,
//   a equipe ficaria em estado inconsistente (slots limpos mas turnos
//   antigos ainda presentes). A transação garante tudo-ou-nada.
//
// POR QUE DELETAR TURNOS EM VEZ DE APENAS DESATIVAR?
//   Um reset é uma operação destrutiva intencional do professor/admin.
//   Manter turnos antigos após reset poluiria a interface e consumiria
//   espaço. Os itens são deletados em cascata (onDelete: Cascade no schema).
// ============================================================================

export async function resetarEquipe(
  equipeId: string,
  senhaAdmin: string,
): Promise<ActionResult<{ mensagem: string }>> {
  try {
    // ------- Passo 1: Validar senha de admin -------
    const senhaCorreta = process.env.ADMIN_PASSWORD;

    if (!senhaCorreta) {
      // Falha de configuração do servidor — não expor detalhes ao client.
      console.error(
        "[resetarEquipe] ADMIN_PASSWORD não definida nas variáveis de ambiente.",
      );
      return {
        sucesso: false,
        erro: "Erro de configuração do servidor. Contate o administrador.",
      };
    }

    if (senhaAdmin !== senhaCorreta) {
      return { sucesso: false, erro: "Senha de administrador incorreta." };
    }

    // ------- Passo 2: Verificar se a equipe existe -------
    const equipe = await prisma.equipe.findUnique({
      where: { id: equipeId },
      select: { id: true },
    });

    if (!equipe) {
      return { sucesso: false, erro: "Equipe não encontrada." };
    }

    // ------- Passo 3: Transação atômica — reset completo -------
    await prisma.$transaction([
      // 3a. Limpar todos os slots da equipe (ignorando expiraEm).
      // Usamos updateMany em vez de deleteMany porque os slots são "vagas
      // fixas" da equipe — não queremos removê-los, apenas desocupá-los.
      prisma.slot.updateMany({
        where: { equipeId },
        data: {
          ocupado: false,
          nomeDisplay: null,
          ocupadoEm: null,
          expiraEm: null,
        },
      }),

      // 3b. Deletar todos os turnos da equipe.
      // Os itens de cada turno serão deletados automaticamente pelo
      // `onDelete: Cascade` definido na relação Turno → Item no schema.
      prisma.turno.deleteMany({
        where: { equipeId },
      }),
    ]);

    // ------- Passo 4: Revalidar cache -------
    revalidatePath("/equipe");
    revalidatePath("/dashboard");

    return {
      sucesso: true,
      dados: {
        mensagem:
          "Equipe resetada com sucesso. Todos os slots foram liberados e os turnos removidos.",
      },
    };
  } catch (erro) {
    console.error("[resetarEquipe] Falha:", erro);
    return {
      sucesso: false,
      erro: "Não foi possível resetar a equipe. Tente novamente.",
    };
  }
}
