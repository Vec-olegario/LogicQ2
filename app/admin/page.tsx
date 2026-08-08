"use client"

import React, { useTransition } from "react"
import { Users, Trash2, CalendarDays, Target, StopCircle, UserCircle2, Crown, Activity } from "lucide-react"
import { getTodasEquipes, deletarEquipeAdmin } from "@/src/actions/auth"
import { encerrarTurnoAdmin } from "@/src/actions/wms"
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

  const handlePararTurno = async (id: string, nome: string) => {
    if (!confirm(`Deseja encerrar o turno ATIVO da equipe "${nome}"?`)) return;
    
    setErroMsg(null)
    startTransition(async () => {
      const res = await encerrarTurnoAdmin(senhaAdmin, id)
      if (res.sucesso) {
        const getRes = await getTodasEquipes(senhaAdmin)
        if (getRes.sucesso) setEquipes(getRes.dados)
      } else {
        setErroMsg(res.erro || "Erro ao encerrar turno")
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
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <Users size={12} /> Alunos ({equipe.usuarios?.length || 0})
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      {equipe.usuarios?.length > 0 ? (
                        equipe.usuarios.map((u: any) => (
                          <div key={u.id} className="text-xs flex items-center gap-1.5 text-foreground">
                            {u.isLider ? <Crown size={12} className="text-violet-500" /> : <UserCircle2 size={12} className="text-muted-foreground" />}
                            <span className={u.isLider ? "font-semibold" : ""}>{u.nome}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Vazia</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-border rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <Activity size={12} /> Turno
                      </div>
                    </div>
                    {equipe.turnos && equipe.turnos.length > 0 ? (
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-xs font-semibold">
                          <span className="status-dot bg-emerald-500" /> Em andamento
                        </span>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="text-xs text-muted-foreground">Vol: <span className="font-bold text-foreground">{equipe.turnos[0].metaVolume}</span></div>
                          <div className="text-xs text-muted-foreground">SLA: <span className="font-bold text-foreground">{equipe.turnos[0].tempoSLA}m</span></div>
                        </div>
                        <button
                          onClick={() => handlePararTurno(equipe.id, equipe.nome)}
                          disabled={isPending}
                          className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-orange-50 text-orange-600 text-xs font-semibold hover:bg-orange-100 transition-colors disabled:opacity-50"
                        >
                          <StopCircle size={14} /> Parar Turno
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-muted-foreground italic">Nenhum turno ativo.</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium border-t border-border pt-3">
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
