import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Brand } from "@/components/layout/brand";
import { CourseAssessmentView } from "@/features/assessments/components/course-assessment";
import { AssessmentRefresh } from "@/features/assessments/components/assessment-refresh";
import type { CourseAssessment } from "@/features/assessments/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Course assessment | PAP Scholars", robots: { index: false, follow: false } };

export default async function AssessmentPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");
  const { data: course, error: courseError } = await supabase.from("courses").select("id,title").eq("id", courseId).eq("is_published", true).maybeSingle();
  if (courseError) throw new Error("Unable to load this course.");
  if (!course) notFound();
  const { data: enrollment, error: enrollmentError } = await supabase.from("enrollments").select("course_id").eq("user_id", user.id).eq("course_id", courseId).maybeSingle();
  if (enrollmentError) throw new Error("Unable to load your enrollment.");
  if (!enrollment) redirect("/dashboard#explore-courses");
  const [lessons, progress, modules] = await Promise.all([
    supabase.from("lessons").select("id,title,module_id,position").eq("course_id", courseId),
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).eq("course_id", courseId),
    supabase.from("course_modules").select("id,position").eq("course_id", courseId),
  ]);
  if (lessons.error || progress.error || modules.error) throw new Error("Unable to load your lesson progress.");
  const completed = new Set((progress.data ?? []).map(item => item.lesson_id));
  const remaining = (lessons.data ?? []).filter(lesson => !completed.has(lesson.id)).sort((a, b) => {
    const position = (id: string) => modules.data?.find(module => module.id === id)?.position ?? 0;
    return position(a.module_id) - position(b.module_id) || a.position - b.position;
  });
  const unlocked = Boolean(lessons.data?.length) && remaining.length === 0;
  let assessment: CourseAssessment | null = null;
  let unavailable = false;
  if (unlocked) {
    const result = await supabase.rpc("get_course_assessment", { target_course: courseId });
    if (result.error) {
      console.error("Unable to load course assessment", JSON.stringify({ courseId, status: result.status, code: result.error.code, message: result.error.message, details: result.error.details, hint: result.error.hint }));
      unavailable = true;
    } else assessment = result.data as CourseAssessment | null;
  }
  return <div className="learning-shell">
    <a href="#assessment-main" className="learning-skip">Skip to assessment</a>
    <header className="learning-header"><Brand showLogo compact href="/dashboard" /><div className="learning-header-label"><span>COURSE ASSESSMENT</span><strong>{course.title}</strong></div><Link href="/dashboard#my-courses" className="learning-back">← My courses</Link></header>
    <main id="assessment-main" className="assessment-main"><nav className="learning-return-nav" aria-label="Assessment navigation"><Link href="/dashboard#my-courses">My courses</Link><span aria-hidden="true">/</span><span>Assessment</span></nav><div className="learning-course-heading"><p className="learning-eyebrow">FINAL ASSESSMENT</p><h1>{course.title}</h1></div>
      {!unlocked ? <section className="assessment-empty"><h2>Finish your lessons first</h2><p>{remaining.length ? `${remaining.length} lesson${remaining.length === 1 ? "" : "s"} left before your assessment unlocks. Your completed lessons are saved.` : "The assessment will unlock when course lessons are available and completed."}</p>{remaining[0] && <Link href={`/learn/${encodeURIComponent(courseId)}/${encodeURIComponent(remaining[0].id)}`} className="learning-button learning-primary">Continue lessons →</Link>}</section>
        : assessment ? <CourseAssessmentView key={`${assessment.revision}:${assessment.needsReview}`} courseId={courseId} assessment={assessment} />
          : <section className="assessment-empty"><h2>{unavailable ? "Unable to load assessment" : "Assessment awaiting publication"}</h2><p>{unavailable ? "We couldn’t load the questions. Your lesson progress is safe. Check again to retry." : "Your lessons are complete. The questions need to be reviewed and published before you can take this assessment."}</p><div className="assessment-result-actions"><AssessmentRefresh /><Link href="/dashboard#my-courses" className="learning-previous-button">Back to my courses</Link></div></section>}
    </main>
  </div>;
}
