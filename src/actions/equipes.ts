"use server";

import { prisma } from "@/src/lib/prisma";
import type { Equipe } from "@prisma/client";

export type ActionResult<T = void> =
  | { sucesso: true; dados?: T }
  | { sucesso: false; erro: string };

export async function acessarEquipe(nomeDaEquipe: string): Promise<ActionResult<{ id: string; nome: string }>> {
  try {
    const nomeLimpo = nomeDaEquipe.trim();
    if (!nomeLimpo) {
      return { sucesso: false, erro: "Nome da equipe não pode ser vazio." };
    }

    let equipe = await prisma.equipe.findUnique({
      where: { nome: nomeLimpo },
    });

    if (!equipe) {
      equipe = await prisma.equipe.create({
        data: {
          nome: nomeLimpo,
          slots: {
            create: [
              { papel: "Líder de Turno", ocupado: false },
              { papel: "Op. Recebimento", ocupado: false },
              { papel: "Op. Estoque", ocupado: false },
              { papel: "Separador(a)", ocupado: false },
              { papel: "Op. Expedição", ocupado: false },
            ],
          },
        },
      });
    }

    return { sucesso: true, dados: { id: equipe.id, nome: equipe.nome } };
  } catch (erro) {
    console.error("[acessarEquipe] Falha:", erro);
    return { sucesso: false, erro: "Falha ao acessar ou criar a equipe." };
  }
}
