"use client"

import { useState, useEffect } from "react"
import {
  Package,
  ArrowRight,
  RotateCcw,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Globe,
} from "lucide-react"
import { PageShell } from "@/components/logiq/page-shell"
import { useEquipe } from "@/hooks/use-equipe"
import { getTurnoAtivoComItens, enderecarItem } from "@/src/actions/wms"
import type { Item } from "@prisma/client"

const regrasNegocio = [
  {
    sigla: "FIFO",
    nome: "First In, First Out",
    descricao: "O primeiro produto a entrar no estoque deve ser o primeiro a sair. Evita obsolescência e perdas por prazo vencido.",
    exemplo: "Caixa de sabão recebida em Jan/25 sai antes da caixa de Fev/25.",
    icon: RotateCcw,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    sigla: "FEFO",
    nome: "First Expired, First Out",
    descricao: "O produto com validade mais próxima sai primeiro, independente da entrada. Obrigatório para alimentos e medicamentos.",
    exemplo: "Iogurte com vencimento em 15/03 sai antes do que vence em 30/03.",
    icon: Calendar,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    sigla: "Curva ABC",
    nome: "Classificação por Giro",
    descricao: "Classe A (alta demanda) fica perto da expedição. Classe B fica no meio. Classe C (baixo giro) fica no fundo.",
    exemplo: "20% dos itens representam 80% das saídas do CD.",
    icon: Package,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  {
    sigla: "LIFO / UEPS",
    nome: "Last In, First Out",
    descricao: "O último produto a entrar é o primeiro a sair. Usado apenas em materiais homogêneos sem validade (ex: brita, carvão).",
    exemplo: "Blocos de construção empilhados em granel.",
    icon: MapPin,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    sigla: "Brasil",
    nome: "Hubs de Armazenagem & Custo Brasil",
    descricao: "O raio de 100km de SP concentra a maior área de condomínios logísticos do país. A complexidade do ICMS exige CDs estratégicos em múltiplos estados.",
    exemplo: "Polos logísticos em Extrema (MG), Cajamar (SP) e Duque de Caxias (RJ).",
    icon: Globe,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
  },
]

export default function EstoquePage() {
  const { equipeId, usuarioId, isLoaded } = useEquipe()
  
  const [itens, setItens] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [posicaoInputs, setPosicaoInputs] = useState<Record<string, string>>({})
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

  async function handleEnderecar(itemId: string) {
    const posicao = posicaoInputs[itemId]?.trim()
    if (!posicao) {
      setErro("Informe uma posição de armazenamento (ex: Rua A, Nível 2).")
      return
    }

    setSubmittingId(itemId)
    setErro(null)
    setSucessoMsg(null)

    const res = await enderecarItem(itemId, { posicao }, usuarioId!)

    if (res.sucesso) {
      setSucessoMsg(`Item endereçado com sucesso em "${posicao}"!`)
      setPosicaoInputs((prev) => ({ ...prev, [itemId]: "" }))
      await carregarDados()
    } else {
      setErro(res.erro)
    }
    setSubmittingId(null)
  }

  const pendentesEnderecar = itens.filter((i) => i.status === "RECEBIDO")
  const estocados = itens.filter((i) => i.status === "ESTOCADO")

  if (isLoaded && !equipeId) {
    return (
      <PageShell
        title="Estoque (Modo Educativo)"
        subtitle="Entenda a teoria e a prática da gestão de armazenamento"
        icon={Package}
        iconColor="text-blue-400"
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="glass rounded-3xl p-6 border border-border shadow-sm">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                O Estoque é o coração do CD, responsável por alocar os produtos nos endereços corretos (rua, nível e coluna), maximizando o espaço vertical e agilizando o picking. A correta aplicação de regras como FIFO e FEFO minimiza o desperdício de itens perecíveis.
              </p>
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-border mt-6">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Vídeo Explicativo do Estoque"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
            <div className="glass rounded-3xl p-6 border border-border shadow-sm">
              <h3 className="font-bold text-base mb-4">Endereçamento Logístico 3D</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                No WMS, cada produto possui um endereço único tridimensional para localização rápida:
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" /><strong>Rua (Corredor):</strong> Onde o porta-paletes está localizado no galpão.</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" /><strong>Coluna (Vão):</strong> A posição horizontal na prateleira.</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" /><strong>Nível (Altura):</strong> A posição vertical, do chão até o nível superior.</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-lg">Regras e Estratégias de Giro</h3>
            {regrasNegocio.map((r, i) => {
              const Icon = r.icon
              return (
                <div key={i} className={`p-5 rounded-3xl border ${r.border} ${r.bg} shadow-sm`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={16} className={r.color} />
                    <h4 className="font-bold text-sm text-foreground">{r.sigla} - {r.nome}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{r.descricao}</p>
                  <p className="text-[10px] font-bold text-foreground">Exemplo: {r.exemplo}</p>
                </div>
              )
            })}
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Estoque"
      subtitle="Endereçamento de produtos e gestão de armazenagem"
      icon={Package}
      iconColor="text-blue-400"
    >
      {/* KPIs Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="stripe-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1 font-medium">Itens no Estoque (Estocados)</p>
          <p className="kpi-number text-3xl font-bold text-blue-500">{estocados.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Endereçados com sucesso</p>
        </div>
        <div className="stripe-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1 font-medium font-medium">Aguardando Endereçamento</p>
          <p className="kpi-number text-3xl font-bold text-amber-500">{pendentesEnderecar.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Status RECEBIDO</p>
        </div>
        <div className="stripe-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1 font-medium">Total de Produtos no Turno</p>
          <p className="kpi-number text-3xl font-bold text-foreground">{itens.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Em movimentação</p>
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

      <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6 mb-8">
        {/* Coluna 1 — Itens Pendentes para Endereçar (3 cols) */}
        <div className="col-span-3 space-y-4">
          <div className="stripe-card rounded-xl p-5 border-border">
            <h2 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
              <MapPin size={16} className="text-amber-500" />
              Pendentes de Endereçamento ({pendentesEnderecar.length})
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Defina o endereço de armazenagem (ex: "Rua A-01", "Nível 2") para disponibilizar os itens para o picking.
            </p>

            {loading ? (
              <div className="py-8 flex justify-center text-muted-foreground">
                <Loader2 size={20} className="animate-spin" />
              </div>
            ) : pendentesEnderecar.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                Não há produtos aguardando endereçamento. Registre novos produtos na aba de Recebimento!
              </div>
            ) : (
              <div className="space-y-3">
                {pendentesEnderecar.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-lg border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-xs text-foreground">{item.descricao}</p>
                      <p className="text-[11px] text-muted-foreground">
                        EAN: <span className="font-mono">{item.codigo}</span> · Qty: {item.quantidade} un.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Ex: Rua A, Nível 2"
                        value={posicaoInputs[item.id] || ""}
                        onChange={(e) =>
                          setPosicaoInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        className="w-36 px-2.5 py-1.5 text-xs rounded-md border border-border bg-background text-foreground"
                      />
                      <button
                        onClick={() => handleEnderecar(item.id)}
                        disabled={submittingId === item.id}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1"
                      >
                        {submittingId === item.id ? <Loader2 size={12} className="animate-spin" /> : "Salvar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lista de Itens Estocados */}
          <div className="stripe-card rounded-xl p-5 border-border">
            <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-blue-500" />
              Itens no Estoque (Endereçados)
            </h2>

            {loading ? (
              <div className="py-6 flex justify-center text-muted-foreground">
                <Loader2 size={20} className="animate-spin" />
              </div>
            ) : estocados.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                Nenhum produto estocado no momento.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {estocados.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-foreground">{item.descricao}</p>
                      <p className="text-[11px] text-muted-foreground">
                        EAN: <span className="font-mono">{item.codigo}</span> · {item.quantidade} un.
                      </p>
                    </div>
                    <span className="font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md text-[11px] flex items-center gap-1">
                      <MapPin size={10} /> {item.posicao}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coluna 2 — Regras Didáticas FIFO / FEFO (2 cols) */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-foreground mb-2">Conceitos de Armazenagem</h2>
          {regrasNegocio.map((regra) => {
            const Icon = regra.icon
            return (
              <div key={regra.sigla} className={`stripe-card rounded-xl p-4 border ${regra.border}`}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`w-7 h-7 rounded-lg ${regra.bg} ${regra.color} flex items-center justify-center`}>
                    <Icon size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground">{regra.sigla}</span>
                    <p className="text-[10px] text-muted-foreground">{regra.nome}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{regra.descricao}</p>
                <div className="p-2 rounded-lg bg-muted/40 text-[11px] text-muted-foreground italic">
                  Ex: {regra.exemplo}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Bar */}
      <div className="stripe-card rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={14} className="text-blue-400" />
          <span className="text-sm text-muted-foreground">Próxima etapa: realizar o picking (separação) dos itens</span>
        </div>
        <a href="/picking" className="flex items-center gap-2 text-sm font-semibold text-amber-500 hover:text-amber-400 transition-colors">
          Ir para Picking <ArrowRight size={13} />
        </a>
      </div>
    </PageShell>
  )
}
