import { marketingTheme } from "../../config/marketing-theme";
import { MotionLink as Link } from "../animations/motion-link";
import { featuredCourses } from "../../data/courses";
import { Reveal } from "../animations/reveal";
import { CourseCard } from "../courses/course-card";

export function FeaturedCourses() {
  return (
    <section id="featured-courses" aria-labelledby="courses-heading" style={marketingTheme} className="section-spacing relative scroll-mt-24 overflow-hidden border-y border-border/60 bg-background">
      <div className="page-container relative">
        <Reveal className="mb-10 flex flex-col gap-6 sm:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><span aria-hidden="true" className="h-px w-6 bg-accent" />Featured courses</p>
            <h2 id="courses-heading" className="font-normal text-foreground">Build skills for a<br className="hidden sm:block" /> brighter tomorrow.</h2>
            <p className="mt-5 max-w-xl text-muted">From academic growth to everyday confidence, discover a starting point for your next chapter.</p>
          </div>
          <Link href="/courses" className="btn btn-secondary w-fit shrink-0 gap-3 border-primary/20 text-primary">Browse all courses </Link>
        </Reveal>
        <div className="course-collection home-course-collection">
          {featuredCourses.map((course, index) => <CourseCard key={course.id} course={course} delay={(index % 3) * 0.06} />)}
        </div>
      </div>
    </section>
  );
}
