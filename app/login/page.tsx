"use client"

import React, { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useEquipe } from "@/hooks/use-equipe"
import { criarEquipe, entrarNaEquipe } from "@/src/actions/auth"
import { Target, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Topbar } from "@/components/logiq/topbar"

export default function LoginPage() {
  const router = useRouter()
  const { selecionarSessao } = useEquipe()
  
  const [nomeUsuario, setNomeUsuario] = useState("")
  const [nomeEquipe, setNomeEquipe] = useState("")
  const [acao, setAcao] = useState<"entrar" | "criar">("entrar")
  
  const [erroMsg, setErroMsg] = useState<string | null>(null)
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroMsg(null)
    setSucessoMsg(null)

    if (!nomeUsuario.trim() || !nomeEquipe.trim()) {
      setErroMsg("Preencha todos os campos.")
      return
    }

    startTransition(async () => {
      let res;
      if (acao === "criar") {
        res = await criarEquipe(nomeUsuario, nomeEquipe)
      } else {
        res = await entrarNaEquipe(nomeUsuario, nomeEquipe)
      }

      if (res.sucesso && res.dados) {
        selecionarSessao(
          res.dados.equipeId,
          res.dados.equipeNome,
          res.dados.equipeCor,
          res.dados.usuarioId,
          res.dados.nomeUsuario,
          acao === "criar" ? true : false
        )
        setSucessoMsg(acao === "criar" ? "Equipe criada! Redirecionando..." : "Sessão iniciada! Redirecionando...")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else if (!res.sucesso) {
        setErroMsg(res.erro || "Ocorreu um erro")
      }
    })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 pt-24 relative overflow-hidden">
      <Topbar />
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(ellipse 60% 80% at 50% -20%, oklch(0.60 0.18 145 / 0.1), transparent 100%)",
      }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3.5 mb-4">
            <img
              src="/logiq-logo.png"
              alt="LogiQ"
              width={60}
              height={60}
              style={{ width: 60, height: 60, objectFit: "contain" }}
            />
            <span className="font-bold text-foreground tracking-tight text-4xl">LogiQ</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Acesso ao Simulador</h1>
          <p className="text-sm text-muted-foreground">Informe seus dados para ingressar no turno.</p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-float-lg border border-border">
          
          {sucessoMsg && (
            <div className="mb-6 bg-emerald-50 text-emerald-600 text-sm font-semibold px-4 py-3 rounded-xl border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{sucessoMsg}</span>
            </div>
          )}
          {erroMsg && (
            <div className="mb-6 bg-red-50 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{erroMsg}</span>
            </div>
          )}

          <div className="flex bg-muted p-1 rounded-xl mb-6">
            <button
              onClick={() => setAcao("entrar")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${acao === "entrar" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Entrar na Equipe
            </button>
            <button
              onClick={() => setAcao("criar")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${acao === "criar" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Criar Nova Equipe
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Seu Nome
              </label>
              <input
                type="text"
                value={nomeUsuario}
                onChange={(e) => setNomeUsuario(e.target.value)}
                placeholder="Ex: Vítor Emanuel"
                className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                disabled={isPending || sucessoMsg !== null}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Nome da Turma / Equipe
              </label>
              <input
                type="text"
                value={nomeEquipe}
                onChange={(e) => setNomeEquipe(e.target.value)}
                placeholder="Ex: Logística A"
                className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                disabled={isPending || sucessoMsg !== null}
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !nomeUsuario || !nomeEquipe || sucessoMsg !== null}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm font-bold transition-all disabled:opacity-50 mt-4 shadow-sm"
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : acao === "criar" ? (
                <>Criar Turma <ArrowRight size={16} /></>
              ) : (
                <>Acessar Turno <ArrowRight size={16} /></>
              )}
            </button>
          </form>

        </div>
        
        <div className="mt-8 text-center text-xs text-muted-foreground font-medium">
          <p>
            É professor? <a href="/admin" className="text-primary hover:underline">Acesse o painel do instrutor</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
