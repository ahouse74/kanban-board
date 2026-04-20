import React from 'react'
import { Layers, AlertCircle } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30
          flex items-center justify-center animate-pulse">
          <Layers size={22} className="text-indigo-400" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-sm text-slate-500">Setting up your workspace…</p>
      </div>
    </div>
  )
}

export function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20
          flex items-center justify-center mx-auto">
          <AlertCircle size={22} className="text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-200">Something went wrong</h2>
        <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-lg p-4 text-left">
          <p className="text-xs font-medium text-slate-400 mb-2">Setup checklist:</p>
          <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
            <li>Copy <code className="text-indigo-400">.env.example</code> → <code className="text-indigo-400">.env</code></li>
            <li>Add your <code className="text-indigo-400">VITE_SUPABASE_URL</code></li>
            <li>Add your <code className="text-indigo-400">VITE_SUPABASE_ANON_KEY</code></li>
            <li>Run the SQL schema in Supabase SQL Editor</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
