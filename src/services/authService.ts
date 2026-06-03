import { User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

import { supabase } from '../lib/supabase';

function getRedirectUrl() {
  // Use the explicit app scheme callback registered in Supabase Auth.
  return 'foomate://auth/callback/';
}

export class AuthRequiredError extends Error {
  constructor() {
    super('Please sign in to save places.');
    this.name = 'AuthRequiredError';
  }
}

async function ensurePublicUserRow(user: User) {
  const { data, error } = await supabase.from('users').select('id').eq('id', user.id).maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return;
  }

  const fallbackName = user.email?.split('@')[0] ?? 'fooMate User';

  const { error: insertError } = await supabase.from('users').insert({
    id: user.id,
    display_name: fallbackName,
  });

  if (insertError) {
    throw insertError;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (user) {
    await ensurePublicUserRow(user);
  }

  return user;
}

export async function sendMagicLink(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getRedirectUrl(),
      shouldCreateUser: true,
    },
  });

  if (error) {
    throw error;
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

function readTokensFromUrl(url: string) {
  const normalizedUrl = url.replace('#', '?');
  const { queryParams } = Linking.parse(normalizedUrl);

  if (!queryParams) {
    return null;
  }

  const accessToken = queryParams.access_token;
  const refreshToken = queryParams.refresh_token;

  if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
    return null;
  }

  return {
    accessToken,
    refreshToken,
  };
}

export async function maybeHandleAuthCallback(url: string | null | undefined): Promise<boolean> {
  if (!url) {
    return false;
  }

  const tokens = readTokensFromUrl(url);

  if (!tokens) {
    return false;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });

  if (error) {
    throw error;
  }

  if (data.user) {
    await ensurePublicUserRow(data.user);
  }

  return true;
}

export async function requireAuthenticatedUserId(): Promise<string> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthRequiredError();
  }

  return user.id;
}
