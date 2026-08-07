"use client"

import { useState, useTransition } from "react"
import { Globe, Loader2, Save, Plus, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { atualizarConfiguracaoGlobal } from "@/src/actions/configuracao"

interface EditGlobalMetasDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentConfig: any
  senhaAdmin: string
  onSuccess?: () => void
}

export function EditGlobalMetasDialog({
  open,
  onOpenChange,
  currentConfig,
  senhaAdmin,
  onSuccess
}: EditGlobalMetasDialogProps) {
  // Situação de Aprendizagem
  const [titulo, setTitulo] = useState(currentConfig?.titulo || "Operação Padrão")
  const [contexto, setContexto] = useState(currentConfig?.contexto || "")
  const [exigirSkuExato, setExigirSkuExato] = useState(currentConfig?.exigirSkuExato ?? true)
  const [itensEsperados, setItensEsperados] = useState<any[]>(currentConfig?.itensEsperados || [])

  // Metas
  const [acuracia, setAcuracia] = useState(currentConfig?.metaAcuracia?.toString() || "98")
  const [erros, setErros] = useState(currentConfig?.metaErros?.toString() || "0")
  const [itensDesc, setItensDesc] = useState(currentConfig?.metaItensDesc || "Fluxo Contínuo")
  const [dificuldade, setDificuldade] = useState(currentConfig?.dificuldade || "Normal")
  const [tempoSLA, setTempoSLA] = useState(currentConfig?.tempoSLA?.toString() || "5")
  const [metaVolume, setMetaVolume] = useState(currentConfig?.metaVolume?.toString() || "500")
  
  const [isPending, startTransition] = useTransition()
  const [erroMsg, setErroMsg] = useState<string | null>(null)
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setErroMsg(null)
    
    startTransition(async () => {
      const novasMetas = {
        titulo,
        contexto,
        exigirSkuExato,
        itensEsperados,
        metaAcuracia: parseInt(acuracia) || 0,
        metaErros: parseInt(erros) || 0,
        metaItensDesc: itensDesc,
        dificuldade,
        tempoSLA: parseInt(tempoSLA) || 0,
        metaVolume: parseInt(metaVolume) || 0
      }
      
      const res = await atualizarConfiguracaoGlobal(senhaAdmin, novasMetas)
      
      if (res.sucesso) {
        onSuccess?.()
        onOpenChange(false)
      } else {
        setErroMsg(res.erro || "Ocorreu um erro.")
      }
    })
  }

  const addItem = () => {
    setItensEsperados([...itensEsperados, { codigo: "", descricao: "", quantidade: 1, fornecedor: "" }])
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...itensEsperados]
    newItems[index][field] = value
    setItensEsperados(newItems)
  }

  const removeItem = (index: number) => {
    const newItems = [...itensEsperados]
    newItems.splice(index, 1)
    setItensEsperados(newItems)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe size={18} className="text-primary" />
              Configurar Situação de Aprendizagem
            </DialogTitle>
            <DialogDescription>
              Ajuste as regras de simulação. Estas configurações servirão de molde para todos os novos turnos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-8">
            {erroMsg && (
              <div className="text-xs font-semibold bg-red-50 text-red-600 p-3 rounded-lg border border-red-200">
                {erroMsg}
              </div>
            )}
            
            {/* Seção 1: Contexto */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">1. Contexto da Situação</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Título da Situação</label>
                  <input type="text" required value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">História / Contexto</label>
                  <textarea required value={contexto} onChange={e => setContexto(e.target.value)} rows={3} placeholder="Descreva o cenário que os alunos enfrentarão..." className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
              </div>
            </div>

            {/* Seção 2: Itens Esperados */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-sm font-bold text-foreground">2. Nota Fiscal (Itens Esperados)</h3>
                <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus size={14} /> Adicionar Item
                </button>
              </div>
              
              <label className="flex items-center gap-2 text-sm font-medium p-3 bg-muted/50 rounded-xl border border-border cursor-pointer">
                <input type="checkbox" checked={exigirSkuExato} onChange={e => setExigirSkuExato(e.target.checked)} className="rounded border-border text-primary focus:ring-primary w-4 h-4" />
                <span>Exigir bipagem exata do SKU no Picking (se desmarcado, conta apenas o volume separado).</span>
              </label>

              {itensEsperados.length === 0 ? (
                <div className="text-center py-6 bg-muted/30 border border-dashed border-border rounded-xl">
                  <p className="text-xs text-muted-foreground">Nenhum item pré-cadastrado. Os alunos operarão no modo fluxo contínuo cego.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-3">SKU / Cód</div>
                    <div className="col-span-4">Descrição</div>
                    <div className="col-span-2">Qtd</div>
                    <div className="col-span-2">Fornecedor</div>
                    <div className="col-span-1"></div>
                  </div>
                  {itensEsperados.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2">
                      <input required placeholder="SKU" value={item.codigo} onChange={e => updateItem(index, 'codigo', e.target.value)} className="col-span-3 text-xs px-3 py-2 rounded-lg border border-border outline-none focus:border-primary" />
                      <input required placeholder="Descrição" value={item.descricao} onChange={e => updateItem(index, 'descricao', e.target.value)} className="col-span-4 text-xs px-3 py-2 rounded-lg border border-border outline-none focus:border-primary" />
                      <input required type="number" min="1" placeholder="Qtd" value={item.quantidade} onChange={e => updateItem(index, 'quantidade', parseInt(e.target.value) || 1)} className="col-span-2 text-xs px-3 py-2 rounded-lg border border-border outline-none focus:border-primary" />
                      <input required placeholder="Forn." value={item.fornecedor} onChange={e => updateItem(index, 'fornecedor', e.target.value)} className="col-span-2 text-xs px-3 py-2 rounded-lg border border-border outline-none focus:border-primary" />
                      <button type="button" onClick={() => removeItem(index)} className="col-span-1 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seção 3: Metas */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">3. Metas Operacionais</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Acurácia de Picking (%)
                  </label>
                  <input type="number" min="0" max="100" required value={acuracia} onChange={(e) => setAcuracia(e.target.value)} className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Limite de Erros Permitidos
                  </label>
                  <input type="number" min="0" required value={erros} onChange={(e) => setErros(e.target.value)} className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    SLA (Tempo Limite em Minutos)
                  </label>
                  <input type="number" min="1" required value={tempoSLA} onChange={(e) => setTempoSLA(e.target.value)} className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Meta de Volume Total
                  </label>
                  <input type="number" min="1" required value={metaVolume} onChange={(e) => setMetaVolume(e.target.value)} className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Dificuldade
                  </label>
                  <select value={dificuldade} onChange={(e) => setDificuldade(e.target.value)} className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="Fácil">Fácil</option>
                    <option value="Normal">Normal</option>
                    <option value="Difícil">Difícil</option>
                    <option value="Extremo">Extremo</option>
                  </select>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Descrição do Fluxo (antigo)
                  </label>
                  <input type="text" required value={itensDesc} onChange={(e) => setItensDesc(e.target.value)} className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
            </div>

          </div>
          
          <DialogFooter>
            <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded-xl text-sm font-semibold transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50">
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isPending ? "Salvando..." : "Salvar Situação"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
