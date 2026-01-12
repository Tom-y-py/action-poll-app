'use server'

import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache';


export async function createEvent(formData: FormData) {
  const title = formData.get('title') as string;
  const start_date = formData.get('start_date') as string;
  const end_date = formData.get('end_date') as string;
  const admin_secret = Math.random().toString(36).substring(2, 8);

  const { data, error } = await supabase
    .from('events')
    .insert([{ title, start_date, end_date, admin_secret }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  // MISSION_COMMAND: Purge the cache for the home page
  revalidatePath('/'); 
  
  // Redirect to the new mission page
  redirect(`/event/${data.id}#admin=${admin_secret}`);
}