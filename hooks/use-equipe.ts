"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export function useEquipe() {
  const [equipeId, setEquipeId] = useState<string | null>(null)
  const [equipeNome, setEquipeNome] = useState<string | null>(null)
  const [equipeCor, setEquipeCor] = useState<string | null>(null)
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [usuarioNome, setUsuarioNome] = useState<string | null>(null)
  const [isLider, setIsLider] = useState<boolean>(false)
  
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Carrega a sessão do localStorage
    const storedEqId = localStorage.getItem("logiq_equipe_id")
    const storedEqNome = localStorage.getItem("logiq_equipe_nome")
    const storedEqCor = localStorage.getItem("logiq_equipe_cor") || "blue"
    const storedUsId = localStorage.getItem("logiq_usuario_id")
    const storedUsNome = localStorage.getItem("logiq_usuario_nome")
    const storedLider = localStorage.getItem("logiq_is_lider") === "true"

    if (storedEqId && storedEqNome && storedUsId && storedUsNome) {
      setEquipeId(storedEqId)
      setEquipeNome(storedEqNome)
      setEquipeCor(storedEqCor)
      setUsuarioId(storedUsId)
      setUsuarioNome(storedUsNome)
      setIsLider(storedLider)
    }
    
    setIsLoaded(true)
  }, [])

  const selecionarSessao = (
    eqId: string, 
    eqNome: string, 
    eqCor: string,
    usId: string, 
    usNome: string, 
    lider: boolean
  ) => {
    localStorage.setItem("logiq_equipe_id", eqId)
    localStorage.setItem("logiq_equipe_nome", eqNome)
    localStorage.setItem("logiq_equipe_cor", eqCor)
    localStorage.setItem("logiq_usuario_id", usId)
    localStorage.setItem("logiq_usuario_nome", usNome)
    localStorage.setItem("logiq_is_lider", lider ? "true" : "false")
    
    setEquipeId(eqId)
    setEquipeNome(eqNome)
    setEquipeCor(eqCor)
    setUsuarioId(usId)
    setUsuarioNome(usNome)
    setIsLider(lider)
  }

  const sairDaEquipe = () => {
    localStorage.removeItem("logiq_equipe_id")
    localStorage.removeItem("logiq_equipe_nome")
    localStorage.removeItem("logiq_usuario_id")
    localStorage.removeItem("logiq_usuario_nome")
    localStorage.removeItem("logiq_is_lider")
    
    setEquipeId(null)
    setEquipeNome(null)
    setUsuarioId(null)
    setUsuarioNome(null)
    setIsLider(false)
    
    router.push("/login")
  }

  const atualizarNome = (novoNome: string) => {
    localStorage.setItem("logiq_usuario_nome", novoNome)
    setUsuarioNome(novoNome)
  }

  return { 
    equipeId, equipeNome, equipeCor,
    usuarioId, usuarioNome, 
    isLider, isLoaded, 
    selecionarSessao, sairDaEquipe, atualizarNome 
  }
}
