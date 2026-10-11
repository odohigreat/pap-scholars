import { marketingTheme } from "@/config/marketing-theme";
import { getPublishedCourses } from "@/lib/courses/server";
import { Reveal } from "@/components/animations/reveal";
import { FeaturedCourseCarousel } from "@/components/courses/featured-course-carousel";
import { CourseCard } from "@/components/courses/course-card";

export async function FeaturedCourses() {
  const featuredCourses = (await getPublishedCourses()).slice(0, 6);
  return (
    <section id="featured-courses" aria-labelledby="courses-heading" style={marketingTheme} className="section-spacing relative scroll-mt-24 overflow-hidden border-y border-border/60 bg-background">
      <div className="page-container relative">
        <Reveal className="mb-10 flex flex-col gap-6 sm:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><span aria-hidden="true" className="h-px w-6 bg-accent" />Featured courses</p>
            <h2 id="courses-heading" className="text-foreground">Explore your next<br className="hidden sm:block" /> learning opportunity.</h2>
            <p className="mt-5 max-w-xl text-muted">From academic growth to everyday confidence, discover a starting point for your next chapter.</p>
          </div>
        </Reveal>
        <p className="mb-4 text-xs text-muted sm:hidden">Swipe to explore courses</p>
        <FeaturedCourseCarousel count={featuredCourses.length}>
          {featuredCourses.map(course => <CourseCard key={course.id} course={course} />)}
        </FeaturedCourseCarousel>
      </div>
    </section>
  );
}
