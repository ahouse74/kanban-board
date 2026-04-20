// ─── Status & Priority ───────────────────────────────────────────────────────

export type Status = 'todo' | 'in_progress' | 'in_review' | 'done'
export type Priority = 'low' | 'normal' | 'high'

// ─── Core Models ─────────────────────────────────────────────────────────────

export interface Task {
  id: string
  title: string
  description?: string | null
  status: Status
  priority: Priority
  due_date?: string | null
  user_id: string
  created_at: string
  updated_at: string
  position: number
}

export interface Label {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
}

export interface TaskWithLabels extends Task {
  labels: Label[]
}

export interface Comment {
  id: string
  task_id: string
  content: string
  user_id: string
  created_at: string
}

export interface ActivityLog {
  id: string
  task_id: string
  action: string
  old_value?: string | null
  new_value?: string | null
  user_id: string
  created_at: string
}

// ─── Column Config ────────────────────────────────────────────────────────────

export interface ColumnConfig {
  id: Status
  label: string
  color: string
  dotColor: string
}

export const COLUMN_CONFIG: ColumnConfig[] = [
  { id: 'todo',        label: 'To Do',       color: 'rgba(148,163,184,0.12)', dotColor: '#64748b' },
  { id: 'in_progress', label: 'In Progress',  color: 'rgba(96,165,250,0.10)',  dotColor: '#3b82f6' },
  { id: 'in_review',   label: 'In Review',    color: 'rgba(245,158,11,0.10)',  dotColor: '#f59e0b' },
  { id: 'done',        label: 'Done',         color: 'rgba(52,211,153,0.10)',  dotColor: '#10b981' },
]

// ─── Priority Config ──────────────────────────────────────────────────────────

export interface PriorityConfig {
  label: string
  color: string
  bg: string
  textColor: string
}

export const PRIORITY_CONFIG: Record<Priority, PriorityConfig> = {
  high:   { label: 'High',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   textColor: '#fca5a5' },
  normal: { label: 'Normal', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  textColor: '#93c5fd' },
  low:    { label: 'Low',    color: '#64748b', bg: 'rgba(100,116,139,0.12)', textColor: '#94a3b8' },
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface CreateTaskInput {
  title: string
  description?: string
  priority: Priority
  due_date?: string
  status: Status
  labelIds?: string[]
}
