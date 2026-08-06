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
  Clock
} from "lucide-react"
import { Topbar } from "@/components/logiq/topbar"
import { getSlotsDaEquipe, ocuparSlot, resetarEquipe } from "@/src/actions/slots"
import { iniciarTurno } from "@/src/actions/wms"
import { useEquipe } from "@/hooks/use-equipe"

interface SlotData {
  id: string;
  papel: string;
  nomeDisplay: string | null;
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
  const { equipeId, isLoaded } = useEquipe()
  const [slots, setSlots] = useState<SlotData[]>([])
  const [loading, setLoading] = useState(true)
  const [erroMsg, setErroMsg] = useState<string | null>(null)
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null)

  const [papelAberto, setPapelAberto] = useState<string | null>(null)
  const [nomeInput, setNomeInput] = useState("")
  
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [senhaAdmin, setSenhaAdmin] = useState("")

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
    setNomeInput("")
  }

  const handleOcupar = async (papelId: string) => {
    const nome = nomeInput.trim()
    if (!nome) return

    const slotCadastrado = slots.find((s) => s.papel === papelId)
    const slotId = slotCadastrado ? slotCadastrado.id : `temp-${papelId}`

    setErroMsg(null)
    startTransition(async () => {
      const res = await ocuparSlot(slotId, nome)
      if (res.sucesso) {
        setSucessoMsg(`Vaga ocupada com sucesso por ${nome}!`)
        setNomeInput("")
        carregarSlots()
        setTimeout(() => setSucessoMsg(null), 4000)
      } else {
        setErroMsg(res.erro)
      }
    })
  }

  const handleIniciarTurno = async () => {
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

  const handleResetEquipe = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroMsg(null)
    startTransition(async () => {
      const res = await resetarEquipe(equipeId, senhaAdmin)
      if (res.sucesso) {
        setSucessoMsg(res.dados.mensagem)
        setResetModalOpen(false)
        setSenhaAdmin("")
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
          <p className="text-muted-foreground max-w-sm leading-relaxed">
            Use o menu "Acessar Equipe" no canto superior direito para entrar no ambiente da sua turma.
          </p>
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
                      Iniciar Novo Turno
                    </button>
                    <button
                      onClick={() => setResetModalOpen(true)}
                      className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground font-bold px-4 py-2 rounded-xl border border-border transition-all text-xs cursor-pointer"
                    >
                      <RotateCcw size={13} className="text-muted-foreground" />
                      Reset Admin
                    </button>
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
                           <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                             <div className={`w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm`}>
                               <span className={`text-[10px] font-bold text-emerald-600`}>{nomeAluno?.[0] || 'U'}</span>
                             </div>
                             <span className="text-xs font-bold text-emerald-700">{nomeAluno}</span>
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
                              Ocupar Vaga
                            </p>

                            {!isCheio ? (
                              <div className="flex gap-2 mb-3">
                                <input
                                  value={nomeInput}
                                  onChange={(e) => setNomeInput(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) handleOcupar(papel.id) }}
                                  placeholder="Seu nome..."
                                  disabled={isPending}
                                  className="flex-1 bg-white border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:opacity-50"
                                />
                                <button
                                  onClick={() => handleOcupar(papel.id)}
                                  disabled={!nomeInput.trim() || isPending}
                                  className={`px-3 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-40 transition-colors ${papel.bgSolid} hover:opacity-90 flex items-center justify-center cursor-pointer`}
                                >
                                  {isPending ? "..." : "+"}
                                </button>
                              </div>
                            ) : (
                              <div className={`text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl flex flex-col gap-1`}>
                                <div className="flex items-center gap-1.5 font-bold">
                                  <CheckCircle2 size={12} />
                                  Vaga ocupada
                                </div>
                                <span className="text-[10px] opacity-80 flex items-center gap-1"><Clock size={10} /> Expira em 4h</span>
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
          <div className="mt-6 glass rounded-2xl p-4 shadow-sm border border-border flex items-center justify-between">
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
            <a href="/dashboard-turno" className="flex items-center gap-2 text-xs font-bold text-foreground hover:text-primary transition-colors">
              Ver Dashboard do Turno <ArrowRight size={12} />
            </a>
          </div>

        </div>
      </div>

      {/* Modal Reset Admin */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">Reset de Equipe</h3>
                <p className="text-xs text-muted-foreground">Liberar todas as vagas e apagar histórico</p>
              </div>
            </div>

            <form onSubmit={handleResetEquipe} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                  Senha Admin
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={senhaAdmin}
                    onChange={(e) => setSenhaAdmin(e.target.value)}
                    placeholder="Digite a senha..."
                    className="w-full bg-white border border-border rounded-2xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Lock size={14} className="text-muted-foreground absolute left-3 top-3" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-bold py-2.5 rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-2xl text-xs shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Executando..." : "Confirmar Reset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
