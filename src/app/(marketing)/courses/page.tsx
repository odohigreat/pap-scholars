import { getStudentEnrollments } from "@/features/enrollments/server";
import type { Metadata } from "next";
import { marketingTheme } from "@/config/marketing-theme";
import { getPublishedCourses } from "@/features/courses/server";
import { CatalogueBrowser } from "@/features/courses/components/catalogue-browser";
import Link from "next/link";
import Image from "next/image";
import studyImage from "@public/images/courses/academic-excellence.webp";
import { Reveal } from "@/components/animations/reveal";

export const metadata: Metadata = { title: "Explore courses | PAP Scholars", description: "Explore courses for academic growth, everyday confidence, and a brighter future." };

export default async function CoursesPage() {
  const [enrollments, courses] = await Promise.all([getStudentEnrollments(), getPublishedCourses()]);
  return <div style={marketingTheme} className="bg-background pb-section">
    <header className="catalogue-hero border-b border-border">
      <div className="page-container grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.3fr_.7fr] lg:gap-16">
        <Reveal className="max-w-3xl">
          <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><span aria-hidden="true" className="h-px w-8 bg-accent" />THE PAP SCHOLARS COLLECTION</p>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.08] tracking-[-0.04em]">Build your skills.<br /><span className="text-primary">Find your next step.</span></h1>
          <p className="mt-6 max-w-xl text-lead">Discover practical lessons for your studies, your relationships, and the world around you. Find your next step here.</p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-muted"><span>{courses.length} courses to explore</span><span>Learn at your own pace</span><span className="text-[var(--support-green)]">Built for student growth</span></div>
        </Reveal>
        <Reveal className="min-w-0">
          <figure className="relative">
            <div className="relative aspect-[5/4] overflow-hidden rounded-card"><Image src={studyImage} alt="Student working through notes in a university library" fill preload sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" /></div>
            <figcaption className="catalogue-hero-caption"><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#e8c98e]">Choose your next chapter</p><p className="mt-2 text-lg font-semibold">Focused lessons. Practical skills.</p><p className="mt-2 text-sm text-white/80">Study in your own time and build on every lesson.</p></figcaption>
          </figure>
        </Reveal>
      </div>
    </header>
    <div className="border-b border-border bg-white"><div className="page-container grid grid-cols-3 gap-4 py-6"><div><span className="block text-xl font-semibold text-primary">{courses.length}</span><span className="text-xs text-muted">Courses to explore</span></div><div><span className="block text-xl font-semibold text-primary">{new Set(courses.map(course => course.category)).size}</span><span className="text-xs text-muted">Learning areas</span></div><div><span className="block text-xl font-semibold text-primary">Your pace</span><span className="text-xs text-muted">Flexible study</span></div></div></div>
    <section aria-labelledby="all-courses-heading" className="page-container pt-10 sm:pt-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--support-green)]">MAKE ROOM FOR GROWTH</p><h2 id="all-courses-heading" className="text-2xl sm:text-3xl">Explore all courses</h2></div><p className="text-xs text-muted">Estimated durations</p></div>
      <CatalogueBrowser courses={courses} enrollments={enrollments} />
      <div className="mt-14 rounded-card border border-border bg-white p-7 sm:p-9"><p className="text-lg font-semibold">Start with what matters to you.</p><p className="mt-2 max-w-2xl text-sm leading-7 text-muted">Build confidence with one course, then explore the next. Every small step is part of your learning journey.</p><Link href="/dashboard" className="btn btn-secondary mt-5">Go to your dashboard</Link></div>
    </section>
  </div>;
}
