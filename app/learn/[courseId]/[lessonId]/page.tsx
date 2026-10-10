import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CoursePlayer } from "../../../../components/learn/course-player";
import { createClient } from "../../../../lib/supabase/server";
import type { LearningCourse } from "../../../../types/learning";

import { ensureEnrollment } from "../../../../lib/enrollments/server";

type Props = { params: Promise<{ courseId: string; lessonId: string }> };
export const metadata: Metadata = { title: "Learning | PAP Scholars", robots: { index: false, follow: false } };

export default async function LessonPage({ params }: Props) {
  const { courseId, lessonId } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");
  const { data: record, error: courseError } = await supabase.from("courses").select("id, title, image_url").eq("id", courseId).eq("is_published", true).maybeSingle();
  if (courseError) throw new Error("Unable to load this course.");
  if (!record) notFound();
  await ensureEnrollment(supabase, user.id, courseId);
  const [modules, lessons, progress] = await Promise.all([
    supabase.from("course_modules").select("id, title, position").eq("course_id", courseId).order("position"),
    supabase.from("lessons").select("id, module_id, title, description, content, video_url, duration_minutes, position").eq("course_id", courseId).order("position"),
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).eq("course_id", courseId),
  ]);
  if (modules.error || lessons.error || progress.error) throw new Error("Unable to load your lessons. Please try again.");
  if (!lessons.data?.some(lesson => lesson.id === lessonId)) notFound();
  const { error: accessError } = await supabase.from("enrollments").update({
    last_lesson_id: lessonId,
  }).eq("user_id", user.id).eq("course_id", courseId);
  if (accessError) throw new Error("Unable to save your lesson location.");
  const course: LearningCourse = { id: record.id, title: record.title, poster: record.image_url,
    modules: (modules.data ?? []).map(module => ({ id: module.id, title: module.title,
      lessons: (lessons.data ?? []).filter(lesson => lesson.module_id === module.id).map(lesson => ({ id: lesson.id, title: lesson.title, description: lesson.description, content: lesson.content, durationMinutes: lesson.duration_minutes, videoSrc: lesson.video_url ?? "" })) })) };
  return <CoursePlayer key={courseId} course={course} lessonId={lessonId} initialCompleted={(progress.data ?? []).map(item => item.lesson_id)} />;
}
