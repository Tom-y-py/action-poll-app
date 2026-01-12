import {
  eachMonthOfInterval, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format 
} from 'date-fns';

export function getCalendarDays(monthStr: string) {
  // monthStr format: "2024-03"
  const [year, month] = monthStr.split('-').map(Number);
  const monthDate = new Date(year, month - 1, 1);

  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 }); // Mon start
  const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });

  return eachDayOfInterval({ start, end });
}

export type AvailabilityEntry = {
  name: string;
  dates: string[];
};

export function processHeatmap(entries: AvailabilityEntry[]) {
  const dateMap: Record<string, string[]> = {};

  entries.forEach((entry) => {
    entry.dates.forEach((date) => {
      if (!dateMap[date]) dateMap[date] = [];
      dateMap[date].push(entry.name);
    });
  });

  const counts = Object.values(dateMap).map((names) => names.length);
  const maxCount = counts.length > 0 ? Math.max(...counts) : 0;

  return { dateMap, maxCount };
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getHeatColor(count: number, maxCount: number) {
  if (count === 0) return 'bg-slate-50 text-slate-300';
  
  const intensity = maxCount > 0 ? count / maxCount : 0;

  if (intensity <= 0.25) return 'bg-[#d1d5db] text-slate-600'; // Low intel
  if (intensity <= 0.5)  return 'bg-[#84a98c] text-slate-900'; // Partial clearance
  if (intensity <= 0.75) return 'bg-[#52796f] text-white';    // Solid
  return 'bg-[#2f3e46] text-white font-bold ring-1 ring-inset ring-white/20'; // High priority
}

export function getMonthsInRange(start: string, end: string) {
  return eachMonthOfInterval({
    start: startOfMonth(new Date(start)),
    end: endOfMonth(new Date(end))
  });
}
