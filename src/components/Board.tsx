import React, { useMemo, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { Column } from './Column'
import { TaskCard } from './TaskCard'
import { COLUMN_CONFIG } from '../types'
import type { Status, TaskWithLabels, Label } from '../types'

interface Props {
  tasks: TaskWithLabels[]
  labels: Label[]
  searchQuery: string
  priorityFilter: string
  labelFilter: string
  onUpdateStatus: (taskId: string, newStatus: Status, oldStatus: Status) => void
  onOpenTask: (task: TaskWithLabels) => void
  onDeleteTask: (taskId: string) => void
  onAddTask: (status: string) => void
}

export function Board({
  tasks,
  searchQuery,
  priorityFilter,
  labelFilter,
  onUpdateStatus,
  onOpenTask,
  onDeleteTask,
  onAddTask,
}: Props) {
  const [activeTask, setActiveTask] = useState<TaskWithLabels | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = !q ||
        task.title.toLowerCase().includes(q) ||
        (task.description ?? '').toLowerCase().includes(q)
      const matchesPriority = !priorityFilter || task.priority === priorityFilter
      const matchesLabel = !labelFilter ||
        task.labels.some(l => l.id === labelFilter)
      return matchesSearch && matchesPriority && matchesLabel
    })
  }, [tasks, searchQuery, priorityFilter, labelFilter])

  const handleDragStart = ({ active }: DragStartEvent) => {
    const task = tasks.find(t => t.id === active.id)
    setActiveTask(task ?? null)
  }

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveTask(null)
    if (!over) return

    const taskId  = active.id as string
    const task    = tasks.find(t => t.id === taskId)
    if (!task) return

    // over.id is either a column id or a task id
    const overId     = over.id as string
    const isColumn   = COLUMN_CONFIG.some(c => c.id === overId)
    const newStatus  = isColumn
      ? (overId as Status)
      : (tasks.find(t => t.id === overId)?.status ?? task.status)

    if (task.status !== newStatus) {
      onUpdateStatus(taskId, newStatus, task.status)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-5 px-6 pb-8 overflow-x-auto min-h-[calc(100vh-160px)]">
        {COLUMN_CONFIG.map(col => (
          <Column
            key={col.id}
            column={col}
            tasks={filteredTasks.filter(t => t.status === col.id)}
            onOpenTask={onOpenTask}
            onDeleteTask={onDeleteTask}
            onAddTask={onAddTask}
          />
        ))}
      </div>

      {/* Ghost card while dragging */}
      <DragOverlay dropAnimation={null}>
        {activeTask && (
          <div className="rotate-2 scale-105 opacity-90">
            <TaskCard
              task={activeTask}
              isDragging
              onOpen={() => {}}
              onDelete={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
