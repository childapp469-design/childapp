import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SQL_EDITOR_URL } from '../config/appConfig';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const isSupabaseConfigured = () =>
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('placeholder'));

export const TABLES = {
  CHILDREN: 'children',
  TASKS: 'tasks',
  COMPLETIONS: 'task_completions',
  ADJUSTMENTS: 'score_adjustments',
  AUDIT: 'audit_logs',
  SETTINGS: 'app_settings',
};

export const STORAGE_BUCKET = 'child-photos';

export { SUPABASE_SQL_EDITOR_URL };
