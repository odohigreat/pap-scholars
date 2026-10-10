import { enrollmentLabel, type Enrollment } from "../../lib/enrollments/server";
import Image from "next/image";
import Link from "next/link";
import { getCourseNavigation } from "../../data/course-navigation";
import type { DemoCourse } from "../../data/course-details";

export function CatalogueCard({ course, enrollment }: { course: DemoCourse; enrollment?: Enrollment }) {
  const label = enrollmentLabel(enrollment);
  return <Link href={enrollment ? `/courses/${encodeURIComponent(course.id)}/continue` : getCourseNavigation(course.id).courseDetailUrl} aria-label={`${label}: ${course.title}`} className="course-tile">
    <div className="course-tile-image"><Image src={course.image} alt={course.imageAlt} fill sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw" className="object-cover" /></div>
    <div className="course-tile-content"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-muted">{course.category}</p><h3 className="course-tile-title mt-3">{course.title}</h3><p className="mt-3 text-sm leading-7 text-muted">{course.description}</p><div className="course-tile-meta"><p className="text-xs text-muted">{course.lessonCount} lessons <span aria-hidden="true">·</span> {course.duration} <span aria-hidden="true">·</span> Self-paced</p><span className="course-tile-link">{label}</span></div></div>
  </Link>;
}
