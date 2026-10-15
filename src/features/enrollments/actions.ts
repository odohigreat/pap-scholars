"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureEnrollment, resumeHref } from "@/features/enrollments/server";

export async function enrollFromDashboard(_state: { error: string; href: string }, formData: FormData) {
  const courseId = formData.get("courseId");
  if (typeof courseId !== "string" || !courseId) return { error: "Choose a course to enroll in.", href: "" };
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  try {
    const enrollment = await ensureEnrollment(supabase, user.id, courseId);
    const href = await resumeHref(supabase, enrollment);
    revalidatePath("/dashboard");
    revalidatePath("/courses");
    return { error: "", href };
  } catch {
    return { error: "Unable to enroll in this course. Please try again.", href: "" };
  }
}

export async function enrollInCourse(formData: FormData) {
  const courseId = formData.get("courseId");
  if (typeof courseId !== "string" || !courseId) throw new Error("Choose a course to start.");
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect(`/login?next=${encodeURIComponent(`/courses/${courseId}`)}`);
  const enrollment = await ensureEnrollment(supabase, user.id, courseId);
  const href = await resumeHref(supabase, enrollment);
  revalidatePath("/dashboard");
  revalidatePath("/courses");
  redirect(href);
}

export async function completeCourseLesson(courseId: string, lessonId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Sign in to save your progress.");
  const { error } = await supabase.from("lesson_progress").upsert(
    { user_id: user.id, course_id: courseId, lesson_id: lessonId },
    { onConflict: "user_id,course_id,lesson_id", ignoreDuplicates: true },
  );
  if (error) throw new Error("Unable to save your progress. Please try again.");
  revalidatePath("/dashboard");
  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
}

export async function recordLessonVisit(courseId: string, lessonId: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Sign in to save your lesson location.");
  const { data: lesson, error: lessonError } = await supabase.from("lessons").select("id").eq("course_id", courseId).eq("id", lessonId).maybeSingle();
  if (lessonError || !lesson) throw new Error("This lesson is unavailable.");
  const { error: updateError } = await supabase.from("enrollments").update({ last_lesson_id: lessonId }).eq("user_id", user.id).eq("course_id", courseId);
  if (updateError) throw new Error("Unable to save your lesson location.");
}
