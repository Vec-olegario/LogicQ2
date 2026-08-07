"use server"

import { prisma } from "@/src/lib/prisma"
import { revalidatePath } from "next/cache"

export async function atualizarMetasTurno(
  senhaAdmin: string,
  turnoId: string,
  metaAcuracia: number,
  metaErros: number,
  metaItensDesc: string
) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD
    
    if (!adminPassword || senhaAdmin !== adminPassword) {
      return { sucesso: false, erro: "Senha de instrutor incorreta." }
    }

    const turno = await prisma.turno.update({
      where: { id: turnoId },
      data: {
        metaAcuracia,
        metaErros,
        metaItensDesc,
      }
    })

    revalidatePath("/situacao")
    
    return { sucesso: true, dados: turno }
  } catch (error) {
    console.error("Erro ao atualizar metas do turno:", error)
    return { sucesso: false, erro: "Falha interna ao atualizar metas." }
  }
}
