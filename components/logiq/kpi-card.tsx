import { type LucideIcon } from "lucide-react"

interface KpiCardProps {
  label: string
  value: string | number
  unit?: string
  change?: string
  changeType?: "up" | "down" | "neutral"
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  shadowClass?: string
  description?: string
}

export function KpiCard({
  label,
  value,
  unit,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-violet-600",
  iconBg = "bg-violet-50",
  shadowClass = "shadow-float",
  description,
}: KpiCardProps) {
  const changeColors = {
    up: "text-emerald-600 bg-emerald-50",
    down: "text-red-500 bg-red-50",
    neutral: "text-muted-foreground bg-muted",
  }

  return (
    <div className={`glass rounded-2xl p-5 ${shadowClass} hover-lift group cursor-default`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center ${iconColor} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={18} />
        </div>
        {change && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${changeColors[changeType]}`}>
            {change}
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="kpi-number text-3xl font-bold text-foreground">
          {value}
          {unit && <span className="text-lg font-medium text-muted-foreground ml-1">{unit}</span>}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}
