"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { AvailableCourse } from "@/features/dashboard/types";
import { enrollFromDashboard } from "@/features/enrollments/actions";

function CourseDetails({ course, onBack, onMyCourses }: { course: AvailableCourse; onBack: () => void; onMyCourses: () => void }) {
  const [state, action, pending] = useActionState(enrollFromDashboard, { error: "", href: "" });
  if (state.href) return <section className="dashboard-panel max-w-3xl p-6 sm:p-8" role="status">
    <h2 className="text-2xl">You’re enrolled!</h2>
    <p className="mt-3 text-muted">{course.title} is now in My Courses. Your progress will be saved as you learn.</p>
    <div className="mt-6 flex flex-wrap gap-3"><Link href={state.href} className="btn btn-primary">{course.lessonCount ? "Start learning" : "View my courses"}</Link><button onClick={onMyCourses} className="btn btn-secondary">My courses</button></div>
  </section>;
  return <section className="dashboard-panel max-w-4xl p-6 sm:p-8">
    <button onClick={onBack} disabled={pending} className="btn btn-secondary mb-6">Back to courses</button>
    <p className="text-xs font-semibold uppercase tracking-wide text-primary">{course.category}</p>
    <h2 className="mt-3 text-2xl">{course.title}</h2>
    <p className="mt-3 text-sm text-muted">{course.lessonCount} lessons · {course.duration} · Learn at your own pace</p>
    <p className="mt-6 leading-7 text-muted">{course.overview || course.description}</p>
    {course.outcomes.length > 0 && <div className="mt-6"><h3 className="text-lg">What you’ll learn</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">{course.outcomes.map(outcome => <li key={outcome}>{outcome}</li>)}</ul></div>}
    {course.modules.length > 0 && <div className="mt-6"><h3 className="text-lg">Course content</h3><div className="mt-3 divide-y divide-border">{course.modules.map((module, index) => <details key={index} className="py-3"><summary className="cursor-pointer text-sm font-semibold">{module.title} · {module.lessons.length} lessons</summary><ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">{module.lessons.map((lesson, lessonIndex) => <li key={lessonIndex}>{lesson}</li>)}</ol></details>)}</div></div>}
    <form action={action} className="mt-8">
      <input type="hidden" name="courseId" value={course.id} />
      {state.error && <p role="alert" className="mb-3 text-sm text-red-700">{state.error}</p>}
      <button disabled={pending || !course.lessonCount} className="btn btn-primary disabled:opacity-50">{pending ? "Enrolling…" : course.lessonCount ? "Enroll in course" : "Lessons coming soon"}</button>
      <p className="mt-3 text-xs text-muted">No extra registration form. This course will be added to your account.</p>
    </form>
  </section>;
}

export function CourseExplorer({ courses, onMyCourses }: { courses: AvailableCourse[]; onMyCourses: () => void }) {
  const [selected, setSelected] = useState<AvailableCourse | null>(null);
  if (selected) return <CourseDetails key={selected.id} course={selected} onBack={() => setSelected(null)} onMyCourses={onMyCourses} />;
  if (!courses.length) return <div className="dashboard-panel p-8"><h2 className="text-xl">You’re all caught up</h2><p className="mt-3 text-muted">No new courses are available to enroll in right now.</p><button onClick={onMyCourses} className="btn btn-primary mt-6">Go to my courses</button></div>;
  return <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{courses.map(course => <article key={course.id} className="dashboard-panel flex flex-col overflow-hidden">
    {course.image && <div className="relative aspect-video"><Image unoptimized src={course.image} alt={course.imageAlt} fill sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 90vw" className="object-cover" /></div>}
    <div className="flex flex-1 flex-col p-5"><p className="text-xs text-muted">{course.category}</p><h2 className="mt-2 text-lg">{course.title}</h2><p className="mt-3 text-sm leading-6 text-muted">{course.description}</p><p className="mt-4 text-xs text-muted">{course.lessonCount} lessons · {course.duration}</p><button onClick={() => setSelected(course)} className="btn btn-secondary mt-5 self-start">View course</button></div>
  </article>)}</div>;
}
