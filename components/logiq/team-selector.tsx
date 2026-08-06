"use client"

import { useState } from "react"
import { useEquipe } from "@/hooks/use-equipe"
import { acessarEquipe } from "@/src/actions/equipes"
import { Users, LogOut, ChevronDown, Loader2 } from "lucide-react"

export function TeamSelector() {
  const { equipeId, equipeNome, isLoaded, selecionarEquipe, sairDaEquipe } = useEquipe()
  const [isOpen, setIsOpen] = useState(false)
  const [nomeDigitado, setNomeDigitado] = useState("")
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")

  if (!isLoaded) {
    return <div className="w-32 h-8 bg-muted animate-pulse rounded-full" />
  }

  const handleAcessar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nomeDigitado.trim()) return

    setLoading(true)
    setErro("")

    const res = await acessarEquipe(nomeDigitado)
    if (res.sucesso && res.dados) {
      selecionarEquipe(res.dados.id, res.dados.nome)
      setIsOpen(false)
      setNomeDigitado("")
      window.location.reload() // Recarrega a página para buscar os dados da nova equipe
    } else {
      setErro(res.erro || "Erro desconhecido")
    }
    setLoading(false)
  }

  const handleSair = () => {
    sairDaEquipe()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Botão da Equipe */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
          equipeId 
            ? "border-emerald-500/30 text-emerald-600 bg-emerald-50 hover:bg-emerald-100" 
            : "border-amber-500/30 text-amber-600 bg-amber-50 hover:bg-amber-100"
        }`}
      >
        <Users size={14} />
        <span className="text-xs font-bold truncate max-w-[120px]">
          {equipeId ? equipeNome : "Sem Equipe"}
        </span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown / Popover */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-72 glass shadow-float-lg rounded-2xl border border-white/60 p-4 z-50">
            {equipeId ? (
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">Equipe Atual</p>
                <p className="text-sm font-bold text-foreground mb-4">{equipeNome}</p>
                <button
                  onClick={handleSair}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors"
                >
                  <LogOut size={14} />
                  Sair da Equipe
                </button>
              </div>
            ) : (
              <form onSubmit={handleAcessar}>
                <p className="text-sm font-bold text-foreground mb-1">Acessar Turma/Equipe</p>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  Digite o nome da sua equipe. Se não existir, ela será criada.
                </p>
                <input
                  type="text"
                  value={nomeDigitado}
                  onChange={(e) => setNomeDigitado(e.target.value)}
                  placeholder="Ex: Turma Logística A"
                  className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-2"
                  disabled={loading}
                />
                {erro && <p className="text-xs text-red-500 mb-2 font-medium">{erro}</p>}
                <button
                  type="submit"
                  disabled={loading || !nomeDigitado.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : "Acessar Equipe"}
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  )
}
