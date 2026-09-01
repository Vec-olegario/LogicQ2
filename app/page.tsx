"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Truck,
  Package,
  ScanBarcode,
  PackageCheck,
  Target,
  Users,
  BarChart3,
  Globe,
  ShieldAlert,
  HelpCircle,
} from "lucide-react"
import { Topbar } from "@/components/logiq/topbar"
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect"
import { NoiseBackground } from "@/components/ui/noise-background"

const heroLine1 = [
  { text: "Plataforma" },
  { text: "de" },
  { text: "Aprendizagem" },
]

const heroLine2 = [
  { text: "por" },
  { text: "simulação" },
  { text: "de" },
  { text: "processos" },
  {
    text: "logísticos.",
    className: "text-primary"
  },
]

const features = [
  {
    icon: Truck,
    label: "Recebimento",
    desc: "Controle as docas e a entrada de mercadorias em tempo real.",
    href: "/recebimento",
    color: "text-emerald-500",
    defaultGradient: ["rgb(16, 185, 129)", "rgb(52, 211, 153)", "rgb(16, 185, 129)"],
  },
  {
    icon: Package,
    label: "Estoque",
    desc: "Guarde os produtos nos locais corretos e gerencie o espaço.",
    href: "/estoque",
    color: "text-blue-500",
    defaultGradient: ["rgb(59, 130, 246)", "rgb(96, 165, 250)", "rgb(59, 130, 246)"],
  },
  {
    icon: ScanBarcode,
    label: "Picking",
    desc: "Use o coletor virtual para separar os itens dos pedidos.",
    href: "/picking",
    color: "text-amber-500",
    defaultGradient: ["rgb(245, 158, 11)", "rgb(251, 191, 36)", "rgb(245, 158, 11)"],
  },
  {
    icon: PackageCheck,
    label: "Expedição",
    desc: "Envie as cargas para as docas e libere os caminhões.",
    href: "/expedicao",
    color: "text-violet-500",
    defaultGradient: ["rgb(139, 92, 246)", "rgb(167, 139, 250)", "rgb(139, 92, 246)"],
  },
]

function SectorFeatureCard({ feat }: { feat: (typeof features)[number] }) {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = feat.icon

  // Intense Palette on Hover: Vibrant Stripe Blue + Indigo + Violet blend
  const stripeColors = [
    "rgb(37, 99, 235)",   // Intense Royal Blue
    "rgb(79, 70, 229)",   // Intense Indigo
    "rgb(124, 58, 237)",  // Intense Deep Violet
  ]

  return (
    <Link
      href={feat.href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group block h-full min-h-[260px]"
    >
      <NoiseBackground
        gradientColors={isHovered ? stripeColors : feat.defaultGradient}
        noiseIntensity={isHovered ? 0.25 : 0.15}
        speed={isHovered ? 0.25 : 0.12}
        containerClassName="h-full rounded-2xl p-1 transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-2xl"
        className="h-full"
      >
        <div
          className={`flex h-full flex-col justify-between rounded-xl p-5 text-card-foreground backdrop-blur-md transition-all duration-300 border ${
            isHovered
              ? "bg-card/70 border-primary/50 shadow-inner"
              : "bg-card/90 border-border/40"
          }`}
        >
          <div>
            <div className={`w-10 h-10 rounded-lg stripe-card flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${feat.color}`}>
              <Icon size={18} />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1.5">{feat.label}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
          </div>
          <div className={`flex items-center gap-1 mt-6 text-xs font-semibold ${feat.color} group-hover:text-primary group-hover:translate-x-1.5 transition-all duration-200`}>
            Acessar módulo <ArrowRight size={12} />
          </div>
        </div>
      </NoiseBackground>
    </Link>
  )
}



export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Topbar />

      <main className="pt-16">

        {/* Hero */}
        <section className="relative overflow-hidden hero-gradient">
          {/* Decorative grid */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "linear-gradient(oklch(0.25 0.02 264 / 0.15) 1px, transparent 1px), linear-gradient(90deg, oklch(0.25 0.02 264 / 0.15) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%, black 20%, transparent 100%)",
          }} />

          <div className="relative mx-auto w-full max-w-7xl px-4 pt-2 pb-6 sm:px-6 sm:pt-3 sm:pb-8 md:grid md:grid-cols-[1.4fr_0.6fr] md:items-center md:gap-8 lg:px-8 lg:pt-3 lg:pb-8">
            {/* Left: Text + CTAs */}
            <div className="w-full text-left">
              {/* Top badge */}
              <div className="mb-4">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-primary/30 text-primary bg-primary/8">
                  <span className="status-dot bg-primary" />
                  Plataforma de Aprendizagem
                </span>
              </div>

              {/* Headline — two lines */}
              <div className="mb-2 flex flex-col items-start">
                <TypewriterEffectSmooth
                  words={heroLine1}
                  delay={0.3}
                  showCursor={false}
                />
                <TypewriterEffectSmooth
                  words={heroLine2}
                  delay={1.2}
                  showCursor={true}
                />
              </div>

              {/* Sub */}
              <p className="text-base text-muted-foreground leading-relaxed text-pretty sm:text-lg/relaxed mb-5">
                Plataforma de aprendizagem de processos logísticos — do recebimento à expedição.
                <br className="hidden sm:inline" /> Videoaulas integradas transformando teoria em experiência prática.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors duration-150 shadow-sm"
                >
                  Entrar como Aluno
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href="/visao-geral"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-white/5 transition-colors duration-150 shadow-sm"
                >
                  Visão Geral (Visitantes)
                </Link>
              </div>
            </div>

            {/* Right: Empty reserved space */}
            <div className="hidden md:block" />
          </div>

          {/* Bottom stripe line */}
          <div className="stripe-line" />
        </section>




        {/* Features grid */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pt-8 pb-12">
          <div className="mb-6">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Fluxo Logístico</p>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Os 4 setores da <span className="text-primary">Armazenagem</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feat) => (
              <SectorFeatureCard key={feat.href} feat={feat} />
            ))}
          </div>
        </section>

        {/* Gestao do turno row + Quiz */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 pb-20">
          <div className="divider mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { href: "/dashboard", icon: BarChart3, label: "Dashboard", desc: "Monitore os KPIs e a performance do turno atual.", color: "text-indigo-500", blobColor: "#6366f1" },
              { href: "/equipe", icon: Users, label: "Sua Equipe", desc: "Gerencie os membros e a lotação dos slots.", color: "text-amber-500", blobColor: "#f59e0b" },
              { href: "/quiz", icon: HelpCircle, label: "Quiz Logístico", desc: "Teste seus conhecimentos em 32 perguntas interativas.", color: "text-emerald-500", blobColor: "#10b981" },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group uiverse-card min-h-[180px]"
                >
                  <div
                    className="uiverse-blob"
                    style={{ backgroundColor: item.blobColor }}
                  />
                  <div className="uiverse-bg p-5 flex flex-col justify-between">
                    <div>
                      <div className={`w-8 h-8 rounded-md stripe-card flex items-center justify-center mb-3 ${item.color}`}>
                        <Icon size={15} />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">{item.label}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-4 text-xs font-medium ${item.color} group-hover:translate-x-1 transition-transform duration-200`}>
                      Acessar <ArrowRight size={11} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

      </main>
    </div>
  )
}
