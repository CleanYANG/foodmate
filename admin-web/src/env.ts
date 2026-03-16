const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const adminEmailsRaw = import.meta.env.VITE_ADMIN_EMAILS ?? '';

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY');
}

export const env = {
  supabaseUrl,
  supabaseAnonKey,
  adminEmails: adminEmailsRaw
    .split(',')
    .map((value: string) => value.trim().toLowerCase())
    .filter(Boolean),
} as const;
