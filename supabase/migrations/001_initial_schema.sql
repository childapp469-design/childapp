-- Uşaqların Gündəlik Fəaliyyətləri - Supabase Schema
-- Supabase Dashboard > SQL Editor-də icra edin

CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT,
  photo_url TEXT,
  notes TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  points_earned INTEGER DEFAULT 0,
  stars_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, task_id, completed_date)
);

CREATE TABLE IF NOT EXISTS score_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  points_delta INTEGER DEFAULT 0,
  stars_delta INTEGER DEFAULT 0,
  reason TEXT,
  adjustment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS children_updated_at ON children;
CREATE TRIGGER children_updated_at BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS task_completions_updated_at ON task_completions;
CREATE TRIGGER task_completions_updated_at BEFORE UPDATE ON task_completions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS score_adjustments_updated_at ON score_adjustments;
CREATE TRIGGER score_adjustments_updated_at BEFORE UPDATE ON score_adjustments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access on children" ON children;
CREATE POLICY "Admin full access on children" ON children
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access on tasks" ON tasks;
CREATE POLICY "Admin full access on tasks" ON tasks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access on task_completions" ON task_completions;
CREATE POLICY "Admin full access on task_completions" ON task_completions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access on score_adjustments" ON score_adjustments;
CREATE POLICY "Admin full access on score_adjustments" ON score_adjustments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access on audit_logs" ON audit_logs;
CREATE POLICY "Admin full access on audit_logs" ON audit_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access on app_settings" ON app_settings;
CREATE POLICY "Admin full access on app_settings" ON app_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('child-photos', 'child-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload child photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload child photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'child-photos');

DROP POLICY IF EXISTS "Authenticated users can update child photos" ON storage.objects;
CREATE POLICY "Authenticated users can update child photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'child-photos');

DROP POLICY IF EXISTS "Anyone can view child photos" ON storage.objects;
CREATE POLICY "Anyone can view child photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'child-photos');

DROP POLICY IF EXISTS "Authenticated users can delete child photos" ON storage.objects;
CREATE POLICY "Authenticated users can delete child photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'child-photos');

-- PostgREST schema cache yenilə
NOTIFY pgrst, 'reload schema';
