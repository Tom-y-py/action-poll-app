import { supabase } from '@/lib/supabase';
import {
  getCalendarDays,
  processHeatmap,
  getHeatColor,
  cn
} from '@/lib/utils';
import {
  format,
  parseISO,
  isSameMonth,
  addMonths,
  isBefore,
  isAfter,
  startOfMonth
} from 'date-fns';
import { notFound } from 'next/navigation';
import { TopDates } from '@/components/TopDates';
import { AddAvailability } from '@/components/AddAvailability';
import Link from 'next/link';
import { CopyLink } from '@/components/CopyLink';
import { AdminControls } from '@/components/AdminControls';

export default async function EventPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { id } = await params;
  const resolvedParams = await searchParams;

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (!event) notFound();

  const { data: entries } = await supabase
    .from('availability')
    .select('name, dates')
    .eq('event_id', id);

  const { dateMap, maxCount } = processHeatmap(entries || []);

  const currentMonthStr =
    resolvedParams.month || format(parseISO(event.start_date), 'yyyy-MM');

  const currentMonthDate = parseISO(`${currentMonthStr}-01`);

  const prevMonth = format(addMonths(currentMonthDate, -1), 'yyyy-MM');
  const nextMonth = format(addMonths(currentMonthDate, 1), 'yyyy-MM');

  const isPrevDisabled = isBefore(
    currentMonthDate,
    startOfMonth(parseISO(event.start_date))
  );

  const isNextDisabled = isAfter(
    currentMonthDate,
    startOfMonth(parseISO(event.end_date))
  );

  const days = getCalendarDays(currentMonthStr);

  const topDates = Object.entries(dateMap)
    .map(([date, names]) => ({ date, count: names.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <main className="max-w-xl mx-auto p-6 space-y-8 min-h-screen bg-[#f2f2f0] text-slate-900 font-sans selection:bg-orange-200">

      <AdminControls
        eventId={event.id}
        adminSecret={event.admin_secret}
        topDates={topDates}
        currentDecidedDate={event.decided_date}
      />

      {/* Mission Header */}
      <header className="border-l-4 border-slate-900 pl-6 py-2">
        <Link
          href="/"
          className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.3em] hover:text-orange-600 transition-colors"
        >
          &#47;&#47; RETURN
        </Link>

        <h1 className="text-4xl font-black uppercase italic tracking-tighter mt-2">
          {event.title}
        </h1>

        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <p className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            Window:{' '}
            {format(parseISO(event.start_date), 'ddMMMyy')} -{' '}
            {format(parseISO(event.end_date), 'ddMMMyy')}
          </p>
        </div>
      </header>

      {/* Target Locked Banner */}
      {event.decided_date && (
        <div className="bg-slate-900 text-white p-6 rounded-sm border-b-4 border-orange-500 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="font-mono text-[10px] text-orange-400 font-bold uppercase tracking-[0.4em] mb-2">
              Target_Locked // Final_Selection
            </p>
            <h2 className="text-3xl font-black uppercase italic">
              {format(parseISO(event.decided_date), 'EEEE, MMM do')}
            </h2>
          </div>

          <span className="absolute right-[-20px] bottom-[-20px] text-9xl font-black text-white/5 select-none pointer-events-none">
            GO
          </span>
        </div>
      )}

      {/* Tactical Heatmap Calendar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-300 pb-2">
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">
            Month_View: {format(currentMonthDate, 'MMMM_yyyy')}
          </h3>

          <div className="flex gap-1">
            <Link
              href={`?month=${prevMonth}`}
              className={cn(
                'p-2 hover:bg-slate-200 transition-colors',
                isPrevDisabled && 'opacity-20 pointer-events-none'
              )}
            >
              ←
            </Link>

            <Link
              href={`?month=${nextMonth}`}
              className={cn(
                'p-2 hover:bg-slate-200 transition-colors',
                isNextDisabled && 'opacity-20 pointer-events-none'
              )}
            >
              →
            </Link>
          </div>
        </div>

        <div className="bg-white border border-slate-300 p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => ( // Add 'i' here
              <div
                key={i} // Use 'i' instead of 'd'
                className="text-center font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const names = dateMap[dateStr] || [];
              const isCurrentMonth = isSameMonth(day, currentMonthDate);
              const isDecided = event.decided_date === dateStr;

              return (
                <div
                  key={dateStr}
                  className={cn(
                    'group relative aspect-square flex items-center justify-center font-mono text-xs font-bold transition-all',
                    !isCurrentMonth
                      ? 'opacity-0 pointer-events-none'
                      : getHeatColor(names.length, maxCount),
                    isDecided &&
                      'ring-4 ring-orange-500 ring-offset-2 scale-110 z-10 bg-orange-500 text-white',
                    event.decided_date && !isDecided && 'opacity-40 grayscale'
                  )}
                >
                  {format(day, 'd')}

                  {names.length > 0 && !event.decided_date && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                      <div className="bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap">
                        <p className="font-bold border-b border-slate-700 pb-1 mb-1">
                          {names.length} Available
                        </p>

                        {names.slice(0, 5).map((n, i) => (
                          <div key={i}>{n}</div>
                        ))}

                        {names.length > 5 && (
                          <div className="text-slate-400 italic">
                            +{names.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-4">
          Optimal_Dates
        </h2>

        <TopDates
          dateMap={dateMap}
          topDates={topDates}
          decidedDate={event.decided_date}
        />
      </section>

      {!event.decided_date ? (
        <AddAvailability event={event} initialMonthStr={currentMonthStr} />
      ) : (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xs px-6 z-40">
          <div className="w-full bg-slate-900 text-orange-400 py-4 font-mono font-bold text-center border-2 border-orange-500 shadow-xl">
            🔒 POLLING_CLOSED
          </div>
        </div>
      )}
    </main>
  );
}
