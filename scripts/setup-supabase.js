/**
 * Supabase schema setup
 * .env faylina SUPABASE_DB_PASSWORD elave edin, sonra: npm run setup:db
 */
const fs = require('fs');
const path = require('path');

// .env faylindan oxu (PowerShell env lazim deyil)
function loadEnvFile() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    });
}

loadEnvFile();

const PROJECT_REF = 'fiwwthtlzbraqwevdidx';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

const PG_HOSTS = [
  // Layihə regionu: ap-southeast-2 (Dashboard → Project Settings → General)
  { host: 'aws-1-ap-southeast-2.pooler.supabase.com', port: 5432, user: `postgres.${PROJECT_REF}` },
  { host: `db.${PROJECT_REF}.supabase.co`, port: 5432, user: 'postgres' },
  { host: 'aws-0-eu-central-1.pooler.supabase.com', port: 6543, user: `postgres.${PROJECT_REF}` },
  { host: 'aws-0-eu-west-1.pooler.supabase.com', port: 6543, user: `postgres.${PROJECT_REF}` },
  { host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, user: `postgres.${PROJECT_REF}` },
];

async function checkTable(table) {
  const key = SECRET_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (!key) return { status: 0, body: 'API key yoxdur' };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  return { status: res.status, body: await res.text() };
}

async function createStorageBucket() {
  if (!SECRET_KEY) return;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: { apikey: SECRET_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'child-photos', name: 'child-photos', public: true }),
  });
  const text = await res.text();
  if (res.ok || text.includes('already exists') || text.includes('Duplicate')) {
    console.log('✓ Storage bucket: child-photos');
  }
}

async function runMigrationWithPg() {
  const { Client } = require('pg');
  const sql = fs.readFileSync(
    path.join(__dirname, '../supabase/migrations/001_initial_schema.sql'),
    'utf8'
  );

  let lastError;
  for (const cfg of PG_HOSTS) {
    const client = new Client({
      ...cfg,
      database: 'postgres',
      password: DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    });
    try {
      await client.connect();
      console.log(`✓ PostgreSQL qoşuldu: ${cfg.host}`);
      await client.query(sql);
      await client.end();
      console.log('✓ Migration uğurla tamamlandı!');
      return true;
    } catch (err) {
      lastError = err;
      try {
        await client.end();
      } catch (_) {}
    }
  }
  throw lastError || new Error('PostgreSQL qoşulması uğursuz');
}

async function verifyTables() {
  console.log('\nCədvəl yoxlaması:');
  let allOk = true;
  for (const table of ['children', 'tasks', 'task_completions', 'score_adjustments', 'audit_logs', 'app_settings']) {
    const result = await checkTable(table);
    const ok = result.status === 200;
    console.log(`  ${ok ? '✓' : '✗'} ${table} → HTTP ${result.status}`);
    if (!ok) allOk = false;
  }
  return allOk;
}

async function main() {
  console.log('=== Supabase DB Setup ===\n');

  if (SECRET_KEY) await createStorageBucket();

  const check = await checkTable('children');
  if (check.status === 200) {
    console.log('\n✓ Cədvəllər artıq mövcuddur.');
    await verifyTables();
    return;
  }

  if (!DB_PASSWORD) {
    console.error('\n✗ SUPABASE_DB_PASSWORD təyin edilməyib.\n');
    console.log('Addım 1: Supabase Dashboard → Project Settings → Database → Database password');
    console.log('        (Reset database password — yeni şifrə yaradın və kopyalayın)\n');
    console.log('Addım 2: .env faylına əlavə edin:');
    console.log('  SUPABASE_SECRET_KEY=sb_secret_...');
    console.log('  SUPABASE_DB_PASSWORD=SIFRENIZ\n');
    console.log('Addım 3: Yenidən işlədin:');
    console.log('  npm run setup:db\n');
    console.log('Alternativ — SQL Editor (şifrə lazım deyil):');
    console.log('  https://supabase.com/dashboard/project/fiwwthtlzbraqwevdidx/sql/new');
    console.log('  Fayl: supabase/migrations/001_initial_schema.sql');
    process.exit(1);
  }

  await runMigrationWithPg();
  const ok = await verifyTables();
  if (!ok) {
    console.log('\n⚠ Bəzi cədvəllər hələ görünmür. 10 saniyə gözləyin və yenidən yoxlayın.');
    process.exit(1);
  }
  console.log('\n✓ Hamısı hazırdır! Tətbiqi yenidən yükləyin.');
}

main().catch((err) => {
  console.error('\n✗ Xəta:', err.message);
  process.exit(1);
});
