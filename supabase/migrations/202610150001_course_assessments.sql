-- Course assessments: private answer keys, server grading, and per-student results.
-- Apply after the existing migrations. Lesson completion remains separate from quiz scores.
begin;

create table if not exists public.course_assessments (
  course_id text primary key references public.courses(id) on delete cascade,
  questions jsonb not null check (jsonb_typeof(questions) = 'array' and jsonb_array_length(questions) > 0)
);
create table if not exists public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  course_id text not null,
  score integer not null check (score between 0 and 100),
  result jsonb not null,
  created_at timestamptz not null default now(),
  foreign key (user_id, course_id) references public.enrollments(user_id, course_id) on delete cascade
);
create index if not exists assessment_attempts_student_course_idx
  on public.assessment_attempts(user_id, course_id, created_at desc);
alter table public.course_assessments enable row level security;
alter table public.assessment_attempts enable row level security;
revoke all on public.course_assessments, public.assessment_attempts from public, anon, authenticated;
grant select on public.assessment_attempts to authenticated;
grant all on public.course_assessments, public.assessment_attempts to service_role;
drop policy if exists assessment_attempts_read_own on public.assessment_attempts;
create policy assessment_attempts_read_own on public.assessment_attempts for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.get_course_assessment(target_course text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare student uuid := auth.uid(); bank jsonb; latest jsonb; best integer;
begin
  if student is null or not exists (
    select 1 from public.enrollments e join public.courses c on c.id = e.course_id
    where e.user_id = student and e.course_id = target_course and c.is_published
  ) then raise exception 'Sign in and enroll in this course to access its assessment.'; end if;
  select questions into bank from public.course_assessments where course_id = target_course;
  if bank is null then return null; end if;
  select result into latest from public.assessment_attempts
    where user_id = student and course_id = target_course order by created_at desc, id desc limit 1;
  select max(score) into best from public.assessment_attempts where user_id = student and course_id = target_course;
  return jsonb_build_object(
    'questions', (select jsonb_agg(jsonb_build_object('id', q->>'id', 'prompt', q->>'prompt', 'options', q->'options') order by position)
      from jsonb_array_elements(bank) with ordinality as items(q, position)),
    'passMark', 60, 'latestResult', latest, 'bestScore', best
  );
end;
$$;
revoke all on function public.get_course_assessment(text) from public, anon, authenticated;
grant execute on function public.get_course_assessment(text) to authenticated;

create or replace function public.submit_course_assessment(target_course text, submitted_answers jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  student uuid := auth.uid(); bank jsonb; question jsonb; selected integer;
  correct integer := 0; total integer; score_value integer; review jsonb := '[]'; outcome jsonb;
  attempt_id uuid := gen_random_uuid(); submitted_at timestamptz := now();
begin
  if student is null or not exists (
    select 1 from public.enrollments e join public.courses c on c.id = e.course_id
    where e.user_id = student and e.course_id = target_course and c.is_published
  ) then raise exception 'Sign in and enroll in this course before submitting.'; end if;
  perform 1 from public.enrollments where user_id = student and course_id = target_course for update;
  if not exists (select 1 from public.lessons where course_id = target_course) or exists (
    select 1 from public.lessons l where l.course_id = target_course and not exists (
      select 1 from public.lesson_progress p where p.user_id = student and p.course_id = target_course and p.lesson_id = l.id
    )
  ) then raise exception 'Complete all course lessons before taking the assessment.'; end if;
  select questions into bank from public.course_assessments where course_id = target_course;
  if bank is null then raise exception 'This assessment is not available yet.'; end if;
  total := jsonb_array_length(bank);
  if submitted_answers is null or jsonb_typeof(submitted_answers) <> 'object' then
    raise exception 'Answer every question before submitting.';
  end if;
  if (select count(*) from jsonb_object_keys(submitted_answers)) <> total then
    raise exception 'Answer every question before submitting.';
  end if;
  for question in select value from jsonb_array_elements(bank) loop
    if not (submitted_answers ? (question->>'id')) or
      jsonb_typeof(submitted_answers->(question->>'id')) <> 'number' or
      (submitted_answers->>(question->>'id')) !~ '^[0-3]$' then
      raise exception 'Choose a valid answer for every question.';
    end if;
    selected := (submitted_answers->>(question->>'id'))::integer;
    if selected = (question->>'correctIndex')::integer then correct := correct + 1; end if;
    review := review || jsonb_build_array(jsonb_build_object(
      'id', question->>'id', 'prompt', question->>'prompt', 'options', question->'options',
      'selectedIndex', selected, 'correctIndex', (question->>'correctIndex')::integer,
      'explanation', question->>'explanation'
    ));
  end loop;
  score_value := round(correct * 100.0 / total);
  outcome := jsonb_build_object('id', attempt_id, 'score', score_value, 'correct', correct,
    'total', total, 'passed', score_value >= 60, 'passMark', 60, 'review', review, 'submittedAt', submitted_at);
  insert into public.assessment_attempts(id, user_id, course_id, score, result, created_at)
    values(attempt_id, student, target_course, score_value, outcome, submitted_at);
  return outcome;
end;
$$;
revoke all on function public.submit_course_assessment(text, jsonb) from public, anon, authenticated;
grant execute on function public.submit_course_assessment(text, jsonb) to authenticated;

-- Five questions for each existing course. Keys are never readable by browser clients.
insert into public.course_assessments(course_id, questions)
select 'financial-intelligence', $questions$[{"id": "q1", "prompt": "A student receives ₦30,000 and spends ₦22,000. How much remains?", "options": ["₦52,000", "₦8,000", "₦22,000", "₦30,000"], "correctIndex": 1, "explanation": "Subtract expenses from income: ₦30,000 − ₦22,000 = ₦8,000."}, {"id": "q2", "prompt": "Which item is most clearly a need for attending a class?", "options": ["A new gaming subscription", "A designer bag", "Transport to the classroom", "An extra entertainment package"], "correctIndex": 2, "explanation": "A need supports an essential activity, such as travelling to an in-person class."}, {"id": "q3", "prompt": "What does a budget record?", "options": ["Only the things you want", "Only money borrowed", "Only large purchases", "Planned income and expenses"], "correctIndex": 3, "explanation": "A budget brings planned income and expenses together so you can compare them."}, {"id": "q4", "prompt": "You plan to save ₦12,000 over four months in equal amounts. What is the monthly amount?", "options": ["₦3,000", "₦4,000", "₦8,000", "₦48,000"], "correctIndex": 0, "explanation": "Divide the total goal by the number of months: ₦12,000 ÷ 4 = ₦3,000."}, {"id": "q5", "prompt": "Why keep a record of small daily expenses?", "options": ["They never affect a budget", "They add up and help explain spending patterns", "Recording them increases income", "Only cash payments count"], "correctIndex": 1, "explanation": "Small purchases can add up. Recording them makes spending patterns easier to see."}]$questions$::jsonb
where exists (select 1 from public.courses where id = 'financial-intelligence')
on conflict (course_id) do nothing;

insert into public.course_assessments(course_id, questions)
select 'learning-styles', $questions$[{"id": "q1", "prompt": "What is a flexible approach to learning?", "options": ["Always using one method", "Avoiding unfamiliar tasks", "Choosing methods that suit the task", "Only studying topics that feel easy"], "correctIndex": 2, "explanation": "Different tasks benefit from different approaches. A flexible toolkit lets you adapt."}, {"id": "q2", "prompt": "Which activity is retrieval practice?", "options": ["Answering a question from memory before checking your notes", "Copying a paragraph while looking at it", "Highlighting every sentence", "Reading the same page without pausing"], "correctIndex": 0, "explanation": "Retrieval practice means trying to recall information before checking the answer."}, {"id": "q3", "prompt": "What does spaced revision mean?", "options": ["Doing all revision in one long sitting", "Never reviewing previous work", "Only revising on exam day", "Returning to material across separate study sessions"], "correctIndex": 3, "explanation": "Spaced revision spreads review across separate sessions instead of concentrating it in one sitting."}, {"id": "q4", "prompt": "After explaining a concept from memory, what should you do?", "options": ["Assume every detail was correct", "Check your explanation and review any gaps", "Avoid looking at the topic again", "Replace the topic with something easier"], "correctIndex": 1, "explanation": "Checking your explanation helps you identify and correct gaps in understanding."}, {"id": "q5", "prompt": "Which is the clearest sign that you can use a new idea?", "options": ["Your notes look colourful", "You recognise the page layout", "You can apply it to a new example", "You read the title many times"], "correctIndex": 2, "explanation": "Applying an idea to a new example demonstrates understanding beyond recognising the material."}]$questions$::jsonb
where exists (select 1 from public.courses where id = 'learning-styles')
on conflict (course_id) do nothing;

insert into public.course_assessments(course_id, questions)
select 'academic-excellence', $questions$[{"id": "q1", "prompt": "Which study goal is the most specific?", "options": ["Become better at everything", "Study whenever possible", "Never make a mistake", "Complete five practice problems by Friday"], "correctIndex": 3, "explanation": "A specific goal describes an observable task and a deadline."}, {"id": "q2", "prompt": "Two assignments are due tomorrow and next month. What should guide your planning?", "options": ["Urgency, importance, and the time each task needs", "Only how colourful the assignment looks", "Always choosing the longest deadline first", "Ignoring both until the deadline passes"], "correctIndex": 0, "explanation": "Planning considers deadlines, importance, and the effort needed for each task."}, {"id": "q3", "prompt": "Which notes are easiest to use for revision?", "options": ["An unbroken copy of every word", "Organised key ideas, questions, and examples", "Only the lecture date", "Unlabelled fragments from different topics"], "correctIndex": 1, "explanation": "Organised ideas, questions, and examples help you revisit and test your understanding."}, {"id": "q4", "prompt": "What should you do after getting a practice question wrong?", "options": ["Hide the result", "Stop studying the subject", "Identify the error, review the idea, and try again", "Memorise only the question number"], "correctIndex": 2, "explanation": "Reviewing the reason for an error helps you decide what to practise next."}, {"id": "q5", "prompt": "Your study plan keeps slipping. What is a useful next step?", "options": ["Keep the same unrealistic schedule", "Remove every break", "Wait for motivation without changing anything", "Review what got in the way and adjust the plan"], "correctIndex": 3, "explanation": "A study plan should adapt to your commitments and what you learn about your working habits."}]$questions$::jsonb
where exists (select 1 from public.courses where id = 'academic-excellence')
on conflict (course_id) do nothing;

insert into public.course_assessments(course_id, questions)
select 'emotional-intelligence', $questions$[{"id": "q1", "prompt": "Which action shows self-awareness?", "options": ["Noticing and naming your emotion before responding", "Assuming other people caused every feeling", "Pretending emotions never occur", "Responding before thinking"], "correctIndex": 0, "explanation": "Self-awareness includes recognising your feelings and noticing how they affect your response."}, {"id": "q2", "prompt": "What is an emotional trigger?", "options": ["A guarantee that everyone reacts the same way", "An instruction to argue", "A situation or experience that prompts an emotional response", "A way to remove all feelings"], "correctIndex": 2, "explanation": "A trigger is something that prompts an emotional response; different people may respond differently."}, {"id": "q3", "prompt": "Which response best demonstrates empathy?", "options": ["Immediately judging someone", "Trying to understand another person's perspective", "Making every conversation about yourself", "Assuming you know how everyone feels"], "correctIndex": 1, "explanation": "Empathy involves trying to understand someone else's experience and perspective."}, {"id": "q4", "prompt": "During a disagreement, which response leaves room for a thoughtful discussion?", "options": ["Interrupting repeatedly", "Sending an angry message immediately", "Using insults", "Pausing, listening, and explaining your view calmly"], "correctIndex": 3, "explanation": "Pausing and listening can help you choose a response rather than reacting impulsively."}, {"id": "q5", "prompt": "How can reflection support personal growth?", "options": ["By proving that you are always right", "By replacing every conversation", "By noticing patterns and considering a different response next time", "By ensuring you never experience emotions"], "correctIndex": 2, "explanation": "Reflection helps you notice patterns and choose actions you may want to change."}]$questions$::jsonb
where exists (select 1 from public.courses where id = 'emotional-intelligence')
on conflict (course_id) do nothing;

insert into public.course_assessments(course_id, questions)
select 'effective-communication', $questions$[{"id": "q1", "prompt": "What helps make a message clear?", "options": ["Including every unrelated detail", "Stating the main point and supporting it with relevant details", "Using unfamiliar words whenever possible", "Avoiding the purpose of the conversation"], "correctIndex": 1, "explanation": "A clear main point and relevant supporting details help the listener follow your message."}, {"id": "q2", "prompt": "Which action demonstrates active listening?", "options": ["Planning your reply while someone speaks", "Checking your phone throughout", "Interrupting to finish every sentence", "Listening, then summarising to check your understanding"], "correctIndex": 3, "explanation": "Summarising and checking what you heard helps establish shared understanding."}, {"id": "q3", "prompt": "You are unsure what a teammate means. What should you do?", "options": ["Ask a respectful clarifying question", "Pretend you understood", "Assume the worst interpretation", "Change the topic immediately"], "correctIndex": 0, "explanation": "A clarifying question helps resolve uncertainty without making assumptions."}, {"id": "q4", "prompt": "Which feedback is most constructive?", "options": ["You are bad at everything", "Everyone dislikes your work", "Your main point was clear; adding an example could make it stronger", "This is useless"], "correctIndex": 2, "explanation": "Constructive feedback is specific, respectful, and suggests an actionable improvement."}, {"id": "q5", "prompt": "Why adapt a message to your audience?", "options": ["To avoid communicating any information", "To make the language and detail appropriate for the listener", "To give everyone identical technical detail", "To make the message longer in every case"], "correctIndex": 1, "explanation": "Considering the audience helps you choose understandable language and a useful level of detail."}]$questions$::jsonb
where exists (select 1 from public.courses where id = 'effective-communication')
on conflict (course_id) do nothing;

insert into public.course_assessments(course_id, questions)
select 'nation-building', $questions$[{"id": "q1", "prompt": "Which action demonstrates responsible citizenship?", "options": ["Ignoring shared responsibilities", "Damaging shared facilities", "Helping care for a shared community space", "Preventing others from participating"], "correctIndex": 2, "explanation": "Taking care of shared spaces is one practical way to contribute to community life."}, {"id": "q2", "prompt": "What is a useful first step when planning a community project?", "options": ["Listen to residents and identify a real need", "Choose a solution without asking anyone", "Promise results before planning", "Ignore the people affected"], "correctIndex": 0, "explanation": "Listening to residents helps identify a need and shape a project around those affected."}, {"id": "q3", "prompt": "Which behaviour supports collaboration across differences?", "options": ["Excluding people with different views", "Assuming one person has every answer", "Refusing to listen", "Respecting others and looking for shared goals"], "correctIndex": 3, "explanation": "Respectful listening and shared goals help people with different experiences work together."}, {"id": "q4", "prompt": "What does accountability mean in a group project?", "options": ["Taking credit for everyone's work", "Taking responsibility for commitments and reporting progress honestly", "Hiding every setback", "Blaming others for all outcomes"], "correctIndex": 1, "explanation": "Accountability includes owning your commitments and communicating honestly about progress."}, {"id": "q5", "prompt": "How can a team review a small community initiative?", "options": ["Only count how many promises were made", "Avoid speaking to participants", "Compare results with the goal and gather feedback", "Assume any activity was automatically successful"], "correctIndex": 2, "explanation": "Comparing results with the goal and gathering feedback helps the team understand its impact."}]$questions$::jsonb
where exists (select 1 from public.courses where id = 'nation-building')
on conflict (course_id) do nothing;

commit;
