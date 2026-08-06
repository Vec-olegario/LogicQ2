"use client"

import { useState, useEffect } from "react"
import {
  BarChart3,
  Users,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  ScanBarcode,
  PackageCheck,
  TrendingUp,
  Activity,
  Loader2,
} from "lucide-react"
import { Topbar } from "@/components/logiq/topbar"
import { useEquipe } from "@/hooks/use-equipe"
import { getTurnoAtivoComItens } from "@/src/actions/wms"
import type { Item, Slot, Turno } from "@prisma/client"

function TimerTurno({ iniciadoEm }: { iniciadoEm?: Date | string }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!iniciadoEm) return
    const startTime = new Date(iniciadoEm).getTime()

    const update = () => {
      const diff = Math.max(0, Math.floor((Date.now() - startTime) / 1000))
      setSeconds(diff)
    }

    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [iniciadoEm])

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  return (
    <span className="kpi-number">
      {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  )
}

export default function DashboardTurnoPage() {
  const { equipeId, equipeNome, isLoaded } = useEquipe()

  const [turno, setTurno] = useState<Turno | null>(null)
  const [itens, setItens] = useState<Item[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)

  const carregarDados = async () => {
    if (!equipeId) return
    setLoading(true)
    const res = await getTurnoAtivoComItens(equipeId)
    if (res.sucesso && res.dados) {
      setTurno(res.dados.turno)
      setItens(res.dados.turno?.itens ?? [])
      setSlots(res.dados.slots)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isLoaded && equipeId) {
      carregarDados()
    }
  }, [isLoaded, equipeId])

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Topbar />
        <div className="pt-32 flex justify-center text-muted-foreground">
          <Loader2 size={32} className="animate-spin" />
        </div>
      </div>
    )
  }

  if (!equipeId) {
    return (
      <div className="min-h-screen bg-background">
        <Topbar />
        <div className="pt-48 flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-6">
            <BarChart3 size={32} className="text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">Nenhuma Equipe Selecionada</h1>
          <p className="text-muted-foreground max-w-sm leading-relaxed text-xs">
            Selecione uma equipe na barra superior para visualizar o Dashboard do turno.
          </p>
        </div>
      </div>
    )
  }

  const recebidos = itens.filter((i) => i.status === "RECEBIDO").length
  const estocados = itens.filter((i) => i.status === "ESTOCADO").length
  const separados = itens.filter((i) => i.status === "SEPARADO").length
  const expedidos = itens.filter((i) => i.status === "EXPEDIDO").length

  const acertos = turno?.acertosPicking ?? 0
  const erros = turno?.errosPicking ?? 0
  const totalBipes = acertos + erros
  const acuracia = totalBipes === 0 ? 100 : Math.round((acertos / totalBipes) * 1000) / 10

  const slotsOcupados = slots.filter((s) => s.ocupado)

  const modulos = [
    { setor: "Recebimento", nivel: recebidos, status: recebidos > 5 ? "crítico" : "normal", icon: Truck, color: "text-emerald-600", bar: "bg-emerald-400" },
    { setor: "Estoque", nivel: estocados, status: estocados > 10 ? "moderado" : "normal", icon: Package, color: "text-blue-600", bar: "bg-blue-400" },
    { setor: "Picking", nivel: separados, status: separados > 5 ? "moderado" : "normal", icon: ScanBarcode, color: "text-amber-600", bar: "bg-amber-400" },
    { setor: "Expedição", nivel: expedidos, status: "normal", icon: PackageCheck, color: "text-violet-600", bar: "bg-violet-400" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <div className="pt-14">
        <div className="max-w-[1280px] mx-auto px-8 py-8">
          {/* Header */}
          <header className="mb-8">
            <div className="glass rounded-3xl p-6 shadow-float-lg overflow-hidden relative">
              <div className="relative z-10 flex items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-float">
                    <BarChart3 size={22} className="text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard: {equipeNome}</h1>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <span className="status-dot bg-emerald-400 inline-block" />
                        Ao Vivo
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Monitoramento completo da operação</p>
                  </div>
                </div>

                {/* Timer + KPIs globais */}
                <div className="flex gap-3">
                  <div className="glass rounded-2xl px-5 py-3 text-center shadow-float border border-white/60">
                    <p className="text-xl font-bold text-foreground">
                      <TimerTurno iniciadoEm={turno?.iniciadoEm} />
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center justify-center gap-1">
                      <Clock size={9} /> Duração
                    </p>
                  </div>
                  <div className="glass rounded-2xl px-5 py-3 text-center shadow-float border border-white/60">
                    <p className="kpi-number text-xl font-bold text-emerald-600">{acuracia}%</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Acurácia</p>
                  </div>
                  <div className="glass rounded-2xl px-5 py-3 text-center shadow-float border border-white/60">
                    <p className="kpi-number text-xl font-bold text-blue-600">{slotsOcupados.length}/{slots.length}</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center justify-center gap-1">
                      <Users size={9} /> Alunos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-5 gap-6">
            {/* Left — status dos setores + alunos */}
            <div className="col-span-3 flex flex-col gap-6">
              {/* Quantidade por Setor */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={14} className="text-slate-600" />
                  <h2 className="text-sm font-bold text-foreground">Cargas por Etapa</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {modulos.map((m) => {
                    const Icon = m.icon
                    return (
                      <div key={m.setor} className="glass rounded-2xl p-4 shadow-float border border-white/60">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon size={14} className={m.color} />
                          <span className="text-sm font-bold text-foreground">{m.setor}</span>
                          <span className="ml-auto text-xs font-bold text-foreground kpi-number">
                            {m.nivel} itens
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Alunos Conectados Reais */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users size={14} className="text-slate-600" />
                  <h2 className="text-sm font-bold text-foreground">Integrantes da Turma</h2>
                  <span className="ml-auto text-xs text-muted-foreground">{slotsOcupados.length} ocupados</span>
                </div>
                <div className="space-y-2">
                  {slots.map((slot) => (
                    <div key={slot.id} className="glass rounded-xl p-3.5 shadow-sm border border-white/60 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-foreground">{slot.papel}</p>
                        <p className="text-muted-foreground text-[11px]">
                          {slot.ocupado ? slot.nomeDisplay : "Vaga livre"}
                        </p>
                      </div>
                      {slot.ocupado ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Ocupado
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          Disponível
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — feed de itens reais */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={14} className="text-slate-600" />
                <h2 className="text-sm font-bold text-foreground">Itens em Operação</h2>
              </div>

              <div className="glass rounded-2xl p-3 shadow-float border border-white/60 overflow-hidden">
                {itens.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    Nenhum item cadastrado no turno.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {itens.map((item) => (
                      <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-foreground">{item.descricao}</span>
                          <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          EAN: <span className="font-mono">{item.codigo}</span> · Fornecedor: {item.fornecedor}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
