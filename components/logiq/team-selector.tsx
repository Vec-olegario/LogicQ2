"use client"

import { useState } from "react"
import { useEquipe } from "@/hooks/use-equipe"
import { Users, LogOut, ChevronDown, User, ShieldAlert } from "lucide-react"
import Link from "next/link"

import { usePathname } from "next/navigation"

export function TeamSelector() {
  const pathname = usePathname()
  const { equipeId, equipeNome, equipeCor, usuarioNome, isLider, isLoaded, sairDaEquipe } = useEquipe()
  const [isOpen, setIsOpen] = useState(false)

  if (!isLoaded) {
    return <div className="w-32 h-8 bg-muted animate-pulse rounded-full" />
  }

  const isLogin = pathname === "/login"

  if (!equipeId) {
    return (
      <Link 
        href="/login"
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
          isLogin 
            ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md shadow-violet-500/40 ring-2 ring-violet-400 scale-105" 
            : "border border-primary/30 text-primary bg-primary/10 hover:bg-primary/20"
        }`}
      >
        <User size={14} />
        Login
        {isLogin && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
      </Link>
    )
  }

  const getBadgeColor = (cor: string | null) => {
    switch (cor) {
      case "emerald": return "border-emerald-500/30 text-emerald-600 bg-emerald-50 hover:bg-emerald-100";
      case "violet": return "border-violet-500/30 text-violet-600 bg-violet-50 hover:bg-violet-100";
      case "amber": return "border-amber-500/30 text-amber-600 bg-amber-50 hover:bg-amber-100";
      case "rose": return "border-rose-500/30 text-rose-600 bg-rose-50 hover:bg-rose-100";
      case "cyan": return "border-cyan-500/30 text-cyan-600 bg-cyan-50 hover:bg-cyan-100";
      case "fuchsia": return "border-fuchsia-500/30 text-fuchsia-600 bg-fuchsia-50 hover:bg-fuchsia-100";
      case "indigo": return "border-indigo-500/30 text-indigo-600 bg-indigo-50 hover:bg-indigo-100";
      case "teal": return "border-teal-500/30 text-teal-600 bg-teal-50 hover:bg-teal-100";
      case "orange": return "border-orange-500/30 text-orange-600 bg-orange-50 hover:bg-orange-100";
      default: return "border-blue-500/30 text-blue-600 bg-blue-50 hover:bg-blue-100";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${getBadgeColor(equipeCor)}`}
      >
        <Users size={14} />
        <span className="text-xs font-bold truncate max-w-[150px]">
          {usuarioNome} @ {equipeNome}
        </span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-64 glass shadow-float-lg rounded-2xl border border-white/60 p-4 z-50">
            <div className="mb-4">
              <p className="text-xs text-muted-foreground font-semibold mb-1">Logado como</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground">{usuarioNome}</p>
                {isLider && (
                  <span className="text-[9px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Líder
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Equipe: {equipeNome}</p>
            </div>
            
            <div className="space-y-2">
              <Link
                href="/equipe"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2 py-2 px-3 bg-muted/50 hover:bg-muted rounded-xl text-xs font-bold transition-colors text-foreground"
              >
                <Users size={14} className="text-muted-foreground" />
                Gerenciar Equipe
              </Link>
              <button
                onClick={() => {
                  sairDaEquipe()
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-2 py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors"
              >
                <LogOut size={14} />
                Sair
              </button>
            </div>
            
            <div className="mt-4 pt-3 border-t border-border/50">
              <Link 
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors font-semibold uppercase tracking-widest"
              >
                <ShieldAlert size={12} /> Painel do Instrutor
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
