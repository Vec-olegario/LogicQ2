"use client"

import { useState, useTransition } from "react"
import { Target, KeyRound, Loader2, Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { atualizarMetasTurno } from "@/src/actions/metas"

interface EditMetasDialogProps {
  turnoId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  currentMetaAcuracia: number
  currentMetaErros: number
  currentMetaItensDesc: string
  onSuccess?: () => void
}

export function EditMetasDialog({
  turnoId,
  open,
  onOpenChange,
  currentMetaAcuracia,
  currentMetaErros,
  currentMetaItensDesc,
  onSuccess
}: EditMetasDialogProps) {
  const [senhaAdmin, setSenhaAdmin] = useState("")
  const [acuracia, setAcuracia] = useState(currentMetaAcuracia.toString())
  const [erros, setErros] = useState(currentMetaErros.toString())
  const [itensDesc, setItensDesc] = useState(currentMetaItensDesc)
  
  const [isPending, startTransition] = useTransition()
  const [erroMsg, setErroMsg] = useState<string | null>(null)
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setErroMsg(null)
    
    startTransition(async () => {
      const parsedAcuracia = parseInt(acuracia) || 0
      const parsedErros = parseInt(erros) || 0
      
      const res = await atualizarMetasTurno(
        senhaAdmin,
        turnoId,
        parsedAcuracia,
        parsedErros,
        itensDesc
      )
      
      if (res.sucesso) {
        setSenhaAdmin("")
        onSuccess?.()
        onOpenChange(false)
      } else {
        setErroMsg(res.erro || "Ocorreu um erro.")
      }
    })
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target size={18} className="text-violet-600" />
              Editar Metas do Turno
            </DialogTitle>
            <DialogDescription>
              Ajuste as metas de aprendizado para esta simulação. Requer a senha de instrutor.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {erroMsg && (
              <div className="text-xs font-semibold bg-red-50 text-red-600 p-3 rounded-lg border border-red-200">
                {erroMsg}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Acurácia de Picking (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={acuracia}
                onChange={(e) => setAcuracia(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Tolerância de Erros
              </label>
              <input
                type="number"
                min="0"
                required
                value={erros}
                onChange={(e) => setErros(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Meta de Itens (Texto)
              </label>
              <input
                type="text"
                required
                value={itensDesc}
                onChange={(e) => setItensDesc(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
            
            <div className="space-y-1 mt-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Senha do Instrutor
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={senhaAdmin}
                  onChange={(e) => setSenhaAdmin(e.target.value)}
                  placeholder="********"
                  className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
                <KeyRound size={16} className="text-muted-foreground absolute left-3 top-2.5" />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-violet-600 text-white hover:bg-violet-700 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isPending ? "Salvando..." : "Salvar Metas"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
