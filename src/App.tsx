import React, { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { Header } from './components/Header'
import { Toolbar } from './components/Toolbar'
import { Board } from './components/Board'
import { CreateTaskModal } from './components/CreateTaskModal'
import { TaskDetailModal } from './components/TaskDetailModal'
import { LoadingScreen, ErrorScreen } from './components/Screens'
import type { Status, TaskWithLabels } from './types'

export default function App() {
  const { user, loading: authLoading, error: authError } = useAuth()
  const {
    tasks, labels, loading: tasksLoading, error: tasksError,
    stats, createTask, updateTaskStatus, updateTask, deleteTask, createLabel, deleteLabel,
  } = useTasks(user?.id)

  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [labelFilter, setLabelFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [createStatus, setCreateStatus] = useState<Status>('todo')
  const [detailTask, setDetailTask] = useState<TaskWithLabels | null>(null)

  if (authLoading || tasksLoading) return <LoadingScreen />
  if (authError) return <ErrorScreen message={authError} />
  if (tasksError) return <ErrorScreen message={tasksError} />
  if (!user) return <ErrorScreen message="No session found." />

  const handleAddTask = (status: string) => {
    setCreateStatus(status as Status)
    setShowCreate(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header stats={stats} />

      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        labelFilter={labelFilter}
        onLabelChange={setLabelFilter}
        labels={labels}
        onNewTask={() => { setCreateStatus('todo'); setShowCreate(true) }}
      />

      <main className="flex-1 pt-6">
        <Board
          tasks={tasks}
          labels={labels}
          searchQuery={searchQuery}
          priorityFilter={priorityFilter}
          labelFilter={labelFilter}
          onUpdateStatus={updateTaskStatus}
          onOpenTask={setDetailTask}
          onDeleteTask={deleteTask}
          onAddTask={handleAddTask}
        />
      </main>

      {showCreate && (
        <CreateTaskModal
          initialStatus={createStatus}
          labels={labels}
          onClose={() => setShowCreate(false)}
          onCreate={createTask}
          onCreateLabel={createLabel}
        />
      )}

      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          labels={labels}
          userId={user.id}
          onClose={() => setDetailTask(null)}
          onUpdate={async (id, updates, labelIds) => {
            // If status changed, use the dedicated status update to keep positions and activity consistent
            const newStatus = (updates as any)?.status as Status | undefined
            if (newStatus && detailTask && detailTask.status !== newStatus) {
              // update status (optimistic) and log activity
              await updateTaskStatus(id, newStatus, detailTask.status)
              // remove status from field updates so we don't update it twice
              const { status, ...otherUpdates } = updates as any
              if (Object.keys(otherUpdates).length > 0 || labelIds !== undefined) {
                await updateTask(id, otherUpdates, labelIds)
              }
            } else {
              await updateTask(id, updates, labelIds)
            }

            setDetailTask(prev => prev ? { ...prev, ...updates } : null)
          }}
          onDelete={(id) => {
            deleteTask(id)
            setDetailTask(null)
          }}
          onDeleteLabel={deleteLabel}
        />
      )}
    </div>
  )
}