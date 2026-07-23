/**
 * Typed, validated environment. Fails fast at startup if a required variable is
 * missing, so misconfiguration surfaces immediately instead of as a runtime null.
 */
function required(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Revisa tu .env (ver .env.example).`);
  }
  return value;
}

export const env = {
  supabaseUrl: required('VITE_SUPABASE_URL'),
  supabaseAnonKey: required('VITE_SUPABASE_ANON_KEY'),
} as const;
