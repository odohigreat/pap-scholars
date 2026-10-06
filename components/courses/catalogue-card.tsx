import Image from "next/image";
import Link from "next/link";
import { getCourseNavigation } from "../../data/course-navigation";
import type { DemoCourse } from "../../data/course-details";

export function CatalogueCard({ course }: { course: DemoCourse }) {
  return (
    <Link href={getCourseNavigation(course.id).courseDetailUrl} aria-label={`View course: ${course.title}`} className="flex h-full min-w-0 flex-col overflow-hidden rounded-card border border-border bg-surface shadow-soft">
      <div className="relative aspect-[16/10] bg-surface-muted">
        <Image src={course.image} alt={course.imageAlt} fill sizes="(min-width: 1280px) 360px, (min-width: 640px) 45vw, 90vw" className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--support-green)]">{course.category}</p>
        <h3 className="mt-3 text-xl leading-snug">{course.title}</h3>
        <p className="mt-3 text-sm leading-7 text-muted">{course.description}</p>
        <div className="mt-auto pt-6">
          <p className="mb-4 text-xs text-muted">{course.lessonCount} lessons <span aria-hidden="true">·</span> Est. {course.duration}</p>
          <span className="btn btn-secondary w-full justify-between border-primary/20 text-primary">View Course <span aria-hidden="true">→</span></span>
        </div>
      </div>
    </Link>
  );
}
