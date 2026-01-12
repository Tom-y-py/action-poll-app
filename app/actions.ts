'use server'

import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { nanoid } from 'nanoid'


export async function createEvent(formData: FormData) {
  const title = formData.get('title') as string;
  const startDate = formData.get('start_date') as string;
  const endDate = formData.get('end_date') as string;
  
  // Generate a simple 6-character secret
  const adminSecret = Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data, error } = await supabase
    .from('events')
    .insert([{ 
      title, 
      start_date: startDate, 
      end_date: endDate,
      admin_secret: adminSecret 
    }])
    .select()
    .single();

  if (!error) {
    // Redirect with the secret in the URL hash so it's not stored in history forever
    // e.g., /event/[id]#admin=ABCDEF
    redirect(`/event/${data.id}#admin=${adminSecret}`);
  }
}