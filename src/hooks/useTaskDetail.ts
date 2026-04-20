import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Comment, ActivityLog } from '../types'

export function useTaskDetail(taskId: string | null, userId: string | undefined) {
  const [comments, setComments]     = useState<Comment[]>([])
  const [activity, setActivity]     = useState<ActivityLog[]>([])
  const [loading, setLoading]       = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchDetail = useCallback(async () => {
    if (!taskId) return
    setLoading(true)

    const [commentsRes, activityRes] = await Promise.all([
      supabase
        .from('comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true }),
      supabase
        .from('activity_log')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    if (commentsRes.data) setComments(commentsRes.data)
    if (activityRes.data) setActivity(activityRes.data)
    setLoading(false)
  }, [taskId])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const addComment = async (content: string) => {
    if (!taskId || !userId || !content.trim()) return
    setSubmitting(true)

    const { data, error } = await supabase
      .from('comments')
      .insert({ task_id: taskId, content: content.trim(), user_id: userId })
      .select()
      .single()

    if (!error && data) {
      setComments(prev => [...prev, data])
    }
    setSubmitting(false)
  }

  return { comments, activity, loading, submitting, addComment, refetch: fetchDetail }
}
