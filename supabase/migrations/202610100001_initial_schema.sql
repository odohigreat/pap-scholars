-- PAP Scholars: run the entire file in the Supabase SQL Editor.
-- Intended for a fresh project; run once. Transactional: errors roll back changes.
-- Accounts/passwords are managed by Supabase Auth, never by these tables.
begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  learning_goal text not null default '' check (char_length(learning_goal) <= 500),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id text primary key,
  title text not null,
  description text not null,
  category text not null,
  overview text not null,
  outcomes text[] not null default '{}',
  image_url text not null,
  image_alt text not null default '',
  duration_minutes integer not null check (duration_minutes > 0),
  instructor_name text not null default 'PAP Scholars Learning Team',
  is_published boolean not null default false,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.course_modules (
  course_id text not null references public.courses(id) on delete cascade,
  id text not null,
  title text not null,
  position integer not null check (position > 0),
  primary key (course_id, id),
  unique (course_id, position)
);

create table public.lessons (
  course_id text not null,
  id text not null,
  module_id text not null,
  title text not null,
  description text not null default '',
  content text not null default '',
  video_url text,
  duration_minutes integer not null check (duration_minutes > 0),
  position integer not null check (position > 0),
  primary key (course_id, id),
  foreign key (course_id, module_id) references public.course_modules(course_id, id) on delete cascade,
  unique (course_id, module_id, position)
);

create table public.enrollments (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

-- A row represents a completed lesson. Course percentages derive from row counts.
create table public.lesson_progress (
  user_id uuid not null,
  course_id text not null,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, course_id, lesson_id),
  foreign key (user_id, course_id) references public.enrollments(user_id, course_id) on delete cascade,
  foreign key (course_id, lesson_id) references public.lessons(course_id, id) on delete cascade
);

create table public.journal_articles (
  slug text primary key,
  title text not null,
  category text not null,
  excerpt text not null,
  published_on date not null,
  image_url text not null,
  image_alt text not null default '',
  introduction text not null,
  sections jsonb not null default '[]' check (jsonb_typeof(sections) = 'array'),
  is_published boolean not null default false,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Insert from a server endpoint with the service role after validation/rate limiting.
-- Public clients cannot insert or read messages directly.
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  subject text not null check (char_length(btrim(subject)) between 1 and 180),
  message text not null check (char_length(btrim(message)) between 1 and 3000),
  status text not null default 'new' check (status in ('new', 'read', 'resolved')),
  created_at timestamptz not null default now()
);

create index enrollments_course_idx on public.enrollments(course_id);
create index lesson_progress_lesson_idx on public.lesson_progress(course_id, lesson_id);
create index notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index contact_messages_status_idx on public.contact_messages(status, created_at desc);

create function public.pap_set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated before update on public.profiles for each row execute function public.pap_set_updated_at();
create trigger courses_updated before update on public.courses for each row execute function public.pap_set_updated_at();
create trigger articles_updated before update on public.journal_articles for each row execute function public.pap_set_updated_at();

create function public.pap_handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, full_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120))
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.pap_handle_new_user() from public, anon, authenticated;
revoke all on function public.pap_set_updated_at() from public, anon, authenticated;

create trigger pap_auth_user_created after insert on auth.users
for each row execute function public.pap_handle_new_user();

-- Also create profiles for any accounts already in Supabase Auth.
insert into public.profiles(id, full_name)
select id, left(coalesce(raw_user_meta_data ->> 'full_name', ''), 120) from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.journal_articles enable row level security;
alter table public.notifications enable row level security;
alter table public.contact_messages enable row level security;

-- Remove default API grants before granting the minimum required permissions.
revoke all on public.profiles, public.courses, public.course_modules, public.lessons,
  public.enrollments, public.lesson_progress, public.journal_articles,
  public.notifications, public.contact_messages from public, anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;
grant select on public.courses, public.course_modules, public.journal_articles to anon, authenticated;
grant select on public.profiles, public.lessons, public.enrollments, public.lesson_progress, public.notifications to authenticated;
grant update (full_name, learning_goal, avatar_url) on public.profiles to authenticated;
grant insert (user_id, course_id) on public.enrollments to authenticated;
grant insert (user_id, course_id, lesson_id) on public.lesson_progress to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant all on public.profiles, public.courses, public.course_modules, public.lessons,
  public.enrollments, public.lesson_progress, public.journal_articles,
  public.notifications, public.contact_messages to service_role;

