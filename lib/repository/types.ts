// Shared types for the Supabase repository layer.
// Every read/write returns a RepoResult so callers can
// distinguish data source and surface errors to the UI.

export type DataSource = 'supabase' | 'local';

export interface RepoReadResult<T> {
  data: T[];
  source: DataSource;
  error: string | null;
}

export interface RepoWriteResult<T> {
  data: T | null;
  source: DataSource;
  error: string | null;
}

export interface AuthState {
  authenticated: boolean;
  userId: string | null;
  loading: boolean;
}

// Helper to build a successful read result
export function okRead<T>(data: T[], source: DataSource): RepoReadResult<T> {
  return { data, source, error: null };
}

// Helper to build an error read result (empty data, keeps source)
export function errRead<T>(error: string, source: DataSource): RepoReadResult<T> {
  return { data: [], source, error };
}

// Helper to build a successful write result
export function okWrite<T>(data: T, source: DataSource): RepoWriteResult<T> {
  return { data, source, error: null };
}

// Helper to build an error write result
export function errWrite<T>(error: string, source: DataSource): RepoWriteResult<T> {
  return { data: null, source, error };
}
