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
} from "lucide-react"
import { PageShell } from "@/components/logiq/page-shell"
import { useEquipe } from "@/hooks/use-equipe"
import { getTurnoAtivoComItens, expedirItem } from "@/src/actions/wms"
import type { Item } from "@prisma/client"

export default function ExpedicaoPage() {
  const { equipeId, isLoaded } = useEquipe()
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
      return
    }

    setSubmittingId(itemId)
    setErro(null)
    setSucessoMsg(null)

    const res = await expedirItem(itemId, docaSaida)

    if (res.sucesso) {
      setSucessoMsg(`Item expedido com sucesso pela "${docaSaida}"!`)
      setDocaInputs((prev) => ({ ...prev, [itemId]: "" }))
      await carregarDados()
    } else {
      setErro(res.erro)
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
        badge="Etapa 04 - Teoria"
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="glass rounded-3xl p-6 border border-border shadow-sm">
              <h2 className="text-xl font-bold mb-4">O Setor de Expedição</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                A Expedição é a etapa final do ciclo interno de um armazém. É responsável por receber os produtos separados pelo picking, consolidar os pedidos, verificar se as notas fiscais estão coladas corretamente nas embalagens, e direcionar a carga para a doca de saída correta.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Uma expedição ágil e precisa garante que a transportadora receba a carga no horário combinado, otimizando o indicador **OTIF (On-Time In-Full)** e a satisfação do cliente final.
              </p>
              <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-border mt-6">
                <Truck size={48} className="text-muted-foreground animate-pulse mb-2" />
                <span className="text-xs font-bold text-muted-foreground">Assista à aula explicativa da Expedição</span>
                <iframe
                  className="absolute inset-0 w-full h-full opacity-10 hover:opacity-100 transition-opacity"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="p-5 rounded-3xl border border-violet-200 bg-violet-50 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <PackageCheck size={16} className="text-violet-600" />
                <h4 className="font-bold text-sm text-foreground">Metas e KPIs da Expedição</h4>
              </div>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li><strong>OTIF (On-Time In-Full):</strong> O indicador mais importante. Mede a porcentagem de entregas feitas no prazo contratado e com a quantidade/qualidade corretas.</li>
                <li><strong>Tempo de Ciclo (Order Cycle Time):</strong> Tempo total desde a entrada do pedido no sistema até a saída física do caminhão.</li>
                <li><strong>Acurácia de Expedição:</strong> Verificação contra erros de envio de produtos trocados para clientes.</li>
              </ul>
            </div>
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Expedição"
      subtitle="Direcionamento de produtos separados para as docas de saída"
      icon={PackageCheck}
      iconColor="text-violet-400"
      badge="Etapa 04"
    >
      {/* KPIs Reais */}
      <div className="grid grid-cols-3 gap-4 mb-8">
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

      <div className="grid grid-cols-2 gap-6 mb-8">
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
                <div key={item.id} className="p-3.5 rounded-lg border border-border bg-card flex items-center justify-between gap-3">
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
        <a href="/dashboard-turno" className="flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-90 transition-opacity">
          Ir para Dashboard do Turno <ArrowRight size={13} />
        </a>
      </div>
    </PageShell>
  )
}
