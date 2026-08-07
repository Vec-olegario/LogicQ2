"use client"

import React, { useEffect, useState, useTransition } from "react"
import {
  Users,
  Crown,
  Package,
  Truck,
  ScanBarcode,
  PackageCheck,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Play,
  RotateCcw,
  ShieldAlert,
  Lock,
  AlertCircle,
  Clock,
  Loader2,
  Target,
  AlertTriangle,
  TrendingUp,
  Globe,
  Gauge
} from "lucide-react"
import { Topbar } from "@/components/logiq/topbar"
import { getSlotsDaEquipe, ocuparSlot, resetarEquipe } from "@/src/actions/slots"
import { iniciarTurno, getTurnoAtivoComItens } from "@/src/actions/wms"
import { passarLideranca, expulsarMembro } from "@/src/actions/auth"
import { useEquipe } from "@/hooks/use-equipe"

interface SlotData {
  id: string;
  papel: string;
  nomeDisplay: string | null;
  usuarioId: string | null;
  ocupado: boolean;
  ocupadoEm: Date | null;
  expiraEm: Date | null;
}

const papeis = [
  {
    id: "Líder",
    titulo: "Líder de Turno",
    descricao: "Coordena todas as operações do CD. Monitora os KPIs globais, resolve gargalos e toma decisões estratégicas para atingir o OTIF.",
    responsabilidades: ["Monitorar acurácia e OTIF em tempo real", "Identificar e resolver gargalos", "Comunicar-se com professor e equipe", "Aprovar exceções e desvios de processo"],
    icon: Crown,
    color: "text-violet-600",
    bg: "bg-violet-50",
    bgSolid: "bg-violet-500",
    border: "border-violet-200",
    shadow: "shadow-float-colored-purple",
    dificuldade: "Alta",
    vagas: 1,
  },
  {
    id: "Recebimento",
    titulo: "Operador de Recebimento",
    descricao: "Responsável pela conferência física das notas fiscais, gestão das docas de entrada e comunicação com os motoristas dos fornecedores.",
    responsabilidades: ["Conferir itens da NF-e fisicamente", "Gerenciar fila de espera das docas", "Registrar divergências e avarias", "Sinalizar docas livres e ocupadas"],
    icon: Truck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    bgSolid: "bg-emerald-500",
    border: "border-emerald-200",
    shadow: "shadow-float-colored-green",
    dificuldade: "Média",
    vagas: 1,
  },
  {
    id: "Estoque",
    titulo: "Operador de Estoque",
    descricao: "Endereça e movimenta paletes no armazém, garantindo a aplicação correta das regras FIFO e FEFO para cada categoria de produto.",
    responsabilidades: ["Endereçar produtos recebidos", "Aplicar regras FIFO e FEFO", "Monitorar ocupação por corredor", "Registrar transferências de palete"],
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50",
    bgSolid: "bg-blue-500",
    border: "border-blue-200",
    shadow: "shadow-float-colored-blue",
    dificuldade: "Média",
    vagas: 1,
  },
  {
    id: "Picking",
    titulo: "Separador (Picking)",
    descricao: "Opera o coletor de radiofrequência (RF) seguindo a fila de separação, bipando os EANs na ordem correta para montar os pedidos.",
    responsabilidades: ["Operar o coletor RF", "Seguir o roteiro de endereços", "Bipar EANs com precisão", "Reportar divergências de estoque"],
    icon: ScanBarcode,
    color: "text-orange-600",
    bg: "bg-orange-50",
    bgSolid: "bg-orange-500",
    border: "border-orange-200",
    shadow: "shadow-float-colored-orange",
    dificuldade: "Baixa",
    vagas: 1,
  },
  {
    id: "Expedição",
    titulo: "Operador de Expedição",
    descricao: "Direciona os pedidos já separados para as docas de saída corretas, confere o romaneio e coordena o despacho dos caminhões.",
    responsabilidades: ["Direcionar pedidos para docas", "Conferir romaneio de carga", "Lacrar e etiquetar volumes", "Coordenar partida dos caminhões"],
    icon: PackageCheck,
    color: "text-purple-600",
    bg: "bg-purple-50",
    bgSolid: "bg-purple-500",
    border: "border-purple-200",
    shadow: "shadow-float-colored-purple",
    dificuldade: "Média",
    vagas: 1,
  },
]

