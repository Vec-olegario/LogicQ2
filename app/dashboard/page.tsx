"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Truck,
  Package,
  ScanBarcode,
  PackageCheck,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Users,
  Wifi,
  TrendingUp,
  Activity,
  BarChart3,
  Loader2,
  BookOpen,
} from "lucide-react"
import { PageShell } from "@/components/logiq/page-shell"
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
    <span>
      {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  )
}

export default function DashboardPage() {
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
      <PageShell title="Dashboard" subtitle="Monitore os KPIs e a performance do turno atual.">
        <div className="py-20 flex justify-center text-muted-foreground">
          <Loader2 size={32} className="animate-spin" />
        </div>
      </PageShell>
    )
  }

  if (!equipeId) {
    return (
      <PageShell title="Dashboard" subtitle="Monitore os KPIs e a performance do turno atual.">
        <div className="py-20 text-center">
          <BarChart3 size={36} className="mx-auto text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-lg font-bold text-foreground mb-1">Nenhuma Equipe Selecionada</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
            Selecione ou crie uma equipe no menu superior para acessar o Dashboard da turma.
          </p>
        </div>
      </PageShell>
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

  const flowModules = [
    { label: "Recebimento", href: "/recebimento", icon: Truck, color: "text-emerald-400", stat: `${recebidos} itens`, sub: "em conferência" },
    { label: "Estoque", href: "/estoque", icon: Package, color: "text-blue-400", stat: `${estocados} itens`, sub: "armazenados" },
    { label: "Picking", href: "/picking", icon: ScanBarcode, color: "text-amber-400", stat: `${separados} itens`, sub: "coletados" },
    { label: "Expedição", href: "/expedicao", icon: PackageCheck, color: "text-violet-400", stat: `${expedidos} itens`, sub: "despachados" },
  ]

  return (
    <PageShell
      title={`Dashboard — ${equipeNome}`}
      subtitle="Monitore os KPIs e a performance do turno atual."
    >
      {/* Situação de Aprendizagem Ativa */}
      {turno && (
        <div className="mb-6 p-5 glass rounded-2xl border border-border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mt-1 shrink-0">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Cenário da Simulação</p>
              <h3 className="text-base font-bold text-foreground mb-1">{turno.titulo}</h3>
              <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
                {turno.contexto}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top KPI row Reais */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <div className="stripe-card rounded-xl p-5">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Duração do Turno</p>
          <p className="kpi-number text-2xl font-bold text-foreground">
            {turno ? <TimerTurno iniciadoEm={turno.iniciadoEm} /> : "00:00:00"}
          </p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Clock size={10} /> {turno ? "Turno em andamento" : "Sem turno ativo"}
          </p>
        </div>
        <div className="stripe-card rounded-xl p-5">
          <p className="text-xs text-muted-foreground mb-2 font-medium font-medium">Acertos no Picking</p>
          <p className="kpi-number text-2xl font-bold text-emerald-400">{acertos}</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <CheckCircle2 size={10} /> Bipes corretos
          </p>
        </div>
        <div className="stripe-card rounded-xl p-5">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Acurácia de Separação</p>
          <p className="kpi-number text-2xl font-bold text-blue-400">{acuracia}%</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp size={10} /> Baseado em {totalBipes} bipes
          </p>
        </div>
        <div className="stripe-card rounded-xl p-5">
          <p className="text-xs text-muted-foreground mb-2 font-medium font-medium">Alunos na Turma</p>
          <p className="kpi-number text-2xl font-bold text-foreground">
            {slotsOcupados.length}<span className="text-base text-muted-foreground font-normal">/{slots.length}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Users size={10} /> Vagas ocupadas
          </p>
        </div>
      </div>

      {/* Flow modules */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Etapas da Operação</p>
        <div className="grid grid-cols-4 gap-3">
          {flowModules.map((mod) => {
            const Icon = mod.icon
            return (
              <Link key={mod.href} href={mod.href} className="group stripe-card-hover rounded-xl p-4 border-border/60 hover:border-border transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <Icon size={16} className={mod.color} />
                  <ArrowRight size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-0.5">{mod.label}</p>
                <p className={`kpi-number text-lg font-bold ${mod.color}`}>{mod.stat}</p>
                <p className="text-[11px] text-muted-foreground">{mod.sub}</p>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* Integrantes da Equipe Reais (3 cols) */}
        <div className="col-span-3 stripe-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={13} className="text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Operadores e Cargos Reais</p>
            </div>
            <span className="text-xs text-muted-foreground">{slotsOcupados.length} ativos</span>
          </div>

          <div className="space-y-2">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                  slot.ocupado ? "border-border bg-card" : "border-dashed border-border/60 opacity-60"
                }`}
              >
                <div>
                  <p className="font-bold text-foreground">{slot.papel}</p>
                  <p className="text-muted-foreground text-[11px]">
                    {slot.ocupado ? `Aluno: ${slot.nomeDisplay}` : "Vaga disponível"}
                  </p>
                </div>
                <div>
                  {slot.ocupado ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Ocupado
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Livre
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Movimentações Reais do Turno (2 cols) */}
        <div className="col-span-2 stripe-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={13} className="text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Registro de Cargas do Turno</p>
            </div>
          </div>

          {itens.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
              Nenhuma carga registrada no turno até o momento.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {itens.map((item) => (
                <div key={item.id} className="p-2.5 rounded-lg border border-border/60 bg-muted/20 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-foreground">{item.descricao}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        item.status === "RECEBIDO"
                          ? "bg-amber-100 text-amber-700"
                          : item.status === "ESTOCADO"
                          ? "bg-blue-100 text-blue-700"
                          : item.status === "SEPARADO"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Qty: {item.quantidade} un. · EAN: {item.codigo}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
