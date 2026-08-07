"use client"

import React, { useState, useTransition, createContext, useContext } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { ShieldAlert, Users, Loader2, Target, KeyRound, Eye, EyeOff, LayoutDashboard } from "lucide-react"
import { getTodasEquipes } from "@/src/actions/auth"

interface AdminContextData {
  senhaAdmin: string
  equipes: any[]
  setEquipes: (eqs: any[]) => void
}

const AdminContext = createContext<AdminContextData | null>(null)

export function useAdminAuth() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error("useAdminAuth must be used within AdminLayout")
  return ctx
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  
  const [senha, setSenha] = useState("")
  const [autenticado, setAutenticado] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [equipes, setEquipes] = useState<any[]>([])
  const [erroMsg, setErroMsg] = useState<string | null>(null)
  
  const [isPending, startTransition] = useTransition()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroMsg(null)
    
    startTransition(async () => {
      const res = await getTodasEquipes(senha)
      if (res.sucesso) {
        setEquipes(res.dados)
        setAutenticado(true)
      } else {
        setErroMsg(res.erro || "Erro desconhecido")
      }
    })
  }

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={24} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Painel do Instrutor</h1>
            <p className="text-sm text-muted-foreground mt-1">Acesso administrativo ao WMS</p>
          </div>

          <form onSubmit={handleLogin} className="glass p-6 rounded-3xl shadow-sm border border-border">
            {erroMsg && (
              <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg mb-4 text-center font-medium border border-red-200">
                {erroMsg}
              </p>
            )}
            <div className="mb-4">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Senha de Instrutor
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="********"
                  className="w-full bg-white border border-border rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  disabled={isPending}
                />
                <KeyRound size={16} className="text-muted-foreground absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isPending || !senha}
              className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 text-white hover:bg-violet-700 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : "Acessar Painel"}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button onClick={() => router.push("/")} className="text-xs text-muted-foreground hover:text-foreground">
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    )
  }

  const menuItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Visão Geral" },
    { href: "/admin/situacao", icon: Target, label: "Regras da Sala" },
  ]

  return (
    <AdminContext.Provider value={{ senhaAdmin: senha, equipes, setEquipes }}>
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        {/* Sidebar / Topbar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-white flex flex-col shrink-0 z-10">
          <div className="h-16 flex items-center justify-between md:justify-start gap-3 px-6 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                <ShieldAlert size={16} />
              </div>
              <div>
                <h1 className="font-bold text-foreground text-sm">Instrutor</h1>
                <p className="text-xs text-muted-foreground">WMS Didático</p>
              </div>
            </div>
            {/* Mobile-only compact logout */}
            <button 
              onClick={() => setAutenticado(false)}
              className="md:hidden flex items-center justify-center p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              title="Sair do Painel"
            >
              Sair
            </button>
          </div>
          
          <div className="flex-1 py-3 md:py-6 px-4 flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar items-center md:items-stretch">
            {menuItems.map(item => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-2 md:gap-3 px-3.5 md:px-3 py-2 md:py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  pathname === item.href 
                    ? "bg-violet-50 text-violet-700" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:block p-4 border-t border-border shrink-0">
            <button 
              onClick={() => setAutenticado(false)}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
            >
              Sair do Painel
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex flex-col h-screen overflow-y-auto">
          {children}
        </main>
      </div>
    </AdminContext.Provider>
  )
}
