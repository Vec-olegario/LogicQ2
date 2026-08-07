"use server"

import { prisma as db } from "@/src/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getConfiguracaoGlobal() {
  try {
    let config = await db.configuracaoGlobal.findUnique({
      where: { id: "global" },
      include: { itensEsperados: true }
    })

    if (!config) {
      config = await db.configuracaoGlobal.create({
        data: { id: "global" },
        include: { itensEsperados: true }
      })
    }

    return { sucesso: true, dados: config }
  } catch (error: any) {
    console.error("Erro ao buscar configuração global:", error)
    return { sucesso: false, erro: error.message }
  }
}

export async function atualizarConfiguracaoGlobal(
  senhaAdmin: string,
  novasMetas: {
    titulo: string
    contexto: string
    exigirSkuExato: boolean
    metaAcuracia: number
    metaErros: number
    metaItensDesc: string
    dificuldade: string
    tempoSLA: number
    metaVolume: number
    itensEsperados: { codigo: string; descricao: string; quantidade: number; fornecedor: string }[]
  }
) {
  try {
    const senhaCorreta = process.env.ADMIN_PASSWORD || "instrutor-adm"
    if (senhaAdmin !== senhaCorreta) {
      return { sucesso: false, erro: "Senha de instrutor incorreta" }
    }

    const { itensEsperados, ...camposBasicos } = novasMetas;

    // 1. Atualizar configuração global e recriar os itens esperados
    const config = await db.$transaction(async (tx) => {
      await tx.itemEsperado.deleteMany({ where: { configuracaoId: "global" } });
      
      const configAtualizada = await tx.configuracaoGlobal.upsert({
        where: { id: "global" },
        update: camposBasicos,
        create: { id: "global", ...camposBasicos }
      });

      if (itensEsperados.length > 0) {
        await tx.itemEsperado.createMany({
          data: itensEsperados.map(i => ({ ...i, configuracaoId: "global" }))
        });
      }
      
      return configAtualizada;
    });

    // 2. Opcionalmente atualizar turnos que já estão ativos? (Poderia desalinhar a experiência. Vamos deixar para o botão IniciarTurnoGlobal)

    revalidatePath("/admin/situacao")
    revalidatePath("/equipe")
    return { sucesso: true, dados: config }
  } catch (error: any) {
    console.error("Erro ao atualizar configuração global:", error)
    return { sucesso: false, erro: error.message }
  }
}

// ============================================================================
// iniciarTurnoGlobal (Botão "Play" para todas as equipes)
// ============================================================================
export async function iniciarTurnoGlobal(senhaAdmin: string) {
  try {
    const senhaCorreta = process.env.ADMIN_PASSWORD || "instrutor-adm"
    if (senhaAdmin !== senhaCorreta) {
      return { sucesso: false, erro: "Senha de instrutor incorreta" }
    }

    const configGlobal = await db.configuracaoGlobal.findUnique({
      where: { id: "global" }
    })

    if (!configGlobal) {
      return { sucesso: false, erro: "Nenhuma configuração global encontrada." }
    }

    const equipes = await db.equipe.findMany({ select: { id: true } })
    if (equipes.length === 0) {
      return { sucesso: false, erro: "Nenhuma equipe cadastrada ainda." }
    }

    await db.$transaction(async (tx) => {
      // 1. Desativa todos os turnos ativos de todas as equipes
      await tx.turno.updateMany({
        where: { ativo: true },
        data: { ativo: false }
      })

      // 2. Cria um novo turno ativo para CADA equipe existente
      const dataCriacao = equipes.map(equipe => ({
        equipeId: equipe.id,
        ativo: true,
        titulo: configGlobal.titulo,
        contexto: configGlobal.contexto,
        exigirSkuExato: configGlobal.exigirSkuExato,
        metaAcuracia: configGlobal.metaAcuracia,
        metaErros: configGlobal.metaErros,
        metaItensDesc: configGlobal.metaItensDesc,
        dificuldade: configGlobal.dificuldade,
        tempoSLA: configGlobal.tempoSLA,
        metaVolume: configGlobal.metaVolume
      }));

      await tx.turno.createMany({
        data: dataCriacao
      })
    })

    revalidatePath("/admin/situacao")
    revalidatePath("/equipe")
    revalidatePath("/dashboard")
    revalidatePath("/visao-geral")
    
    return { sucesso: true, dados: { sucesso: true } }
  } catch (error: any) {
    console.error("Erro ao iniciar turno global:", error)
    return { sucesso: false, erro: error.message }
  }
}
