"use client"

import { useState, useEffect } from "react"
import {
  Truck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Package,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Plus,
  Loader2,
  Globe,
  Volume2,
} from "lucide-react"
import { PageShell } from "@/components/logiq/page-shell"
import { VideoPlayer } from "@/components/logiq/video-player"
import { BackgroundGradient } from "@/components/ui/background-gradient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { useEquipe } from "@/hooks/use-equipe"
import { useTextToSpeech } from "@/hooks/use-tts"
import { getTurnoAtivoComItens, receberItem } from "@/src/actions/wms"
import { getConfiguracaoGlobal } from "@/src/actions/configuracao"
import type { Item } from "@prisma/client"
import { toast } from "sonner"

const conceitosDidaticos = [
  {
    titulo: "O que é uma NF-e?",
    conteudo: "A Nota Fiscal Eletrônica (NF-e) é o documento digital que acompanha toda mercadoria em trânsito no Brasil. No recebimento, a NF-e é conferida item a item contra os produtos físicos para validar a carga.",
    icon: FileText,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    titulo: "Processo de Conferência",
    conteudo: "O conferente bipa cada unidade ou caixa recebida, comparando o EAN (código de barras) com os itens da NF-e. Divergências geram uma 'Carta de Correção' ou devolução ao fornecedor.",
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    titulo: "SLA de Doca",
    conteudo: "O SLA (Service Level Agreement - Acordo de Nível de Serviço) de doca define o tempo máximo que um caminhão pode permanecer descarregando. Ultrapassar o SLA gera multa contratual e bloqueia a doca para outros fornecedores.",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    titulo: "Logística no Brasil — Modal Rodoviário",
    conteudo: "No Brasil, mais de 65% das cargas dependem do modal rodoviário. A integração digital de recebimento via NF-e com a SEFAZ torna o sistema brasileiro um dos mais avançados em auditoria fiscal.",
    icon: Globe,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
]

export default function RecebimentoPage() {
  const { equipeId, usuarioId, isLoaded } = useEquipe()
  const { speak, isSpeaking, supported } = useTextToSpeech()
  const [openConceito, setOpenConceito] = useState<number | null>(null)
  
  // Real DB state
  const [itens, setItens] = useState<Item[]>([])
  const [itensEsperados, setItensEsperados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null)

  // Form state
  const [codigo, setCodigo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [quantidade, setQuantidade] = useState<number>(1)
  const [fornecedor, setFornecedor] = useState("")

  const carregarDados = async () => {
    if (!equipeId) return
    setLoading(true)
    const res = await getTurnoAtivoComItens(equipeId)
    if (res.sucesso && res.dados?.turno) {
      setItens(res.dados.turno.itens)
    } else {
      setItens([])
    }
    
    const configRes = await getConfiguracaoGlobal()
    if (configRes.sucesso && configRes.dados) {
      setItensEsperados(configRes.dados.itensEsperados || [])
    }
    
    setLoading(false)
  }

  useEffect(() => {
    if (isLoaded && equipeId) {
      carregarDados()
    }
  }, [isLoaded, equipeId])

  async function handleReceber(e: React.FormEvent) {
    e.preventDefault()
    if (!equipeId) return
    setSubmitting(true)
    setErro(null)
    setSucessoMsg(null)

    const res = await receberItem(equipeId, {
      codigo,
      descricao,
      quantidade,
      fornecedor,
    }, usuarioId!)

    if (res.sucesso) {
      setSucessoMsg(`Item "${descricao}" registrado com sucesso!`)
      setCodigo("")
      setDescricao("")
      setQuantidade(1)
      setFornecedor("")
      await carregarDados()
    } else {
      setErro(res.erro)
      toast.error(res.erro || "Erro ao receber item.")
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([200, 100, 200])
    }
    setSubmitting(false)
  }

  const recebidosList = itens.filter((i) => i.status === "RECEBIDO")
  const totalRecebidos = itens.length

  if (isLoaded && !equipeId) {
    return (
      <PageShell
        title="Recebimento (Modo Educativo)"
        subtitle="Entenda a teoria e a prática da recepção de mercadorias"
        icon={Truck}
        iconColor="text-emerald-400"
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="glass rounded-2xl p-4 border border-border shadow-sm">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-2.5">
                O Recebimento é a porta de entrada do Centro de Distribuição, onde ocorre a recepção e a conferência física das mercadorias contra a Nota Fiscal Eletrônica (NF-e). Falhas aqui propagam erros graves de inventário por todo o armazém.
              </p>
              <div className="relative aspect-video rounded-xl overflow-hidden border border-border/50 mt-2.5">
                <VideoPlayer
                  videoId="invalid_video_id_x"
                  thumbnailSrc="/recebimento.jpg"
                  title="Vídeo Explicativo do Recebimento"
                />
              </div>
            </div>

            <div className="glass rounded-3xl p-6 border border-border shadow-sm">
              <h3 className="font-bold text-base mb-2">Boas Práticas na Doca</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="agendamento" className="border-b border-border/50">
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:text-primary transition-colors py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                      Agendamento
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-3 pl-3.5">
                    Programar a chegada das transportadoras para evitar filas longas e gargalos nas docas.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="conferencia" className="border-b border-border/50">
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:text-primary transition-colors py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                      Conferência Cega
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-3 pl-3.5">
                    Contar as caixas sem saber a quantidade exata declarada na NF-e para forçar o conferente a contar de forma precisa.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="triagem" className="border-none">
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:text-primary transition-colors py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                      Triagem de Avarias
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-3 pl-3.5">
                    Separar produtos danificados imediatamente na entrada para devolver ao transportador no mesmo momento.
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
      title="Recebimento de Carga"
      subtitle="Simulação interativa de descarregamento e conferência de Nota Fiscal."
      icon={Truck}
      iconColor="text-emerald-400"
    >
      {/* KPIs Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="stripe-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1 font-medium">Itens em Recebimento</p>
          <p className="kpi-number text-3xl font-bold text-amber-500">{recebidosList.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Aguardando endereçamento</p>
        </div>
        <div className="stripe-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1 font-medium">Total Recebido no Turno</p>
          <p className="kpi-number text-3xl font-bold text-emerald-500">{totalRecebidos}</p>
          <p className="text-xs text-muted-foreground mt-1">Registrados pela equipe</p>
        </div>
        <div className="stripe-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1 font-medium">Status do Turno</p>
          <p className="kpi-number text-xl font-bold text-blue-500 flex items-center gap-1.5 pt-1">
            <CheckCircle2 size={18} className="text-emerald-500" /> Ativo
          </p>
          <p className="text-xs text-muted-foreground mt-1">Pronto para receber carga</p>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6">
        {/* Left Column — Form + Tabela de Itens Reais (3 cols) */}
        <div className="col-span-3 space-y-6">
          {/* Form de Cadastro de Item */}
          <div className="stripe-card rounded-xl p-5 border-border">
            <h2 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
              <Plus size={16} className="text-emerald-500" />
              Registrar Novo Recebimento
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Preencha os dados do produto recebido na doca para dar entrada no estoque.
            </p>

            {erro && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle size={14} />
                {erro}
              </div>
            )}

            {sucessoMsg && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={14} />
                {sucessoMsg}
              </div>
            )}

            <form onSubmit={handleReceber} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Código (EAN/SKU)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 7891234567890"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Fornecedor</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Unilever, Nestlé"
                    value={fornecedor}
                    onChange={(e) => setFornecedor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground mb-1 block">Descrição do Produto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Detergente Ypê 500ml"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Quantidade</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quantidade}
                    onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !equipeId}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
                Confirmar Recebimento do Item
              </button>
            </form>
          </div>

          {/* Tabela de Itens Reais no Status RECEBIDO */}
          <div className="stripe-card rounded-xl p-5 border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-foreground">Itens em Recebimento (Aguardando Endereçamento)</h2>
              <span className="text-xs text-muted-foreground">{recebidosList.length} itens</span>
            </div>

            {loading ? (
              <div className="py-8 flex justify-center text-muted-foreground">
                <Loader2 size={20} className="animate-spin" />
              </div>
            ) : recebidosList.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                Nenhum item pendente de endereçamento. Registre um novo recebimento acima!
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {recebidosList.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-foreground">{item.descricao}</p>
                      <p className="text-muted-foreground text-[11px]">
                        EAN: <span className="font-mono">{item.codigo}</span> · Fornecedor: {item.fornecedor}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {item.quantidade} un.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column — Nota Fiscal e Conceitos (2 cols) */}
        <div className="col-span-2 space-y-6">
          
          {/* Nota Fiscal */}
          {itensEsperados.length > 0 && (
            <div className="stripe-card rounded-xl p-5 border-border bg-gradient-to-b from-white to-orange-50/30">
              <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                <FileText size={16} className="text-orange-500" />
                <h2 className="text-sm font-bold text-foreground">Nota Fiscal Eletrônica (NF-e)</h2>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {itensEsperados.map((item, idx) => {
                  const jaRecebeu = recebidosList.filter(i => i.codigo === item.codigo).reduce((acc, curr) => acc + curr.quantidade, 0)
                  const concluido = jaRecebeu >= item.quantidade
                  
                  return (
                    <div key={idx} className={`p-2.5 rounded-lg border text-xs ${concluido ? 'bg-emerald-50/50 border-emerald-200 opacity-70' : 'bg-white border-border shadow-sm'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-bold ${concluido ? 'text-emerald-700 line-through' : 'text-foreground'}`}>{item.descricao}</span>
                        <span className="font-bold text-orange-600 bg-orange-50 px-1.5 rounded">{item.quantidade} un.</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground flex justify-between">
                        <span>SKU: <span className="font-mono">{item.codigo}</span></span>
                        {concluido && <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={10} /> Recebido</span>}
                      </p>
                    </div>
                  )
                })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-4 text-center">
                Dica: Confirme as cargas bipando exatamente os SKUs descritos na Nota acima.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={14} className="text-emerald-600" />
              <h2 className="text-sm font-bold text-foreground">Conceitos Essenciais de Aprendizagem</h2>
            </div>
            <div className="space-y-2">
            {conceitosDidaticos.map((c, i) => {
              const Icon = c.icon
              const isOpen = openConceito === i
              return (
                <div key={c.titulo} className="stripe-card rounded-xl overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setOpenConceito(isOpen ? null : i)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg ${c.bg} ${c.color} ${c.border} border flex items-center justify-center shrink-0`}>
                      <Icon size={14} />
                    </div>
                    <span className="text-sm font-semibold text-foreground flex-1">{c.titulo}</span>
                    {isOpen ? <ChevronDown size={14} className="text-muted-foreground shrink-0" /> : <ChevronRight size={14} className="text-muted-foreground shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-0">
                      <p className="text-xs text-muted-foreground leading-relaxed">{c.conteudo}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>

      {/* Action Bar */}
      <div className="mt-8 stripe-card rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span className="text-sm text-muted-foreground">Próxima etapa: endereçar os produtos recebidos no estoque</span>
        </div>
        <a href="/estoque" className="flex items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors">
          Ir para Estoque <ArrowRight size={13} />
        </a>
      </div>
    </PageShell>
  )
}
