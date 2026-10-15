import Image from "next/image";
import Link from "next/link";
import type { FeaturedCourse } from "@/features/courses/types";

export function CourseCard({ course }: { course: Omit<FeaturedCourse, "image"> & { image: FeaturedCourse["image"] | string; duration?: string; lessonCount?: number };  }) {
  return <article className="course-tile featured-course-card">
    <div className="course-tile-image"><Image unoptimized={typeof course.image === "string"} src={course.image} alt={course.imageAlt} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw" className="object-cover" /></div>
    <div className="course-tile-content"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-muted">{course.category}</p><h3 className="course-tile-title mt-3">{course.title}</h3><p className="mt-3 text-sm leading-7 text-muted">{course.description}</p><div className="course-tile-meta">{course.lessonCount !== undefined && <div className="flex flex-wrap items-center gap-2 text-xs text-muted"><span>{course.lessonCount} lessons</span><span aria-hidden="true">·</span><span>{course.duration}</span><span aria-hidden="true">·</span><span>Self-paced</span></div>}<Link href={`/courses/${encodeURIComponent(course.id)}`} aria-label={`Explore ${course.title}`} className="journal-read-button featured-course-button mt-4">Explore course</Link></div></div>
  </article>;
}
