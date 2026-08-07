"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Truck,
  Package,
  ScanBarcode,
  PackageCheck,
  LayoutDashboard,
  Target,
  Users,
  Brain,
} from "lucide-react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { TeamSelector } from "@/components/logiq/team-selector";
import { useEquipe } from "@/hooks/use-equipe";

export default function ResizableNavbarDemo() {
  const pathname = usePathname();
  const { equipeId } = useEquipe();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    setIsFlashing(true);
    const timer = setTimeout(() => {
      setIsFlashing(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [pathname]);

  const navItems = [
    { name: equipeId ? "Dashboard" : "Visão Geral", link: equipeId ? "/dashboard" : "/visao-geral", icon: LayoutDashboard },
    { name: "Recebimento", link: "/recebimento", icon: Truck },
    { name: "Estoque", link: "/estoque", icon: Package },
    { name: "Picking", link: "/picking", icon: ScanBarcode },
    { name: "Expedição", link: "/expedicao", icon: PackageCheck },
    { name: "Equipe", link: "/equipe", icon: Users },
    { name: "Quiz", link: "/quiz", icon: Brain },
  ];

  const isLoginPage = pathname === "/login";
  const showGlow = isLoginPage || isFlashing;

  return (
    <Navbar className="fixed top-0 inset-x-0 z-50 w-full pt-3 px-4">
      {/* Desktop Navigation */}
      <NavBody className={`transition-all duration-300 ${
        showGlow
          ? "bg-white/95 border-2 border-blue-500/80 shadow-[0_0_30px_rgba(59,130,246,0.35)] ring-2 ring-blue-400/40 scale-[1.005]"
          : "bg-background/80 border-border/80 shadow-xs"
      }`}>
        <NavbarLogo />

        <NavItems items={navItems} activeHref={pathname} />

        <div className="flex items-center gap-3 shrink-0">
          <TeamSelector />
          <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold shadow-2xs">
            P
          </div>
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav className={`transition-all duration-300 ${
        showGlow
          ? "bg-white/95 border-2 border-blue-500/80 shadow-[0_0_30px_rgba(59,130,246,0.35)] ring-2 ring-blue-400/40"
          : "bg-background/90 border-border/80 shadow-xs"
      }`}>
        <MobileNavHeader>
          <NavbarLogo />
          <div className="flex items-center gap-2">
            <TeamSelector />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          <div className="flex flex-col w-full gap-1">
            {navItems.map((item, idx) => {
              const isActive = pathname === item.link;
              const Icon = item.icon;
              return (
                <Link
                  key={`mobile-link-${idx}`}
                  href={item.link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
          <div className="w-full pt-4 border-t border-border flex items-center justify-between mt-2">
            <span className="text-sm text-muted-foreground font-medium">Perfil</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground">Professor / Aluno</span>
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold">
                P
              </div>
            </div>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}

