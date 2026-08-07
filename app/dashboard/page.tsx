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
  Target,
  Zap,
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
    <span className="font-mono tracking-tight">
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
      <PageShell title="Visão Geral" subtitle="Monitore os KPIs e a performance do turno atual.">
        <div className="py-32 flex flex-col items-center justify-center text-muted-foreground animate-in fade-in zoom-in duration-500">
          <Loader2 size={48} className="animate-spin text-primary mb-4" />
          <p className="font-medium">Carregando painel de controle...</p>
        </div>
      </PageShell>
    )
  }

  if (!equipeId) {
    return (
      <PageShell title="Visão Geral" subtitle="Monitore os KPIs e a performance do turno atual.">
        <div className="py-24 text-center max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <BarChart3 size={40} className="text-muted-foreground opacity-60" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Nenhuma Equipe Selecionada</h2>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            Selecione ou crie uma equipe no menu superior para acessar o Dashboard da turma e visualizar os indicadores em tempo real.
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
    { label: "Recebimento", href: "/recebimento", icon: Truck, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/50", stat: recebidos, sub: "itens em conferência" },
    { label: "Estoque", href: "/estoque", icon: Package, color: "text-blue-500", bg: "bg-blue-500/10", border: "hover:border-blue-500/50", stat: estocados, sub: "itens armazenados" },
    { label: "Picking", href: "/picking", icon: ScanBarcode, color: "text-amber-500", bg: "bg-amber-500/10", border: "hover:border-amber-500/50", stat: separados, sub: "itens coletados" },
    { label: "Expedição", href: "/expedicao", icon: PackageCheck, color: "text-violet-500", bg: "bg-violet-500/10", border: "hover:border-violet-500/50", stat: expedidos, sub: "itens despachados" },
  ]

  return (
    <PageShell
      title={<span className="flex items-center gap-3">Visão Geral <span className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full font-bold uppercase tracking-widest">{equipeNome}</span></span>}
      subtitle="Centro de Comando e Controle Logístico Integrado."
    >
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out space-y-8">
        
        {/* Banner do Cenário (Hero style) */}
        {turno ? (
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5 shadow-sm p-8">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-gradient-to-br from-primary/80 to-primary rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transform -rotate-3">
                  <Target size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Simulação em Andamento</p>
                  </div>
                  <h3 className="text-2xl font-black text-foreground mb-2">{turno.titulo}</h3>
                  <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                    {turno.contexto}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
            <p className="text-muted-foreground text-sm">Nenhum cenário de simulação ativo no momento.</p>
          </div>
        )}

        {/* Top KPI row Reais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stripe-card-hover rounded-2xl p-6 bg-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
              <Clock size={64} />
            </div>
            <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Duração do Turno</p>
            <p className="kpi-number text-3xl font-black text-foreground mb-1">
              {turno ? <TimerTurno iniciadoEm={turno.iniciadoEm} /> : "00:00:00"}
            </p>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5 font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${turno ? 'bg-emerald-500' : 'bg-muted-foreground'}`}></span> 
              {turno ? "Turno em andamento" : "Sem turno ativo"}
            </p>
          </div>
          
          <div className="stripe-card-hover rounded-2xl p-6 bg-card relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
              <CheckCircle2 size={64} />
            </div>
            <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Acertos no Picking</p>
            <p className="kpi-number text-3xl font-black text-emerald-500 mb-1">{acertos}</p>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5 font-medium">
              <Zap size={12} className="text-emerald-500" /> Bipes validados com sucesso
            </p>
          </div>
          
          <div className="stripe-card-hover rounded-2xl p-6 bg-card relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 text-blue-500 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
              <TrendingUp size={64} />
            </div>
            <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Acurácia Geral</p>
            <div className="flex items-baseline gap-1 mb-1">
              <p className="kpi-number text-3xl font-black text-blue-500">{acuracia}</p>
              <span className="text-lg font-bold text-blue-500/70">%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5 font-medium">
              <Activity size={12} className="text-blue-500" /> Baseado em {totalBipes} operações
            </p>
          </div>
          
          <div className="stripe-card-hover rounded-2xl p-6 bg-card relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 text-primary group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
              <Users size={64} />
            </div>
            <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Força de Trabalho</p>
            <div className="flex items-baseline gap-1 mb-1">
              <p className="kpi-number text-3xl font-black text-foreground">{slotsOcupados.length}</p>
              <span className="text-lg font-bold text-muted-foreground">/ {slots.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5 font-medium">
              <Users size={12} className="text-primary" /> Membros ativos na equipe
            </p>
          </div>
        </div>

        {/* Modulos do Fluxo Logístico */}
        <div>
          <div className="flex items-center gap-2 mb-5 pl-2">
            <Activity size={18} className="text-primary" />
            <h3 className="text-base font-bold text-foreground">Fluxo Operacional</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {flowModules.map((mod) => {
              const Icon = mod.icon
              return (
                <Link key={mod.href} href={mod.href} className={`group stripe-card rounded-2xl p-5 ${mod.border} transition-all duration-300 hover:shadow-md hover:-translate-y-1`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${mod.bg} ${mod.color} flex items-center justify-center`}>
                      <Icon size={20} />
                    </div>
                    <ArrowRight size={16} className={`${mod.color} opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0`} />
                  </div>
                  <p className="text-sm font-bold text-foreground mb-1">{mod.label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <p className={`kpi-number text-2xl font-black ${mod.color}`}>{mod.stat}</p>
                    <p className="text-[11px] font-medium text-muted-foreground">{mod.sub}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6">
          {/* Integrantes da Equipe Reais */}
          <div className="col-span-3 stripe-card rounded-3xl p-6 bg-card flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Users size={18} />
                </div>
                <h3 className="text-base font-bold text-foreground">Quadro de Operadores</h3>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{slotsOcupados.length} Ativos</span>
            </div>

            <div className="space-y-3 flex-1">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                    slot.ocupado ? "border-border/80 bg-background hover:bg-muted/30" : "border-dashed border-border/50 bg-muted/10 opacity-70"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {slot.ocupado ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shadow-sm">
                        {slot.nomeDisplay.substring(0, 2).toUpperCase()}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground">
                        <Users size={16} />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-sm text-foreground">{slot.papel}</p>
                      <p className="text-muted-foreground text-xs font-medium mt-0.5">
                        {slot.ocupado ? slot.nomeDisplay : "Vaga não preenchida"}
                      </p>
                    </div>
                  </div>
                  <div>
                    {slot.ocupado ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Operante
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted border border-border/50 px-3 py-1 rounded-full">
                        Aguardando
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Movimentações Reais do Turno */}
          <div className="col-span-2 stripe-card rounded-3xl p-6 bg-card flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Activity size={18} />
                </div>
                <h3 className="text-base font-bold text-foreground">Timeline Logística</h3>
              </div>
            </div>

            {itens.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-2xl bg-muted/10">
                <Package size={32} className="text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Nenhuma carga registrada.</p>
                <p className="text-xs text-muted-foreground/70 mt-1">As operações do turno aparecerão aqui.</p>
              </div>
            ) : (
              <div className="relative pl-3 space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {/* Linha da timeline */}
                <div className="absolute left-4 top-2 bottom-2 w-px bg-border"></div>
                
                {itens.map((item, idx) => {
                  let statusColor = "bg-muted text-muted-foreground border-border";
                  let dotColor = "bg-muted-foreground";
                  
                  if (item.status === "RECEBIDO") {
                    statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                    dotColor = "bg-emerald-500 ring-emerald-100";
                  } else if (item.status === "ESTOCADO") {
                    statusColor = "bg-blue-50 text-blue-700 border-blue-200";
                    dotColor = "bg-blue-500 ring-blue-100";
                  } else if (item.status === "SEPARADO") {
                    statusColor = "bg-amber-50 text-amber-700 border-amber-200";
                    dotColor = "bg-amber-500 ring-amber-100";
                  } else if (item.status === "EXPEDIDO") {
                    statusColor = "bg-violet-50 text-violet-700 border-violet-200";
                    dotColor = "bg-violet-500 ring-violet-100";
                  }

                  return (
                    <div key={item.id} className="relative pl-6 animate-in slide-in-from-right-4 fade-in duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                      <div className={`absolute left-0.5 top-1.5 w-2 h-2 rounded-full ring-4 ${dotColor} z-10`}></div>
                      <div className={`p-3.5 rounded-xl border ${statusColor} transition-colors hover:brightness-95`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-sm leading-tight pr-4">{item.descricao}</span>
                          <span className="text-[9px] font-black tracking-wider uppercase opacity-80 shrink-0 mt-0.5">{item.status}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-medium opacity-75">
                          <span className="flex items-center gap-1.5">
                            <ScanBarcode size={10} /> EAN: {item.codigo}
                          </span>
                          <span className="font-bold px-1.5 py-0.5 bg-black/5 rounded">
                            {item.quantidade} un.
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
