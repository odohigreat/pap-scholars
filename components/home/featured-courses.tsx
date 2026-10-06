import type { CSSProperties } from "react";
import { MotionLink as Link } from "../animations/motion-link";
import { featuredCourses } from "../../data/courses";
import { Reveal } from "../animations/reveal";
import { CourseCard } from "../courses/course-card";

// Section-local semantic tokens match the hero while leaving other sections alone.
const courseColors = {
  "--brand-primary": "#0759d4",
  "--brand-primary-hover": "#0847a8",
  "--brand-accent": "#e7b34d",
  "--background": "#f4f8ff",
  "--surface-muted": "#eaf1fd",
  "--foreground": "#102344",
  "--muted": "#53657f",
  "--border": "#dce5f0",
  "--focus": "#0759d4",
  "--course-green": "#0a6243",
} as CSSProperties;

export function FeaturedCourses() {
  return (
    <section id="featured-courses" aria-labelledby="courses-heading" style={courseColors} className="section-spacing relative scroll-mt-24 overflow-hidden border-y border-border/60 bg-background">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 size-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="page-container relative">
        <Reveal className="mb-10 flex flex-col gap-6 sm:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><span aria-hidden="true" className="h-px w-6 bg-accent" />Featured courses</p>
            <h2 id="courses-heading" className="font-semibold text-foreground">Build skills for a<br className="hidden sm:block" /> brighter tomorrow.</h2>
            <p className="mt-5 max-w-xl text-muted">From academic growth to everyday confidence, discover a starting point for your next chapter.</p>
          </div>
          <Link href="/courses" className="btn btn-secondary w-fit shrink-0 gap-3 border-primary/20 text-primary">Browse all courses <span aria-hidden="true">↗</span></Link>
        </Reveal>
        <div className="grid auto-rows-fr gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredCourses.map((course, index) => <CourseCard key={course.id} course={course} delay={(index % 3) * 0.06} />)}
        </div>
      </div>
    </section>
  );
}
