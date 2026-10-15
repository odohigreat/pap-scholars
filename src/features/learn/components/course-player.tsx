"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Brand } from "@/components/layout/brand";
import { completeCourseLesson, recordLessonVisit } from "@/features/enrollments/actions";
const dashboardHref = "/dashboard";
const myCoursesHref = "/dashboard#my-courses";
import { LessonNotes } from "@/features/learn/components/lesson-notes";

const lessonHref = (courseId: string, id: string) => `/learn/${encodeURIComponent(courseId)}/${encodeURIComponent(id)}`;

import type { LearningCourse } from "@/features/learn/types";

export function CoursePlayer({ course, lessonId, initialCompleted }: { course: LearningCourse; lessonId: string; initialCompleted: string[] }) {
  const router = useRouter();
  useEffect(() => {
    const refresh = () => { if (!document.hidden) router.refresh(); };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);
  const [completionSnapshot, setCompletionSnapshot] = useState(initialCompleted);
  const [done, setDone] = useState(initialCompleted);
  if (completionSnapshot !== initialCompleted) {
    setCompletionSnapshot(initialCompleted);
    setDone(initialCompleted);
  }
  const [visitError, setVisitError] = useState("");
  useEffect(() => {
    let active = true;
    recordLessonVisit(course.id, lessonId).then(() => {
      if (active) setVisitError("");
    }).catch(() => {
      if (active) setVisitError("Unable to save your lesson location. Reload to try again.");
    });
    return () => { active = false; };
  }, [course.id, lessonId]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  async function completeLesson(continueLearning = false) {
    if (saving) return;
    setSaving(true);
    setSaveError("");
    try {
      if (!done.includes(lessonId)) await completeCourseLesson(course.id, lessonId);
      setDone(current => current.includes(lessonId) ? current : [...current, lessonId]);
      if (continueLearning) router.push(next ? lessonHref(course.id, next.id) : `/learn/${encodeURIComponent(course.id)}/assessment`);
    } catch { setSaveError("Unable to save your progress. Please try again."); }
    finally { setSaving(false); }
  }
  const [focusMode, setFocusMode] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [contentsOpen, setContentsOpen] = useState(false);
  const [failedVideo, setFailedVideo] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const lessons = course.modules.flatMap(module => module.lessons);
  const index = lessons.findIndex(lesson => lesson.id === lessonId);
  const lesson = lessons[index];
  const currentModule = course.modules.find(item => item.lessons.some(item => item.id === lessonId))!;
  const isComplete = done.includes(lessonId);
  const completedCount = lessons.filter(item => done.includes(item.id)).length;
  const percent = lessons.length ? Math.round(completedCount / lessons.length * 100) : 0;
  const previous = lessons[index - 1];
  const next = lessons[index + 1];

  return <div className={`learning-shell ${focusMode ? "is-focused" : ""} ${largeText ? "has-large-text" : ""}`}>
    <a href="#lesson-main" className="learning-skip">Skip to lesson</a>
    <header className="learning-header">
      <Brand showLogo compact href="/dashboard" />
      <div className="learning-header-label"><span>YOUR LEARNING SPACE</span><strong>{course.title}</strong></div>
      <Link href={dashboardHref} aria-label="Back to dashboard" className="learning-back"><span>← Dashboard</span></Link>
    </header>
    <div className="learning-workspace">
      <main id="lesson-main" className="learning-main">
        {visitError && <p role="alert">{visitError}</p>}
        <nav className="learning-return-nav" aria-label="Learning navigation">
          <Link href={myCoursesHref}>My Courses</Link>
          <span aria-hidden="true">/</span>
          <span>{course.title}</span>
        </nav>
        <div className="learning-course-heading"><div><p className="learning-eyebrow">YOUR CLASSROOM · SELF-PACED COURSE</p><h1>{course.title}</h1></div></div>
        <div className="learning-position"><span>{currentModule.title}</span><span>Lesson {index + 1} / {lessons.length}</span></div>
        {lesson.videoSrc && <div className="learning-video">
          <video key={lesson.id} controls playsInline preload="metadata" poster={course.poster} onError={() => setFailedVideo(lesson.id)} aria-label={`${lesson.title} video`}>
            <source src={lesson.videoSrc} type="video/mp4" />
            Your browser does not support video playback.
          </video>
        </div>}
        <p className="learning-video-note">{failedVideo === lesson.id ? "Video unavailable. Please try again later." : lesson.videoSrc ? "Press play when you’re ready." : "Read the lesson below to get started."}</p>
        <motion.section key={lesson.id} initial={false} animate={{ opacity: 1 }} transition={{ duration: reduceMotion ? 0 : 0.18 }} className="learning-lesson" aria-labelledby="lesson-title">
          <div className="learning-lesson-meta"><span className="learning-eyebrow">LESSON {String(index + 1).padStart(2, "0")}</span><span>{lesson.durationMinutes} min estimated study</span>{isComplete && <span className="learning-complete-label">✓ Completed</span>}</div>
          <h2 id="lesson-title">{lesson.title}</h2>
          <p className="learning-description">{lesson.description}</p>
          <div className="learning-note-toolbar"><h3>Lesson notes</h3><div><button type="button" aria-pressed={largeText} onClick={() => setLargeText(!largeText)} aria-label="Larger lesson text">A<span aria-hidden="true">a</span></button><button type="button" aria-pressed={focusMode} onClick={() => setFocusMode(!focusMode)}>{focusMode ? "Exit focus view" : "Focus view"}</button></div></div>
          <LessonNotes content={lesson.content?.trim() || lesson.description} />
          {saveError && <p className="learning-error" role="alert">{saveError}</p>}
          <nav className="learning-footer-nav" aria-label="Lesson navigation" aria-busy={saving}>
            <div className="learning-footer-previous">
              {previous ? <Link href={lessonHref(course.id, previous.id)} className="learning-previous-button">← Previous lesson</Link> : <Link href={myCoursesHref} className="learning-previous-button">← My courses</Link>}
              <p>{previous ? previous.title : "Back to your learning dashboard"}</p>
            </div>
            <div className="learning-footer-next">
              <button className="learning-button learning-primary" disabled={saving} onClick={() => void completeLesson(true)}>{saving ? "Saving progress…" : next ? isComplete ? "Continue →" : "Complete & continue →" : isComplete ? "Go to assessment →" : "Complete & assess →"}</button>
              <p>{next ? `Up next: ${next.title}` : "Up next: final course assessment"}</p>
            </div>
          </nav>
          <p className="learning-footer-status" role="status" aria-live="polite">{saving ? "Saving your lesson progress…" : percent === 100 ? "All lessons completed. Your final assessment is ready." : isComplete ? "Lesson completed · Progress saved" : "Your progress is saved when you complete this lesson."}</p>
        </motion.section>

      </main>
      <aside className="learning-sidebar" aria-label="Course content">
        <div className="learning-sidebar-heading"><div><p className="learning-eyebrow">YOUR JOURNEY</p><h2>Course content</h2></div><button className="learning-contents-toggle" aria-expanded={contentsOpen} aria-controls="course-modules" onClick={() => setContentsOpen(!contentsOpen)}>{contentsOpen ? "Hide lessons −" : "Show lessons +"}</button></div>
        <div className="learning-progress-summary"><div><span>Course progress</span><strong>{percent}%</strong></div><progress max={100} value={percent} aria-label="Course progress" /><p>{completedCount} of {lessons.length} lessons completed</p></div>
        <div id="course-modules" className={`learning-modules ${contentsOpen ? "is-open" : ""}`}>
          {course.modules.map((item, moduleIndex) => <section key={item.id} className="learning-module"><div className="learning-module-heading"><span>{String(moduleIndex + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.lessons.filter(entry => done.includes(entry.id)).length}/{item.lessons.length} completed</p></div></div><ol>{item.lessons.map(entry => {
            const active = entry.id === lessonId;
            const complete = done.includes(entry.id);
            return <li key={entry.id}><Link href={lessonHref(course.id, entry.id)} aria-current={active ? "page" : undefined} className={`learning-lesson-link ${active ? "is-current" : ""}`} onClick={() => setContentsOpen(false)}><span className={`learning-lesson-symbol ${complete ? "is-done" : ""}`} aria-hidden="true">{complete ? "✓" : active ? "▶" : "▷"}</span><span><strong>{entry.title}</strong><small>{entry.durationMinutes} min{active ? " · Current lesson" : complete ? " · Completed" : " · Available"}</small></span></Link></li>;
          })}</ol></section>)}
        </div>
        <Link href={`/learn/${encodeURIComponent(course.id)}/assessment`} className="learning-assessment-link"><span>Final assessment</span><small>{percent === 100 ? "Ready to take · View your score →" : "Available after completing all lessons"}</small></Link>
        <p className="learning-session-note">Your progress is saved to your account.</p>
      </aside>
    </div>
  </div>;
}
