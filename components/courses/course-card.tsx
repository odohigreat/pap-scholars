"use client";

import Image from "next/image";
import { MotionLink as Link } from "../animations/motion-link";
import { motion, useReducedMotion } from "motion/react";
import { getCourseNavigation } from "../../data/course-navigation";
import type { FeaturedCourse } from "../../types/course";

export function CourseCard({ course, delay = 0 }: { course: FeaturedCourse; delay?: number }) {
  const reducedMotion = useReducedMotion();

  return (
    <Link href={getCourseNavigation(course.id).courseDetailUrl} aria-label={`Explore ${course.title}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-card border border-border bg-surface shadow-[0_2px_8px_rgb(16_35_68/0.02)] transition-shadow duration-200 hover:shadow-soft focus-within:shadow-soft motion-reduce:transition-none"
    >
      <div className="relative aspect-[16/9] shrink-0 overflow-hidden border-b border-border/60 bg-surface-muted">
        <Image
          src={course.image}
          alt={course.imageAlt}
          fill
          sizes="(min-width: 1280px) 360px, (min-width: 768px) 45vw, 90vw"
          className="object-cover object-center"
        />
      </div>
      <motion.div
        initial={false}
        whileInView={reducedMotion ? undefined : { y: [12, 0] }}
        viewport={{ once: true, amount: 0.15 }}
        whileHover={reducedMotion ? undefined : { y: -2 }}
        transition={{ duration: 0.4, delay, ease: "easeOut" }}
        className="flex flex-1 flex-col p-6 sm:p-7"
      >
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--course-green)]">{course.category}</p>
        <h3 className="text-xl font-semibold leading-snug tracking-tight text-foreground">{course.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">{course.description}</p>
        <div className="mt-auto pt-6">
          <span
            className="flex min-h-11 items-center justify-between gap-3 rounded-control border border-primary/15 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-on-primary focus-visible:bg-primary focus-visible:text-on-primary motion-reduce:transition-none"
          >
            Explore course
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
