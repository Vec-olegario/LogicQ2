import Link from "next/link"
import {
  ArrowRight,
  Truck,
  Package,
  ScanBarcode,
  PackageCheck,
  Target,
  Users,
} from "lucide-react"
import { Topbar } from "@/components/logiq/topbar"

const features = [
  {
    icon: Truck,
    label: "Recebimento",
    desc: "Controle de docas, NF-e e SLAs de fornecedores em tempo real.",
    href: "/recebimento",
    color: "text-emerald-400",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    glow: "oklch(0.60 0.18 145 / 0.08)",
  },
  {
    icon: Package,
    label: "Estoque",
    desc: "Endereçamento, FIFO/FEFO e taxa de ocupação do armazém.",
    href: "/estoque",
    color: "text-blue-400",
    border: "border-blue-500/20 hover:border-blue-500/40",
    glow: "oklch(0.60 0.18 220 / 0.08)",
  },
  {
    icon: ScanBarcode,
    label: "Picking",
    desc: "Simulador de coletor RF — bipe EANs e siga os endereços.",
    href: "/picking",
    color: "text-amber-400",
    border: "border-amber-500/20 hover:border-amber-500/40",
    glow: "oklch(0.65 0.18 55 / 0.08)",
  },
  {
    icon: PackageCheck,
    label: "Expedição",
    desc: "Direcionamento de carga para docas e geração de romaneio.",
    href: "/expedicao",
    color: "text-violet-400",
    border: "border-violet-500/20 hover:border-violet-500/40",
    glow: "oklch(0.62 0.20 295 / 0.08)",
  },
]

const stats = [
  { value: "", label: "Módulos operacionais" },
  { value: "100%", label: "OTIF do turno" },
  { value: "98.4%", label: "Acurácia de picking" },
  { value: "0", label: "Erros não resolvidos" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Topbar />

      <main className="pt-14">

        {/* Hero */}
        <section className="relative overflow-hidden hero-gradient">
          {/* Decorative grid */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "linear-gradient(oklch(0.25 0.02 264 / 0.15) 1px, transparent 1px), linear-gradient(90deg, oklch(0.25 0.02 264 / 0.15) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%, black 20%, transparent 100%)",
          }} />

          <div className="relative max-w-[1280px] mx-auto px-6 pt-24 pb-28">
            {/* Top badge */}
            <div className="flex justify-center mb-8">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-primary/30 text-primary bg-primary/8">
                <span className="status-dot bg-primary" />
                Simulador WMS Educacional ativo
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-center text-5xl sm:text-6xl font-bold tracking-tight text-foreground text-balance leading-[1.1] mb-6">
              Gerencie um Centro de{" "}
              <br />
              <span>Distribuição real.</span>
            </h1>

            {/* Sub */}
            <p className="text-center text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10 text-pretty">
              LogiQ simula o fluxo completo de um armazém logístico — do recebimento à expedição — para aulas práticas de Logística e Supply Chain.
            </p>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors duration-150"
              >
                Entrar no Dashboard
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/recebimento"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-white/5 transition-colors duration-150"
              >
                Ver Recebimento
              </Link>
            </div>
          </div>

          {/* Bottom stripe line */}
          <div className="stripe-line" />
        </section>

        {/* Stats */}
        <section className="max-w-[1280px] mx-auto px-6 py-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-card px-8 py-7 text-center">
                {stat.value ? (
                  <p className="kpi-number text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                ) : null}
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features grid */}
        <section className="max-w-[1280px] mx-auto px-6 pb-16">
          <div className="mb-10">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Fluxo Logístico</p>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Quatro módulos. Um ciclo completo.
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feat) => {
              const Icon = feat.icon
              return (
                <Link
                  key={feat.href}
                  href={feat.href}
                  className={`group relative stripe-card-hover rounded-xl p-6 transition-all duration-200 ${feat.border} overflow-hidden`}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
                    style={{ background: `radial-gradient(ellipse 60% 40% at 30% 50%, ${feat.glow}, transparent)` }}
                  />

                  <div className="relative">
                    <div className={`w-10 h-10 rounded-lg stripe-card flex items-center justify-center mb-4 ${feat.color}`}>
                      <Icon size={18} />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-1.5">{feat.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                    <div className={`flex items-center gap-1 mt-4 text-xs font-semibold ${feat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                      Acessar módulo <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Gestao do turno row */}
        <section className="max-w-[1280px] mx-auto px-6 pb-20">
          <div className="divider mb-10" />
          <div className="grid grid-cols-3 gap-4">
            {[
              { href: "/dashboard", icon: Target, label: "Dashboard do Turno", desc: "KPIs globais, gargalos e status da equipe.", color: "text-primary" },
              { href: "/situacao", icon: Target, label: "Situação", desc: "Meta do turno, scores e desafios em andamento.", color: "text-red-400" },
              { href: "/equipe", icon: Users, label: "Equipe", desc: "Distribua papéis e adicione alunos à simulação.", color: "text-teal-400" },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group stripe-card-hover rounded-xl p-5 border-border/60 hover:border-border transition-all duration-200"
                >
                  <div className={`w-8 h-8 rounded-md stripe-card flex items-center justify-center mb-3 ${item.color}`}>
                    <Icon size={15} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{item.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${item.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    Acessar <ArrowRight size={11} />
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
