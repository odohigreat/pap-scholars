-- Open the initial 20-question assessments now, as requested by the site owner.
-- Content review is deferred. Future course edits still require the normal review workflow.
-- Paste this ENTIRE file into Supabase SQL Editor and Run once.
begin;
do $activate$
declare entry record; opened integer:=0;
begin
  if to_regclass('public.course_assessment_drafts') is null
    or to_regprocedure('public.publish_course_assessment(text,text,text,text,jsonb)') is null then
    raise exception 'Run setup-course-assessments.sql first, then run this activation script.';
  end if;
  for entry in
    select c.id,a.published_at,d.questions,d.source_signature,d.draft_hash
    from public.courses c
    left join public.course_assessments a on a.course_id=c.id
    left join public.course_assessment_drafts d on d.course_id=c.id
    where c.is_published
    order by c.id
  loop
    -- Never republish or approve a later course update when this script is rerun.
    if entry.published_at is not null then continue; end if;
    if entry.questions is null or jsonb_array_length(entry.questions)<>20 then
      raise exception 'Course % has no prepared 20-question draft. Run the combined assessment setup first.',entry.id;
    end if;
    perform public.publish_course_assessment(
      entry.id,entry.source_signature,entry.draft_hash,
      'Site owner authorized initial publication; content review deferred',entry.questions
    );
    opened:=opened+1;
  end loop;
  raise notice 'Opened % initial assessments. Previously published versions were preserved.',opened;
end $activate$;
notify pgrst,'reload schema';
commit;

select c.title,jsonb_array_length(a.questions) as questions,
  case when a.needs_review then 'Awaiting update review' else 'Open' end as assessment_status
from public.courses c join public.course_assessments a on a.course_id=c.id
where c.is_published order by c.title;
