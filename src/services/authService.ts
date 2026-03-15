import { supabase } from '../lib/supabase';

let initializationPromise: Promise<string> | null = null;

async function ensureSignedInAnonymously() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (session?.user) {
    return session.user;
  }

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Anonymous sign-in succeeded without a user.');
  }

  return data.user;
}

async function ensurePublicUserRow(userId: string) {
  const { data, error } = await supabase.from('users').select('id').eq('id', userId).maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return;
  }

  const { error: insertError } = await supabase.from('users').insert({
    id: userId,
    display_name: 'Anonymous CityTalk User',
  });

  if (insertError) {
    throw insertError;
  }
}

export async function ensureAppUser(): Promise<string> {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const user = await ensureSignedInAnonymously();
      await ensurePublicUserRow(user.id);
      return user.id;
    })().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}
