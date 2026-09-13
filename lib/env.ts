const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export function validateEnv(): {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  GEMINI_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
} {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
    GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
    STRIPE_SECRET_KEY: import.meta.env.VITE_STRIPE_SECRET_KEY,
  };

  return env;
}
