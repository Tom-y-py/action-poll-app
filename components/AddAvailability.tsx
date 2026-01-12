'use client'

import { useState, useEffect } from 'react'
import { format, isSameMonth, parseISO, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import { getCalendarDays, cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Event {
  id: string;
  title: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
}

interface AddAvailabilityProps {
  event: Event;
  initialMonthStr?: string; // e.g. "2024-06"
}

export function AddAvailability({ event, initialMonthStr }: AddAvailabilityProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Calculate all months between start and end date
  const monthsInRange = eachMonthOfInterval({
    start: startOfMonth(parseISO(event.start_date)),
    end: endOfMonth(parseISO(event.end_date))
  })

  // Auto-scroll to the correct month when modal opens
  useEffect(() => {
    if (isOpen && initialMonthStr) {
      const el = document.getElementById(`modal-month-${initialMonthStr}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [isOpen, initialMonthStr])

  const toggleDate = (dateStr: string) => {
    setSelectedDates(prev =>
      prev.includes(dateStr)
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr]
    )
  }

  const handleSubmit = async () => {
    if (!name || selectedDates.length === 0) {
      alert('Please enter your name and select at least one date.')
      return
    }

    setIsSubmitting(true)
    const { error } = await supabase
      .from('availability')
      .insert([{ event_id: event.id, name, dates: selectedDates }])

    if (!error) {
      setIsOpen(false)
      setName('')
      setSelectedDates([])
      router.refresh()
    } else {
      alert('Failed to save availability.')
    }
    setIsSubmitting(false)
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xs px-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-slate-900 text-white py-4 rounded-full shadow-2xl font-bold hover:scale-105 transition-transform active:scale-95"
        >
          + Add Your Availability
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Select your dates</h2>
          <p className="text-sm text-slate-500">Pick all days you are free to meet.</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Name</label>
            <input
              type="text"
              placeholder="e.g. Alex Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
            />
          </div>

          <div className="space-y-10">
            {monthsInRange.map((monthDate) => {
              const monthStr = format(monthDate, 'yyyy-MM')
              const days = getCalendarDays(monthStr)

              return (
                <div
                  key={monthStr}
                  id={`modal-month-${monthStr}`}
                  className="space-y-4"
                >
                  <h3 className="font-bold text-slate-800 px-1">
                    {format(monthDate, 'MMMM yyyy')}
                  </h3>

                  <div className="grid grid-cols-7 gap-1">
                    {['M','T','W','T','F','S','S'].map(d => (
                      <div key={d} className="text-[10px] font-bold text-slate-300 text-center pb-2">{d}</div>
                    ))}

                    {days.map((day) => {
                      const dateStr = format(day, 'yyyy-MM-dd')
                      const isSelected = selectedDates.includes(dateStr)
                      const isCurrentMonth = isSameMonth(day, monthDate)

                      if (!isCurrentMonth) return <div key={dateStr} />

                      return (
                        <button
                          key={dateStr}
                          type="button"
                          onClick={() => toggleDate(dateStr)}
                          className={cn(
                            "aspect-square rounded-xl text-sm transition-all flex items-center justify-center relative",
                            isSelected
                              ? "bg-emerald-600 text-white font-bold scale-90"
                              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          {format(day, 'd')}
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-in fade-in" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50 rounded-b-3xl">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 py-4 font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-4 font-bold bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50 active:scale-95"
          >
            {isSubmitting ? 'Saving...' : `Submit (${selectedDates.length} days)`}
          </button>
        </div>
      </div>
    </div>
  )
}
