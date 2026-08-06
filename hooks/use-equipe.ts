"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export function useEquipe() {
  const [equipeId, setEquipeId] = useState<string | null>(null)
  const [equipeNome, setEquipeNome] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Carrega a equipe inicial do localStorage
    const storedId = localStorage.getItem("logiq_equipe_id")
    const storedNome = localStorage.getItem("logiq_equipe_nome")

    if (storedId && storedNome) {
      setEquipeId(storedId)
      setEquipeNome(storedNome)
    }
    
    setIsLoaded(true)
  }, [])

  const selecionarEquipe = (id: string, nome: string) => {
    localStorage.setItem("logiq_equipe_id", id)
    localStorage.setItem("logiq_equipe_nome", nome)
    setEquipeId(id)
    setEquipeNome(nome)
  }

  const sairDaEquipe = () => {
    localStorage.removeItem("logiq_equipe_id")
    localStorage.removeItem("logiq_equipe_nome")
    setEquipeId(null)
    setEquipeNome(null)
    router.push("/")
  }

  return { equipeId, equipeNome, isLoaded, selecionarEquipe, sairDaEquipe }
}
