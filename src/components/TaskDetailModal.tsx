import React, { useRef, useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  X, Calendar, Flag, Tag, MessageSquare,
  ChevronDown, Save, Trash2, History, XCircle,
} from 'lucide-react'
import type { TaskWithLabels, Label, Priority, Status } from '../types'
import { COLUMN_CONFIG, PRIORITY_CONFIG } from '../types'
import { useTaskDetail } from '../hooks/useTaskDetail'

interface Props {
  task: TaskWithLabels
  labels: Label[]
  userId: string
  onClose: () => void
  onUpdate: (taskId: string, updates: any, labelIds?: string[]) => Promise<void>
  onDelete: (taskId: string) => void
  onDeleteLabel: (labelId: string) => void
}

function ActivityItem({ action, oldValue, newValue, createdAt }: {
  action: string; oldValue?: string | null; newValue?: string | null; createdAt: string
}) {
  const ago = formatDistanceToNow(new Date(createdAt), { addSuffix: true })
  const statusLabels: Record<string, string> = {
    todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done'
  }
  const description = action === 'created'
    ? 'Task created'
    : action === 'status_changed'
      ? `Moved ${statusLabels[oldValue ?? ''] ?? oldValue} → ${statusLabels[newValue ?? ''] ?? newValue}`
      : action

  return (
    <div className="flex items-start gap-2.5 text-xs">
      <div className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0 mt-1.5" />
      <div>
        <span className="text-slate-300">{description}</span>
        <span className="text-slate-600 ml-2">{ago}</span>
      </div>
    </div>
  )
}

