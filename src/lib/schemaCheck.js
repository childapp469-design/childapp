import { supabase, isSupabaseConfigured } from './supabase';

const SCHEMA_FLAG = 'supabase_schema_ready';

export function isSchemaMissingError(error) {
  if (!error) return false;
  const code = error.code;
  const message = error.message || '';
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    message.includes('Could not find the table') ||
    message.includes('does not exist')
  );
}

export function markSchemaReady() {
  localStorage.setItem(SCHEMA_FLAG, 'true');
}

export function markSchemaMissing() {
  localStorage.setItem(SCHEMA_FLAG, 'false');
}

export function shouldSkipSupabase() {
  return localStorage.getItem(SCHEMA_FLAG) === 'false';
}

export async function checkSupabaseSchema() {
  if (!isSupabaseConfigured() || !navigator.onLine) {
    return { ready: false, reason: 'offline_or_unconfigured' };
  }

  const { error } = await supabase.from('children').select('id').limit(1);
  if (!error) {
    markSchemaReady();
    return { ready: true };
  }
  if (isSchemaMissingError(error)) {
    markSchemaMissing();
    return { ready: false, reason: 'tables_missing' };
  }
  return { ready: false, reason: 'unknown', error };
}

export async function runSupabaseQuery(queryFn) {
  if (!isSupabaseConfigured() || !navigator.onLine || shouldSkipSupabase()) {
    return { data: null, error: null, skipped: true };
  }

  const result = await queryFn();
  if (result.error) {
    if (isSchemaMissingError(result.error)) {
      markSchemaMissing();
    }
  } else {
    markSchemaReady();
  }
  return { ...result, skipped: false };
}
