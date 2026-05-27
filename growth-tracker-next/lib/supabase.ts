'use client';

import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

async function createClient(): Promise<SupabaseClient | null> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (supabaseClient) {
    return supabaseClient;
  }

  const { createBrowserClient } = await import('@supabase/ssr');
  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

export async function supabaseCreateUserIfNotExists(userId: string, name: string) {
  const client = await createClient();
  if (!client) return;

  const { data, error } = await client
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    await client.from('users').insert({
      id: userId,
      name,
      created_at: new Date().toISOString(),
    });
  }
}

export async function supabaseGetUserData(userId: string) {
  const client = await createClient();
  if (!client) {
    return { taskTypes: [], achievements: [], dailyRecords: [] };
  }

  const [taskTypesRes, achievementsRes, dailyRecordsRes] = await Promise.all([
    client.from('task_types').select('*').eq('user_id', userId),
    client.from('achievements').select('*').eq('user_id', userId),
    client.from('daily_records').select('*').eq('user_id', userId),
  ]);

  return {
    taskTypes: taskTypesRes.data || [],
    achievements: achievementsRes.data || [],
    dailyRecords: dailyRecordsRes.data || [],
  };
}

export async function supabaseSaveDailyRecord(userId: string, date: string, dailyNotes?: string) {
  const client = await createClient();
  if (!client) return;

  const { data, error } = await client
    .from('daily_records')
    .select('id')
    .eq('user_id', userId)
    .eq('date', date)
    .single();

  if (data) {
    await client
      .from('daily_records')
      .update({ daily_notes: dailyNotes, updated_at: new Date().toISOString() })
      .eq('id', data.id);
  } else {
    await client.from('daily_records').insert({
      id: crypto.randomUUID(),
      user_id: userId,
      date,
      daily_notes: dailyNotes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
}

export async function supabaseAddTaskRecord(userId: string, date: string, task: {
  type: number;
  duration: number;
  notes?: string;
  tags?: string[];
}) {
  const client = await createClient();
  if (!client) return crypto.randomUUID();

  const recordId = crypto.randomUUID();
  await client.from('task_records').insert({
    id: recordId,
    user_id: userId,
    date,
    type: task.type,
    duration: task.duration,
    notes: task.notes,
    tags: task.tags || [],
    completed_at: new Date().toISOString(),
  });
  return recordId;
}

export async function supabaseSaveMood(userId: string, date: string, mood: string, note?: string) {
  const client = await createClient();
  if (!client) return;

  const { data, error } = await client
    .from('mood_records')
    .select('id')
    .eq('user_id', userId)
    .eq('date', date)
    .single();

  if (data) {
    await client
      .from('mood_records')
      .update({ mood, note, updated_at: new Date().toISOString() })
      .eq('id', data.id);
  } else {
    await client.from('mood_records').insert({
      id: crypto.randomUUID(),
      user_id: userId,
      date,
      mood,
      note,
      created_at: new Date().toISOString(),
    });
  }
}

export async function supabaseAddPomodoroSession(userId: string, date: string, duration: number, taskType?: number) {
  const client = await createClient();
  if (!client) return crypto.randomUUID();

  const sessionId = crypto.randomUUID();
  await client.from('pomodoro_sessions').insert({
    id: sessionId,
    user_id: userId,
    date,
    duration,
    task_type: taskType,
    completed_at: new Date().toISOString(),
  });
  return sessionId;
}

export async function supabaseUpdateAchievement(userId: string, achievementId: number, unlocked: boolean, unlockedAt?: string) {
  const client = await createClient();
  if (!client) return;

  await client
    .from('achievements')
    .update({ unlocked, unlocked_at: unlockedAt })
    .eq('user_id', userId)
    .eq('id', achievementId);
}

export async function supabaseUpdateTaskType(userId: string, id: number, updates: { name?: string; icon?: string; color?: string; default_duration?: number }) {
  const client = await createClient();
  if (!client) return;

  await client
    .from('task_types')
    .update({ ...updates })
    .eq('user_id', userId)
    .eq('id', id);
}

export async function supabaseAddTaskType(userId: string, taskType: { name: string; icon: string; color: string; default_duration: number }) {
  const client = await createClient();
  if (!client) return;

  const { data } = await client.from('task_types').select('id').eq('user_id', userId).order('id', { ascending: false }).limit(1);
  const maxId = data?.[0]?.id || 0;
  
  await client.from('task_types').insert({
    id: maxId + 1,
    user_id: userId,
    ...taskType,
    created_at: new Date().toISOString(),
  });
}

export async function supabaseDeleteTaskType(userId: string, id: number) {
  const client = await createClient();
  if (!client) return;

  await client.from('task_types').delete().eq('user_id', userId).eq('id', id);
}

export async function supabaseGetTaskRecords(userId: string, date: string) {
  const client = await createClient();
  if (!client) return [];

  const { data } = await client
    .from('task_records')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date);
  return data || [];
}

export async function supabaseGetMoodRecord(userId: string, date: string) {
  const client = await createClient();
  if (!client) return null;

  const { data } = await client
    .from('mood_records')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();
  return data || null;
}

export async function supabaseGetPomodoroSessions(userId: string, date: string) {
  const client = await createClient();
  if (!client) return [];

  const { data } = await client
    .from('pomodoro_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date);
  return data || [];
}