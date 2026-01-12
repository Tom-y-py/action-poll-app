'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface AdminProps {
  eventId: string
  adminSecret: string
  topDates: { date: string; count: number }[]
  currentDecidedDate: string | null
}

export function AdminControls({ eventId, adminSecret, topDates, currentDecidedDate }: AdminProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  // Detect admin mode
  useEffect(() => {
    const check = () => setIsAdmin(window.location.hash.includes(`admin=${adminSecret}`))
    setTimeout(check, 0)
    window.addEventListener('hashchange', check)
    return () => window.removeEventListener('hashchange', check)
  }, [adminSecret])

  const handleUpdateDate = async (date: string) => {
    setIsUpdating(true)

    const dateValue = (date === 'clear' || date === '') ? null : date

    const { error } = await supabase
      .from('events')
      .update({ decided_date: dateValue })
      .eq('id', eventId)

    if (error) {
      alert("Failed to update date: " + error.message)
    } else {
      router.refresh()
    }

    setIsUpdating(false)
  }

  const handleDelete = async () => {
    if (!confirm("🚨 Delete this event forever?")) return
    const { error } = await supabase.from('events').delete().eq('id', eventId)
    if (!error) router.push('/')
  }

  if (!isAdmin) return null

  return (
    <>
      {/* Orange top bar */}
      <div className="fixed top-0 left-0 w-full z-[100] h-1 bg-orange-500" />

      {/* HUD Panel */}
      <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-right-8">
        <div className="bg-slate-900 border-2 border-slate-800 p-3 shadow-2xl rounded-none">

          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="font-mono text-[9px] text-orange-500 font-bold tracking-widest leading-none">
              ADMIN_HUD<br />STATUS: ACTIVE
            </div>

            <button
              onClick={handleDelete}
              className="text-slate-500 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Date Selector */}
          <div className="mt-3">
            <select
              disabled={isUpdating}
              onChange={(e) => handleUpdateDate(e.target.value)}
              className="bg-slate-800 border-none text-[10px] font-mono font-bold text-white uppercase p-2 w-full focus:ring-1 focus:ring-orange-500"
            >
              <option value="">-- SET FINAL DATE --</option>

              {topDates.map((d) => (
                <option key={d.date} value={d.date}>
                  {format(parseISO(d.date), 'MMM do')} ({d.count} free)
                </option>
              ))}

              {currentDecidedDate && (
                <option value="clear">❌ CLEAR FINAL DATE</option>
              )}
            </select>
          </div>

        </div>
      </div>
    </>
  )
}
