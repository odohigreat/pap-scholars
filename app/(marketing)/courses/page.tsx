import { getStudentEnrollments } from "../../../lib/enrollments/server";
import type { Metadata } from "next";
import { marketingTheme } from "../../../config/marketing-theme";
import { demoCourses } from "../../../data/course-details";
import { CatalogueCard } from "../../../components/courses/catalogue-card";
import { Reveal } from "../../../components/animations/reveal";

export const metadata: Metadata = { title: "Explore courses | PAP Scholars", description: "Explore six courses for academic growth, everyday confidence, and a brighter future." };

export default async function CoursesPage() {
  const enrollments = await getStudentEnrollments();
  return <div style={marketingTheme} className="bg-background pb-section">
    <header className="border-b border-border bg-surface">
      <div className="page-container page-intro">
        <Reveal className="max-w-3xl">
          <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><span aria-hidden="true" className="h-px w-8 bg-accent" />THE PAP SCHOLARS COLLECTION</p>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.08] tracking-[-0.04em]">A new skill.<br />A brighter possibility.</h1>
          <p className="mt-6 max-w-xl text-lead">Discover practical lessons for your studies, your relationships, and the world around you. Find your next step here.</p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-muted"><span>6 courses to explore</span><span>Learn at your own pace</span><span className="text-[var(--support-green)]">Built for student growth</span></div>
        </Reveal>
      </div>
    </header>
    <section aria-labelledby="all-courses-heading" className="page-container pt-10 sm:pt-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--support-green)]">MAKE ROOM FOR GROWTH</p><h2 id="all-courses-heading" className="text-2xl sm:text-3xl">Explore all courses</h2></div><p className="text-xs text-muted">Demo catalogue · Estimated durations</p></div>
      <div className="course-collection">{demoCourses.map((course, index) => <Reveal key={course.id} delay={(index % 3) * 0.04} className="h-full"><CatalogueCard course={course} enrollment={enrollments.find(item => item.course_id === course.id)} /></Reveal>)}</div>
      <div className="mt-16 border-t border-border py-8"><p className="text-lg font-semibold">Start with what matters to you.</p><p className="mt-2 max-w-2xl text-sm leading-7 text-muted">Build confidence with one course, then explore the next. Every small step is part of your learning journey.</p></div>
    </section>
  </div>;
}
