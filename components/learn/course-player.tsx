"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Brand } from "../layout/brand";
import { completeCourseLesson } from "../../app/dashboard/actions";
const dashboardHref = "/dashboard";
const myCoursesHref = "/dashboard#my-courses";
import { lessonHref } from "../../data/learning-courses";

import type { LearningCourse } from "../../types/learning";

export function CoursePlayer({ course, lessonId, initialCompleted }: { course: LearningCourse; lessonId: string; initialCompleted: string[] }) {
  const [done, setDone] = useState(initialCompleted);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  async function completeLesson() {
    setSaving(true);
    setSaveError("");
    try {
      await completeCourseLesson(course.id, lessonId);
      setDone(current => current.includes(lessonId) ? current : [...current, lessonId]);
    } catch { setSaveError("Unable to save your progress. Please try again."); }
    finally { setSaving(false); }
  }
  const [contentsOpen, setContentsOpen] = useState(false);
  const [failedVideo, setFailedVideo] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const lessons = course.modules.flatMap(module => module.lessons);
  const index = lessons.findIndex(lesson => lesson.id === lessonId);
  const lesson = lessons[index];
  const currentModule = course.modules.find(item => item.lessons.some(item => item.id === lessonId))!;
  const isComplete = done.includes(lessonId);
  const percent = Math.round(done.length / lessons.length * 100);
  const previous = lessons[index - 1];
  const next = lessons[index + 1];

  return <div className="learning-shell">
    <a href="#lesson-main" className="learning-skip">Skip to lesson</a>
    <header className="learning-header">
      <Brand showLogo />
      <span className="learning-header-label">YOUR LEARNING SPACE</span>
      <Link href={dashboardHref} aria-label="Back to dashboard" className="learning-back"><span>Dashboard</span></Link>
    </header>
    <div className="learning-workspace">
      <main id="lesson-main" className="learning-main">
        <nav className="learning-return-nav" aria-label="Learning navigation">
          <Link href={myCoursesHref}>My Courses</Link>
          <span aria-hidden="true">/</span>
          <span>{course.title}</span>
        </nav>
        <div className="learning-course-heading"><div><p className="learning-eyebrow">SELF-PACED COURSE</p><h1>{course.title}</h1></div></div>
        <div className="learning-position"><span>{currentModule.title}</span><span>Lesson {index + 1} of {lessons.length}</span></div>
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
          {lesson.content && <p className="learning-description whitespace-pre-wrap">{lesson.content}</p>}{saveError && <p role="alert">{saveError}</p>}<div className="learning-actions"><button className={`learning-button learning-primary ${isComplete ? "is-complete" : ""}`} disabled={isComplete || saving} onClick={completeLesson}>{saving ? "Saving…" : isComplete ? "✓ Lesson completed" : "✓ Mark lesson complete"}</button><p role="status" aria-live="polite">{percent === 100 ? "Course complete. Well done! Revisit any lesson whenever you like." : isComplete ? "A step forward. Your next lesson is ready." : "Make this lesson a small step towards your goals."}</p></div>
        </motion.section>
        <nav className="learning-pagination" aria-label="Lesson navigation">
          {previous ? <Link href={lessonHref(course.id, previous.id)} className="learning-page-link"><span>Previous lesson</span><strong>{previous.title}</strong></Link> : <div className="learning-page-link learning-disabled" aria-disabled="true"><span>Previous lesson</span><strong>You’re at the first lesson</strong></div>}
          {next ? <Link href={lessonHref(course.id, next.id)} className="learning-page-link learning-page-next"><span>Next lesson</span><strong>{next.title}</strong></Link> : <div className="learning-page-link learning-page-next learning-disabled" aria-disabled="true"><span>Last lesson</span><strong>{percent === 100 ? "Course complete" : "Complete your learning journey"}</strong></div>}
        </nav>
        <section className="learning-resources" aria-labelledby="resources-title"><div><h3 id="resources-title">Lesson resources</h3><p>Worksheets and reading materials will appear here when available.</p></div></section>
      </main>
      <aside className="learning-sidebar" aria-label="Course content">
        <div className="learning-sidebar-heading"><div><p className="learning-eyebrow">YOUR JOURNEY</p><h2>Course content</h2></div><button className="learning-contents-toggle" aria-expanded={contentsOpen} aria-controls="course-modules" onClick={() => setContentsOpen(!contentsOpen)}>{contentsOpen ? "Hide lessons −" : "Show lessons +"}</button></div>
        <div className="learning-progress-summary"><div><span>Course progress</span><strong>{percent}%</strong></div><progress max={100} value={percent} aria-label="Course progress" /><p>{done.length} of {lessons.length} lessons completed</p></div>
        <div id="course-modules" className={`learning-modules ${contentsOpen ? "is-open" : ""}`}>
          {course.modules.map((item, moduleIndex) => <section key={item.id} className="learning-module"><div className="learning-module-heading"><span>{String(moduleIndex + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.lessons.filter(entry => done.includes(entry.id)).length}/{item.lessons.length} completed</p></div></div><ol>{item.lessons.map(entry => {
            const active = entry.id === lessonId;
            const complete = done.includes(entry.id);
            return <li key={entry.id}><Link href={lessonHref(course.id, entry.id)} aria-current={active ? "page" : undefined} className={`learning-lesson-link ${active ? "is-current" : ""}`} onClick={() => setContentsOpen(false)}><span className={`learning-lesson-symbol ${complete ? "is-done" : ""}`} aria-hidden="true">{complete ? "✓" : active ? "▶" : "▷"}</span><span><strong>{entry.title}</strong><small>{entry.durationMinutes} min{active ? " · Current lesson" : complete ? " · Completed" : " · Available"}</small></span></Link></li>;
          })}</ol></section>)}
        </div>
        <p className="learning-session-note">Your progress is saved to your account.</p>
      </aside>
    </div>
  </div>;
}
