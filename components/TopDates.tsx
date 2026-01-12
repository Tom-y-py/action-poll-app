'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

interface TopDateProps {
  dateMap: Record<string, string[]>;
  topDates: { date: string; count: number }[];
  decidedDate: string | null;
}

export function TopDates({ dateMap, topDates, decidedDate }: TopDateProps) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null)

  if (topDates.length === 0) return <p className="text-slate-400 italic">No responses yet.</p>

  return (
    <div className="space-y-3">
      {topDates.map((item) => {
        const isExpanded = expandedDate === item.date
        const names = dateMap[item.date] || []
        const isDecided = decidedDate === item.date

        return (
          <div key={item.date}>
            <button
              onClick={() => setExpandedDate(isExpanded ? null : item.date)}
              className={cn(
                "w-full flex items-center justify-between p-4 bg-white border rounded-xl transition-all",
                isDecided ? "border-amber-500 bg-amber-50" : "border-slate-200"
              )}
            >
              <span className="font-semibold text-slate-700">
                {format(parseISO(item.date), 'EEEE, MMM do')}
              </span>
              <span className={cn(
                "font-bold px-3 py-1 rounded-full text-sm",
                isDecided ? "bg-amber-200 text-amber-900" : "bg-emerald-50 text-emerald-700"
              )}>
                {item.count} free
              </span>
            </button>

            {isExpanded && (
              <div className="mt-2 p-4 bg-slate-50 border rounded-xl animate-in slide-in-from-top-2">
                <div className="flex flex-wrap gap-2">
                  {names.map((n, i) => (
                    <span key={i} className="px-2 py-1 bg-white border rounded text-sm">{n}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}