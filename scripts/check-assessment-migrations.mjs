// Uses isolated PostgreSQL; never connects to or changes the hosted database.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const { PGlite } = await import(process.env.PAP_PGLITE_MODULE || '@electric-sql/pglite');
const db = new PGlite();
const alice = '11111111-1111-1111-1111-111111111111';
const bob = '22222222-2222-2222-2222-222222222222';
const course = 'learning-styles';
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
  for (const name of ['202610100001_initial_schema.sql', '202610100002_enrollment_tracking.sql', '202610110001_catalogue_progress.sql', '202610150001_course_assessments.sql']) {
    await db.exec(await readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8'));
  }
  const banks = (await db.query('select course_id, questions from public.course_assessments')).rows;
  assert.equal(banks.length, 6);
  for (const bank of banks) {
    assert.equal(bank.questions.length, 5);
    assert.equal(new Set(bank.questions.map(question => question.id)).size, 5);
    for (const question of bank.questions) {
      assert.equal(question.options.length, 4);
      assert.ok(Number.isInteger(question.correctIndex) && question.correctIndex >= 0 && question.correctIndex < 4);
      assert.ok(question.explanation.length > 0);
    }
  }
  await db.exec(`insert into auth.users values ('${alice}', '{}'), ('${bob}', '{}');`);
  async function asUser(id, sql) {
    await db.exec(`set role authenticated; set request.jwt.claim.sub = '${id}';`);
    try { return await db.query(sql); } finally { await db.exec('reset role;'); }
  }
  const call = answers => `select public.submit_course_assessment('${course}', '${JSON.stringify(answers)}'::jsonb) as result`;
  const correct = Object.fromEntries(banks.find(bank => bank.course_id === course).questions.map(question => [question.id, question.correctIndex]));
  await assert.rejects(asUser(bob, `select public.get_course_assessment('${course}')`), /enroll/);
  await assert.rejects(asUser(alice, call(correct)), /enroll/);
  await asUser(alice, `insert into public.enrollments(user_id,course_id) values ('${alice}','${course}')`);
  const preview = (await asUser(alice, `select public.get_course_assessment('${course}') as assessment`)).rows[0].assessment;
  assert.equal(preview.questions.length, 5);
  assert.equal(preview.passMark, 60);
  assert.equal(preview.latestResult, null);
  for (const question of preview.questions) {
    assert(!Object.hasOwn(question, 'correctIndex'), 'answer keys are not exposed before submission');
    assert(!Object.hasOwn(question, 'explanation'), 'explanations are not exposed before submission');
  }
  await assert.rejects(asUser(alice, 'select * from public.course_assessments'), /permission denied/);
  await assert.rejects(asUser(alice, call(correct)), /Complete all course lessons/);
  await asUser(alice, `insert into public.lesson_progress(user_id,course_id,lesson_id) select '${alice}',course_id,id from public.lessons where course_id = '${course}'`);
  for (const answers of [null, [], {}, { q1: 1 }, { ...correct, q1: 5 }, { ...correct, q1: '1' }, { ...correct, extra: 0 }, { ...correct, q1: 0.5 }]) {
    await assert.rejects(asUser(alice, call(answers)), /every question/);
  }
  const perfect = (await asUser(alice, call(correct))).rows[0].result;
  assert.equal(perfect.score, 100);
  assert.equal(perfect.correct, 5);
  assert.equal(perfect.passed, true);
  assert.equal(perfect.review.length, 5);
  const wrong = Object.fromEntries(Object.entries(correct).map(([id, answer]) => [id, (answer + 1) % 4]));
  const failed = (await asUser(alice, call(wrong))).rows[0].result;
  assert.equal(failed.score, 0);
  assert.equal(failed.passed, false);
  const partial = { ...wrong, q1: correct.q1, q2: correct.q2, q3: correct.q3 };
  const pass = (await asUser(alice, call(partial))).rows[0].result;
  assert.equal(pass.score, 60);
  assert.equal(pass.passed, true);
  assert.equal((await asUser(alice, 'select * from public.assessment_attempts')).rows.length, 3);
  assert.equal((await asUser(bob, 'select * from public.assessment_attempts')).rows.length, 0);
  await assert.rejects(asUser(alice, `insert into public.assessment_attempts(user_id,course_id,score,result) values ('${alice}','${course}',100,'{}')`), /permission denied/);
  await assert.rejects(asUser(alice, 'update public.assessment_attempts set score = 100'), /permission denied/);
  await db.exec('set role anon;');
  await assert.rejects(db.query(`select public.get_course_assessment('${course}')`), /permission denied/);
  await assert.rejects(db.query(call(correct)), /permission denied/);
  await db.exec('reset role;');
  const restored = (await asUser(alice, `select public.get_course_assessment('${course}') as assessment`)).rows[0].assessment;
  assert.equal(restored.bestScore, 100);
  assert.equal(restored.latestResult.id, pass.id);
  await db.exec(await readFile(new URL('../supabase/migrations/202610150001_course_assessments.sql', import.meta.url), 'utf8'));
  assert.equal((await asUser(alice, 'select * from public.assessment_attempts')).rows.length, 3, 'migration rerun preserves attempts');
  await db.exec(`update public.courses set is_published = false where id = '${course}'`);
  await assert.rejects(asUser(alice, call(correct)), /enroll/);
  console.log('PASS: six question banks, prerequisites, safe question projection, grading, 60% boundary, invalid submissions, saved retries, best/latest scores, private keys, result access, score tampering, anon access, unpublished courses, and migration reruns.');
} finally { await db.close(); }
