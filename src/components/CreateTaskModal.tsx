import React, { useEffect, useRef, useState } from 'react'
import { X, Tag, Plus } from 'lucide-react'
import type { CreateTaskInput, Label, Priority, Status, Task } from '../types'
import { COLUMN_CONFIG, PRIORITY_CONFIG } from '../types'

interface Props {
  initialStatus?: Status
  labels: Label[]
  onClose: () => void
  onCreate: (input: CreateTaskInput) => Promise<Task | null>
  onCreateLabel: (name: string, color: string) => Promise<Label | null>
}

const LABEL_COLORS = [
  '#6366f1', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6',
]

export function CreateTaskModal({ initialStatus = 'todo', labels, onClose, onCreate, onCreateLabel }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDesc] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [status, setStatus] = useState<Status>(initialStatus)
  const [dueDate, setDueDate] = useState('')
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  // New label creation inline
  const [showLabelForm, setShowLabelForm] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0])

  const titleRef = useRef<HTMLInputElement>(null)
  useEffect(() => { titleRef.current?.focus() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        due_date: dueDate || undefined,
        labelIds: selectedLabels,
      })
      onClose()
    } catch {
      setSubmitting(false)
    }
  }

  const toggleLabel = (id: string) => {
    setSelectedLabels(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    )
  }

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return
    const label = await onCreateLabel(newLabelName.trim(), newLabelColor)
    if (label) {
      setSelectedLabels(prev => [...prev, label.id])
      setNewLabelName('')
      setShowLabelForm(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <h2 className="text-base font-semibold text-slate-100">New Task</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <input
              ref={titleRef}
              type="text"
              placeholder="Task title…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="input-base text-base font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <textarea
              placeholder="Add a description…"
              value={description}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              className="input-base resize-none"
            />
          </div>

          {/* Row: Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as Status)}
                className="input-base"
              >
                {COLUMN_CONFIG.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="input-base"
              >
                {Object.entries(PRIORITY_CONFIG).map(([key, conf]) => (
                  <option key={key} value={key}>{conf.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="input-base"
            />
          </div>

          {/* Labels */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Labels</label>
            <div className="flex flex-wrap gap-1.5">
              {labels.map(label => {
                const selected = selectedLabels.includes(label.id)
                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => toggleLabel(label.id)}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium transition-all"
                    style={{
                      backgroundColor: selected ? label.color + '33' : label.color + '11',
                      color: label.color,
                      border: `1px solid ${selected ? label.color + '66' : label.color + '22'}`,
                      boxShadow: selected ? `0 0 0 1px ${label.color}44` : 'none',
                    }}
                  >
                    {label.name}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => setShowLabelForm(!showLabelForm)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-500
                  border border-white/[0.08] hover:text-slate-300 hover:border-white/[0.15] transition-colors"
              >
                <Tag size={10} /> <Plus size={9} />
              </button>
            </div>

            {showLabelForm && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Label name"
                  value={newLabelName}
                  onChange={e => setNewLabelName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleCreateLabel())}
                  className="input-base flex-1 text-xs py-1.5"
                />
                <div className="flex gap-1">
                  {LABEL_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewLabelColor(c)}
                      className="w-5 h-5 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: c,
                        borderColor: newLabelColor === c ? 'white' : 'transparent',
                      }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCreateLabel}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium whitespace-nowrap"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
