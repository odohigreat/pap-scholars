# Assessment review and publication

Each course assessment contains 20 multiple-choice questions. Every question references a lesson, has four distinct options, one correct answer, and an explanation. The pass mark is 60% (12 correct answers). The six initial draft banks cover all 59 current lesson topics; they are unpublished until reviewed against the teaching content.

For an existing app, paste the entire [combined setup script](../setup-course-assessments.sql) into Supabase SQL Editor and run it. It creates missing assessment tables before installing the review workflow, in one transaction, and is safe to rerun. This also fixes `relation "public.course_assessments" does not exist`. The app’s base course tables must already exist.

Alternatively, apply migrations `202610150001_course_assessments.sql` and `202610150002_assessment_review_workflow.sql` in order. The second migration preserves previous results, creates the draft review queue, and retires the original five-question assessments until a reviewed replacement is published.

## Review the prepared questions

Run `npm run assessments -- review-local` to regenerate [REVIEW.md](REVIEW.md) from [course-question-drafts.json](course-question-drafts.json). This contains all 120 prompts, answer choices, correct answers, explanations, and source lesson IDs. The question sets have been checked against the published course outcomes and lesson topics. Review full current lesson notes before approving; titles alone are not evidence that an answer is taught.

These files live outside `public/` and must never be imported by client components.

## Scan live courses, including updates and additions

Set the following server-only environment variable in `.env.local`, alongside the existing public Supabase URL:

```text
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
```

Never put this key in a `NEXT_PUBLIC_` variable or commit it. A public key cannot read all private course notes or publish assessments.

Run:

```sh
npm run assessments -- scan
```

The scan reads every published course, module, outcome, and full lesson note. It writes a JSON snapshot and readable review for each course into the ignored `.assessment-review/` folder. It reports missing, stale, and published assessments. It does not change any live assessment.

Course title, description, overview, outcomes, module order/title, and lesson content/order changes automatically mark the assessment for review. Added and removed lessons are detected. New courses appear in the next scan. Cosmetic image/media changes do not require a new assessment. Generation is an explicit command; database triggers flag changes but do not call a paid API.

## Generate an updated draft

Optional AI generation uses the OpenAI Responses API with [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses). Configure a compatible model available to your account:

```text
OPENAI_API_KEY=your-api-key
OPENAI_ASSESSMENT_MODEL=your-structured-output-capable-model
```

```sh
npm run assessments -- generate learning-styles
npm run assessments -- generate --all
```

The command reads the latest source, generates exactly 20 draft questions, validates lesson references and coverage, checks source excerpts, then stages the draft for human review. `--all` processes courses requiring review, including newly published courses. It never publishes. If a course lacks enough teaching content, generation stops with an explanation instead of inventing questions. The API key and model are not configured by this repository.

For manual authoring, call `stage_course_assessment(course_id, question_array, expected_source_signature)` from a trusted server or the Supabase SQL Editor, then scan again to get the updated review. Each question needs `id`, `lessonId`, `prompt`, `options` (four strings), `correctIndex` (0–3), and `explanation`.

## Publish after reviewing

Review the source snapshot, lesson coverage, question wording, answer choices, answer key, and explanations in `.assessment-review/<course-id>.md` and its JSON snapshot. If you change questions, stage them and scan again; editing the local file alone does not change the database draft.

Only after the content review:

```sh
npm run assessments -- publish .assessment-review/learning-styles.json --reviewed-by "Reviewer name"
```

Publication checks both the course signature and the exact draft content. If either changed since the scan, publication fails and asks for a fresh review. Each publication creates a new revision. In-progress submissions with an old revision are rejected instead of being graded against a different answer key. Prior attempts stay saved and are shown separately from the new revision's scores.

While a changed course waits for review, students see an assessment update message and retain access to their prior scores. Their lessons and progress remain available.

## Verification

```sh
PAP_PGLITE_MODULE=/tmp/pap-assessment-check/node_modules/@electric-sql/pglite/dist/index.js node scripts/check-assessment-review.mjs
```

This uses isolated PostgreSQL. It covers all 120 questions, lesson coverage, draft privacy, reviewer-only publication, stale snapshots, content edits, new courses, versioned scores, invalid submissions, and mocked generation. It does not connect to the hosted database or make paid API calls.

## Initial release with review deferred

The site owner has requested that the six prepared assessments open now, with content review handled later. After the combined setup, run [open-course-assessments.sql](../open-course-assessments.sql) once in Supabase SQL Editor. It publishes the prepared 20-question banks, records that review was deferred, and preserves existing attempts. Rerunning it leaves published versions untouched. Future course changes still flag assessments for review.
