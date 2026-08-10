"use client"

import { useState, useRef, useEffect } from "react"
import {
  ScanBarcode,
  CheckCircle2,
  XCircle,
  MapPin,
  Package,
  RotateCcw,
  Zap,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Globe,
  Volume2,
} from "lucide-react"
import { PageShell } from "@/components/logiq/page-shell"
import { BackgroundGradient } from "@/components/ui/background-gradient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { useEquipe } from "@/hooks/use-equipe"
import { useTextToSpeech } from "@/hooks/use-tts"
import { getTurnoAtivoComItens, validarPicking } from "@/src/actions/wms"
import type { Item, Turno } from "@prisma/client"
import { toast } from "sonner"

const conceitosDidaticos = [
  {
    titulo: "Metodologias de Picking",
    conteudo: "• Onda (Wave): Agrupa pedidos por rotas/horários.\n• Zona (Zone): CD dividido em setores estilo linha de montagem.\n• Discreto: Um operador coleta um pedido do início ao fim.",
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    titulo: "Slotting & Roteirização Interna",
    conteudo: "O WMS gera a menor rota física dentro dos corredores para evitar que o operador perca tempo caminhando de ida e volta desnecessariamente no galpão.",
    icon: MapPin,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    titulo: "Acurácia de Separação",
    conteudo: "Mede o percentual de itens coletados corretamente sem trocas. Bipe de código EAN errado penaliza a nota de acurácia da equipe.",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    titulo: "E-Commerce & Same-Day no Brasil",
    conteudo: "O avanço das compras online no Brasil forçou os CDs a operarem com picking ultra-rápido para atender metas de entrega no mesmo dia (Same-Day) em capitais.",
    icon: Globe,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
]

export default function PickingPage() {
  const { equipeId, usuarioId, isLoaded } = useEquipe()
  const { speak, isSpeaking, supported } = useTextToSpeech()

  const [itens, setItens] = useState<Item[]>([])
  const [turno, setTurno] = useState<Turno | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [eanInput, setEanInput] = useState("")
  const [feedback, setFeedback] = useState<null | { ok: boolean; msg: string }>(null)
  const [historico, setHistorico] = useState<HistoricoBipe[]>([])
  const [shakeError, setShakeError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const carregarDados = async () => {
    if (!equipeId) return
    setLoading(true)
    const res = await getTurnoAtivoComItens(equipeId)
    if (res.sucesso && res.dados?.turno) {
      setTurno(res.dados.turno)
      setItens(res.dados.turno.itens)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isLoaded && equipeId) {
      carregarDados()
    }
  }, [isLoaded, equipeId])

  useEffect(() => {
    inputRef.current?.focus()
  }, [loading])

  const itensEstocados = itens.filter((i) => i.status === "ESTOCADO")
  const currentItem = itensEstocados[0] // O próximo item da fila

  const totalBipes = (turno?.acertosPicking ?? 0) + (turno?.errosPicking ?? 0)
  const acuracia = totalBipes === 0 ? 100 : Math.round(((turno?.acertosPicking ?? 0) / totalBipes) * 100)

  async function handleBipe(e: React.FormEvent) {
    e.preventDefault()
    if (!eanInput.trim() || !currentItem) return

    setSubmitting(true)
    setFeedback(null)

    const ts = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    const res = await validarPicking(currentItem.id, eanInput.trim(), usuarioId!)

    if (res.sucesso) {
      // Se o item avançou para SEPARADO, o bipe foi correto
      const acertou = res.dados?.status === "SEPARADO"
      
      if (acertou) {
        setFeedback({ ok: true, msg: `Correto! ${currentItem.descricao} bipado com sucesso.` })
        setHistorico((prev) => [{ ean: eanInput.trim(), produto: currentItem.descricao, acertou: true, ts }, ...prev.slice(0, 9)])
      } else {
        setFeedback({ ok: false, msg: `Código Incorreto! Esperado: ${currentItem.codigo}` })
        setHistorico((prev) => [{ ean: eanInput.trim(), produto: currentItem.descricao, acertou: false, ts }, ...prev.slice(0, 9)])
        
        // A11y: Feedback Visual e Tátil para erro
        toast.error(`Código Incorreto! Esperado: ${currentItem.codigo}`)
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([200, 100, 200])
        setShakeError(true)
        setTimeout(() => setShakeError(false), 600)
      }
      setEanInput("")
      await carregarDados()
    } else {
      setFeedback({ ok: false, msg: res.erro || "Erro na validação." })
      toast.error(res.erro || "Erro na validação.")
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([200, 100, 200])
      setShakeError(true)
      setTimeout(() => setShakeError(false), 600)
    }

    setSubmitting(false)
    inputRef.current?.focus()
  }

  if (isLoaded && !equipeId) {
    return (
      <PageShell
        title="Picking (Modo Educativo)"
        subtitle="Entenda a teoria e a prática da separação de pedidos"
        icon={ScanBarcode}
        iconColor="text-amber-400"
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="glass rounded-2xl p-4 border border-border shadow-sm">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-2.5">
                O Picking é a separação física dos produtos para atender aos pedidos. Sendo a etapa mais cara do CD, otimizar a rota de separação é vital. O uso de coletores de radiofrequência (RF) ou comandos de voz garante precisão no bipe e minimiza os erros de envio.
              </p>
              <div className="relative aspect-video rounded-xl overflow-hidden border border-border/50 mt-2.5">
                <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30 text-muted-foreground/70">
                  <span className="text-2xl mb-2">⚠️</span>
                  <span className="text-sm font-medium">Vídeo Indisponível</span>
                </div>
              </div>
            </div>
            <div className="glass rounded-3xl p-6 border border-border shadow-sm">
              <h3 className="font-bold text-base mb-2">Tecnologias de Coleta e Bipagem</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="coletor" className="border-b border-border/50">
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:text-primary transition-colors py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                      Coletor RF
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-3 pl-3.5">
                    Dispositivo móvel com leitor laser de código de barras (EAN). Valida produto e endereço em tempo real.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="voice" className="border-b border-border/50">
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:text-primary transition-colors py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                      Voice Picking
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-3 pl-3.5">
                    Instruções auditivas via headset, mantendo mãos e olhos livres para a operação.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="pick-to-light" className="border-none">
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:text-primary transition-colors py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                      Pick-to-Light
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-3 pl-3.5">
                    Luzes nos módulos de prateleira indicam exatamente a posição e a quantidade a retirar.
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
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{c.conteudo}</p>
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
      title="Picking (Separação)"
      subtitle="Simulador de Coletor RF — bipe o EAN na ordem de armazenagem"
      icon={ScanBarcode}
      iconColor="text-amber-400"
    >
      {/* KPIs Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <div className="stripe-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1 font-medium">Acurácia do Turno</p>
          <p className="kpi-number text-2xl font-bold text-emerald-500">{acuracia}%</p>
          <p className="text-xs text-muted-foreground mt-1">Calculado em tempo real</p>
        </div>
        <div className="stripe-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1 font-medium">Acertos no Coletor</p>
          <p className="kpi-number text-2xl font-bold text-blue-500">{turno?.acertosPicking ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Bipes validados</p>
        </div>
        <div className="stripe-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1 font-medium">Erros Registrados</p>
          <p className="kpi-number text-2xl font-bold text-red-500">{turno?.errosPicking ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Bipes incorretos</p>
        </div>
        <div className="stripe-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1 font-medium">Fila de Picking</p>
          <p className="kpi-number text-2xl font-bold text-amber-500">{itensEstocados.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Itens a separar</p>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6 mb-8">
        {/* Coletor RF Virtual (3 cols) */}
        <div className="col-span-3 space-y-4">
          <div className="stripe-card rounded-2xl p-6 border border-border shadow-float">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Zap size={12} className="text-amber-500" /> Coletor RF v2.4
              </span>
              <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Online
              </span>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center text-muted-foreground">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : !currentItem ? (
              <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                Não há itens estocados pendentes de picking. Enderece novos produtos no Estoque!
              </div>
            ) : (
              <div>
                {/* Item Alvo */}
                <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">Próximo Item Alvo</span>
                    <span className="text-xs font-bold text-foreground flex items-center gap-1">
                      <MapPin size={12} className="text-amber-600" /> {currentItem.posicao}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">{currentItem.descricao}</h3>
                  <p className="text-xs text-muted-foreground">
                    EAN Esperado: <span className="font-mono font-bold text-foreground">{currentItem.codigo}</span> · Quantidade: {currentItem.quantidade} un.
                  </p>
                </div>

                {/* Form Bipagem */}
                <form onSubmit={handleBipe} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Bipar / Digitar Código EAN
                    </label>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Bipe o código de barras aqui..."
                      value={eanInput}
                      onChange={(e) => setEanInput(e.target.value)}
                      className={`w-full px-4 py-3 text-sm font-mono rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                        shakeError ? "animate-pulse border-red-500 bg-red-500/10 focus:ring-red-500" : ""
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !eanInput.trim()}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <ScanBarcode size={16} />}
                    Confirmar Bipagem de Coleta
                  </button>
                </form>

                {/* Feedback Box */}
                {feedback && (
                  <div
                    className={`mt-4 p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                      feedback.ok
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                        : "bg-red-500/10 border-red-500/30 text-red-500"
                    }`}
                  >
                    {feedback.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    {feedback.msg}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Fila Geral + Histórico (2 cols) */}
        <div className="col-span-2 space-y-4">
          {/* Fila Geral de Produtos Estocados */}
          <div className="stripe-card rounded-xl p-4 border border-border">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
              Fila de Produtos ({itensEstocados.length})
            </h3>
            {itensEstocados.length === 0 ? (
              <p className="text-xs text-muted-foreground">Fila de separação vazia.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {itensEstocados.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                      idx === 0 ? "border-amber-500/40 bg-amber-500/5 font-bold" : "border-border/60 bg-muted/20 opacity-70"
                    }`}
                  >
                    <div>
                      <p className="text-foreground">{item.descricao}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{item.posicao}</p>
                    </div>
                    {idx === 0 && <span className="text-[10px] bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded-md font-bold">Atual</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Histórico Recente de Bipes */}
          <div className="stripe-card rounded-xl p-4 border border-border">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
              Últimos Bipes da Equipe
            </h3>
            {historico.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum bipe realizado recentemente.</p>
            ) : (
              <div className="space-y-2">
                {historico.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-0">
                    <span className="font-mono text-[10px] text-muted-foreground">{h.ts}</span>
                    <span className="truncate max-w-[150px] font-medium text-foreground">{h.produto}</span>
                    {h.acertou ? (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">OK</span>
                    ) : (
                      <span className="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded">ERRO</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="stripe-card rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={14} className="text-amber-400" />
          <span className="text-sm text-muted-foreground">Próxima etapa: encaminhar produtos separados para Expedição</span>
        </div>
        <a href="/expedicao" className="flex items-center gap-2 text-sm font-semibold text-violet-500 hover:text-violet-400 transition-colors">
          Ir para Expedição <ArrowRight size={13} />
        </a>
      </div>
    </PageShell>
  )
}
