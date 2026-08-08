import { type LucideIcon } from "lucide-react"
import { Topbar } from "@/components/logiq/topbar"

interface PageShellProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  iconColor?: string
  badge?: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export function PageShell({
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  badge,
  children,
  actions,
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <div className="pt-20">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">

          {/* Page Header */}
          <header className="mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className={`w-9 h-9 rounded-lg stripe-card flex items-center justify-center ${iconColor}`}>
                    <Icon size={17} />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-xl font-semibold text-foreground tracking-tight">{title}</h1>
                    {badge && (
                      <span className="pill border-border text-muted-foreground bg-muted/40">
                        {badge}
                      </span>
                    )}
                  </div>
                  {subtitle && (
                    <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
                  )}
                </div>
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          </header>

          <main>{children}</main>
        </div>
      </div>
    </div>
  )
}
