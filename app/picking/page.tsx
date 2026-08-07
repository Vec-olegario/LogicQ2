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
} from "lucide-react"
import { PageShell } from "@/components/logiq/page-shell"
import { useEquipe } from "@/hooks/use-equipe"
import { getTurnoAtivoComItens, validarPicking } from "@/src/actions/wms"
import type { Item, Turno } from "@prisma/client"

type HistoricoBipe = { ean: string; produto: string; acertou: boolean; ts: string }

export default function PickingPage() {
  const { equipeId, isLoaded } = useEquipe()
  const [itens, setItens] = useState<Item[]>([])
  const [turno, setTurno] = useState<Turno | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [eanInput, setEanInput] = useState("")
  const [feedback, setFeedback] = useState<null | { ok: boolean; msg: string }>(null)
  const [historico, setHistorico] = useState<HistoricoBipe[]>([])
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
    const res = await validarPicking(currentItem.id, currentItem.codigo, eanInput.trim())

    if (res.sucesso) {
      const acertou = res.dados?.acertou ?? false
      if (acertou) {
        setFeedback({ ok: true, msg: `Correto! ${currentItem.descricao} bipado com sucesso.` })
        setHistorico((prev) => [{ ean: eanInput.trim(), produto: currentItem.descricao, acertou: true, ts }, ...prev.slice(0, 9)])
      } else {
        setFeedback({ ok: false, msg: `Código Incorreto! Esperado: ${currentItem.codigo}` })
        setHistorico((prev) => [{ ean: eanInput.trim(), produto: currentItem.descricao, acertou: false, ts }, ...prev.slice(0, 9)])
      }
      setEanInput("")
      await carregarDados()
    } else {
      setFeedback({ ok: false, msg: res.erro })
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
        badge="Etapa 03 - Teoria"
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="glass rounded-3xl p-6 border border-border shadow-sm">
              <h2 className="text-xl font-bold mb-4">O Setor de Picking (Separação)</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                O Picking consiste na separação física dos produtos armazenados para atender aos pedidos dos clientes. É a etapa mais cara e que consome mais tempo em um CD, sendo crucial otimizar a rota de separação para minimizar deslocamentos desnecessários dos operadores.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                O uso de coletores de radiofrequência (RF) ou sistemas guiados por luz (Pick-to-Light) e voz (Voice Picking) garante precisão quase absoluta de bipe, reduzindo significativamente erros de envio.
              </p>
              <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-border mt-6">
                <ScanBarcode size={48} className="text-muted-foreground animate-pulse mb-2" />
                <span className="text-xs font-bold text-muted-foreground">Assista à aula explicativa do Picking</span>
                <iframe
                  className="absolute inset-0 w-full h-full opacity-10 hover:opacity-100 transition-opacity"
                  src="https://www.youtube.com/embed/invalid_video_id"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="p-5 rounded-3xl border border-amber-200 bg-amber-50 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-amber-600" />
                <h4 className="font-bold text-sm text-foreground">Metodologias de Picking</h4>
              </div>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li><strong>Picking por Onda (Wave):</strong> Agrupamento de pedidos por rotas de entrega ou transportadoras, liberados em intervalos ao longo do turno.</li>
                <li><strong>Picking por Zona (Zone):</strong> O CD é dividido em zonas e cada operador separa apenas os itens de sua zona, similar a uma linha de montagem.</li>
                <li><strong>Picking Discreto:</strong> Um operador separa um único pedido por vez, do início ao fim (mais simples, porém menos produtivo em larga escala).</li>
              </ul>
            </div>
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
      badge="Etapa 03"
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
                      className="w-full px-4 py-3 text-sm font-mono rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
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
