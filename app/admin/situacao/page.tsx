"use client"

import React, { useState, useEffect, useTransition } from "react"
import { useAdminAuth } from "../layout"
import { Target, Settings2, Globe, Loader2, Gauge, Clock, PackageCheck, PlayCircle, BookOpen } from "lucide-react"
import { getConfiguracaoGlobal, iniciarTurnoGlobal } from "@/src/actions/configuracao"
import { EditGlobalMetasDialog } from "@/src/components/logiq/edit-global-metas-dialog"

export default function AdminSituacaoGlobalPage() {
  const { senhaAdmin } = useAdminAuth()
  
  const [configGlobal, setConfigGlobal] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const carregarConfiguracao = () => {
    setLoading(true)
    startTransition(async () => {
      const res = await getConfiguracaoGlobal()
      if (res.sucesso) {
        setConfigGlobal(res.dados)
      }
      setLoading(false)
    })
  }
  
  const handleIniciarGlobal = () => {
    if (!confirm("TEM CERTEZA? Isso encerrará o turno atual de TODAS as equipes e iniciará um novo aplicando esta Situação de Aprendizagem imediatamente.")) return;
    
    startTransition(async () => {
      const res = await iniciarTurnoGlobal(senhaAdmin)
      if (res.sucesso) {
        alert("Situação de Aprendizagem iniciada com sucesso para todas as equipes!")
        carregarConfiguracao()
      } else {
        alert("Erro: " + res.erro)
      }
    })
  }

  useEffect(() => {
    carregarConfiguracao()
  }, [])

  if (loading) {
    return (
      <div className="py-20 flex justify-center text-muted-foreground">
        <Loader2 size={32} className="animate-spin" />
      </div>
    )
  }

  const metasGerais = configGlobal ? [
    {
      kpi: "Acurácia de Picking",
      valor: `≥ ${configGlobal.metaAcuracia}%`,
      descricao: "Taxa mínima de acertos que as equipes precisam ter.",
      icon: Target,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      kpi: "Limite de Erros",
      valor: `${configGlobal.metaErros} max`,
      descricao: "Número máximo de erros permitidos no coletor.",
      icon: Gauge,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      kpi: "Dificuldade Base",
      valor: configGlobal.dificuldade,
      descricao: "Dificuldade geral da simulação.",
      icon: Globe,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      kpi: "SLA (Tempo Limite)",
      valor: `${configGlobal.tempoSLA} min`,
      descricao: "Tempo máximo para liberar um pedido.",
      icon: Clock,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-200",
    },
    {
      kpi: "Meta de Volume",
      valor: `${configGlobal.metaVolume} itens`,
      descricao: "Quantas caixas a turma precisa fazer até o fim da aula.",
      icon: PackageCheck,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-200",
    }
  ] : []

  return (
    <div className="p-6 md:p-10 max-w-[1000px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-foreground">Situação de Aprendizagem</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure o cenário simulado e as regras operacionais para <strong>todas as equipes</strong>.
          </p>
        </div>
        <button
          onClick={handleIniciarGlobal}
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
        >
          {isPending ? <Loader2 size={18} className="animate-spin" /> : <PlayCircle size={18} />}
          Iniciar Situação Globalmente
        </button>
      </div>

      <div className="space-y-6">
        {/* Card do Contexto e Editar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 glass rounded-2xl border border-border mb-6 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex shrink-0 items-center justify-center text-primary mt-1">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Cenário Ativo</p>
              <h3 className="text-lg font-bold text-foreground mb-2">{configGlobal?.titulo || "Carregando..."}</h3>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {configGlobal?.contexto || "Sem contexto definido."}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all shadow-sm"
          >
            <Settings2 size={16} /> Configurar SA
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {metasGerais.map((meta) => {
            const Icon = meta.icon
            return (
              <div key={meta.kpi} className={`bg-white rounded-2xl p-6 border shadow-sm transition-all duration-200 hover:shadow-md ${meta.border}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${meta.bg} ${meta.color} flex items-center justify-center`}>
                    <Icon size={20} />
                  </div>
                </div>
                <h3 className="text-base font-bold text-foreground mb-1.5">{meta.kpi}</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-black text-foreground">{meta.valor}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{meta.descricao}</p>
              </div>
            )
          })}
        </div>

        {configGlobal && (
          <EditGlobalMetasDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            currentConfig={configGlobal}
            senhaAdmin={senhaAdmin}
            onSuccess={carregarConfiguracao}
          />
        )}
      </div>
    </div>
  )
}
