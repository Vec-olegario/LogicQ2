"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type A11yContextType = {
  fontSize: "normal" | "large" | "x-large";
  setFontSize: (size: "normal" | "large" | "x-large") => void;
  highContrast: boolean;
  setHighContrast: (active: boolean) => void;
  dyslexiaFont: boolean;
  setDyslexiaFont: (active: boolean) => void;
}

const A11yContext = createContext<A11yContextType | undefined>(undefined)

export function A11yProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState<"normal" | "large" | "x-large">("normal")
  const [highContrast, setHighContrast] = useState(false)
  const [dyslexiaFont, setDyslexiaFont] = useState(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("logiq-a11y-prefs")
      if (saved) {
        const prefs = JSON.parse(saved)
        if (prefs.fontSize) setFontSize(prefs.fontSize)
        if (typeof prefs.highContrast === "boolean") setHighContrast(prefs.highContrast)
        if (typeof prefs.dyslexiaFont === "boolean") setDyslexiaFont(prefs.dyslexiaFont)
      }
    } catch (e) {
      console.error("Failed to load a11y prefs", e)
    }
  }, [])

  // Save preferences and apply classes to HTML
  useEffect(() => {
    try {
      localStorage.setItem(
        "logiq-a11y-prefs",
        JSON.stringify({ fontSize, highContrast, dyslexiaFont })
      )
    } catch (e) {}

    const html = document.documentElement

    // Font size
    html.classList.remove("text-base", "text-lg", "text-xl")
    if (fontSize === "normal") html.classList.add("text-base")
    if (fontSize === "large") html.classList.add("text-lg")
    if (fontSize === "x-large") html.classList.add("text-xl")

    // High Contrast
    if (highContrast) {
      html.classList.add("high-contrast")
    } else {
      html.classList.remove("high-contrast")
    }

    // Dyslexia Font
    if (dyslexiaFont) {
      html.classList.add("font-dyslexic")
    } else {
      html.classList.remove("font-dyslexic")
    }
  }, [fontSize, highContrast, dyslexiaFont])

  return (
    <A11yContext.Provider
      value={{
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
        dyslexiaFont,
        setDyslexiaFont,
      }}
    >
      {children}
    </A11yContext.Provider>
  )
}

export function useA11y() {
  const context = useContext(A11yContext)
  if (context === undefined) {
    throw new Error("useA11y must be used within an A11yProvider")
  }
  return context
}