create policy profiles_read_own on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated
using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy courses_read_published on public.courses for select to anon, authenticated using (is_published);
create policy modules_read_published on public.course_modules for select to anon, authenticated
using (exists (select 1 from public.courses c where c.id = course_id and c.is_published));
create policy lessons_read_enrolled on public.lessons for select to authenticated
using (
  exists (select 1 from public.courses c where c.id = course_id and c.is_published)
  and exists (select 1 from public.enrollments e where e.course_id = lessons.course_id and e.user_id = (select auth.uid()))
);
create policy enrollments_read_own on public.enrollments for select to authenticated using (user_id = (select auth.uid()));
-- All initial courses are free: students may enrol themselves in published courses.
create policy enrollments_insert_own on public.enrollments for insert to authenticated
with check (user_id = (select auth.uid()) and exists (select 1 from public.courses c where c.id = course_id and c.is_published));
create policy progress_read_own on public.lesson_progress for select to authenticated using (user_id = (select auth.uid()));
create policy progress_insert_own on public.lesson_progress for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (select 1 from public.lessons l where l.course_id = lesson_progress.course_id and l.id = lesson_id)
);
create policy articles_read_published on public.journal_articles for select to anon, authenticated
using (is_published and published_on <= current_date);
create policy notifications_read_own on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy notifications_update_own on public.notifications for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- SEED DATA BELOW: current website demo content, preserving existing URL IDs.

insert into public.courses (id, title, description, category, overview, outcomes, image_url, image_alt, duration_minutes, is_published, is_demo) values
  ('financial-intelligence', 'Financial Intelligence', 'Build a healthier relationship with money. Explore budgeting, saving, and thoughtful financial decisions.', 'Personal finance', 'Money skills start with everyday choices. Build a practical foundation for managing what you have, planning for what matters, and making informed decisions as a student.', array['Create a realistic student budget', 'Set savings goals and track your progress', 'Distinguish needs from wants', 'Recognise financial risks and make thoughtful choices']::text[], '/images/courses/financial-intelligence.webp', 'Student reviewing a budget with a calculator, notebook, and savings jar', 120, true, true),
  ('learning-styles', 'Understanding and Utilizing Your Learning Styles', 'Reflect on how you approach learning and explore study strategies you can adapt to different tasks.', 'Learning strategies', 'There is more than one way to approach a learning task. Reflect on your preferences, experiment with evidence-informed study techniques, and build a flexible toolkit instead of limiting yourself to a single learning style.', array['Reflect on your learning habits', 'Choose strategies that suit the task', 'Use retrieval practice and spaced revision', 'Build and adjust a personal study routine']::text[], '/images/courses/learning-styles.webp', 'Student studying with a textbook, visual notes, tablet, and headphones', 90, true, true),
  ('academic-excellence', 'Academic Excellence Tips', 'Bring more intention to your studies with practical approaches to planning, revision, and academic goals.', 'Academic growth', 'Academic growth is built through small, consistent actions. Turn your goals into a manageable plan and develop habits that help you prepare, participate, and revise with purpose.', array['Set achievable academic goals', 'Plan your time around priorities', 'Take notes that support revision', 'Prepare for assessments with confidence']::text[], '/images/courses/academic-excellence.webp', 'Student preparing for academic work with textbooks, notebooks, and a study planner', 80, true, true),
  ('emotional-intelligence', 'Emotional Intelligence', 'Develop self-awareness, understand your emotions, and approach relationships with greater empathy.', 'Personal development', 'Understanding your emotions can help you respond thoughtfully to everyday challenges. Explore self-awareness, empathy, and practical ways to build healthier relationships in your student life.', array['Name and reflect on your emotions', 'Recognise everyday emotional triggers', 'Practise empathy and perspective-taking', 'Respond thoughtfully during disagreements']::text[], '/images/courses/emotional-intelligence.webp', 'Two students having a thoughtful conversation in a campus courtyard', 90, true, true),
  ('effective-communication', 'Effective Communication', 'Express your ideas clearly, listen with purpose, and build confidence in everyday conversations.', 'Communication', 'Clear communication brings ideas and people together. Practise expressing yourself, listening attentively, and adapting your message across classroom discussions, teamwork, and everyday conversations.', array['Structure a clear message', 'Listen actively and ask useful questions', 'Give and receive constructive feedback', 'Speak with greater confidence in a group']::text[], '/images/courses/effective-communication.webp', 'Student explaining an idea to two attentive classmates during a discussion', 80, true, true),
  ('nation-building', 'Nation Building', 'Explore responsible citizenship, shared values, and the role you can play in strengthening your community.', 'Citizenship & leadership', 'Strong communities grow through participation, responsibility, and shared purpose. Explore what citizenship means in everyday life and identify practical ways to contribute to your community.', array['Explain the role of responsible citizenship', 'Recognise shared values across differences', 'Identify a need in your community', 'Plan a small, meaningful community initiative']::text[], '/images/courses/nation-building.webp', 'Young community volunteers working together to plant a tree near a school', 100, true, true);

