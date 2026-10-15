import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
import { createClient } from '@supabase/supabase-js';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { generateDraft, renderReview, validateQuestionBank } from './lib/assessment-drafts.mjs';

const [command, argument, ...flags] = process.argv.slice(2);
const outputDirectory = path.resolve('.assessment-review');
loadEnvConfig(process.cwd());

async function saveReview(entry) {
  // Course IDs are external data; never use them as unchecked filesystem paths.
  const filename = encodeURIComponent(entry.courseId);
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, `${filename}.json`), JSON.stringify(entry, null, 2) + '\n');
  await writeFile(path.join(outputDirectory, `${filename}.md`), renderReview(entry));
}

async function main() {
  if (command === 'review-local') {
    const banks = JSON.parse(await readFile('supabase/assessments/course-question-drafts.json', 'utf8'));
    const report = ['# Assessment drafts for review', '', '120 questions across six courses. These are unpublished drafts aligned with the current lesson topics and outcomes. Full lesson bodies require a live scan before approval.', ''];
    for (const bank of banks) report.push(renderReview({ courseId: bank.courseId, title: bank.title, draft: { questions: bank.questions } }), '\n---\n');
    await writeFile('supabase/assessments/REVIEW.md', report.join('\n'));
    console.log('Created supabase/assessments/REVIEW.md. Nothing was published.');
    return;
  }
  if (!['scan', 'generate', 'publish'].includes(command)) throw new Error('Use: assessments scan | generate [course-id|--all] | publish <review.json> --reviewed-by <name> | review-local');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and the server-only SUPABASE_SERVICE_ROLE_KEY. Never use a public client key for content review.');
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  if (command === 'publish') {
    const reviewerIndex = flags.indexOf('--reviewed-by');
    const reviewer = reviewerIndex === -1 ? '' : flags[reviewerIndex + 1];
    if (!argument || !reviewer?.trim()) throw new Error('Publishing requires a reviewed JSON file and --reviewed-by <name>.');
    const entry = JSON.parse(await readFile(argument, 'utf8'));
    if (!entry.draft || entry.draft.sourceSignature !== entry.sourceSignature) throw new Error('The draft is stale. Generate and review a new draft first.');
    validateQuestionBank(entry.draft.questions, entry.source);
    const { error } = await db.rpc('publish_course_assessment', { target_course: entry.courseId, expected_signature: entry.sourceSignature, expected_draft_hash: entry.draft.draftHash, reviewer: reviewer.trim(), reviewed_bank: entry.draft.questions });
    if (error) throw new Error(error.message);
    console.log(`Published the reviewed 20-question assessment for ${entry.courseId}.`);
    return;
  }
  const { data, error } = await db.rpc('get_assessment_review_sources');
  if (error) throw new Error(error.message);
  const entries = data ?? [];
  if (command === 'scan') {
    for (const entry of entries) {
      await saveReview(entry);
      console.log(`${entry.courseId}: ${entry.needsReview ? 'REVIEW NEEDED' : 'published and current'}; draft ${entry.draft?.status ?? 'not generated'}`);
    }
    console.log(`Read ${entries.length} current courses, including all lesson notes. Reviews saved to .assessment-review/. Nothing was published.`);
    return;
  }
  if (!argument) throw new Error('Choose a course ID or --all to generate drafts.');
  const chosen = entries.filter(entry => argument === '--all' ? entry.needsReview : entry.courseId === argument);
  if (!chosen.length) throw new Error('No matching courses need generation. Run scan to inspect the catalogue.');
  for (const entry of chosen) {
    const questions = await generateDraft({ source: entry.source, apiKey: process.env.OPENAI_API_KEY, model: process.env.OPENAI_ASSESSMENT_MODEL });
    const staged = await db.rpc('stage_course_assessment', { target_course: entry.courseId, bank: questions, expected_signature: entry.sourceSignature });
    if (staged.error) throw new Error(staged.error.message);
    console.log(`Generated 20 draft questions for ${entry.courseId}; review required.`);
  }
  const refreshed = await db.rpc('get_assessment_review_sources');
  if (refreshed.error) throw new Error(refreshed.error.message);
  for (const entry of refreshed.data ?? []) if (chosen.some(item => item.courseId === entry.courseId)) await saveReview(entry);
  console.log('Drafts staged and review files saved. No assessment was published.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
