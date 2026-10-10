begin;
-- Safe to rerun after an earlier or partially applied version.
-- Existing columns and student records are preserved.
alter table public.enrollments
  add column if not exists id uuid not null default gen_random_uuid(),
  add column if not exists status text not null default 'enrolled',
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists last_lesson_id text,
  add column if not exists progress_percentage numeric(5,2) not null default 0,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists enrollments_id_key on public.enrollments(id);

-- PostgreSQL does not support ADD CONSTRAINT IF NOT EXISTS.
do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.enrollments'::regclass and conname = 'enrollments_status_check') then
    alter table public.enrollments add constraint enrollments_status_check
      check (status in ('enrolled', 'in_progress', 'completed'));
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.enrollments'::regclass and conname = 'enrollments_progress_percentage_check') then
    alter table public.enrollments add constraint enrollments_progress_percentage_check
      check (progress_percentage between 0 and 100);
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.enrollments'::regclass and conname = 'enrollment_last_lesson') then
    alter table public.enrollments add constraint enrollment_last_lesson
      foreign key (course_id, last_lesson_id) references public.lessons(course_id, id);
  end if;
end;
$$;

drop trigger if exists enrollments_updated on public.enrollments;

create trigger enrollments_updated before update on public.enrollments
for each row execute function public.pap_set_updated_at();
-- Students update their resume location; lifecycle fields are maintained by triggers.
grant update (last_lesson_id) on public.enrollments to authenticated;
create or replace function public.pap_track_enrollment_access() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.last_lesson_id is not null then
    new.started_at := coalesce(old.started_at, now());
    if old.status <> 'completed' then new.status := 'in_progress'; end if;
  end if;
  return new;
end;
$$;
revoke all on function public.pap_track_enrollment_access() from public, anon, authenticated;
drop trigger if exists enrollment_access on public.enrollments;
create trigger enrollment_access before update of last_lesson_id on public.enrollments
for each row execute function public.pap_track_enrollment_access();
drop policy if exists enrollments_update_own on public.enrollments;
create policy enrollments_update_own on public.enrollments for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Serialize progress changes on the enrollment so simultaneous completions cannot lose updates.
create or replace function public.pap_sync_enrollment_progress() returns trigger
language plpgsql security definer set search_path = '' as $$
declare lesson_count integer; done_count integer;
begin
  perform 1 from public.enrollments where user_id = new.user_id and course_id = new.course_id for update;
  select count(*) into lesson_count from public.lessons where course_id = new.course_id;
  select count(*) into done_count from public.lesson_progress where user_id = new.user_id and course_id = new.course_id;
  update public.enrollments set
    progress_percentage = case when lesson_count > 0 then round(done_count * 100.0 / lesson_count, 2) else 0 end,
    status = case when lesson_count > 0 and done_count >= lesson_count then 'completed' else 'in_progress' end,
    started_at = coalesce(started_at, new.completed_at),
    completed_at = case when lesson_count > 0 and done_count >= lesson_count then coalesce(completed_at, new.completed_at) else null end
  where user_id = new.user_id and course_id = new.course_id;
  return new;
end;
$$;
revoke all on function public.pap_sync_enrollment_progress() from public, anon, authenticated;
drop trigger if exists enrollment_progress on public.lesson_progress;
create trigger enrollment_progress after insert on public.lesson_progress
for each row execute function public.pap_sync_enrollment_progress();

update public.enrollments set created_at = enrolled_at;

-- Backfill students who completed lessons before this migration.
update public.enrollments e set
  created_at = e.enrolled_at,
  started_at = coalesce(e.started_at, p.first_completed),
  progress_percentage = round(p.done * 100.0 / nullif(l.total, 0), 2),
  status = case when p.done = l.total then 'completed' else 'in_progress' end,
  completed_at = case when p.done = l.total then coalesce(e.completed_at, p.last_completed) else null end
from (select user_id, course_id, count(*) done, min(completed_at) first_completed, max(completed_at) last_completed from public.lesson_progress group by user_id, course_id) p
join (select course_id, count(*) total from public.lessons group by course_id) l using (course_id)
where e.user_id = p.user_id and e.course_id = p.course_id;
commit;
