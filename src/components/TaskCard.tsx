import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { format, isPast, isToday, differenceInDays } from 'date-fns'
import { Calendar, Trash2, AlertTriangle, Clock } from 'lucide-react'
import type { TaskWithLabels } from '../types'
import { PRIORITY_CONFIG } from '../types'

interface Props {
  task: TaskWithLabels
  onOpen: (task: TaskWithLabels) => void
  onDelete: (taskId: string) => void
}

function DueDateBadge({ date, done }: { date: string; done: boolean }) {
  const d = new Date(date)
  const overdue = !done && isPast(d) && !isToday(d)
  const dueToday = !done && isToday(d)
  const dueSoon = !done && !overdue && !dueToday && differenceInDays(d, new Date()) <= 2

  let cls = 'text-slate-500'
  let Icon = Calendar
  if (overdue) { cls = 'text-red-400'; Icon = AlertTriangle }
  else if (dueToday) { cls = 'text-amber-400'; Icon = Clock }
  else if (dueSoon) { cls = 'text-amber-500'; Icon = Clock }
  if (done) { cls = 'text-slate-600' }

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${cls}`}>
      <Icon size={11} />
      {format(d, 'MMM d')}
    </span>
  )
}

export function TaskCard({ task, onOpen, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id })
  const pConf = PRIORITY_CONFIG[task.priority]

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(task.id)
  }

  // When dragging: hide the original so only the DragOverlay ghost is visible
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        className="bg-[#1a1a26] border border-indigo-500/30 rounded-xl p-3.5 opacity-40 h-[72px]"
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
      className="group relative bg-[#1a1a26] border border-white/[0.07] rounded-xl p-3.5
        cursor-grab active:cursor-grabbing select-none
        hover:border-white/[0.14] hover:bg-[#1e1e2e]
        transition-all duration-150
        shadow-[0_1px_3px_rgba(0,0,0,0.4)]
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
    >
      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100
          p-1 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-400/10
          transition-all duration-150 z-10"
        onPointerDown={e => e.stopPropagation()}
      >
        <Trash2 size={12} />
      </button>

      {/* Priority bar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
        style={{ backgroundColor: pConf.color }}
      />

      {/* Title */}
      <p className="text-sm font-medium text-slate-100 leading-snug pr-5 mb-2.5 pl-2">
        {task.title}
      </p>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-slate-500 pl-2 mb-2.5 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 pl-2 mb-2.5">
          {task.labels.map(label => (
            <span
              key={label.id}
              className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium"
              style={{
                backgroundColor: label.color + '22',
                color: label.color,
                border: `1px solid ${label.color}33`,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pl-2">
        <span
          className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium"
          style={{ backgroundColor: pConf.bg, color: pConf.textColor }}
        >
          {pConf.label}
        </span>
        <div className="flex items-center gap-2">
          {task.due_date && (
            <DueDateBadge date={task.due_date} done={task.status === 'done'} />
          )}
        </div>
      </div>
    </div>
  )
}