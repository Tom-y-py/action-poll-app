import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface EventData {
  id: string;
  title: string;
  month: string; // YYYY-MM
}

export interface Availability {
  event_id: string;
  name: string;
  dates: string[]; // YYYY-MM-DD
}