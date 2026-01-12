import { supabase } from '@/lib/supabase'
import { createEvent } from './actions'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  // Fetch existing events (limiting to 10 for the MVP)
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
        
        {/* Left Column: Create Event */}
        <section className="space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Meetup Planner
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Coordinate dates with your team instantly.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-bold mb-6 text-slate-800">Create New Event</h2>

            <form action={createEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">
                  Event Title
                </label>
                <input
                  required
                  name="title"
                  type="text"
                  placeholder="Summer Barbecue"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">
                    Start Date
                  </label>
                  <input
                    required
                    name="start_date"
                    type="date"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">
                    End Date
                  </label>
                  <input
                    required
                    name="end_date"
                    type="date"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                Generate Link
              </button>
            </form>
          </div>
        </section>

        {/* Right Column: Existing Events */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] pt-4">
            Recent Events
          </h2>

          <div className="space-y-3">
            {events && events.length > 0 ? (
              events.map((event) => {
                const isClosed = !!event.decided_date

                return (
                  <Link
                    key={event.id}
                    href={`/event/${event.id}`}
                    className={cn(
                      'block p-5 border rounded-2xl transition-all group relative overflow-hidden',
                      isClosed
                        ? 'bg-amber-50/50 border-amber-200 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-md'
                    )}
                  >
                    {isClosed && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                        Confirmed
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div>
                        <h3
                          className={cn(
                            'font-bold transition-colors',
                            isClosed
                              ? 'text-amber-900'
                              : 'text-slate-800 group-hover:text-emerald-700'
                          )}
                        >
                          {event.title}
                        </h3>

                        <p
                          className={cn(
                            'text-sm font-medium',
                            isClosed ? 'text-amber-700' : 'text-slate-500'
                          )}
                        >
                          {isClosed ? (
                            <span className="flex items-center gap-1">
                              📍{' '}
                              {format(
                                parseISO(event.decided_date),
                                'MMMM do, yyyy'
                              )}
                            </span>
                          ) : (
                            `${format(
                              parseISO(event.start_date),
                              'MMM d'
                            )} – ${format(
                              parseISO(event.end_date),
                              'MMM d, yyyy'
                            )}`
                          )}
                        </p>
                      </div>

                      <span
                        className={
                          isClosed
                            ? 'text-amber-400'
                            : 'text-slate-300 group-hover:text-emerald-500'
                        }
                      >
                        {isClosed ? '★' : '→'}
                      </span>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-400 italic">No events found.</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  )
}
