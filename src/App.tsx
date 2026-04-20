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
    stats, createTask, updateTaskStatus, updateTask, deleteTask, createLabel,
  } = useTasks(user?.id)

  // UI state
  const [searchQuery, setSearchQuery]       = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [labelFilter, setLabelFilter]       = useState('')
  const [showCreate, setShowCreate]         = useState(false)
  const [createStatus, setCreateStatus]     = useState<Status>('todo')
  const [detailTask, setDetailTask]         = useState<TaskWithLabels | null>(null)

  if (authLoading || tasksLoading) return <LoadingScreen />
  if (authError)  return <ErrorScreen message={authError} />
  if (tasksError) return <ErrorScreen message={tasksError} />
  if (!user)      return <ErrorScreen message="No session found." />

  const handleAddTask = (status: string) => {
    setCreateStatus(status as Status)
    setShowCreate(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header stats={stats} />

      <Toolbar
        searchQuery={searchQuery}
        priorityFilter={priorityFilter}
        labelFilter={labelFilter}
        labels={labels}
        onSearch={setSearchQuery}
        onPriorityFilter={setPriorityFilter}
        onLabelFilter={setLabelFilter}
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
            await updateTask(id, updates, labelIds)
            // Refresh the open task from updated list
            setDetailTask(prev =>
              prev ? { ...prev, ...updates } : null
            )
          }}
          onDelete={(id) => {
            deleteTask(id)
            setDetailTask(null)
          }}
        />
      )}
    </div>
  )
}
