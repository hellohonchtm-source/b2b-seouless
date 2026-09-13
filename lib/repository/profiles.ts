// Typed repository for the profiles/users domain.
// Uses the anon-key Supabase client — never exposes service_role.

import { supabase } from '../supabase';
import { UserProfile, UserRole } from '../../types';
import { mockUserProfiles } from '../../src/data/mockData';
import { RepoReadResult, RepoWriteResult, okRead, errRead, okWrite, errWrite, DataSource } from './types';

// ---- mappers (snake_case DB row → camelCase TS) ----

interface ProfileRow {
  id: string;
  email: string;
  role: UserRole;
  company_name: string;
  created_at: string;
}

function mapProfile(r: ProfileRow): UserProfile {
  return {
    id: r.id,
    email: r.email,
    role: r.role,
    companyName: r.company_name,
    createdAt: r.created_at,
  };
}

function toProfileRow(p: UserProfile): Partial<ProfileRow> {
  return {
    id: p.id,
    email: p.email,
    role: p.role,
    company_name: p.companyName,
    created_at: p.createdAt,
  };
}

// ---- public API ----

export async function fetchProfiles(): Promise<RepoReadResult<UserProfile>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return errRead<UserProfile>(error.message, 'supabase');
  }

  const mapped = (data as ProfileRow[]).map(mapProfile);
  return okRead(mapped, 'supabase');
}

export async function fetchProfileById(id: string): Promise<RepoWriteResult<UserProfile>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return errWrite<UserProfile>(error.message, 'supabase');
  }

  return okWrite(mapProfile(data as ProfileRow), 'supabase');
}

export async function upsertProfile(
  profile: UserProfile,
  source: DataSource
): Promise<RepoWriteResult<UserProfile>> {
  if (source === 'local') {
    // Local fallback: no remote write, just echo back
    return okWrite(profile, 'local');
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(toProfileRow(profile))
    .select()
    .single();

  if (error) {
    return errWrite<UserProfile>(error.message, 'supabase');
  }

  return okWrite(mapProfile(data as ProfileRow), 'supabase');
}

// Fallback: return mock profiles when not authenticated
export function localProfiles(): RepoReadResult<UserProfile> {
  return okRead(mockUserProfiles, 'local');
}
