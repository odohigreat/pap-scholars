import type { Enrollment } from "@/features/enrollments/server";
import Image from "next/image";
import Link from "next/link";
import type { CatalogCourse } from "@/features/courses/server";

export function CatalogueCard({ course, enrollment }: { course: CatalogCourse; enrollment?: Enrollment }) {
  const label = !enrollment ? "View course" : enrollment.status === "completed" ? "Review course" : "Continue learning";
  return <article className="course-tile featured-course-card">
    <div className="course-tile-image">{enrollment && <span className="catalogue-enrollment-badge">{enrollment.status === "completed" ? "Completed" : enrollment.status === "in_progress" ? "In progress" : "Enrolled"}</span>}<Image unoptimized src={course.image} alt={course.imageAlt} fill sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw" className="object-cover" /></div>
    <div className="course-tile-content"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-muted">{course.category}</p><h3 className="course-tile-title mt-3">{course.title}</h3><p className="mt-3 text-sm leading-7 text-muted">{course.description}</p><div className="course-tile-meta">{enrollment && <div className="mb-4"><div className="mb-2 flex justify-between text-xs text-muted"><span>Your progress</span><span>{Math.round(Number(enrollment.progress_percentage))}%</span></div><progress className="catalogue-card-progress" max={100} value={Number(enrollment.progress_percentage)} aria-label={`${course.title} progress`} /></div>}<p className="text-xs text-muted">{course.lessonCount} lessons <span aria-hidden="true">·</span> {course.duration} <span aria-hidden="true">·</span> Self-paced</p><Link href={enrollment ? `/courses/${encodeURIComponent(course.id)}/continue` : `/courses/${encodeURIComponent(course.id)}`} aria-label={`${label}: ${course.title}`} className="journal-read-button featured-course-button mt-4">{label}</Link></div></div>
  </article>;
}
