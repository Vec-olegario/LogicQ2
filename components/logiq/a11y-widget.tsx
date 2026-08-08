"use client"

import React, { useState } from "react"
import { Accessibility, Type, Eye, Brain, X, TypeIcon } from "lucide-react"
import { useA11y } from "@/contexts/a11y-context"
import { motion, AnimatePresence } from "framer-motion"

export function A11yWidget() {
  const [open, setOpen] = useState(false)
  const {
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    dyslexiaFont,
    setDyslexiaFont
  } = useA11y()

  const toggleFontSize = () => {
    if (fontSize === "normal") setFontSize("large")
    else if (fontSize === "large") setFontSize("x-large")
    else setFontSize("normal")
  }

  return (
    <div className="fixed bottom-24 right-6 z-[9999] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-card text-card-foreground border border-border rounded-2xl shadow-2xl p-4 w-64 flex flex-col gap-2"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-sm">Acessibilidade</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                aria-label="Fechar painel de acessibilidade"
              >
                <X size={16} />
              </button>
            </div>

            <button
              onClick={toggleFontSize}
              className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-muted text-sm font-medium transition-colors"
              aria-label={`Tamanho da fonte: ${fontSize}`}
            >
              <div className="flex items-center gap-2">
                <TypeIcon size={16} className="text-blue-500" />
                <span>Tamanho do Texto</span>
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md uppercase font-bold">
                {fontSize === "normal" ? "A" : fontSize === "large" ? "A+" : "A++"}
              </span>
            </button>

            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`flex items-center justify-between w-full p-2.5 rounded-xl text-sm font-medium transition-colors ${
                highContrast ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "hover:bg-muted"
              }`}
              aria-pressed={highContrast}
            >
              <div className="flex items-center gap-2">
                <Eye size={16} className={highContrast ? "text-amber-500" : "text-amber-500"} />
                <span>Alto Contraste</span>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${highContrast ? "bg-amber-500" : "bg-muted-foreground/30"}`}>
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${highContrast ? "translate-x-4" : ""}`} />
              </div>
            </button>

            <button
              onClick={() => setDyslexiaFont(!dyslexiaFont)}
              className={`flex items-center justify-between w-full p-2.5 rounded-xl text-sm font-medium transition-colors ${
                dyslexiaFont ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "hover:bg-muted"
              }`}
              aria-pressed={dyslexiaFont}
            >
              <div className="flex items-center gap-2">
                <Brain size={16} className={dyslexiaFont ? "text-emerald-500" : "text-emerald-500"} />
                <span>Fonte Dislexia</span>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${dyslexiaFont ? "bg-emerald-500" : "bg-muted-foreground/30"}`}>
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${dyslexiaFont ? "translate-x-4" : ""}`} />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        aria-label="Abrir opções de acessibilidade"
        aria-expanded={open}
        className="w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all focus-visible:ring-4 focus-visible:ring-primary/50 focus:outline-none"
      >
        <Accessibility size={24} className={open ? "rotate-12 transition-transform" : "transition-transform"} />
      </button>
    </div>
  )
}
