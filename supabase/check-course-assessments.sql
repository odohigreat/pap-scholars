-- Read-only assessment setup check. Run in Supabase SQL Editor.
-- The result contains setup flags only, not student details or answer keys.
select
  to_regclass('public.course_assessments') is not null as assessment_table_exists,
  to_regclass('public.course_assessment_drafts') is not null as draft_table_exists,
  to_regclass('public.assessment_attempts') is not null as score_table_exists,
  to_regprocedure('public.get_course_assessment(text)') is not null as lookup_exists,
  to_regprocedure('public.get_assessment_review_sources()') is not null as review_workflow_exists,
  has_function_privilege('authenticated',to_regprocedure('public.get_course_assessment(text)'),'execute') as signed_in_users_can_load;

-- Published/draft status per course, without revealing questions or answers.
select c.id as course_id,
  coalesce(jsonb_array_length(a.questions),0) as published_question_count,
  a.needs_review,
  coalesce(jsonb_array_length(d.questions),0) as draft_question_count,
  d.status as draft_status,
  a.published_at,
  a.reviewed_by
from public.courses c
left join public.course_assessments a on a.course_id=c.id
left join public.course_assessment_drafts d on d.course_id=c.id
where c.is_published order by c.id;
