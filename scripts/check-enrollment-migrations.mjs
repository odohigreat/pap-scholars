// Run with PAP_PGLITE_MODULE pointing to an installed @electric-sql/pglite entry point.
// Uses isolated PostgreSQL, never a hosted database.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const { PGlite } = await import(process.env.PAP_PGLITE_MODULE || '@electric-sql/pglite');
const db = new PGlite();
const alice = '11111111-1111-1111-1111-111111111111';
const bob = '22222222-2222-2222-2222-222222222222';
try {
  await db.exec(`
    create role anon; create role authenticated; create role service_role;
    create schema auth;
    create table auth.users(id uuid primary key, raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated;
    grant execute on function auth.uid() to authenticated;
  `);
  for (const file of ['202610100001_initial_schema.sql', '202610100002_enrollment_tracking.sql']) {
    await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), 'utf8'));
    if (file === '202610100001_initial_schema.sql' && process.env.PAP_TEST_EXISTING_ID === '1') {
      // Reproduce the hosted database's already-existing ID column.
      await db.exec('alter table public.enrollments add column id uuid not null default gen_random_uuid() unique;');
    }
    if (file === '202610100001_initial_schema.sql') {
      await db.exec(`insert into auth.users values ('33333333-3333-3333-3333-333333333333', '{}');
        insert into public.enrollments(user_id, course_id) values ('33333333-3333-3333-3333-333333333333', 'learning-styles');
        insert into public.lesson_progress(user_id, course_id, lesson_id)
        select '33333333-3333-3333-3333-333333333333', course_id, id from public.lessons where course_id = 'learning-styles';`);
    }
  }
  const backfilled = (await db.query("select * from public.enrollments where user_id = '33333333-3333-3333-3333-333333333333'")).rows[0];
  assert.equal(backfilled.status, 'completed', 'existing progress is backfilled');
  assert.equal(Number(backfilled.progress_percentage), 100);
  await db.exec(`insert into auth.users values ('${alice}', '{}'), ('${bob}', '{}');`);
  async function asUser(id, sql) {
    await db.exec(`set role authenticated; set request.jwt.claim.sub = '${id}';`);
    try { return await db.query(sql); } finally { await db.exec('reset role;'); }
  }
  const course = 'financial-intelligence';
  await asUser(alice, `insert into public.enrollments(user_id,course_id) values ('${alice}','${course}') on conflict (user_id,course_id) do nothing;`);
  await asUser(alice, `insert into public.enrollments(user_id,course_id) values ('${alice}','${course}') on conflict (user_id,course_id) do nothing;`);
  assert.equal((await asUser(alice, 'select * from public.enrollments')).rows.length, 1, 'duplicate enrolment prevention');
  assert.equal((await asUser(bob, 'select * from public.enrollments')).rows.length, 0, 'other student cannot read');
  assert.equal((await asUser(bob, `update public.enrollments set last_lesson_id = 'money-habits-and-values' where user_id = '${alice}' returning *`)).rows.length, 0, 'other student cannot update');
  await assert.rejects(asUser(bob, `insert into public.enrollments(user_id,course_id) values ('${alice}','learning-styles')`), /row-level security/, 'cannot enrol another student');
  await assert.rejects(asUser(alice, `update public.enrollments set progress_percentage = 100`), /permission denied/, 'progress is maintained by database');
  await assert.rejects(asUser(alice, `update public.enrollments set last_lesson_id = 'not-a-lesson'`), /foreign key/, 'resume lesson belongs to course');
  await asUser(alice, `update public.enrollments set last_lesson_id = 'money-habits-and-values' where course_id = '${course}'`);
  let enrollment = (await asUser(alice, 'select * from public.enrollments')).rows[0];
  assert.equal(enrollment.status, 'in_progress');
  assert.ok(enrollment.started_at);
  assert.equal(Number(enrollment.progress_percentage), 0);
  await asUser(alice, `insert into public.lesson_progress(user_id, course_id, lesson_id) values ('${alice}','${course}','money-habits-and-values') on conflict do nothing`);
  enrollment = (await asUser(alice, 'select * from public.enrollments')).rows[0];
  assert.ok(Number(enrollment.progress_percentage) > 0 && Number(enrollment.progress_percentage) < 100);
  await asUser(alice, `insert into public.lesson_progress(user_id, course_id, lesson_id) select '${alice}', course_id, id from public.lessons where course_id = '${course}' on conflict do nothing`);
  enrollment = (await asUser(alice, 'select * from public.enrollments')).rows[0];
  assert.equal(Number(enrollment.progress_percentage), 100);
  assert.equal(enrollment.status, 'completed');
  assert.ok(enrollment.completed_at);
  await asUser(alice, `update public.enrollments set last_lesson_id = 'needs-wants-and-priorities'`);
  assert.equal((await asUser(alice, 'select status from public.enrollments')).rows[0].status, 'completed', 'review preserves completion');
  await db.exec('set role anon;');
  await assert.rejects(db.query('select * from public.enrollments'), /permission denied/);
  await db.exec('reset role;');
  const beforeRerun = (await asUser(alice, 'select * from public.enrollments')).rows[0];
  await db.exec(await readFile(new URL('../supabase/migrations/202610100002_enrollment_tracking.sql', import.meta.url), 'utf8'));
  const afterRerun = (await asUser(alice, 'select * from public.enrollments')).rows[0];
  for (const field of ['id', 'enrolled_at', 'started_at', 'completed_at', 'last_lesson_id', 'status', 'progress_percentage']) {
    assert.deepEqual(afterRerun[field], beforeRerun[field], `rerun preserves ${field}`);
  }
  assert.equal((await asUser(bob, 'select * from public.enrollments')).rows.length, 0, 'rerun preserves RLS');
  console.log('PASS: existing ID and migration rerun compatibility; both migrations, duplicates, own-row RLS, restricted updates, lesson FK, start/resume, completion and review.');
} finally { await db.close(); }
