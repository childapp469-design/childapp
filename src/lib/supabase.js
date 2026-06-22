import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase konfiqurasiyası tapılmadı. .env faylında REACT_APP_SUPABASE_URL və REACT_APP_SUPABASE_ANON_KEY təyin edin.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export const isSupabaseConfigured = () =>
  Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'));

export const TABLES = {
  CHILDREN: 'children',
  TASKS: 'tasks',
  COMPLETIONS: 'task_completions',
  ADJUSTMENTS: 'score_adjustments',
  AUDIT: 'audit_logs',
  SETTINGS: 'app_settings',
};

export const STORAGE_BUCKET = 'child-photos';

export const SUPABASE_SQL_EDITOR_URL =
  'https://supabase.com/dashboard/project/fiwwthtlzbraqwevdidx/sql/new';
