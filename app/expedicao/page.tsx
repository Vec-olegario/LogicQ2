"use client"

import { useState, useEffect } from "react"
import {
  PackageCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Package,
  ShieldAlert,
  Volume2,
} from "lucide-react"
import { PageShell } from "@/components/logiq/page-shell"
import { BackgroundGradient } from "@/components/ui/background-gradient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { useEquipe } from "@/hooks/use-equipe"
import { useTextToSpeech } from "@/hooks/use-tts"
import { getTurnoAtivoComItens, expedirItem } from "@/src/actions/wms"
import type { Item } from "@prisma/client"
import { toast } from "sonner"

const conceitosDidaticos = [
  {
    titulo: "OTIF (On-Time In-Full - No Prazo e Completo)",
    conteudo: "O indicador de ouro da logística. Mede se as entregas foram feitas rigorosamente no prazo (On-Time) e sem faltas ou avarias (In-Full).",
    icon: PackageCheck,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  {
    titulo: "TMS (Transportation Management System - Sistema de Gestão de Transportes)",
    conteudo: "Sistema focado no transporte externo. Cuida de roteirização inteligente de frotas, cálculo de fretes e rastreamento em tempo real.",
    icon: Truck,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    titulo: "Comprovante POD (Proof of Delivery - Prova de Entrega)",
    conteudo: "Documento assinado pelo destinatário ao receber a carga. Encerra legalmente a responsabilidade da transportadora.",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    titulo: "Gerenciamento de Risco (GRIS) no Brasil",
    conteudo: "Devido aos custos de sinistros e roubos nas estradas brasileiras, a expedição exige regras rígidas de telemetria, rastreamento via satélite, escolta armada e gerenciamento de risco.",
    icon: ShieldAlert,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
]

export default function ExpedicaoPage() {
  const { equipeId, usuarioId, isLoaded } = useEquipe()
  const { speak, isSpeaking, supported } = useTextToSpeech()
  const [itens, setItens] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [docaInputs, setDocaInputs] = useState<Record<string, string>>({})
  const [erro, setErro] = useState<string | null>(null)
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null)

  const carregarDados = async () => {
    if (!equipeId) return
    setLoading(true)
    const res = await getTurnoAtivoComItens(equipeId)
    if (res.sucesso && res.dados?.turno) {
      setItens(res.dados.turno.itens)
    } else {
      setItens([])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isLoaded && equipeId) {
      carregarDados()
    }
  }, [isLoaded, equipeId])

  async function handleExpedir(itemId: string) {
    const docaSaida = docaInputs[itemId]?.trim()
    if (!docaSaida) {
      setErro("Informe a doca de saída (ex: Doca 1).")
      toast.error("Informe a doca de saída.")
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([200, 100, 200])
      return
    }

    setSubmittingId(itemId)
    setErro(null)
    setSucessoMsg(null)

    const res = await expedirItem(itemId, { docaSaida }, usuarioId!)

    if (res.sucesso) {
      setSucessoMsg(`Item expedido com sucesso pela "${docaSaida}"!`)
      setDocaInputs((prev) => ({ ...prev, [itemId]: "" }))
      await carregarDados()
    } else {
      setErro(res.erro)
      toast.error(res.erro || "Erro ao expedir item.")
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([200, 100, 200])
    }
    setSubmittingId(null)
  }

  const separados = itens.filter((i) => i.status === "SEPARADO")
  const expedidos = itens.filter((i) => i.status === "EXPEDIDO")

  if (isLoaded && !equipeId) {
    return (
      <PageShell
        title="Expedição (Modo Educativo)"
        subtitle="Entenda a teoria e a prática do despacho de mercadorias"
        icon={PackageCheck}
        iconColor="text-violet-400"
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="glass rounded-2xl p-4 border border-border shadow-sm">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-2.5">
                A Expedição é a etapa final do armazém, onde os pedidos separados são consolidados, conferidos e direcionados à doca de saída correta. Uma operação ágil garante a saída pontual da carga, otimizando o indicador <strong>OTIF (On-Time In-Full)</strong> e a satisfação do cliente final.
              </p>
              <div className="relative aspect-video rounded-xl overflow-hidden border border-border/50 mt-2.5">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/invalid_video_id_x"
                  title="Vídeo Explicativo da Expedição"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
            <div className="glass rounded-3xl p-6 border border-border shadow-sm">
              <h3 className="font-bold text-base mb-2">Etapas do Despacho de Cargas</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="unitizacao" className="border-b border-border/50">
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:text-primary transition-colors py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-violet-500 rounded-full shrink-0" />
                      Unitização
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-3 pl-3.5">
                    Paletização e aplicação de filme stretch nos volumes para garantir estabilidade durante o transporte.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="romaneio" className="border-b border-border/50">
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:text-primary transition-colors py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-violet-500 rounded-full shrink-0" />
                      Romaneio de Embarque
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-3 pl-3.5">
                    Listagem oficial de conferência das caixas que sobem no baú da transportadora.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="lacre" className="border-none">
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:text-primary transition-colors py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-violet-500 rounded-full shrink-0" />
                      Lacre de Segurança
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-3 pl-3.5">
                    Lacre numerado aplicado nas portas do caminhão após a conclusão do carregamento nas docas.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-lg">Conceitos Chave</h3>
            {conceitosDidaticos.map((c, i) => {
              const Icon = c.icon
              return (
                <BackgroundGradient 
                  key={i}
                  className="rounded-[22px] bg-transparent hover:scale-105 transition-transform duration-300"
                >
                  <Card className={`flex flex-col h-full rounded-[20px] border ${c.border} ${c.bg} shadow-sm`}>
                    <CardHeader className="p-5 pb-2 flex flex-row items-start justify-between space-y-0">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className={c.color} />
                        <CardTitle className="font-bold text-sm text-foreground">{c.titulo}</CardTitle>
                      </div>
                      {supported && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            speak(`${c.titulo}. ${c.conteudo}`);
                          }}
                          aria-label={`Ouvir explicação sobre ${c.titulo}`}
                          className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full p-1 -mt-1 -mr-1"
                        >
                          <Volume2 size={16} className={isSpeaking ? "animate-pulse text-primary" : ""} />
                        </button>
                      )}
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                      <p className="text-xs text-muted-foreground leading-relaxed">{c.conteudo}</p>
                    </CardContent>
                  </Card>
                </BackgroundGradient>
              )
            })}
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Expedição"
      subtitle="Direcionamento de produtos separados para las docas de saída"
      icon={PackageCheck}
      iconColor="text-violet-400"
    >
      {/* KPIs Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="stripe-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1 font-medium">Aguardando Expedição</p>
          <p className="kpi-number text-3xl font-bold text-amber-500">{separados.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Status SEPARADO</p>
        </div>
        <div className="stripe-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1 font-medium font-medium">Itens Expedidos</p>
          <p className="kpi-number text-3xl font-bold text-violet-500">{expedidos.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Status EXPEDIDO</p>
        </div>
        <div className="stripe-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1 font-medium">Conclusão do Fluxo</p>
          <p className="kpi-number text-3xl font-bold text-emerald-500">
            {itens.length === 0 ? "100%" : `${Math.round((expedidos.length / itens.length) * 100)}%`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Do total do turno</p>
        </div>
      </div>

      {erro && (
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={14} />
          {erro}
        </div>
      )}

      {sucessoMsg && (
        <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={14} />
          {sucessoMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Coluna 1 — Itens Separados Prontos para Expedição */}
        <div className="stripe-card rounded-xl p-5 border-border">
          <h2 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
            <Package size={16} className="text-amber-500" />
            Produtos Aguardando Expedição ({separados.length})
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Selecione a doca de saída para despachar o produto para o cliente.
          </p>

          {loading ? (
            <div className="py-8 flex justify-center text-muted-foreground">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : separados.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
              Nenhum item aguardando expedição. Realize a separação de produtos na aba de Picking!
            </div>
          ) : (
            <div className="space-y-3">
              {separados.map((item) => (
                <div key={item.id} className="p-3.5 rounded-lg border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-xs text-foreground">{item.descricao}</p>
                    <p className="text-[11px] text-muted-foreground">
                      EAN: <span className="font-mono">{item.codigo}</span> · Qty: {item.quantidade} un.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={docaInputs[item.id] || ""}
                      onChange={(e) =>
                        setDocaInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      className="px-2.5 py-1.5 text-xs rounded-md border border-border bg-background text-foreground"
                    >
                      <option value="">Selecione a Doca</option>
                      <option value="Doca 1 - SP">Doca 1 - SP</option>
                      <option value="Doca 2 - RJ">Doca 2 - RJ</option>
                      <option value="Doca 3 - MG">Doca 3 - MG</option>
                    </select>
                    <button
                      onClick={() => handleExpedir(item.id)}
                      disabled={submittingId === item.id}
                      className="px-3 py-1.5 text-xs font-semibold rounded-md bg-violet-600 hover:bg-violet-500 text-white transition-colors flex items-center gap-1"
                    >
                      {submittingId === item.id ? <Loader2 size={12} className="animate-spin" /> : "Expedir"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coluna 2 — Itens Expedidos */}
        <div className="stripe-card rounded-xl p-5 border-border">
          <h2 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
            <Truck size={16} className="text-violet-500" />
            Produtos Expedidos ({expedidos.length})
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Histórico de cargas despachadas durante o turno.
          </p>

          {loading ? (
            <div className="py-8 flex justify-center text-muted-foreground">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : expedidos.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
              Nenhum produto expedido até o momento.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {expedidos.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{item.descricao}</p>
                    <p className="text-[11px] text-muted-foreground">
                      EAN: <span className="font-mono">{item.codigo}</span> · {item.quantidade} un.
                    </p>
                  </div>
                  <span className="font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-md text-[11px] flex items-center gap-1">
                    <Truck size={10} /> {item.docaSaida}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="stripe-card rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={14} className="text-violet-400" />
          <span className="text-sm text-muted-foreground">Fluxo de operação concluído com sucesso! Veja o balanço no Dashboard.</span>
        </div>
        <a href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-90 transition-opacity">
          Ir para Dashboard <ArrowRight size={13} />
        </a>
      </div>
    </PageShell>
  )
}
