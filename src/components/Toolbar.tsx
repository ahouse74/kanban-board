import React from 'react'
import { Search, Plus, SlidersHorizontal } from 'lucide-react'
import type { Label } from '../types'

interface Props {
  searchQuery: string
  onSearchChange: (v: string) => void
  priorityFilter: string
  onPriorityChange: (v: string) => void
  labelFilter: string
  onLabelChange: (v: string) => void
  labels: Label[]
  onNewTask: () => void
}

export function Toolbar({
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
  labelFilter,
  onLabelChange,
  labels,
  onNewTask,
}: Props) {
  const hasFilters = searchQuery || priorityFilter || labelFilter

  return (
    <div className="flex items-center gap-3 px-6 py-3 border-b border-white/[0.06]">
      <div className="relative flex-1 max-w-xs">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search tasks…"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg pl-8 pr-3 py-1.5
            text-xs text-slate-200 placeholder-slate-600
            focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40
            transition-all"
        />
      </div>

      <div className="flex items-center gap-2">
        <SlidersHorizontal size={13} className="text-slate-500" />
        <select
          value={priorityFilter}
          onChange={e => onPriorityChange(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.07] rounded-lg px-2.5 py-1.5
            text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30
            transition-all cursor-pointer"
        >
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>

        {labels.length > 0 && (
          <select
            value={labelFilter}
            onChange={e => onLabelChange(e.target.value)}
            className="bg-white/[0.04] border border-white/[0.07] rounded-lg px-2.5 py-1.5
              text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30
              transition-all cursor-pointer"
          >
            <option value="">All labels</option>
            {labels.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        )}

        {hasFilters && (
          <button
            onClick={() => { onSearchChange(''); onPriorityChange(''); onLabelChange('') }}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors px-1"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-1" />

      <button
        onClick={onNewTask}
        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-400
          text-white text-xs font-semibold rounded-lg transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-lg shadow-indigo-500/20"
      >
        <Plus size={13} />
        New Task
      </button>
    </div>
  )
}
