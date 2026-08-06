"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Truck,
  Package,
  ScanBarcode,
  PackageCheck,
  LayoutDashboard,
  Target,
  Users,
} from "lucide-react"
import { TeamSelector } from "./team-selector"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Recebimento", href: "/recebimento", icon: Truck },
  { label: "Estoque", href: "/estoque", icon: Package },
  { label: "Picking", href: "/picking", icon: ScanBarcode },
  { label: "Expedição", href: "/expedicao", icon: PackageCheck },
  { label: "Situação", href: "/situacao", icon: Target },
  { label: "Equipe", href: "/equipe", icon: Users },
]

export function Topbar() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 border-b border-border/60 bg-white/85 backdrop-blur-md">
      <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center gap-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs font-mono tracking-tight">LQ</span>
          </div>
          <span className="font-semibold text-foreground text-sm tracking-tight">LogiQ</span>
        </Link>

        {/* Divider */}
        <div className="w-px h-5 bg-border/60" />

        {/* Nav links */}
        <nav className="flex items-center gap-0.5 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon size={13} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          <TeamSelector />
          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-primary text-xs font-bold">P</span>
          </div>
        </div>
      </div>
    </header>
  )
}
