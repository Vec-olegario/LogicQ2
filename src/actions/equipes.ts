"use server";

import { prisma } from "@/src/lib/prisma";
import type { Equipe } from "@prisma/client";

export type ActionResult<T = void> =
  | { sucesso: true; dados?: T }
  | { sucesso: false; erro: string };

export async function acessarEquipe(nomeDaEquipe: string): Promise<ActionResult<{ id: string; nome: string; cor: string }>> {
  try {
    const nomeLimpo = nomeDaEquipe.trim();
    if (!nomeLimpo) {
      return { sucesso: false, erro: "Nome da equipe não pode ser vazio." };
    }

    let equipe = await prisma.equipe.findUnique({
      where: { nome: nomeLimpo },
    });

    if (!equipe) {
      // Cores disponíveis para as equipes
      const CORES = ["blue", "emerald", "violet", "amber", "rose", "cyan", "fuchsia", "indigo", "teal", "orange"];
      
      // Buscar cores já em uso
      const equipesExistentes = await prisma.equipe.findMany({ select: { cor: true } });
      const coresUsadas = equipesExistentes.map(e => e.cor);
      
      // Encontrar cores ainda não usadas
      const coresDisponiveis = CORES.filter(cor => !coresUsadas.includes(cor));
      
      // Se todas foram usadas, repete de forma aleatória do conjunto original,
      // senão sorteia uma das disponíveis
      const poolCores = coresDisponiveis.length > 0 ? coresDisponiveis : CORES;
      const corSorteada = poolCores[Math.floor(Math.random() * poolCores.length)];

      equipe = await prisma.equipe.create({
        data: {
          nome: nomeLimpo,
          cor: corSorteada,
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

    return { sucesso: true, dados: { id: equipe.id, nome: equipe.nome, cor: equipe.cor } };
  } catch (erro) {
    console.error("[acessarEquipe] Falha:", erro);
    return { sucesso: false, erro: "Falha ao acessar ou criar a equipe." };
  }
}
