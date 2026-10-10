import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StudentDashboard } from "../../components/dashboard/student-dashboard";
import { createClient } from "../../lib/supabase/server";
import type { DashboardCourse, DashboardActivity } from "../../lib/dashboard/types";
import { enrollmentFields, type Enrollment } from "../../lib/enrollments/server";
import "./dashboard.css";

export const metadata: Metadata = { title: "Student dashboard | PAP Scholars", robots: { index: false, follow: false } };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  const { data: profile, error: profileError } = await supabase.from("profiles").select("full_name, learning_goal").eq("id", user.id).single();
  if (profileError) throw new Error("Unable to load your profile. Ensure the Supabase schema migration has been applied.");
  const results = await Promise.all([
    supabase.from("enrollments").select(enrollmentFields).eq("user_id", user.id).order("enrolled_at", { ascending: false }),
    supabase.from("courses").select("id, title, category, image_url, image_alt").eq("is_published", true),
    supabase.from("course_modules").select("course_id, id, position"),
    supabase.from("lessons").select("course_id, id, module_id, title, duration_minutes, position"),
    supabase.from("lesson_progress").select("course_id, lesson_id, completed_at").eq("user_id", user.id).order("completed_at", { ascending: false }),
    supabase.from("notifications").select("id, title, message, read_at, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
  ] as const);
  const tables = ["enrollments", "courses", "course_modules", "lessons", "lesson_progress", "notifications"];
  const failedIndex = results.findIndex(result => result.error);
  if (failedIndex !== -1) {
    const databaseError = results[failedIndex].error!;
    console.error("Dashboard database query failed", {
      table: tables[failedIndex], code: databaseError.code, message: databaseError.message,
    });
    if (failedIndex === 0 && ["42703", "PGRST204"].includes(databaseError.code)) {
      throw new Error("The enrolment database migration has not been applied. Run 202610100002_enrollment_tracking.sql in Supabase, then reload the dashboard.");
    }
    throw new Error(`Unable to load your dashboard (${tables[failedIndex]}). Check the server terminal for the database error.`);
  }
  const enrollments = (results[0].data ?? []) as Enrollment[];
  const catalog = results[1].data ?? [];
  const modules = results[2].data ?? [];
  const lessons = results[3].data ?? [];
  const progress = results[4].data ?? [];
  const updates = results[5].data ?? [];
  const formatDate = (date: string) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" }).format(new Date(date));
  const courses: DashboardCourse[] = enrollments.flatMap(enrollment => {
    const course = catalog.find(item => item.id === enrollment.course_id);
    if (!course) return [];
    const ordered = lessons.filter(lesson => lesson.course_id === course.id).sort((a, b) => {
      const modulePosition = (id: string) => modules.find(module => module.course_id === course.id && module.id === id)?.position ?? 0;
      return modulePosition(a.module_id) - modulePosition(b.module_id) || a.position - b.position;
    });
    const doneIds = new Set(progress.filter(item => item.course_id === course.id).map(item => item.lesson_id));
    const done = ordered.filter(lesson => doneIds.has(lesson.id)).length;
    const next = ordered.find(lesson => lesson.id === enrollment.last_lesson_id) ?? ordered[0];
    return [{ id: course.id, title: course.title, category: course.category, image: course.image_url, imageAlt: course.image_alt,
      done, progress: Number(enrollment.progress_percentage), lastAccessed: Boolean(enrollment.last_lesson_id), total: ordered.length, lesson: next?.title ?? "Lessons coming soon", lessonNumber: next ? ordered.indexOf(next) + 1 : 0, duration: next ? `${next.duration_minutes} min` : "",
      href: next ? `/learn/${encodeURIComponent(course.id)}/${encodeURIComponent(next.id)}` : "/dashboard#my-courses",
      tag: enrollment.status === "completed" ? "Completed" : enrollment.status === "in_progress" ? "In progress" : "Not started" }];
  });
  const activities: DashboardActivity[] = progress.flatMap(item => {
    const course = courses.find(course => course.id === item.course_id);
    const lesson = lessons.find(lesson => lesson.course_id === item.course_id && lesson.id === item.lesson_id);
    return course && lesson ? [{ id: `${item.course_id}/${item.lesson_id}`, title: `Completed “${lesson.title}”`, detail: course.title, time: formatDate(item.completed_at), icon: "check" as const }] : [];
  }).slice(0, 5);
  const notifications = updates.map(item => ({ id: item.id, title: item.title, text: item.message, time: formatDate(item.created_at), read: Boolean(item.read_at) }));
  const availableCourses = catalog.filter(course => !enrollments.some(enrollment => enrollment.course_id === course.id)).map(course => ({ id: course.id, title: course.title, category: course.category }));
  return <StudentDashboard fullName={profile.full_name} email={user.email ?? ""} learningGoal={profile.learning_goal} userId={user.id} availableCourses={availableCourses} courses={courses} activities={activities} notifications={notifications} />;
}
