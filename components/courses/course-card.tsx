import Image from "next/image";
import Link from "next/link";
import { getCourseNavigation } from "../../data/course-navigation";
import type { FeaturedCourse } from "../../types/course";

export function CourseCard({ course }: { course: FeaturedCourse; delay?: number }) {
  return <Link href={getCourseNavigation(course.id).courseDetailUrl} aria-label={`Explore ${course.title}`} className="course-tile">
    <div className="course-tile-image"><Image src={course.image} alt={course.imageAlt} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw" className="object-cover" /></div>
    <div className="course-tile-content"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-muted">{course.category}</p><h3 className="course-tile-title mt-3">{course.title}</h3><p className="mt-3 text-sm leading-7 text-muted">{course.description}</p><div className="course-tile-meta"><span className="course-tile-link">Explore course</span></div></div>
  </Link>;
}
