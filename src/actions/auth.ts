"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import type { ActionResult } from "./types";
import { z } from "zod";

const AuthSchema = z.object({
  nomeUsuario: z.string().trim().min(2, "Nome muito curto.").max(50, "Nome muito longo."),
  nomeEquipe: z.string().trim().min(2, "Nome da equipe muito curto.").max(50, "Nome da equipe muito longo."),
});

// ============================================================================
// 1. criarEquipe (O aluno vira líder)
// ============================================================================
export async function criarEquipe(
  nomeUsuario: string,
  nomeEquipe: string
): Promise<ActionResult<{ usuarioId: string; equipeId: string; nomeUsuario: string; equipeNome: string; equipeCor: string }>> {
  try {
    const parsed = AuthSchema.safeParse({ nomeUsuario, nomeEquipe });
    if (!parsed.success) {
      return { sucesso: false, erro: parsed.error.issues[0].message };
    }
    const { nomeUsuario: uNome, nomeEquipe: eNome } = parsed.data;

    // Verifica se a equipe já existe
    const equipeExistente = await prisma.equipe.findUnique({
      where: { nome: eNome },
    });
    if (equipeExistente) {
      return { sucesso: false, erro: "Já existe uma equipe com este nome. Tente outro ou entre nela." };
    }

    // Cores disponíveis para as equipes
    const CORES = ["blue", "emerald", "violet", "amber", "rose", "cyan", "fuchsia", "indigo", "teal", "orange"];
    const equipesExistentes = await prisma.equipe.findMany({ select: { cor: true } });
    const coresUsadas = equipesExistentes.map(e => e.cor);
    const coresDisponiveis = CORES.filter(cor => !coresUsadas.includes(cor));
    const poolCores = coresDisponiveis.length > 0 ? coresDisponiveis : CORES;
    const corSorteada = poolCores[Math.floor(Math.random() * poolCores.length)];

    // Cria a equipe e o usuário (Líder) na mesma transação
    const resultado = await prisma.$transaction(async (tx) => {
      const equipe = await tx.equipe.create({
        data: { 
          nome: eNome,
          cor: corSorteada
        },
      });

      const usuario = await tx.usuario.create({
        data: {
          nome: uNome,
          equipeId: equipe.id,
          isLider: true,
        },
      });

      // Ocupar slot de "Líder" automaticamente
      // Como a equipe acabou de ser criada, não tem slots ocupados. Vamos criá-lo.
      // Ops, a arquitetura atual usa "ocuparSlot" que faz um updateMany. 
      // Mas o slot nem existe no banco ainda se a equipe foi recém criada!
      // A UI de Slots é preenchida sob demanda? Onde os slots são criados?
      // O `ocuparSlot` faz update, então os slots devem ser criados ou inseridos/atualizados.
      // O esquema diz: @@unique([equipeId, papel]). Se não existe, ele precisa ser criado.
      // Vou usar upsert para criar e ocupar o slot de Líder.
      await tx.slot.upsert({
        where: {
          equipeId_papel: {
            equipeId: equipe.id,
            papel: "Líder",
          }
        },
        update: {
          ocupado: true,
          usuarioId: usuario.id,
          nomeDisplay: usuario.nome,
          ocupadoEm: new Date(),
          expiraEm: new Date(Date.now() + 4 * 60 * 60 * 1000),
        },
        create: {
          equipeId: equipe.id,
          papel: "Líder",
          ocupado: true,
          usuarioId: usuario.id,
          nomeDisplay: usuario.nome,
          ocupadoEm: new Date(),
          expiraEm: new Date(Date.now() + 4 * 60 * 60 * 1000),
        }
      });

      return { usuario, equipe };
    });

    revalidatePath("/admin");
    return {
      sucesso: true,
      dados: {
        usuarioId: resultado.usuario.id,
        equipeId: resultado.equipe.id,
        nomeUsuario: resultado.usuario.nome,
        equipeNome: resultado.equipe.nome,
        equipeCor: resultado.equipe.cor,
      }
    };
  } catch (erro) {
    console.error("[criarEquipe] Falha:", erro);
    return { sucesso: false, erro: "Não foi possível criar a equipe." };
  }
}

