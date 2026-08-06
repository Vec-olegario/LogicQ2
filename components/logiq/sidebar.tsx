"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Truck,
  Package,
  ScanBarcode,
  PackageCheck,
  Target,
  Users,
  BarChart3,
  ChevronRight,
} from "lucide-react"

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  {
    label: "Recebimento",
    href: "/recebimento",
    icon: Truck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    label: "Estoque",
    href: "/estoque",
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    label: "Picking",
    href: "/picking",
    icon: ScanBarcode,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  {
    label: "Expedição",
    href: "/expedicao",
    icon: PackageCheck,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  {
    label: "Situação",
    href: "/situacao",
    icon: Target,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  {
    label: "Equipe",
    href: "/equipe",
    icon: Users,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
  },
  {
    label: "Dashboard Turno",
    href: "/dashboard-turno",
    icon: BarChart3,
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 w-64 z-50 glass shadow-float-lg border-r border-white/60 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border/40">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm font-mono">LQ</span>
          </div>
          <div>
            <span className="font-bold text-foreground tracking-tight text-lg">LogiQ</span>
            <span className="block text-[10px] text-muted-foreground font-medium uppercase tracking-widest -mt-0.5">Simulador WMS</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? `${item.bg} ${item.color} ${item.border} border shadow-sm`
                  : "text-muted-foreground hover:bg-white/70 hover:text-foreground hover:shadow-sm"
              }`}
            >
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                isActive ? `bg-white/80 ${item.color}` : "bg-transparent group-hover:bg-white/60"
              }`}>
                <Icon size={15} />
              </span>
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={13} className="opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border/40">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-white/40">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">P</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">Professor</p>
            <p className="text-[10px] text-muted-foreground">Turno Ativo</p>
          </div>
          <div className="status-dot bg-emerald-400" />
        </div>
      </div>
    </aside>
  )
}
