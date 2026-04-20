import React from 'react'
import { CheckSquare, Clock, AlertCircle, Layers } from 'lucide-react'

interface Props {
  stats: {
    total: number
    done: number
    overdue: number
    inProgress: number
  }
}

function StatPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] rounded-lg border border-white/[0.06]">
      <Icon size={13} style={{ color }} />
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-xs font-semibold text-slate-200">{value}</span>
    </div>
  )
}

export function Header({ stats }: Props) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
          <Layers size={14} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-slate-100 leading-tight">My Board</h1>
          <p className="text-[11px] text-slate-500">Guest workspace</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2">
        <StatPill icon={Layers}       label="Total"       value={stats.total}      color="#94a3b8" />
        <StatPill icon={Clock}        label="In Progress" value={stats.inProgress} color="#3b82f6" />
        <StatPill icon={CheckSquare}  label="Done"        value={stats.done}       color="#10b981" />
        {stats.overdue > 0 && (
          <StatPill icon={AlertCircle} label="Overdue"    value={stats.overdue}    color="#ef4444" />
        )}
      </div>
    </header>
  )
}