export function TaskDetailModal({ task, labels, userId, onClose, onUpdate, onDelete, onDeleteLabel }: Props) {
  const { comments, activity, submitting, addComment } = useTaskDetail(task.id, userId)

  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDesc] = useState(task.description ?? '')
  const [priority, setPriority] = useState<Priority>(task.priority)
  const [status, setStatus] = useState<Status>(task.status)
  const [dueDate, setDueDate] = useState(task.due_date ?? '')
  const [selectedLabels, setSelLabels] = useState<string[]>(task.labels.map(l => l.id))
  const [comment, setComment] = useState('')
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments')
  const [saving, setSaving] = useState(false)

  const titleRef = useRef<HTMLTextAreaElement>(null)

  const handleSave = async () => {
    setSaving(true)
    await onUpdate(
      task.id,
      { title, description: description || null, priority, status, due_date: dueDate || null },
      selectedLabels
    )
    setSaving(false)
    setEditing(false)
      // Blur all focused elements so the card doesn't stay highlighted
      ; (document.activeElement as HTMLElement)?.blur()
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    await addComment(comment)
    setComment('')
  }

  const toggleLabel = (id: string) => {
    setSelLabels(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id])
    if (!editing) setEditing(true)
  }

  const handleDeleteLabel = (e: React.MouseEvent, labelId: string) => {
    e.stopPropagation()
    setSelLabels(prev => prev.filter(id => id !== labelId))
    onDeleteLabel(labelId)
  }

  const pConf = PRIORITY_CONFIG[priority]

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] shrink-0">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
            style={{ backgroundColor: pConf.bg, color: pConf.textColor }}
          >
            {pConf.label}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { onDelete(task.id); onClose() }}
              className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              title="Delete task"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Title */}
            <textarea
              ref={titleRef}
              value={title}
              onChange={e => { setTitle(e.target.value); setEditing(true) }}
              rows={2}
              className="w-full bg-transparent text-lg font-semibold text-slate-100
                resize-none border-none outline-none focus:ring-0 placeholder-slate-600 leading-snug"
              placeholder="Task title"
            />

            {/* Description */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5">Description</p>
              <textarea
                value={description}
                onChange={e => { setDesc(e.target.value); setEditing(true) }}
                rows={4}
                placeholder="Add a description…"
                className="input-base resize-none text-sm"
              />
            </div>

            {/* Labels */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1">
                <Tag size={11} /> Labels
                <span className="text-slate-600 ml-1 font-normal">(click to toggle · × to delete)</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {labels.map(label => {
                  const selected = selectedLabels.includes(label.id)
                  return (
                    <div key={label.id} className="relative group/label">
                      <button
                        type="button"
                        onClick={() => toggleLabel(label.id)}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium transition-all pr-5"
                        style={{
                          backgroundColor: selected ? label.color + '33' : label.color + '11',
                          color: label.color,
                          border: `1px solid ${selected ? label.color + '66' : label.color + '22'}`,
                        }}
                      >
                        {label.name}
                      </button>
                      {/* Delete label button */}
                      <button
                        type="button"
                        onClick={e => handleDeleteLabel(e, label.id)}
                        className="absolute right-0.5 top-1/2 -translate-y-1/2
                          opacity-0 group-hover/label:opacity-100
                          text-slate-600 hover:text-red-400 transition-all p-0.5"
                        title="Delete this label"
                      >
                        <XCircle size={11} />
                      </button>
                    </div>
                  )
                })}
                {labels.length === 0 && (
                  <p className="text-xs text-slate-600">No labels yet — create one when making a task.</p>
                )}
              </div>
            </div>

            {/* Save bar */}
            {editing && (
              <div className="flex justify-end gap-2 pt-1 border-t border-white/[0.06]">
                <button
                  onClick={() => {
                    setEditing(false)
                    setTitle(task.title)
                    setDesc(task.description ?? '')
                  }}
                  className="btn-ghost text-xs"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 btn-primary text-xs disabled:opacity-50"
                >
                  <Save size={12} /> {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            )}

            {/* Tabs: Comments & Activity */}
            <div className="border-t border-white/[0.06] pt-5">
              <div className="flex gap-1 mb-4">
                {(['comments', 'activity'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === tab
                        ? 'bg-white/[0.08] text-slate-200'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                      }`}
                  >
                    {tab === 'comments' ? <MessageSquare size={11} /> : <History size={11} />}
                    {tab === 'comments' ? 'Comments' : 'Activity'}
                  </button>
                ))}
              </div>

              {activeTab === 'comments' ? (
                <div className="space-y-3">
                  {comments.length === 0 && (
                    <p className="text-xs text-slate-600 py-4 text-center">No comments yet.</p>
                  )}
                  {comments.map(c => (
                    <div key={c.id} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                      <p className="text-sm text-slate-200 leading-relaxed">{c.content}</p>
                      <p className="text-xs text-slate-600 mt-1.5">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                  <form onSubmit={handleSubmitComment} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Write a comment…"
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      className="input-base flex-1 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={submitting || !comment.trim()}
                      className="btn-primary disabled:opacity-50 text-xs px-3"
                    >
                      {submitting ? '…' : 'Post'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activity.length === 0 && (
                    <p className="text-xs text-slate-600 py-4 text-center">No activity yet.</p>
                  )}
                  {activity.map(a => (
                    <ActivityItem
                      key={a.id}
                      action={a.action}
                      oldValue={a.old_value}
                      newValue={a.new_value}
                      createdAt={a.created_at}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-52 shrink-0 border-l border-white/[0.06] p-4 space-y-5 overflow-y-auto">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1">
                <ChevronDown size={11} /> Status
              </p>
              <select
                value={status}
                onChange={e => { setStatus(e.target.value as Status); setEditing(true) }}
                className="dark-select w-full"
              >
                {COLUMN_CONFIG.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1">
                <Flag size={11} /> Priority
              </p>
              <select
                value={priority}
                onChange={e => { setPriority(e.target.value as Priority); setEditing(true) }}
                className="dark-select w-full"
              >
                {Object.entries(PRIORITY_CONFIG).map(([key, conf]) => (
                  <option key={key} value={key}>{conf.label}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1">
                <Calendar size={11} /> Due Date
              </p>
              <input
                type="date"
                value={dueDate}
                onChange={e => { setDueDate(e.target.value); setEditing(true) }}
                className="input-base text-xs"
              />
            </div>

            <div className="pt-2 border-t border-white/[0.06]">
              <p className="text-xs text-slate-500">Created</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {format(new Date(task.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}