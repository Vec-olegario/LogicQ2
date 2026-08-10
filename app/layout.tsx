import React from "react"
import type { Metadata } from 'next'
import { Instrument_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SmoothScroll } from "@/components/smooth-scroll"
import { ChatbotAtlas } from "@/components/logiq/chatbot-atlas"
import { A11yProvider } from "@/contexts/a11y-context"
import { A11yWidget } from "@/components/logiq/a11y-widget"
import { Toaster } from "sonner"

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: '--font-instrument',
  weight: ['400', '500', '600', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: '--font-jetbrains',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'LogiQ — Simulador WMS Educacional',
  description: 'Plataforma gamificada de simulação de armazém logístico para aulas práticas. Gerencie recebimento, estoque, picking e expedição.',
  generator: 'v0.app',
  other: {
    'strix-verification': 'strix-verify-baa419c22f76ee53911fba9b93f8814a',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className={`${instrumentSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <A11yProvider>
          <SmoothScroll>
            {children}
            <ChatbotAtlas />
            <A11yWidget />
          </SmoothScroll>
          <Toaster richColors position="top-right" />
        </A11yProvider>
      </body>
    </html>
  )
}
