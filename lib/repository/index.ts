// Barrel export for the repository layer.
// Centralizes auth state and re-exports all domain repositories.

import { supabase } from '../supabase';
import { AuthState } from './types';

export * from './types';
export * from './profiles';
export * from './products';
export * from './orders';
export * from './agentTasks';

// Check whether a user is currently authenticated via Supabase Auth.
// Returns loading: true during the async check.
export async function getAuthState(): Promise<AuthState> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { authenticated: false, userId: null, loading: false };
    }

    return { authenticated: true, userId: user.id, loading: false };
  } catch {
    return { authenticated: false, userId: null, loading: false };
  }
}
