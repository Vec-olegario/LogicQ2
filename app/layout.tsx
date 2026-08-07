import React from "react"
import type { Metadata } from 'next'
import { Instrument_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SmoothScroll } from "@/components/smooth-scroll"
import { ChatbotAtlas } from "@/components/logiq/chatbot-atlas"

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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className={`${instrumentSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <SmoothScroll>
          {children}
          <ChatbotAtlas />
        </SmoothScroll>
      </body>
    </html>
  )
}