// ============================================================================
// 2. entrarNaEquipe
// ============================================================================
export async function entrarNaEquipe(
  nomeUsuario: string,
  nomeEquipe: string
): Promise<ActionResult<{ usuarioId: string; equipeId: string; nomeUsuario: string; equipeNome: string; equipeCor: string; isLider: boolean }>> {
  try {
    const parsed = AuthSchema.safeParse({ nomeUsuario, nomeEquipe });
    if (!parsed.success) {
      return { sucesso: false, erro: parsed.error.issues[0].message };
    }
    const { nomeUsuario: uNome, nomeEquipe: eNome } = parsed.data;

    const equipe = await prisma.equipe.findUnique({
      where: { nome: eNome },
    });

    if (!equipe) {
      return { sucesso: false, erro: "Equipe não encontrada. Verifique o nome." };
    }

    // Verifica se já existe alguém com esse nome na equipe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: {
        equipeId_nome: {
          equipeId: equipe.id,
          nome: uNome,
        }
      }
    });

    if (usuarioExistente) {
      // Se já existe um membro com esse nome, apenas faz o "login" nesse usuário
      return {
        sucesso: true,
        dados: {
          usuarioId: usuarioExistente.id,
          equipeId: equipe.id,
          nomeUsuario: usuarioExistente.nome,
          equipeNome: equipe.nome,
          equipeCor: equipe.cor,
          isLider: usuarioExistente.isLider,
        }
      };
    }

    // Caso não exista, cria o novo usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome: uNome,
        equipeId: equipe.id,
        isLider: false,
      },
    });

    return {
      sucesso: true,
      dados: {
        usuarioId: usuario.id,
        equipeId: equipe.id,
        nomeUsuario: usuario.nome,
        equipeNome: equipe.nome,
        equipeCor: equipe.cor,
        isLider: false,
      }
    };
  } catch (erro) {
    console.error("[entrarNaEquipe] Falha:", erro);
    return { sucesso: false, erro: "Não foi possível entrar na equipe." };
  }
}

// ============================================================================
// 3. alterarNome
// ============================================================================
export async function alterarNome(
  usuarioId: string,
  novoNome: string
): Promise<ActionResult<{ nomeUsuario: string }>> {
  try {
    const nomeLimpo = novoNome.trim();
    if (nomeLimpo.length < 2 || nomeLimpo.length > 50) {
      return { sucesso: false, erro: "Nome deve ter entre 2 e 50 caracteres." };
    }

    const usuarioAtual = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    });

    if (!usuarioAtual) return { sucesso: false, erro: "Usuário não encontrado." };

    // Verifica duplicação na mesma equipe
    const duplicado = await prisma.usuario.findUnique({
      where: {
        equipeId_nome: {
          equipeId: usuarioAtual.equipeId,
          nome: nomeLimpo,
        }
      }
    });

    if (duplicado) {
      return { sucesso: false, erro: "Já existe alguém com esse nome na equipe." };
    }

    await prisma.$transaction([
      prisma.usuario.update({
        where: { id: usuarioId },
        data: { nome: nomeLimpo }
      }),
      // Atualiza o display do slot se ele estiver ocupando algum
      prisma.slot.updateMany({
        where: { usuarioId: usuarioId },
        data: { nomeDisplay: nomeLimpo }
      })
    ]);

    revalidatePath("/equipe");
    return { sucesso: true, dados: { nomeUsuario: nomeLimpo } };
  } catch (erro) {
    console.error("[alterarNome] Falha:", erro);
    return { sucesso: false, erro: "Não foi possível alterar o nome." };
  }
}

// ============================================================================
// 4. sairDaEquipe (Exclui a conta do aluno)
// ============================================================================
export async function sairDaEquipe(usuarioId: string): Promise<ActionResult<{ sucesso: boolean }>> {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) return { sucesso: true, dados: { sucesso: true } };

    if (usuario.isLider) {
      return { sucesso: false, erro: "Você é o Líder. Transfira a liderança antes de sair da equipe." };
    }

    // Libera slot (o onDelete: SetNull resolveria no banco, mas a gente atualiza os campos extras tbm)
    await prisma.$transaction([
      prisma.slot.updateMany({
        where: { usuarioId: usuarioId },
        data: { ocupado: false, nomeDisplay: null, ocupadoEm: null, expiraEm: null, usuarioId: null }
      }),
      prisma.usuario.delete({
        where: { id: usuarioId }
      })
    ]);

    revalidatePath("/equipe");
    return { sucesso: true, dados: { sucesso: true } };
  } catch (erro) {
    console.error("[sairDaEquipe] Falha:", erro);
    return { sucesso: false, erro: "Não foi possível sair da equipe." };
  }
}

