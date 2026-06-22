/**
 * Supabase schema setup — npm run setup:db
 */
const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'fiwwthtlzbraqwevdidx';
const SUPABASE_URL = 'https://fiwwthtlzbraqwevdidx.supabase.co';
const SECRET_KEY = 'sb_secret_p6HkiAA86P5yKMgnE0tRug_6cnkrRha';
const DB_PASSWORD = 'childapp1990@';
const ANON_KEY = 'sb_publishable_i99XGuDLP_fahu_YzneUYg_NpXXoNoA';

const PG_HOSTS = [
  { host: 'aws-1-ap-southeast-2.pooler.supabase.com', port: 5432, user: `postgres.${PROJECT_REF}` },
  { host: `db.${PROJECT_REF}.supabase.co`, port: 5432, user: 'postgres' },
  { host: 'aws-0-eu-central-1.pooler.supabase.com', port: 6543, user: `postgres.${PROJECT_REF}` },
  { host: 'aws-0-eu-west-1.pooler.supabase.com', port: 6543, user: `postgres.${PROJECT_REF}` },
  { host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, user: `postgres.${PROJECT_REF}` },
];

async function checkTable(table) {
  const key = SECRET_KEY || ANON_KEY;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  return { status: res.status, body: await res.text() };
}

async function createStorageBucket() {
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

  await createStorageBucket();

  const check = await checkTable('children');
  if (check.status === 200) {
    console.log('\n✓ Cədvəllər artıq mövcuddur.');
    await verifyTables();
    return;
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
