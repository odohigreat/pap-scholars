begin;
-- Expose only published lesson titles, never lesson bodies or media URLs.
create or replace view public.lesson_previews as
select l.course_id, l.id, l.module_id, l.title, l.position
from public.lessons l join public.courses c on c.id = l.course_id
where c.is_published;
revoke all on public.lesson_previews from public, anon, authenticated;
grant select on public.lesson_previews to anon, authenticated;

-- Removing a lesson must not be blocked by a saved resume location.
alter table public.enrollments drop constraint enrollment_last_lesson;
alter table public.enrollments add constraint enrollment_last_lesson
foreign key (course_id, last_lesson_id) references public.lessons(course_id, id)
on delete set null (last_lesson_id);

create function public.pap_recalculate_course_progress(target_course text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.enrollments where course_id = target_course order by user_id for update;
  update public.enrollments e set
    progress_percentage = case when p.total > 0 then round(p.done * 100.0 / p.total, 2) else 0 end,
    status = case when p.total > 0 and p.done = p.total then 'completed'
      when e.started_at is not null or p.done > 0 then 'in_progress' else 'enrolled' end,
    completed_at = case when p.total > 0 and p.done = p.total then coalesce(e.completed_at, p.last_completed) else null end
  from (
    select enrollment.user_id,
      (select count(*) from public.lessons where course_id = target_course) total,
      count(progress.lesson_id) done, max(progress.completed_at) last_completed
    from public.enrollments enrollment
    left join public.lesson_progress progress on progress.user_id = enrollment.user_id and progress.course_id = enrollment.course_id
    where enrollment.course_id = target_course group by enrollment.user_id
  ) p
  where e.course_id = target_course and e.user_id = p.user_id;
end;
$$;
revoke all on function public.pap_recalculate_course_progress(text) from public, anon, authenticated;

create function public.pap_curriculum_changed() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op <> 'INSERT' then perform public.pap_recalculate_course_progress(old.course_id); end if;
  if tg_op <> 'DELETE' and (tg_op = 'INSERT' or new.course_id is distinct from old.course_id) then
    perform public.pap_recalculate_course_progress(new.course_id);
  end if;
  return null;
end;
$$;
revoke all on function public.pap_curriculum_changed() from public, anon, authenticated;
create trigger curriculum_progress after insert or delete or update on public.lessons
for each row execute function public.pap_curriculum_changed();
create trigger removed_progress after delete on public.lesson_progress
for each row execute function public.pap_curriculum_changed();

-- Repair existing stale percentages as part of rollout.
do $$ declare course record; begin
  for course in select id from public.courses loop
    perform public.pap_recalculate_course_progress(course.id);
  end loop;
end $$;
commit;
