import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { validateQuestionBank, generateDraft } from './lib/assessment-drafts.mjs';
const { PGlite } = await import(process.env.PAP_PGLITE_MODULE || '@electric-sql/pglite');
const db = new PGlite({ onNotice: notice => { if (notice.message.startsWith('Draft for')) console.log(notice.message); } });
const alice = '11111111-1111-1111-1111-111111111111';
const bob = '22222222-2222-2222-2222-222222222222';
const course = 'learning-styles';
const literal = value => `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`;
const text = value => `'${String(value).replaceAll("'", "''")}'`;
try {
  await db.exec(`create role anon; create role authenticated; create role service_role;
    create schema auth; create table auth.users(id uuid primary key,raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;`);
  for (const file of ['202610100001_initial_schema.sql','202610100002_enrollment_tracking.sql','202610110001_catalogue_progress.sql']) {
    await db.exec(await readFile(new URL(`../supabase/migrations/${file}`,import.meta.url),'utf8'));
  }
  assert.equal((await db.query("select to_regclass('public.course_assessments') as relation")).rows[0].relation,null);
  await db.exec(await readFile(new URL('../supabase/setup-course-assessments.sql',import.meta.url),'utf8'));
  async function asUser(id,sql) {
    await db.exec(`set role authenticated; set request.jwt.claim.sub='${id}';`);
    try { return await db.query(sql); } finally { await db.exec('reset role;'); }
  }
  async function scan() { return (await db.query('select public.get_assessment_review_sources() as entry')).rows.map(row=>row.entry); }
  async function stage(entry, questions=entry.draft.questions, signature=entry.sourceSignature) {
    return db.query(`select public.stage_course_assessment(${text(entry.courseId)},${literal(questions)},${text(signature)})`);
  }
  async function publish(entry, questions=entry.draft.questions) {
    return (await db.query(`select public.publish_course_assessment(${text(entry.courseId)},${text(entry.sourceSignature)},${text(entry.draft.draftHash)},'Test reviewer',${literal(questions)}) as revision`)).rows[0].revision;
  }
  async function get() { return (await asUser(alice,`select public.get_course_assessment('${course}') as quiz`)).rows[0].quiz; }
  const setupStatus = await db.exec(await readFile(new URL('../supabase/check-course-assessments.sql',import.meta.url),'utf8'));
  assert(Object.values(setupStatus[0].rows[0]).every(value=>value===true),'diagnostics confirm the complete setup and signed-in lookup permission');
  assert.equal(setupStatus[1].rows.length,6,'diagnostics report every published course');
  assert(setupStatus[1].rows.every(row=>row.draft_question_count===20 && row.needs_review===true),'diagnostics distinguish unpublished drafts from missing tables');
  const drafts=await scan();
  assert.equal(drafts.length,6);
  const authored=JSON.parse(await readFile(new URL('../supabase/assessments/course-question-drafts.json',import.meta.url),'utf8'));
  for (const entry of drafts) {
    assert.equal(entry.needsReview,true);
    if (!entry.draft) {
      const bank=authored.find(item=>item.courseId===entry.courseId);
      try { await stage(entry,bank.questions); } catch(error) { throw new Error(`${entry.courseId}: ${error.message}`); }
      throw new Error(`Missing seeded draft for ${entry.courseId}`);
    }
    assert.equal(entry.draft.questions.length,20);
    assert.equal(entry.draft.status,'needs_review');
    assert.equal(entry.draft.sourceSignature,entry.sourceSignature);
    validateQuestionBank(entry.draft.questions,entry.source);
    assert.deepEqual(entry.draft.questions,authored.find(bank=>bank.courseId===entry.courseId).questions);
  }
  await db.exec(`insert into auth.users values('${alice}','{}'),('${bob}','{}');
    insert into public.enrollments(user_id,course_id) values('${alice}','${course}');
    insert into public.lesson_progress(user_id,course_id,lesson_id) select '${alice}',course_id,id from public.lessons where course_id='${course}';`);
  const before=await get();
  assert.equal(before.needsReview,true);
  assert.equal(before.questions.length,0,'unreviewed drafts cannot be seen by students');
  const entry=drafts.find(item=>item.courseId===course);
  await assert.rejects(stage(entry,entry.draft.questions.slice(0,19)),/exactly 20/);
  await assert.rejects(stage(entry,entry.draft.questions,'outdated'),/content changed/);
  const duplicate=structuredClone(entry.draft.questions); duplicate[1].prompt=duplicate[0].prompt;
  await assert.rejects(stage(entry,duplicate),/distinct/);
  const wrongLesson=structuredClone(entry.draft.questions); wrongLesson[0].lessonId='missing';
  await assert.rejects(stage(entry,wrongLesson),/current lesson/);
  const edited=structuredClone(entry.draft.questions); edited[0].explanation+=' Changed.';
  await assert.rejects(publish(entry,edited),/draft changed/,'a modified review file cannot publish the old draft');
  for (const rpc of [
    'select * from public.course_assessment_drafts',
    'select public.get_assessment_review_sources()',
    `select public.publish_course_assessment('${course}','x','y','Fake reviewer','[]')`,
    `select public.stage_course_assessment('${course}','[]','x')`,
  ]) await assert.rejects(asUser(alice,rpc),/permission denied/);
  const revision=await publish(entry);
  const quiz=await get();
  assert.equal(quiz.needsReview,false);
  assert.equal(quiz.questions.length,20);
  assert.equal(quiz.revision,revision);
  assert(quiz.questions.every(q=>!Object.hasOwn(q,'correctIndex')&&!Object.hasOwn(q,'explanation')));
  const answers=Object.fromEntries(entry.draft.questions.map(q=>[q.id,q.correctIndex]));
  const submit=(values,version=revision)=>asUser(alice,`select public.submit_course_assessment('${course}',${literal(values)},${text(version)}) as result`);
  const perfect=(await submit(answers)).rows[0].result;
  assert.equal(perfect.score,100); assert.equal(perfect.total,20); assert.equal(perfect.correct,20);
  assert.equal(perfect.revision,revision);
  const wrong=Object.fromEntries(Object.entries(answers).map(([id,value])=>[id,(value+1)%4]));
  assert.equal((await submit(wrong)).rows[0].result.score,0);
  const eleven={...wrong,...Object.fromEntries(Object.entries(answers).slice(0,11))};
  const twelve={...wrong,...Object.fromEntries(Object.entries(answers).slice(0,12))};
  assert.equal((await submit(eleven)).rows[0].result.passed,false);
  const passing=(await submit(twelve)).rows[0].result;
  assert.equal(passing.score,60); assert.equal(passing.passed,true);
  for (const value of [null,{},[],{...answers,q1:4},{...answers,q1:'1'},{...answers,extra:0}]) await assert.rejects(submit(value),/every question/);
  assert.equal((await asUser(bob,'select * from public.assessment_attempts')).rows.length,0);
  await db.exec(`update public.courses set image_alt='A different image description' where id='${course}'`);
  assert.equal((await get()).needsReview,false,'cosmetic updates do not invalidate an assessment');
  await db.exec(`update public.lessons set content='Updated teaching text explaining recall and study practice.' where course_id='${course}' and id='reflecting-on-your-study-habits'`);
  assert.equal((await get()).needsReview,true,'lesson content updates require review');
  await assert.rejects(submit(answers),/being reviewed/);
  await assert.rejects(publish(entry),/draft changed/);
  const updated=(await scan()).find(item=>item.courseId===course);
  assert.notEqual(updated.sourceSignature,entry.sourceSignature);
  assert.equal(updated.draft.status,'stale');
  await stage(updated);
  const fresh=(await scan()).find(item=>item.courseId===course);
  const revision2=await publish(fresh);
  assert.notEqual(revision,revision2);
  await assert.rejects(submit(answers,revision),/assessment changed/,'an in-flight older quiz cannot be scored with new keys');
  const current=await get();
  assert.equal(current.latestResult,null,'old attempts do not count towards the new assessment');
  assert.equal(current.bestScore,null);
  assert.equal(current.previousResult.score,60,'old results remain available');
  assert.equal((await submit(answers,revision2)).rows[0].result.score,100);
  for (const sql of [
    `update public.courses set overview=overview||' Updated.' where id='${course}'`,
    `update public.course_modules set title=title||' Updated' where course_id='${course}' and id='module-1'`,
    `insert into public.lessons(course_id,id,module_id,title,description,duration_minutes,position) values('${course}','new-lesson','module-3','New topic','A new lesson description.',5,100)`,
    `delete from public.lessons where course_id='${course}' and id='new-lesson'`,
  ]) {
    await db.exec(sql);
    assert.equal((await get()).needsReview,true,'course and curriculum changes require review');
    const next=(await scan()).find(item=>item.courseId===course);
    if (sql.startsWith('insert')) await assert.rejects(stage(next),/cover every lesson/);
    else { await stage(next); await publish((await scan()).find(item=>item.courseId===course)); }
  }
  await db.exec(`insert into public.courses(id,title,description,category,overview,duration_minutes,is_published,image_url) values('new-course','New course','New description','Learning','New overview',30,true,'/image.png')`);
  assert.equal((await scan()).find(item=>item.courseId==='new-course').needsReview,true,'new courses appear in the scan queue');
  const publishedBeforeRerun=(await db.query("select revision,questions from public.course_assessments order by course_id")).rows;
  const attemptCount=(await db.query('select count(*) from public.assessment_attempts')).rows[0].count;
  await db.exec(await readFile(new URL('../supabase/setup-course-assessments.sql',import.meta.url),'utf8'));
  assert.equal((await db.query('select count(*) from public.assessment_attempts')).rows[0].count,attemptCount,'combined setup rerun preserves results');
  assert.deepEqual((await db.query("select revision,questions from public.course_assessments order by course_id")).rows,publishedBeforeRerun,'combined setup preserves published questions and revisions');

  // Owner-authorized initial release opens the prepared sets without creating reviewer accounts.
  await db.exec("delete from public.courses where id='new-course'");
  const activation = await readFile(new URL('../supabase/open-course-assessments.sql',import.meta.url),'utf8');
  await db.exec(activation);
  const opened = (await db.query('select course_id,revision,needs_review,jsonb_array_length(questions) as total,reviewed_by from public.course_assessments order by course_id')).rows;
  assert.equal(opened.length,6);
  assert(opened.every(item=>item.total===20 && item.needs_review===false),'initial activation opens every prepared assessment');
  assert(opened.filter(item=>item.course_id!==course).every(item=>item.reviewed_by.includes('review deferred')),'initial publication records that review was deferred');
  assert.equal((await db.query('select count(*) from public.assessment_attempts')).rows[0].count,attemptCount,'activation preserves saved results');
  await db.exec("update public.courses set overview=overview||' Updated after release.' where id='academic-excellence'");
  await db.exec(activation);
  const reopened = (await db.query('select course_id,revision,needs_review from public.course_assessments order by course_id')).rows;
  assert(reopened.find(item=>item.course_id==='academic-excellence').needs_review,'rerun does not approve future content updates');
  assert.deepEqual(reopened.map(item=>item.revision),opened.map(item=>item.revision),'rerun does not republish existing versions');

  // Exercise API-backed draft generation with a mock; no paid API call is made.
  let request;
  const generated=entry.draft.questions.map(q=>({...q,sourceQuote:entry.source.course.overview.slice(0,60)}));
  const questions=await generateDraft({source:entry.source,apiKey:'test-only',model:'test-model',fetchImpl:async(url,options)=>{
    request={url,body:JSON.parse(options.body)};
    return {ok:true,json:async()=>({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({insufficientContent:false,reason:'',questions:generated})}]}]})};
  }});
  assert.equal(questions.length,20); assert.equal(request.body.text.format.type,'json_schema'); assert.equal(request.body.store,false);
  await assert.rejects(generateDraft({source:entry.source,apiKey:'test-only',model:'test-model',fetchImpl:async()=>({ok:true,json:async()=>({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({insufficientContent:true,reason:'Too little teaching text.',questions:[]})}]}]})})}),/More lesson content/);
  const unsupported=structuredClone(generated); unsupported[0].sourceQuote='This passage does not exist anywhere in the supplied course.';
  await assert.rejects(generateDraft({source:entry.source,apiKey:'test-only',model:'test-model',fetchImpl:async()=>({ok:true,json:async()=>({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({insufficientContent:false,reason:'',questions:unsupported})}]}]})})}),/traced/);
  console.log('PASS: 120 questions, all 59 lessons covered, private drafts, explicit review, stale draft rejection, course change detection, versioned scoring, 55/60% boundaries, saved results, new courses, API contract, evidence checks, and safe migration reruns.');
} finally { await db.close(); }
