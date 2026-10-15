import { getStudentEnrollments } from "@/features/enrollments/server";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marketingTheme } from "@/config/marketing-theme";
import { getPublishedCourse, getPublishedCourses } from "@/features/courses/server";
import { CatalogueCard } from "@/features/courses/components/catalogue-card";
import { StartCourse } from "@/features/courses/components/start-course";
import { Reveal } from "@/components/animations/reveal";

type CourseProps = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: CourseProps): Promise<Metadata> {
  const course = await getPublishedCourse((await params).slug);
  return course ? { title: `${course.title} | PAP Scholars`, description: course.description } : { title: "Course not found | PAP Scholars" };
}

export default async function CoursePage({ params }: CourseProps) {
  const course = await getPublishedCourse((await params).slug);
  if (!course) notFound();
  const enrollments = await getStudentEnrollments();
  const related = (await getPublishedCourses()).filter(item => item.id !== course.id).slice(0, 3);
  return <div style={marketingTheme} className="course-detail bg-background pb-section">
    <header className="course-detail-hero">
      <div className="page-container py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-8"><Link href="/courses" className="inline-flex min-h-11 items-center text-sm font-medium text-white/80 hover:text-white hover:underline">Courses</Link><span aria-hidden="true" className="mx-3 text-white/40">/</span><span className="text-sm text-white/70">Course details</span></nav>
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#e8c98e]">{course.category}</p>
            <h1 className="mt-5 text-[clamp(2.35rem,4.5vw,4rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-white">{course.title}</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/80 sm:text-lg">{course.description}</p>
            <div className="mt-7 flex flex-wrap gap-3 text-xs font-medium text-white/90"><span className="course-detail-tag">{course.lessonCount} lessons</span><span className="course-detail-tag">{course.duration}</span><span className="course-detail-tag">Self-paced</span>{course.isDemo && <span className="course-detail-tag">Demo course</span>}</div>
            <a href="#curriculum" className="mt-7 inline-flex min-h-11 items-center border-b border-white/40 text-sm font-semibold text-white hover:border-white">View the curriculum</a>
          </Reveal>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-white/10">
            <Image unoptimized src={course.image} alt={course.imageAlt} fill preload sizes="(min-width: 1024px) 45vw, 95vw" className="object-cover" />
          </div>
        </div>
      </div>
    </header>
    <div className="page-container grid items-start gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-14 sm:py-16">
      <div className="min-w-0">
        <section aria-labelledby="overview-heading"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--support-green)]">ABOUT THIS COURSE</p><h2 id="overview-heading" className="text-2xl sm:text-3xl">Course overview</h2><p className="mt-5 text-base leading-8 text-muted">{course.overview}</p></section>
        <section aria-labelledby="outcomes-heading" className="course-outcomes"><h2 id="outcomes-heading" className="text-xl sm:text-2xl">What you will learn</h2><ul className="mt-6 grid gap-5 sm:grid-cols-2">{course.outcomes.map(outcome => <li key={outcome} className="flex items-start gap-3 text-sm leading-7"><span aria-hidden="true" className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#eaf4ee] text-[var(--support-green)]">✓</span>{outcome}</li>)}</ul></section>
        <section id="curriculum" aria-labelledby="curriculum-heading" className="mt-12 scroll-mt-28"><div className="mb-6"><h2 id="curriculum-heading" className="text-2xl sm:text-3xl">Course curriculum</h2><p className="mt-3 text-sm text-muted">{course.modules.length} modules · {course.lessonCount} lesson previews</p></div><div className="space-y-4">{course.modules.map((module, index) => <details key={module.title} open={index === 0} className="group rounded-card border border-border bg-surface"><summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 rounded-card p-5 marker:hidden sm:p-6"><span className="text-sm font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span><span className="flex-1"><span className="block text-base font-semibold">{module.title}</span><span className="mt-1 block text-xs text-muted">{module.lessons.length} lessons</span></span><span aria-hidden="true" className="text-xl text-primary group-open:hidden">+</span><span aria-hidden="true" className="hidden text-xl text-primary group-open:block">−</span></summary><ol className="mx-5 mb-5 border-t border-border sm:mx-6 sm:mb-6">{module.lessons.map((lesson, lessonIndex) => <li key={lesson} className="flex items-start gap-3 border-b border-border/60 py-4 text-sm last:border-b-0"><span className="shrink-0 text-xs leading-6 text-muted">{index + 1}.{lessonIndex + 1}</span><span className="flex-1">{lesson}</span><span className="shrink-0 text-[10px] leading-6 text-muted">Preview</span></li>)}</ol></details>)}</div><p className="mt-4 text-xs leading-6 text-muted">Select Enroll in Course to start learning.</p></section>
      </div>
      <aside aria-label="Course information" className="space-y-5 lg:sticky lg:top-28">
        <div className="course-information"><span className="inline-block text-[11px] font-semibold text-[#856026]">SELF-PACED LEARNING</span><h2 className="mt-5 text-xl">Start learning today.</h2><p className="mt-3 text-sm leading-7 text-muted">Explore practical ideas you can bring into your everyday life.</p><dl className="my-6 space-y-3 border-y border-border py-5 text-sm">{[["Category", course.category], ["Estimated duration", course.duration], ["Lessons", String(course.lessonCount)], ["Learning format", "Self-paced"]].map(([label, value]) => <div key={label} className="flex justify-between gap-5"><dt className="text-muted">{label}</dt><dd className="max-w-[55%] text-right font-medium">{value}</dd></div>)}</dl><StartCourse courseId={course.id} enrollment={enrollments.find(item => item.course_id === course.id)} /></div>
        <section className="course-instructor"><p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--support-green)]">YOUR INSTRUCTOR</p><div className="flex items-center gap-3"><span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-muted text-sm font-semibold text-primary">PAP</span><div><h2 className="text-base">{course.instructor}</h2><p className="mt-1 text-xs text-muted">Course instructor</p></div></div><p className="mt-4 text-sm leading-7 text-muted">Supporting students with practical skills for learning, personal growth, and community life.</p></section>
      </aside>
    </div>
    <section aria-labelledby="related-heading" className="page-container border-t border-border pt-12"><div className="mb-7 flex flex-wrap items-center justify-between gap-3"><h2 id="related-heading" className="text-2xl sm:text-3xl">More courses to explore</h2><Link href="/courses" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline">View all courses </Link></div><div className="grid auto-rows-fr gap-6 sm:grid-cols-2 xl:grid-cols-3">{related.map((item, index) => <Reveal key={item.id} delay={index * 0.04} className="h-full"><CatalogueCard course={item} enrollment={enrollments.find(enrollment => enrollment.course_id === item.id)} /></Reveal>)}</div></section>
  </div>;
}