insert into public.course_modules (course_id, id, title, position) values
  ('financial-intelligence', 'module-1', 'Your relationship with money', 1),
  ('financial-intelligence', 'module-2', 'Budgeting and saving', 2),
  ('financial-intelligence', 'module-3', 'Decisions for the future', 3),
  ('learning-styles', 'module-1', 'Understand your approach', 1),
  ('learning-styles', 'module-2', 'Expand your toolkit', 2),
  ('learning-styles', 'module-3', 'Make learning work for you', 3),
  ('academic-excellence', 'module-1', 'Build your foundation', 1),
  ('academic-excellence', 'module-2', 'Study with intention', 2),
  ('academic-excellence', 'module-3', 'Keep your momentum', 3),
  ('emotional-intelligence', 'module-1', 'Know yourself', 1),
  ('emotional-intelligence', 'module-2', 'Respond with intention', 2),
  ('emotional-intelligence', 'module-3', 'Connect with others', 3),
  ('effective-communication', 'module-1', 'Make your message clear', 1),
  ('effective-communication', 'module-2', 'Listen and connect', 2),
  ('effective-communication', 'module-3', 'Put it into practice', 3),
  ('nation-building', 'module-1', 'Citizenship and shared values', 1),
  ('nation-building', 'module-2', 'Leadership in everyday life', 2),
  ('nation-building', 'module-3', 'Contribute to your community', 3);