export default function EquipePage() {
  const { equipeId, equipeNome, usuarioId, isLider, isLoaded } = useEquipe()
  const [slots, setSlots] = useState<SlotData[]>([])
  const [loading, setLoading] = useState(true)
  const [erroMsg, setErroMsg] = useState<string | null>(null)
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null)

  const [papelAberto, setPapelAberto] = useState<string | null>(null)
  
  const [isPending, startTransition] = useTransition()

  const carregarSlots = async () => {
    if (!equipeId) {
      setSlots([])
      setLoading(false)
      return
    }

    setLoading(true)
    setErroMsg(null)
    const res = await getSlotsDaEquipe(equipeId)
    if (res.sucesso) {
      setSlots(res.dados as SlotData[])
    } else {
      setErroMsg(res.erro)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isLoaded) {
      carregarSlots()
    }
  }, [equipeId, isLoaded])

  function togglePapel(papelId: string) {
    setPapelAberto(papelAberto === papelId ? null : papelId)
  }

  const handleOcupar = async (papelId: string) => {
    if (!usuarioId) return;

    const slotCadastrado = slots.find((s) => s.papel === papelId)
    const slotId = slotCadastrado ? slotCadastrado.id : `temp-${papelId}`

    setErroMsg(null)
    startTransition(async () => {
      const res = await ocuparSlot(slotId, usuarioId)
      if (res.sucesso) {
        setSucessoMsg(`Vaga ocupada com sucesso!`)
        carregarSlots()
        setTimeout(() => setSucessoMsg(null), 4000)
      } else {
        setErroMsg(res.erro)
      }
    })
  }

  const handlePassarLideranca = async (alvoId: string) => {
    if (!usuarioId) return;
    if (!confirm("Tem certeza que deseja passar a liderança? Você perderá os controles da equipe.")) return;

    setErroMsg(null)
    startTransition(async () => {
      const res = await passarLideranca(usuarioId, alvoId)
      if (res.sucesso) {
        setSucessoMsg("Liderança transferida com sucesso! Você não é mais o líder.")
        carregarSlots()
        setTimeout(() => {
          setSucessoMsg(null)
          window.location.reload()
        }, 2000)
      } else {
        setErroMsg(res.erro)
      }
    })
  }

  const handleExpulsar = async (alvoId: string) => {
    if (!usuarioId) return;
    if (!confirm("Tem certeza que deseja expulsar este membro da equipe?")) return;

    setErroMsg(null)
    startTransition(async () => {
      const res = await expulsarMembro(usuarioId, alvoId)
      if (res.sucesso) {
        setSucessoMsg("Membro expulso com sucesso!")
        carregarSlots()
        setTimeout(() => setSucessoMsg(null), 4000)
      } else {
        setErroMsg(res.erro)
      }
    })
  }

  const handleIniciarTurno = async () => {
    if (!equipeId) return
    setErroMsg(null)
    startTransition(async () => {
      const res = await iniciarTurno(equipeId)
      if (res.sucesso) {
        setSucessoMsg("Novo turno iniciado com sucesso! O placar de picking foi zerado.")
        setTimeout(() => setSucessoMsg(null), 4000)
      } else {
        setErroMsg(res.erro)
      }
    })
  }

  const handleResetLider = async () => {
    if (!usuarioId || !equipeId) return;
    if (!confirm("Tem certeza que deseja resetar todas as vagas e turnos? Isso apagará o histórico atual da sua equipe.")) return;

    setErroMsg(null)
    startTransition(async () => {
      const res = await resetarEquipe(equipeId, usuarioId)
      if (res.sucesso) {
        setSucessoMsg(res.dados.mensagem)
        carregarSlots()
        setTimeout(() => setSucessoMsg(null), 4000)
      } else {
        setErroMsg(res.erro)
      }
    })
  }

  const ocupadosCount = slots.filter((s) => s.ocupado).length
  const totalVagas = papeis.reduce((s, p) => s + p.vagas, 0)

  if (!isLoaded) {
    return <div className="min-h-screen bg-background"><Topbar /></div>
  }

  if (!equipeId) {
    return (
      <div className="min-h-screen bg-background">
        <Topbar />
        <div className="pt-48 flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-6">
            <Users size={32} className="text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">Nenhuma Equipe Selecionada</h1>
          <p className="text-muted-foreground max-w-sm leading-relaxed mb-8">
            Você não está alocado em nenhuma equipe atualmente. Acesse o LogiQ para continuar.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm"
          >
            Fazer Login na Equipe
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Topbar />

      {/* Toasts */}
      {sucessoMsg && (
        <div className="fixed top-20 right-6 z-[60] bg-emerald-50 text-emerald-600 text-sm font-semibold px-4 py-3 rounded-xl shadow-lg border border-emerald-200 flex items-center gap-2 slide-in-up">
          <CheckCircle2 size={16} />
          <span>{sucessoMsg}</span>
        </div>
      )}
      {erroMsg && (
        <div className="fixed top-20 right-6 z-[60] bg-red-50 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl shadow-lg border border-red-200 flex items-center gap-2 slide-in-up">
          <AlertCircle size={16} />
          <span>{erroMsg}</span>
        </div>
      )}

      <div className="pt-14">
        <div className="max-w-[1280px] mx-auto px-8 py-8">

          {/* Header */}
          <header className="mb-8">
            <div className="glass rounded-3xl p-8 shadow-float-lg overflow-hidden relative border border-border">
              <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-bl from-teal-100/40 to-transparent rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-sm">
                    <Users size={22} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">{equipeNome}</h1>
                    <p className="text-sm text-muted-foreground">Sistema de Vagas Dinâmicas (Slots)</p>
                  </div>
                </div>

                {/* Actions and Stats */}
                <div className="flex flex-wrap items-center gap-4 shrink-0">
                  <div className="flex gap-2">
                    <button
                      onClick={handleIniciarTurno}
                      disabled={isPending}
                      className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold px-4 py-2 rounded-xl shadow-sm transition-all disabled:opacity-50 text-xs cursor-pointer"
                    >
                      <Play size={13} className="fill-current" />
                      Novo Turno
                    </button>
                    {isLider && (
                      <button
                        onClick={handleResetLider}
                        disabled={isPending}
                        className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold px-4 py-2 rounded-xl border border-red-200 transition-all text-xs cursor-pointer"
                      >
                        <RotateCcw size={13} />
                        Resetar Equipe
                      </button>
                    )}
                  </div>
                  
                  <div className="w-px h-8 bg-border hidden md:block" />

                  <div className="flex gap-3">
                    <div className="glass rounded-2xl px-4 py-2 text-center border border-border shadow-sm">
                      <p className="kpi-number text-xl font-bold text-teal-600">{ocupadosCount}</p>
                      <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Alocados</p>
                    </div>
                    <div className="glass rounded-2xl px-4 py-2 text-center border border-border shadow-sm">
                      <p className="kpi-number text-xl font-bold text-foreground">{totalVagas}</p>
                      <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Vagas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl border border-border" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {papeis.map((papel) => {
                const Icon = papel.icon
                const isOpen = papelAberto === papel.id
                
                const slotCadastrado = slots.find((s) => s.papel === papel.id)
                const ocupado = slotCadastrado?.ocupado ?? false
                const nomeAluno = slotCadastrado?.nomeDisplay
                
                const isCheio = ocupado

                return (
                  <div key={papel.id} className={`glass rounded-2xl ${papel.shadow} border ${ocupado ? 'border-emerald-200/50' : 'border-border'} overflow-hidden transition-all duration-300`}>
                    {/* Card header */}
                    <button
                      onClick={() => togglePapel(papel.id)}
                      className="w-full flex items-center gap-4 p-5 text-left cursor-pointer"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${papel.bg} ${papel.border} border flex items-center justify-center shrink-0 shadow-sm`}>
                        <Icon size={20} className={papel.color} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-bold text-base text-foreground">{papel.titulo}</h3>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${
                            papel.dificuldade === "Alta" ? "bg-red-50 text-red-600 border-red-200" :
                            papel.dificuldade === "Média" ? "bg-amber-50 text-amber-600 border-amber-200" :
                            "bg-emerald-50 text-emerald-600 border-emerald-200"
                          }`}>
                            {papel.dificuldade}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{papel.descricao}</p>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-4 shrink-0">
                        {ocupado ? (
                           <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl ${
                             slotCadastrado?.usuarioId === usuarioId 
                              ? "bg-primary/10 border-primary/20" 
                              : "bg-emerald-50 border-emerald-200"
                           }`}>
                             <div className={`w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm`}>
                               <span className={`text-[10px] font-bold ${slotCadastrado?.usuarioId === usuarioId ? "text-primary" : "text-emerald-600"}`}>{nomeAluno?.[0] || 'U'}</span>
                             </div>
                             <span className={`text-xs font-bold ${slotCadastrado?.usuarioId === usuarioId ? "text-primary" : "text-emerald-700"}`}>
                               {slotCadastrado?.usuarioId === usuarioId ? "Você" : nomeAluno}
                             </span>
                           </div>
                        ) : (
                           <span className="text-xs font-semibold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-xl border border-border">Livre</span>
                        )}
                        <ChevronRight size={14} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                      </div>
                    </button>

                    {/* Expanded */}
                    {isOpen && (
                      <div className="px-5 pb-5 pt-0 border-t border-border/30">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 pt-4">
                          {/* Descrição e responsabilidades */}
                          <div className="md:col-span-3">
                            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{papel.descricao}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Responsabilidades</p>
                            <ul className="space-y-1.5">
                              {papel.responsabilidades.map((r) => (
                                <li key={r} className="flex items-start gap-2 text-xs text-foreground">
                                  <ChevronRight size={11} className={`${papel.color} shrink-0 mt-0.5`} />
                                  {r}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Adicionar aluno */}
                          <div className="md:col-span-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                              Status da Vaga
                            </p>

                            {!isCheio ? (
                              <button
                                onClick={() => handleOcupar(papel.id)}
                                disabled={isPending}
                                className={`w-full py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-40 transition-colors ${papel.bgSolid} hover:opacity-90 flex items-center justify-center cursor-pointer shadow-sm`}
                              >
                                {isPending ? <Loader2 size={14} className="animate-spin" /> : "Ocupar Vaga"}
                              </button>
                            ) : (
                              <div className={`text-xs font-medium bg-muted/50 border border-border px-4 py-3 rounded-xl flex flex-col gap-2`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                    Vaga ocupada por {nomeAluno}
                                  </div>
                                </div>
                                <span className="text-[10px] opacity-80 flex items-center gap-1 text-muted-foreground">
                                  <Clock size={10} /> Expira em 4h
                                </span>
                                
                                {isLider && slotCadastrado?.usuarioId !== usuarioId && slotCadastrado?.usuarioId && (
                                  <div className="mt-2 pt-2 border-t border-border flex flex-col gap-1.5">
                                    <button 
                                      onClick={() => handlePassarLideranca(slotCadastrado.usuarioId!)}
                                      disabled={isPending}
                                      className="text-[10px] font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 py-1.5 rounded-lg transition-colors text-center w-full"
                                    >
                                      Promover a Líder
                                    </button>
                                    <button 
                                      onClick={() => handleExpulsar(slotCadastrado.usuarioId!)}
                                      disabled={isPending}
                                      className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 py-1.5 rounded-lg transition-colors text-center w-full"
                                    >
                                      Expulsar Membro
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* CTA */}
          <div className="mt-6 glass rounded-2xl p-4 shadow-sm border border-border flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Users size={15} className="text-teal-600" />
              <span className="text-sm font-medium text-foreground">
                {ocupadosCount} de {totalVagas} vagas preenchidas
              </span>
              <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-400 rounded-full transition-all"
                  style={{ width: `${(ocupadosCount / totalVagas) * 100}%` }}
                />
              </div>
            </div>
            <a href="/dashboard" className="flex items-center gap-2 text-xs font-bold text-foreground hover:text-primary transition-colors">
              Ver Dashboard do Turno <ArrowRight size={12} />
            </a>
          </div>

          <TurnoSituacaoReadOnly equipeId={equipeId} />

        </div>
      </div>

    </div>
  )
}

function TurnoSituacaoReadOnly({ equipeId }: { equipeId: string }) {
  const [turno, setTurno] = useState<any | null>(null)
  const [itens, setItens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      setLoading(true)
      const res = await getTurnoAtivoComItens(equipeId)
      if (res.sucesso && res.dados) {
        setTurno(res.dados.turno)
        setItens(res.dados.turno?.itens ?? [])
      }
      setLoading(false)
    }
    carregar()
  }, [equipeId])

  if (loading) {
    return (
      <div className="py-12 flex justify-center text-muted-foreground">
        <Loader2 size={24} className="animate-spin" />
      </div>
    )
  }

  if (!turno) {
    return null
  }

  const acertos = turno.acertosPicking ?? 0
  const erros = turno.errosPicking ?? 0
  const totalBipes = acertos + erros
  const acuracia = totalBipes === 0 ? 100 : Math.round((acertos / totalBipes) * 1000) / 10

  const metaAcuracia = turno.metaAcuracia ?? 98
  const metaErros = turno.metaErros ?? 0
  const metaItensDesc = turno.metaItensDesc ?? "Fluxo Contínuo"

  const metasTurno = [
    {
      kpi: "Acurácia de Picking",
      meta: `≥ ${metaAcuracia}%`,
      atual: `${acuracia}%`,
      status: acuracia >= metaAcuracia ? "atingido" : "alerta",
      descricao: "Taxa mínima de acertos na hora de bipar os produtos.",
      icon: Target,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      kpi: "Erros no Picking",
      meta: `${metaErros} erros max`,
      atual: `${erros} erros`,
      status: erros <= metaErros ? "atingido" : "alerta",
      descricao: "Número máximo de bipes errados no coletor.",
      icon: erros <= metaErros ? CheckCircle2 : AlertTriangle,
      color: erros <= metaErros ? "text-emerald-600" : "text-amber-600",
      bg: erros <= metaErros ? "bg-emerald-50" : "bg-amber-50",
      border: erros <= metaErros ? "border-emerald-200" : "border-amber-200",
    },
    {
      kpi: "Dificuldade",
      meta: turno.dificuldade ?? "Normal",
      atual: turno.dificuldade ?? "Normal",
      status: "atingido",
      descricao: "Dificuldade geral da simulação.",
      icon: Globe,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      kpi: "Tempo SLA",
      meta: `${turno.tempoSLA ?? 5} min`,
      atual: "---", // Fictício por enquanto, será calculado com pedidos no futuro
      status: "atingido",
      descricao: "Tempo máximo para liberar um pedido.",
      icon: Clock,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-200",
    },
    {
      kpi: "Volume (Caixas)",
      meta: `${turno.metaVolume ?? 500} un`,
      atual: `${itens.length} un`,
      status: itens.length >= (turno.metaVolume ?? 500) ? "atingido" : "alerta",
      descricao: "Quantas caixas vocês precisam fazer até o fim da aula.",
      icon: PackageCheck,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-200",
    },
  ]

  return (
    <div className="mt-10">
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <Target size={18} className="text-violet-500" /> Situação das Metas (Turno Ativo)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metasTurno.map((meta) => {
          const Icon = meta.icon
          return (
            <div key={meta.kpi} className={`glass rounded-xl p-5 border ${meta.border} shadow-sm`}>
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
  )
}
