const EXPO_PUBLIC_USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA;
const EXPO_PUBLIC_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const EXPO_PUBLIC_SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const missingConfig = [
  !EXPO_PUBLIC_SUPABASE_URL ? 'EXPO_PUBLIC_SUPABASE_URL' : null,
  !EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'EXPO_PUBLIC_SUPABASE_ANON_KEY' : null,
].filter((value): value is string => value != null);

export const env = {
  isConfigured: missingConfig.length === 0,
  missingConfig,
  useMockData: EXPO_PUBLIC_USE_MOCK_DATA === 'true',
  supabaseUrl: EXPO_PUBLIC_SUPABASE_URL ?? 'https://placeholder.invalid',
  supabaseAnonKey: EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key',
} as const;