insert into public.lessons (course_id, id, module_id, title, description, video_url, duration_minutes, position) values
  ('financial-intelligence', 'money-habits-and-values', 'module-1', 'Money habits and values', 'Explore money habits and values through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 6, 1),
  ('financial-intelligence', 'needs-wants-and-priorities', 'module-1', 'Needs, wants, and priorities', 'Explore needs, wants, and priorities through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 7, 2),
  ('financial-intelligence', 'setting-financial-goals', 'module-1', 'Setting financial goals', 'Explore setting financial goals through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 8, 3),
  ('financial-intelligence', 'understanding-income-and-expenses', 'module-1', 'Understanding income and expenses', 'Explore understanding income and expenses through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 9, 4),
  ('financial-intelligence', 'tracking-your-spending', 'module-2', 'Tracking your spending', 'Explore tracking your spending through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 7, 1),
  ('financial-intelligence', 'building-a-student-budget', 'module-2', 'Building a student budget', 'Explore building a student budget through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 8, 2),
  ('financial-intelligence', 'saving-with-intention', 'module-2', 'Saving with intention', 'Explore saving with intention through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 9, 3),
  ('financial-intelligence', 'preparing-for-unexpected-costs', 'module-2', 'Preparing for unexpected costs', 'Explore preparing for unexpected costs through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 10, 4),
  ('financial-intelligence', 'creating-a-budget-that-works', 'module-3', 'Creating a budget that works', 'Explore creating a budget that works through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 8, 1),
  ('financial-intelligence', 'understanding-borrowing', 'module-3', 'Understanding borrowing', 'Explore understanding borrowing through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 9, 2),
  ('financial-intelligence', 'recognising-financial-risks', 'module-3', 'Recognising financial risks', 'Explore recognising financial risks through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 10, 3),
  ('financial-intelligence', 'your-personal-money-plan', 'module-3', 'Your personal money plan', 'Explore your personal money plan through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 11, 4),
  ('learning-styles', 'reflecting-on-your-study-habits', 'module-1', 'Reflecting on your study habits', 'Explore reflecting on your study habits through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 6, 1),
  ('learning-styles', 'preferences-versus-effective-strategies', 'module-1', 'Preferences versus effective strategies', 'Explore preferences versus effective strategies through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 7, 2),
  ('learning-styles', 'finding-your-study-rhythm', 'module-1', 'Finding your study rhythm', 'Explore finding your study rhythm through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 8, 3),
  ('learning-styles', 'making-useful-visual-notes', 'module-2', 'Making useful visual notes', 'Explore making useful visual notes through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 7, 1),
  ('learning-styles', 'learning-through-explanation', 'module-2', 'Learning through explanation', 'Explore learning through explanation through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 8, 2),
  ('learning-styles', 'practising-with-examples', 'module-2', 'Practising with examples', 'Explore practising with examples through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 9, 3),
  ('learning-styles', 'retrieval-practice-and-spaced-revision', 'module-2', 'Retrieval practice and spaced revision', 'Explore retrieval practice and spaced revision through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 10, 4),
  ('learning-styles', 'choosing-a-strategy-for-the-task', 'module-3', 'Choosing a strategy for the task', 'Explore choosing a strategy for the task through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 8, 1),
  ('learning-styles', 'designing-your-study-routine', 'module-3', 'Designing your study routine', 'Explore designing your study routine through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 9, 2),
  ('learning-styles', 'reflecting-and-adapting', 'module-3', 'Reflecting and adapting', 'Explore reflecting and adapting through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 10, 3),
  ('academic-excellence', 'defining-academic-success', 'module-1', 'Defining academic success', 'Explore defining academic success through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 6, 1),
  ('academic-excellence', 'setting-goals-you-can-act-on', 'module-1', 'Setting goals you can act on', 'Explore setting goals you can act on through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 7, 2),
  ('academic-excellence', 'planning-your-study-week', 'module-1', 'Planning your study week', 'Explore planning your study week through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 8, 3),
  ('academic-excellence', 'active-reading-and-useful-notes', 'module-2', 'Active reading and useful notes', 'Explore active reading and useful notes through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 7, 1),
  ('academic-excellence', 'revision-that-supports-recall', 'module-2', 'Revision that supports recall', 'Explore revision that supports recall through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 8, 2),
  ('academic-excellence', 'preparing-for-assessments', 'module-2', 'Preparing for assessments', 'Explore preparing for assessments through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 9, 3),
  ('academic-excellence', 'using-feedback-to-improve', 'module-3', 'Using feedback to improve', 'Explore using feedback to improve through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 8, 1),
  ('academic-excellence', 'putting-your-study-plan-into-practice', 'module-3', 'Putting your study plan into practice', 'Explore putting your study plan into practice through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 9, 2),
  ('emotional-intelligence', 'understanding-your-emotions', 'module-1', 'Understanding your emotions', 'Explore understanding your emotions through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 6, 1),
  ('emotional-intelligence', 'recognising-emotional-triggers', 'module-1', 'Recognising emotional triggers', 'Explore recognising emotional triggers through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 7, 2),
  ('emotional-intelligence', 'developing-self-awareness', 'module-1', 'Developing self-awareness', 'Explore developing self-awareness through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 8, 3),
  ('emotional-intelligence', 'pausing-before-reacting', 'module-2', 'Pausing before reacting', 'Explore pausing before reacting through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 7, 1),
  ('emotional-intelligence', 'managing-everyday-stress', 'module-2', 'Managing everyday stress', 'Explore managing everyday stress through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 8, 2),
  ('emotional-intelligence', 'building-helpful-habits', 'module-2', 'Building helpful habits', 'Explore building helpful habits through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 9, 3),
  ('emotional-intelligence', 'practising-empathy', 'module-3', 'Practising empathy', 'Explore practising empathy through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 8, 1),
  ('emotional-intelligence', 'seeing-another-perspective', 'module-3', 'Seeing another perspective', 'Explore seeing another perspective through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 9, 2),
  ('emotional-intelligence', 'navigating-disagreements', 'module-3', 'Navigating disagreements', 'Explore navigating disagreements through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 10, 3),
  ('emotional-intelligence', 'your-reflection-plan', 'module-3', 'Your reflection plan', 'Explore your reflection plan through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 11, 4),
  ('effective-communication', 'the-purpose-of-communication', 'module-1', 'The purpose of communication', 'Explore the purpose of communication through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 6, 1),
  ('effective-communication', 'organising-your-ideas', 'module-1', 'Organising your ideas', 'Explore organising your ideas through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 7, 2),
  ('effective-communication', 'choosing-words-with-care', 'module-1', 'Choosing words with care', 'Explore choosing words with care through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 8, 3),
  ('effective-communication', 'active-listening', 'module-2', 'Active listening', 'Explore active listening through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 7, 1),
  ('effective-communication', 'asking-better-questions', 'module-2', 'Asking better questions', 'Explore asking better questions through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 8, 2),
  ('effective-communication', 'understanding-nonverbal-cues', 'module-2', 'Understanding nonverbal cues', 'Explore understanding nonverbal cues through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 9, 3),
  ('effective-communication', 'giving-and-receiving-feedback', 'module-3', 'Giving and receiving feedback', 'Explore giving and receiving feedback through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 8, 1),
  ('effective-communication', 'speaking-in-a-group', 'module-3', 'Speaking in a group', 'Explore speaking in a group through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 9, 2),
  ('effective-communication', 'communicating-through-disagreement', 'module-3', 'Communicating through disagreement', 'Explore communicating through disagreement through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 10, 3),
  ('nation-building', 'what-nation-building-means', 'module-1', 'What nation building means', 'Explore what nation building means through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 6, 1),
  ('nation-building', 'rights-and-responsibilities', 'module-1', 'Rights and responsibilities', 'Explore rights and responsibilities through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 7, 2),
  ('nation-building', 'shared-values-and-belonging', 'module-1', 'Shared values and belonging', 'Explore shared values and belonging through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 8, 3),
  ('nation-building', 'leading-through-service', 'module-2', 'Leading through service', 'Explore leading through service through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 7, 1),
  ('nation-building', 'working-across-differences', 'module-2', 'Working across differences', 'Explore working across differences through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 8, 2),
  ('nation-building', 'making-responsible-choices', 'module-2', 'Making responsible choices', 'Explore making responsible choices through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 9, 3),
  ('nation-building', 'identifying-community-needs', 'module-3', 'Identifying community needs', 'Explore identifying community needs through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 8, 1),
  ('nation-building', 'planning-a-small-initiative', 'module-3', 'Planning a small initiative', 'Explore planning a small initiative through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 9, 2),
  ('nation-building', 'working-with-others', 'module-3', 'Working with others', 'Explore working with others through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 10, 3),
  ('nation-building', 'reflecting-on-your-contribution', 'module-3', 'Reflecting on your contribution', 'Explore reflecting on your contribution through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 11, 4);

insert into public.journal_articles (slug, title, category, excerpt, published_on, image_url, image_alt, introduction, sections, is_published, is_demo) values
  ('understanding-your-learning-style', 'Understanding Your Learning Style', 'Academic Excellence', 'Notice how you approach a new idea, then build a study routine that helps you understand it more deeply.', '2026-10-01', '/images/courses/learning-styles.webp', 'Student studying with a notebook, illustrated textbook, and headphones in a library', 'Think about the last time a difficult idea finally made sense. Perhaps you drew a diagram, talked it through with a friend, or worked through an example. That moment offers a useful starting point for reflecting on how you study.', '[{"heading":"Start with curiosity, rather than a label","paragraphs":["You may prefer pictures, conversation, or hands-on activities. Treat these preferences as options to explore, rather than fixed categories that define what you can learn. Different subjects ask for different approaches.","Instead of deciding that you are one kind of learner, ask what the topic needs. A map can clarify a geographical relationship; working through a problem can show you how a mathematical method works."]},{"heading":"Try more than one way in","paragraphs":["Choose a concept from your current studies. Read a short explanation, sketch its main relationships, and explain it aloud without looking at your notes. Notice which parts remain unclear.","Then test your understanding with a question or a practical example. Feeling comfortable with a page of notes is different from being able to use the idea on your own."]},{"heading":"Build a routine you can adjust","paragraphs":["Keep a brief record of what you tried and what you could explain afterwards. A few sentences are enough. Over time, this gives you something more useful than a label: a collection of approaches you can choose from.","Your next step can be small. In your next study session, replace ten minutes of rereading with a short explanation from memory, then check what you missed."]}]'::jsonb, true, true),
  ('building-financial-intelligence-early', 'Building Financial Intelligence Early', 'Financial Intelligence', 'Small, thoughtful habits can make everyday money decisions feel clearer and more intentional.', '2026-09-28', '/images/courses/financial-intelligence.webp', 'Student reviewing a budget with a calculator and notebook', 'Learning about money begins with everyday choices. Transport, lunch, mobile data, and a purchase you have been looking forward to all compete for the same limited resources. Paying attention to those choices is a practical place to start.', '[{"heading":"Understand your everyday pattern","paragraphs":["Write down what comes in and what goes out over a normal week. Include the small purchases you might otherwise forget. The purpose is to see your pattern clearly, without judging yourself.","Look for costs that are essential, costs that are flexible, and costs that surprised you. Your circumstances will shape those categories; someone else''s budget is unlikely to fit your life exactly."]},{"heading":"Give a goal a clear purpose","paragraphs":["A goal becomes easier to think about when it has a name. You might be planning for study materials, a project, or a future expense. Write down why it matters and what you need to learn about its cost.","Consider the trade-offs before deciding. A smaller purchase today may delay something you value more, while an essential expense may need to come first. Thoughtful planning leaves room for real life."]},{"heading":"Make asking questions a habit","paragraphs":["Before agreeing to a financial product or offer, take time to understand the terms. Ask about fees, obligations, and anything you cannot explain in your own words. Avoid making a decision simply because someone is rushing you.","This article is a starting point for financial literacy, rather than a recommendation for a particular product. Begin with awareness: review one week of spending and choose one question you want to understand better."]}]'::jsonb, true, true),
  ('why-emotional-intelligence-matters', 'Why Emotional Intelligence Matters', 'Personal Development', 'Self-awareness and empathy create room for more thoughtful conversations and stronger relationships.', '2026-09-24', '/images/courses/emotional-intelligence.webp', 'Two students listening to each other during a conversation on campus', 'A group project rarely depends on knowledge alone. It also involves disappointment, competing priorities, and the challenge of working with people who see things differently. How you respond in those moments matters.', '[{"heading":"Notice before you respond","paragraphs":["When a conversation becomes difficult, pause long enough to name what you are feeling. Frustration, embarrassment, and uncertainty can look similar from the outside, but they may call for different responses.","A pause does not mean ignoring the issue. It gives you time to choose words that explain your concern instead of making the disagreement larger."]},{"heading":"Listen for the other person''s meaning","paragraphs":["Try summarising what you heard before offering your own view. A simple question such as ''Have I understood you correctly?'' can reveal a misunderstanding early.","Empathy does not require agreement. You can understand why someone feels strongly and still hold a different position. The aim is to make the conversation more accurate and respectful."]},{"heading":"Put reflection into practice","paragraphs":["After a challenging interaction, consider what helped and what you would do differently. Focus on actions you can change, rather than trying to control another person''s feelings.","In your next group discussion, try one deliberate pause and one clarifying question. Small choices can change the tone of a conversation."]}]'::jsonb, true, true),
  ('academic-habits-that-improve-performance', 'Academic Habits That Improve Performance', 'Academic Excellence', 'Move beyond last-minute revision with a study rhythm built around attention, practice, and reflection.', '2026-09-20', '/images/courses/academic-excellence.webp', 'Student concentrating on notes and an open textbook in a library', 'A useful study routine does not need to be elaborate. It needs to help you begin, notice gaps in your understanding, and return to important ideas before they disappear from memory.', '[{"heading":"Make the next task specific","paragraphs":["''Study chemistry'' is a large instruction. ''Explain today''s reaction and complete three practice questions'' gives you a clear starting point and a way to judge what you accomplished.","Choose a realistic task for the time available. Leave space for reviewing mistakes; finishing a page is less useful if you have not understood why an answer works."]},{"heading":"Practise without the answer in front of you","paragraphs":["Close your notes and write what you remember about a topic. Try a question before looking at the worked solution. These moments show you where your understanding needs more attention.","When you get something wrong, record the reason in a short sentence. Was it a missing concept, a misunderstood question, or an avoidable calculation error? Your next action should respond to that reason."]},{"heading":"Return, review, and adjust","paragraphs":["Plan a short return to important topics across the week. A routine should support your learning, rather than become another standard you feel you must meet perfectly.","At the end of the week, ask which tasks helped you explain or solve something more independently. Keep those approaches, adjust what did not work, and set one concrete task for tomorrow."]}]'::jsonb, true, true),
  ('becoming-a-more-effective-communicator', 'Becoming a More Effective Communicator', 'Communication', 'Clear communication begins with a purpose, an attentive listener, and the willingness to check understanding.', '2026-09-16', '/images/courses/effective-communication.webp', 'Student presenting an idea to classmates during a group discussion', 'Whether you are presenting in class or sending a message to a project team, communication works best when the other person can understand what matters and what should happen next.', '[{"heading":"Know what you want to communicate","paragraphs":["Before you begin, finish this sentence: ''After this conversation, I want the other person to understand…'' That gives your message a centre.","Lead with the main point, then provide the context that makes it useful. A short example often explains more than several abstract statements."]},{"heading":"Make space for listening","paragraphs":["A conversation is more than a well-prepared speech. Listen for questions, hesitation, or a different interpretation. Give the other person time to respond.","If you are unsure, ask a focused question instead of guessing. Checking what someone means can prevent a long exchange built on the wrong assumption."]},{"heading":"End with a clear next step","paragraphs":["For a group task, agree on who will do what and when you will check in. For an explanation, invite the listener to describe the idea in their own words.","Practise with one everyday message. Remove any detail that hides the main point, add the context the reader needs, and make the requested next step easy to find."]}]'::jsonb, true, true),
  ('the-role-of-young-people-in-nation-building', 'The Role of Young People in Nation Building', 'Leadership', 'Thoughtful leadership can begin close to home, through service, responsibility, and steady participation.', '2026-09-12', '/images/courses/nation-building.webp', 'Young volunteers working together on a community planting project', 'Nation building can sound distant from student life. Yet the habits that support a stronger community often begin in familiar places: a classroom, a neighbourhood, or a team working toward a shared goal.', '[{"heading":"Pay attention to the community around you","paragraphs":["Start by listening. What do people in your community say they need? Which efforts already exist, and where could your time or skills be useful?","A good contribution responds to a real need. Joining an existing effort can be more useful than starting something new without understanding the context."]},{"heading":"Build trust through everyday responsibility","paragraphs":["Keep the commitments you make, acknowledge mistakes, and treat other people''s time with care. These actions may feel small, but they shape whether people can depend on you.","Leadership also means sharing the work and recognising contributions. A project becomes stronger when its success belongs to the group, rather than one person."]},{"heading":"Choose a manageable contribution","paragraphs":["You might support a reading group, help organise a community activity, or share a skill with younger students. Choose something that fits your capacity and the priorities of the people involved.","Ask a local group how you can help before making a plan. A thoughtful first step, followed by consistent effort, is a meaningful way to begin."]}]'::jsonb, true, true);

commit;

-- Expected seed counts: 6 courses, 18 modules, 59 lessons, 6 articles.
select
  (select count(*) from public.courses) as courses,
  (select count(*) from public.course_modules) as modules,
  (select count(*) from public.lessons) as lessons,
  (select count(*) from public.journal_articles) as articles;