// ============================================================================
// 5. passarLideranca
// ============================================================================
export async function passarLideranca(
  liderAtualId: string,
  novoLiderId: string
): Promise<ActionResult<{ sucesso: boolean }>> {
  try {
    const lider = await prisma.usuario.findUnique({ where: { id: liderAtualId } });
    if (!lider || !lider.isLider) {
      return { sucesso: false, erro: "Sem permissão." };
    }

    const novoLider = await prisma.usuario.findUnique({ where: { id: novoLiderId } });
    if (!novoLider || novoLider.equipeId !== lider.equipeId) {
      return { sucesso: false, erro: "O membro alvo não pertence à equipe." };
    }

    await prisma.$transaction([
      prisma.usuario.update({
        where: { id: liderAtualId },
        data: { isLider: false }
      }),
      prisma.usuario.update({
        where: { id: novoLiderId },
        data: { isLider: true }
      })
    ]);

    revalidatePath("/equipe");
    return { sucesso: true, dados: { sucesso: true } };
  } catch (erro) {
    console.error("[passarLideranca] Falha:", erro);
    return { sucesso: false, erro: "Não foi possível transferir a liderança." };
  }
}

// ============================================================================
// 6. expulsarMembro
// ============================================================================
export async function expulsarMembro(
  liderId: string,
  membroId: string
): Promise<ActionResult<{ sucesso: boolean }>> {
  try {
    const lider = await prisma.usuario.findUnique({ where: { id: liderId } });
    if (!lider || !lider.isLider) {
      return { sucesso: false, erro: "Sem permissão." };
    }

    const membro = await prisma.usuario.findUnique({ where: { id: membroId } });
    if (!membro || membro.equipeId !== lider.equipeId) {
      return { sucesso: false, erro: "O membro alvo não pertence à equipe." };
    }

    if (membro.id === lider.id) {
      return { sucesso: false, erro: "Você não pode expulsar a si mesmo." };
    }

    await prisma.$transaction([
      prisma.slot.updateMany({
        where: { usuarioId: membroId },
        data: { ocupado: false, nomeDisplay: null, ocupadoEm: null, expiraEm: null, usuarioId: null }
      }),
      prisma.usuario.delete({
        where: { id: membroId }
      })
    ]);

    revalidatePath("/equipe");
    return { sucesso: true, dados: { sucesso: true } };
  } catch (erro) {
    console.error("[expulsarMembro] Falha:", erro);
    return { sucesso: false, erro: "Não foi possível expulsar o membro." };
  }
}

// ============================================================================
// 7. deletarEquipeAdmin
// ============================================================================
export async function deletarEquipeAdmin(
  senhaAdmin: string,
  equipeId: string
): Promise<ActionResult<{ sucesso: boolean }>> {
  try {
    const senhaCorreta = process.env.ADMIN_PASSWORD || "instrutor-adm";
    if (senhaAdmin !== senhaCorreta) {
      return { sucesso: false, erro: "Senha de instrutor incorreta." };
    }

    // Com onDelete: Cascade, tudo (Slots, Turnos, Itens, Usuarios) é limpo.
    await prisma.equipe.delete({
      where: { id: equipeId }
    });

    revalidatePath("/admin");
    return { sucesso: true, dados: { sucesso: true } };
  } catch (erro) {
    console.error("[deletarEquipeAdmin] Falha:", erro);
    return { sucesso: false, erro: "Não foi possível apagar a equipe." };
  }
}

// ============================================================================
// 8. getTodasEquipes
// ============================================================================
export async function getTodasEquipes(senhaAdmin: string): Promise<ActionResult<any>> {
  try {
    const senhaCorreta = process.env.ADMIN_PASSWORD || "instrutor-adm";
    if (senhaAdmin !== senhaCorreta) {
      return { sucesso: false, erro: "Senha incorreta." };
    }

    const equipes = await prisma.equipe.findMany({
      include: {
        _count: {
          select: { usuarios: true, turnos: true }
        }
      },
      orderBy: { criadoEm: "desc" }
    });

    return { sucesso: true, dados: equipes };
  } catch (erro) {
    console.error("[getTodasEquipes] Falha:", erro);
    return { sucesso: false, erro: "Erro ao buscar equipes." };
  }
}
