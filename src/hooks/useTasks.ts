import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Task, TaskWithLabels, Label, Status, Priority, CreateTaskInput } from '../types'

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks]   = useState<TaskWithLabels[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchTasks = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    const { data, error: fetchError } = await supabase
      .from('tasks')
      .select(`
        *,
        task_labels (
          labels ( * )
        )
      `)
      .eq('user_id', userId)
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      const mapped: TaskWithLabels[] = (data ?? []).map((row: any) => ({
        ...row,
        labels: (row.task_labels ?? [])
          .map((tl: any) => tl.labels)
          .filter(Boolean),
      }))
      setTasks(mapped)
      setError(null)
    }
    setLoading(false)
  }, [userId])

  const fetchLabels = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('labels')
      .select('*')
      .eq('user_id', userId)
      .order('name')
    if (data) setLabels(data)
  }, [userId])

  useEffect(() => {
    fetchTasks()
    fetchLabels()
  }, [fetchTasks, fetchLabels])

  // ─── Create Task ─────────────────────────────────────────────────────────────

  const createTask = async (input: CreateTaskInput): Promise<Task | null> => {
    if (!userId) return null

    const position = tasks.filter(t => t.status === input.status).length

    const { data, error: insertError } = await supabase
      .from('tasks')
      .insert({
        title:       input.title,
        description: input.description || null,
        priority:    input.priority,
        due_date:    input.due_date || null,
        status:      input.status,
        user_id:     userId,
        position,
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Attach labels
    if (input.labelIds && input.labelIds.length > 0 && data) {
      await supabase.from('task_labels').insert(
        input.labelIds.map(labelId => ({ task_id: data.id, label_id: labelId }))
      )
    }

    // Log creation
    if (data) {
      await logActivity(data.id, 'created', undefined, input.status)
    }

    await fetchTasks()
    return data
  }

  // ─── Update Status (drag & drop) ─────────────────────────────────────────────

  const updateTaskStatus = async (taskId: string, newStatus: Status, oldStatus: Status) => {
    // Optimistic update
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    )

    const { error: updateError } = await supabase
      .from('tasks')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', taskId)

    if (updateError) {
      // Rollback
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, status: oldStatus } : t)
      )
      throw updateError
    }

    await logActivity(taskId, 'status_changed', oldStatus, newStatus)
  }

  // ─── Update Task Fields ───────────────────────────────────────────────────────

  const updateTask = async (
    taskId: string,
    updates: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'due_date'>>,
    labelIds?: string[]
  ) => {
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', taskId)

    if (updateError) throw updateError

    if (labelIds !== undefined) {
      await supabase.from('task_labels').delete().eq('task_id', taskId)
      if (labelIds.length > 0) {
        await supabase.from('task_labels').insert(
          labelIds.map(labelId => ({ task_id: taskId, label_id: labelId }))
        )
      }
    }

    await fetchTasks()
  }

  // ─── Delete Task ──────────────────────────────────────────────────────────────

  const deleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId)) // optimistic
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
    if (deleteError) {
      await fetchTasks() // rollback
      throw deleteError
    }
  }

  // ─── Labels ───────────────────────────────────────────────────────────────────

  const createLabel = async (name: string, color: string): Promise<Label | null> => {
    if (!userId) return null
    const { data, error: insertError } = await supabase
      .from('labels')
      .insert({ name, color, user_id: userId })
      .select()
      .single()
    if (insertError) throw insertError
    if (data) setLabels(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  // ─── Activity Log Helper ──────────────────────────────────────────────────────

  const logActivity = async (
    taskId: string,
    action: string,
    oldValue?: string,
    newValue?: string
  ) => {
    if (!userId) return
    await supabase.from('activity_log').insert({
      task_id:   taskId,
      action,
      old_value: oldValue ?? null,
      new_value: newValue ?? null,
      user_id:   userId,
    })
  }

  // ─── Stats ────────────────────────────────────────────────────────────────────

  const stats = {
    total:     tasks.length,
    done:      tasks.filter(t => t.status === 'done').length,
    overdue:   tasks.filter(t => {
      if (!t.due_date || t.status === 'done') return false
      return new Date(t.due_date) < new Date()
    }).length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
  }

  return {
    tasks,
    labels,
    loading,
    error,
    stats,
    createTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
    createLabel,
    refetch: fetchTasks,
  }
}
