import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    // 1. Try to resume an existing session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        setLoading(false)
        return
      }

      // 2. No session — create a new anonymous one
      const { data, error: signInError } = await supabase.auth.signInAnonymously()
      if (signInError) {
        setError('Could not create guest session: ' + signInError.message)
      } else {
        setUser(data.user)
      }
      setLoading(false)
    })

    // Keep in sync with auth state changes (e.g. tab refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading, error }
}
