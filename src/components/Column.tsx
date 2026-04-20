import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { TaskCard } from './TaskCard'
import type { ColumnConfig, TaskWithLabels } from '../types'

interface Props {
  column: ColumnConfig
  tasks: TaskWithLabels[]
  onOpenTask: (task: TaskWithLabels) => void
  onDeleteTask: (taskId: string) => void
  onAddTask: (status: string) => void
}

export function Column({ column, tasks, onOpenTask, onDeleteTask, onAddTask }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: column.dotColor }}
          />
          <span className="text-sm font-semibold text-slate-300">{column.label}</span>
          <span className="text-xs text-slate-500 bg-white/5 px-1.5 py-0.5 rounded-md font-medium">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
          title={`Add task to ${column.label}`}
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 flex flex-col gap-2 rounded-xl p-2 min-h-[120px]
          transition-all duration-150
          ${isOver
            ? 'ring-2 ring-indigo-500/40 bg-indigo-500/5'
            : 'bg-white/[0.02] border border-white/[0.04]'
          }
        `}
      >
        {tasks.length === 0 && !isOver && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-slate-600 text-center py-8">
              Drop tasks here<br />or click + to add
            </p>
          </div>
        )}

        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onOpen={onOpenTask}
            onDelete={onDeleteTask}
          />
        ))}
      </div>
    </div>
  )
}
