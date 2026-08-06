"use client"

import { useState, useEffect } from "react"
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  TrendingUp,
  Loader2,
} from "lucide-react"
import { PageShell } from "@/components/logiq/page-shell"
import { useEquipe } from "@/hooks/use-equipe"
import { getTurnoAtivoComItens } from "@/src/actions/wms"
import type { Item, Turno } from "@prisma/client"

export default function SituacaoPage() {
  const { equipeId, equipeNome, isLoaded } = useEquipe()
  const [turno, setTurno] = useState<Turno | null>(null)
  const [itens, setItens] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  const carregarDados = async () => {
    if (!equipeId) return
    setLoading(true)
    const res = await getTurnoAtivoComItens(equipeId)
    if (res.sucesso && res.dados) {
      setTurno(res.dados.turno)
      setItens(res.dados.turno?.itens ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isLoaded && equipeId) {
      carregarDados()
    }
  }, [isLoaded, equipeId])

  const acertos = turno?.acertosPicking ?? 0
  const erros = turno?.errosPicking ?? 0
  const totalBipes = acertos + erros
  const acuracia = totalBipes === 0 ? 100 : Math.round((acertos / totalBipes) * 1000) / 10

  const metasTurno = [
    {
      kpi: "Acurácia de Picking",
      meta: "≥ 98%",
      atual: `${acuracia}%`,
      status: acuracia >= 98 ? "atingido" : "alerta",
      descricao: "Percentual de bipes corretos efetuados no coletor RF do simulador.",
      icon: Target,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      kpi: "Erros no Picking",
      meta: "0 erros",
      atual: `${erros} erros`,
      status: erros === 0 ? "atingido" : "alerta",
      descricao: "Quantidade de bipes incorretos registrados pelos separadores.",
      icon: erros === 0 ? CheckCircle2 : AlertTriangle,
      color: erros === 0 ? "text-emerald-600" : "text-amber-600",
      bg: erros === 0 ? "bg-emerald-50" : "bg-amber-50",
      border: erros === 0 ? "border-emerald-200" : "border-amber-200",
    },
    {
      kpi: "Itens em Operação",
      meta: "Fluxo Contínuo",
      atual: `${itens.length} itens`,
      status: "atingido",
      descricao: "Volume total de produtos recebidos e transitando no WMS.",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
  ]

  return (
    <PageShell
      title={`Situação das Metas — ${equipeNome ?? "Equipe"}`}
      subtitle="Scorecards e desempenho operacional da equipe no turno"
      icon={Target}
      iconColor="text-red-400"
    >
      {loading ? (
        <div className="py-12 flex justify-center text-muted-foreground">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-foreground mb-4">Metas do Turno Atual</h2>
          <div className="grid grid-cols-3 gap-4">
            {metasTurno.map((meta) => {
              const Icon = meta.icon
              return (
                <div key={meta.kpi} className={`stripe-card rounded-xl p-5 border ${meta.border}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-8 h-8 rounded-lg ${meta.bg} ${meta.color} flex items-center justify-center`}>
                      <Icon size={16} />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        meta.status === "atingido"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {meta.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{meta.kpi}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-foreground kpi-number">{meta.atual}</span>
                    <span className="text-xs text-muted-foreground">(Meta: {meta.meta})</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{meta.descricao}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </PageShell>
  )
}
