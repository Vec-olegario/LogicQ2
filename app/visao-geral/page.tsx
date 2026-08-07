"use client"

import React, { useEffect, useState, useTransition } from "react"
import { Topbar } from "@/components/logiq/topbar"
import { getVisaoGeralVisitante } from "@/src/actions/wms"
import { Users, Target, CheckCircle2, RotateCw, Play, ShieldAlert, Award } from "lucide-react"

interface TeamStats {
  id: string
  nome: string
  cor: string
  usuariosCount: number
  turnosConcluidos: number
  acuraciaGeral: number
  temTurnoAtivo: boolean
  progresso: {
    recebidos: number
    estocados: number
    separados: number
    expedidos: number
    total: number
  }
}

export default function VisaoGeralPage() {
  const [equipes, setEquipes] = useState<TeamStats[]>([])
  const [loading, setLoading] = useState(true)
  const [erroMsg, setErroMsg] = useState<string | null>(null)
  
  const [isPending, startTransition] = useTransition()

  const carregarDados = () => {
    startTransition(async () => {
      const res = await getVisaoGeralVisitante()
      if (res.sucesso && res.dados) {
        // Ordenar por acurácia geral (melhores primeiro) ou por turnos concluídos
        const sorted = (res.dados as TeamStats[]).sort((a, b) => b.acuraciaGeral - a.acuraciaGeral)
        setEquipes(sorted)
        setErroMsg(null)
      } else {
        setErroMsg("Erro ao carregar os dados das equipes.")
      }
      setLoading(false)
    })
  }

  useEffect(() => {
    carregarDados()
  }, [])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Topbar />

      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(ellipse 60% 80% at 50% -20%, oklch(0.60 0.18 145 / 0.05), transparent 100%)",
      }} />

      <main className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <Award className="text-primary w-8 h-8" />
              Visão Geral — Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitore os KPIs e a performance do turno atual.
            </p>
          </div>

          <button
            onClick={carregarDados}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border hover:bg-muted text-foreground text-xs font-bold rounded-xl transition-all shadow-sm self-start"
            title="Atualizar agora"
          >
            <RotateCw size={14} className={isPending ? "animate-spin" : ""} />
            Atualizar Dados
          </button>
        </div>

        {/* Quadro Explicativo de Metas */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-10 flex items-start gap-4">
          <Target className="text-primary w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-primary mb-1">Situação de Aprendizagem Ativa</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cada equipe está operando sob metas rigorosas de <strong>Acurácia de Picking</strong> e restrição de <strong>Erros Operacionais</strong>.
              Você pode conferir a "Situação" detalhada e em tempo real dentro do painel da respectiva Equipe.
            </p>
          </div>
        </div>

        {erroMsg && (
          <div className="bg-red-50 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl border border-red-200 mb-6">
            {erroMsg}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-card/50 border border-border animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : equipes.length === 0 ? (
          <div className="text-center py-20 bg-card/50 border border-border rounded-3xl">
            <Users size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">Nenhuma equipe ativa</h3>
            <p className="text-sm text-muted-foreground">Aguarde até que os alunos criem equipes para iniciar a simulação.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {equipes.map((equipe, index) => {
              const { progresso } = equipe
              const totalMapeados = progresso.recebidos + progresso.estocados + progresso.separados + progresso.expedidos
              
              // Percentual de progresso nas etapas
              const pctRecebimento = totalMapeados > 0 ? (progresso.recebidos / totalMapeados) * 100 : 0
              const pctEstoque = totalMapeados > 0 ? (progresso.estocados / totalMapeados) * 100 : 0
              const pctPicking = totalMapeados > 0 ? (progresso.separados / totalMapeados) * 100 : 0
              const pctExpedicao = totalMapeados > 0 ? (progresso.expedidos / totalMapeados) * 100 : 0

              const getBadgeColor = (cor: string) => {
                switch (cor) {
                  case "emerald": return "bg-emerald-500/10 border-emerald-500/20 text-emerald-500";
                  case "violet": return "bg-violet-500/10 border-violet-500/20 text-violet-500";
                  case "amber": return "bg-amber-500/10 border-amber-500/20 text-amber-500";
                  case "rose": return "bg-rose-500/10 border-rose-500/20 text-rose-500";
                  case "cyan": return "bg-cyan-500/10 border-cyan-500/20 text-cyan-500";
                  case "fuchsia": return "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-500";
                  case "indigo": return "bg-indigo-500/10 border-indigo-500/20 text-indigo-500";
                  case "teal": return "bg-teal-500/10 border-teal-500/20 text-teal-500";
                  case "orange": return "bg-orange-500/10 border-orange-500/20 text-orange-500";
                  default: return "bg-blue-500/10 border-blue-500/20 text-blue-500";
                }
              };

              return (
                <div key={equipe.id} className="relative bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {/* Decorative stripe using team color */}
                  <div className={`absolute top-0 left-0 w-full h-1 ${getBadgeColor(equipe.cor).split(" ")[2].replace("text-", "bg-")}`} />
                  
                  {/* Position Badge */}
                  <div className={`absolute top-6 right-6 flex items-center justify-center w-8 h-8 rounded-full border font-bold text-sm ${getBadgeColor(equipe.cor)}`}>
                    #{index + 1}
                  </div>

                  <div className="mb-4">
                    <h3 className="font-bold text-xl text-foreground truncate pr-10">{equipe.nome}</h3>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users size={14} />
                        <span>{equipe.usuariosCount} {equipe.usuariosCount === 1 ? "Membro" : "Membros"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 size={14} />
                        <span>{equipe.turnosConcluidos} {equipe.turnosConcluidos === 1 ? "Turno" : "Turnos"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-muted/50 rounded-2xl p-4 border border-border/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Acurácia Picking</p>
                      <p className="text-2xl font-bold text-primary">{equipe.acuraciaGeral}%</p>
                    </div>
                    <div className="bg-muted/50 rounded-2xl p-4 border border-border/50 flex flex-col justify-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Status do Turno</p>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${equipe.temTurnoAtivo ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`} />
                        <span className="text-xs font-bold text-foreground">
                          {equipe.temTurnoAtivo ? "Operando" : "Inativo"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {equipe.temTurnoAtivo ? (
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Progresso dos Itens</p>
                      <div className="space-y-3">
                        {/* Progress Bar Stack */}
                        <div className="w-full h-3 bg-muted rounded-full overflow-hidden flex">
                          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${pctRecebimento}%` }} title="Recebidos" />
                          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${pctEstoque}%` }} title="Estocados" />
                          <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${pctPicking}%` }} title="Separados" />
                          <div className="h-full bg-violet-500 transition-all duration-500" style={{ width: `${pctExpedicao}%` }} title="Expedidos" />
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                          <div className="text-emerald-600 bg-emerald-50 rounded-lg py-1 border border-emerald-100">
                            Rec: {progresso.recebidos}
                          </div>
                          <div className="text-blue-600 bg-blue-50 rounded-lg py-1 border border-blue-100">
                            Est: {progresso.estocados}
                          </div>
                          <div className="text-amber-600 bg-amber-50 rounded-lg py-1 border border-amber-100">
                            Sep: {progresso.separados}
                          </div>
                          <div className="text-violet-600 bg-violet-50 rounded-lg py-1 border border-violet-100">
                            Exp: {progresso.expedidos}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-muted/30 border border-dashed border-border rounded-2xl">
                      <p className="text-xs text-muted-foreground font-semibold">Nenhum turno em andamento no momento.</p>
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        )}

      </main>
    </div>
  )
}
