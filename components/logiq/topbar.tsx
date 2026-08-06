"use client"

import { useState } from "react"
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
  Menu,
} from "lucide-react"
import { TeamSelector } from "./team-selector"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 border-b border-border/60 bg-white/85 backdrop-blur-md">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs font-mono tracking-tight">LQ</span>
          </div>
          <span className="font-semibold text-foreground text-sm tracking-tight">LogiQ</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8 flex-1 min-w-0">
          {/* Divider */}
          <div className="w-px h-5 bg-border/60" />

          {/* Nav links */}
          <nav className="flex items-center gap-0.5 flex-1 min-w-0">
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
        </div>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <TeamSelector />
          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-primary text-xs font-bold">P</span>
          </div>
        </div>

        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              aria-label="Abrir menu de navegação"
            >
              <Menu size={18} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-sm p-0">
            <SheetHeader className="border-b border-border/60 pb-3">
              <SheetTitle>Navegação</SheetTitle>
              <SheetDescription>Acesse os módulos da simulação LogiQ.</SheetDescription>
            </SheetHeader>

            <nav className="px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="mt-auto border-t border-border/60 px-4 py-4">
              <TeamSelector />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
