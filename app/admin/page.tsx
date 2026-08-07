"use client"

import React, { useTransition } from "react"
import { Users, Trash2, CalendarDays, Target } from "lucide-react"
import { getTodasEquipes, deletarEquipeAdmin } from "@/src/actions/auth"
import { useAdminAuth } from "./layout"

export default function AdminPage() {
  const { senhaAdmin, equipes, setEquipes } = useAdminAuth()
  const [isPending, startTransition] = useTransition()
  const [erroMsg, setErroMsg] = React.useState<string | null>(null)

  const handleDeletar = async (id: string, nome: string) => {
    if (!confirm(`TEM CERTEZA absoluta que deseja APAGAR a equipe "${nome}"? Isso removerá todos os usuários, itens e turnos desta equipe. Não há volta.`)) return;
    
    setErroMsg(null)
    startTransition(async () => {
      const res = await deletarEquipeAdmin(senhaAdmin, id)
      if (res.sucesso) {
        const getRes = await getTodasEquipes(senhaAdmin)
        if (getRes.sucesso) setEquipes(getRes.dados)
      } else {
        setErroMsg(res.erro || "Erro ao deletar")
      }
    })
  }

  return (
    <div className="p-6 md:p-10 max-w-[1000px] mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-foreground">Equipes Ativas</h2>
          <p className="text-sm text-muted-foreground mt-1">Gerencie as equipes e seus turnos criados no simulador.</p>
        </div>
        <span className="text-xs font-bold bg-violet-100 text-violet-700 px-3 py-1.5 rounded-full">{equipes.length} equipes</span>
      </div>

      {erroMsg && (
        <div className="bg-red-50 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl border border-red-200 mb-6">
          {erroMsg}
        </div>
      )}

      {equipes.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border border-border">
          <Users size={32} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">Nenhuma equipe criada</h3>
          <p className="text-sm text-muted-foreground">Os alunos ainda não criaram nenhuma equipe no simulador.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {equipes.map((equipe) => (
            <div key={equipe.id} className="glass rounded-2xl p-5 border border-border flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-lg text-foreground">{equipe.nome}</h3>
                  <button
                    onClick={() => handleDeletar(equipe.id, equipe.nome)}
                    disabled={isPending}
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50"
                    title="Apagar equipe"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-white border border-border rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      <Users size={12} /> Alunos
                    </div>
                    <p className="text-xl font-bold text-foreground">{equipe._count.usuarios}</p>
                  </div>
                  <div className="bg-white border border-border rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      <Target size={12} /> Turnos
                    </div>
                    <p className="text-xl font-bold text-foreground">{equipe._count.turnos}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                <CalendarDays size={10} /> 
                Criada em {new Date(equipe.criadoEm).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
