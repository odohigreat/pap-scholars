import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "../supabase/server";

export type Enrollment = {
  course_id: string; status: "enrolled" | "in_progress" | "completed";
  enrolled_at: string; started_at: string | null; completed_at: string | null;
  last_lesson_id: string | null; progress_percentage: number;
};
export const enrollmentFields = "course_id, status, enrolled_at, started_at, completed_at, last_lesson_id, progress_percentage";
export const learningHref = (courseId: string, lessonId: string) => `/learn/${encodeURIComponent(courseId)}/${encodeURIComponent(lessonId)}`;
export const enrollmentLabel = (enrollment?: Enrollment) => !enrollment ? "View Course" : enrollment.status === "completed" ? "Review Course" : "Continue Learning";

export async function getStudentEnrollments() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return [] as Enrollment[];
  const result = await supabase.from("enrollments").select(enrollmentFields).eq("user_id", user.id);
  if (result.error) throw new Error("Unable to load your enrolments.");
  return (result.data ?? []) as Enrollment[];
}

export async function ensureEnrollment(supabase: SupabaseClient, userId: string, courseId: string) {
  const { data: course, error: courseError } = await supabase.from("courses").select("id").eq("id", courseId).eq("is_published", true).maybeSingle();
  if (courseError || !course) throw new Error("This course is unavailable.");
  const { error } = await supabase.from("enrollments").upsert({ user_id: userId, course_id: courseId }, { onConflict: "user_id,course_id", ignoreDuplicates: true });
  if (error) throw new Error("Unable to enrol. Please try again.");
  const result = await supabase.from("enrollments").select(enrollmentFields).eq("user_id", userId).eq("course_id", courseId).single();
  if (result.error) throw new Error("Unable to load your enrolment.");
  return result.data as Enrollment;
}

export async function resumeHref(supabase: SupabaseClient, enrollment: Enrollment) {
  if (enrollment.last_lesson_id) return learningHref(enrollment.course_id, enrollment.last_lesson_id);
  const [modules, lessons] = await Promise.all([
    supabase.from("course_modules").select("id, position").eq("course_id", enrollment.course_id).order("position"),
    supabase.from("lessons").select("id, module_id, position").eq("course_id", enrollment.course_id).order("position"),
  ]);
  if (modules.error || lessons.error) throw new Error("Unable to load your lessons.");
  const first = modules.data?.flatMap(module => lessons.data?.filter(lesson => lesson.module_id === module.id) ?? [])[0];
  return first ? learningHref(enrollment.course_id, first.id) : "/dashboard#my-courses";
}
