import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marketingTheme } from "../../../../config/marketing-theme";
import { demoCourses, getDemoCourse } from "../../../../data/course-details";
import { CatalogueCard } from "../../../../components/courses/catalogue-card";
import { StartCourse } from "../../../../components/courses/start-course";
import { Reveal } from "../../../../components/animations/reveal";

type CourseProps = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return demoCourses.map(course => ({ slug: course.id })); }
export async function generateMetadata({ params }: CourseProps): Promise<Metadata> {
  const course = getDemoCourse((await params).slug);
  return course ? { title: `${course.title} | PAP Scholars`, description: course.description } : { title: "Course not found | PAP Scholars" };
}

export default async function CoursePage({ params }: CourseProps) {
  const course = getDemoCourse((await params).slug);
  if (!course) notFound();
  const related = demoCourses.filter(item => item.id !== course.id).slice(0, 3);
  return <div style={marketingTheme} className="bg-background pb-section">
    <header className="bg-surface pb-10 sm:pb-14">
      <div className="page-container pt-7 sm:pt-10">
        <nav aria-label="Breadcrumb"><Link href="/courses" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline"><span aria-hidden="true">←</span> All courses</Link></nav>
        <Reveal className="mb-8 mt-6 max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--support-green)]">{course.category}</p>
          <h1 className="mt-4 text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.12] tracking-[-0.035em]">{course.title}</h1>
          <p className="mt-5 max-w-2xl text-lead">{course.description}</p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted"><span>{course.lessonCount} lessons</span><span>Est. {course.duration}</span><span>Self-paced</span><span className="text-[var(--support-green)]">Demo course</span></div>
        </Reveal>
        <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-surface-muted sm:aspect-[16/7]">
          <Image src={course.image} alt={course.imageAlt} fill preload sizes="(min-width: 1200px) 1120px, 95vw" className="object-cover" />
        </div>
      </div>
    </header>
    <div className="page-container grid items-start gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-14 sm:py-16">
      <div className="min-w-0">
        <section aria-labelledby="overview-heading"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--support-green)]">YOUR NEXT CHAPTER</p><h2 id="overview-heading" className="text-2xl sm:text-3xl">Course overview</h2><p className="mt-5 text-base leading-8 text-muted">{course.overview}</p></section>
        <section aria-labelledby="outcomes-heading" className="mt-10 rounded-card border border-border bg-surface p-6 sm:p-8"><h2 id="outcomes-heading" className="text-xl sm:text-2xl">What you will learn</h2><ul className="mt-6 grid gap-5 sm:grid-cols-2">{course.outcomes.map(outcome => <li key={outcome} className="flex items-start gap-3 text-sm leading-7"><span aria-hidden="true" className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#eaf4ee] text-[var(--support-green)]">✓</span>{outcome}</li>)}</ul></section>
        <section id="curriculum" aria-labelledby="curriculum-heading" className="mt-12 scroll-mt-28"><div className="mb-6"><h2 id="curriculum-heading" className="text-2xl sm:text-3xl">A look inside the course</h2><p className="mt-3 text-sm text-muted">{course.modules.length} modules · {course.lessonCount} lesson previews</p></div><div className="space-y-4">{course.modules.map((module, index) => <details key={module.title} open={index === 0} className="group rounded-card border border-border bg-surface"><summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 rounded-card p-5 marker:hidden sm:p-6"><span className="text-sm font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span><span className="flex-1"><span className="block text-base font-semibold">{module.title}</span><span className="mt-1 block text-xs text-muted">{module.lessons.length} lessons</span></span><span aria-hidden="true" className="text-xl text-primary group-open:hidden">+</span><span aria-hidden="true" className="hidden text-xl text-primary group-open:block">−</span></summary><ol className="mx-5 mb-5 border-t border-border sm:mx-6 sm:mb-6">{module.lessons.map((lesson, lessonIndex) => <li key={lesson} className="flex items-start gap-3 border-b border-border/60 py-4 text-sm last:border-b-0"><span className="shrink-0 text-xs leading-6 text-muted">{index + 1}.{lessonIndex + 1}</span><span className="flex-1">{lesson}</span><span className="shrink-0 text-[10px] leading-6 text-muted">Preview</span></li>)}</ol></details>)}</div><p className="mt-4 text-xs leading-6 text-muted">Sample curriculum for the demo. Select Start Course to explore the lesson player.</p></section>
      </div>
      <aside aria-label="Course information" className="space-y-5 lg:sticky lg:top-28">
        <div className="rounded-card border border-border bg-surface p-6 shadow-soft"><span className="inline-block rounded-full bg-[#fcf5e7] px-3 py-1 text-[11px] font-semibold text-[#856026]">A SMALL STEP TOWARDS GROWTH</span><h2 className="mt-5 text-xl">Make time for your next chapter.</h2><p className="mt-3 text-sm leading-7 text-muted">Explore practical ideas you can bring into your everyday life.</p><dl className="my-6 space-y-3 border-y border-border py-5 text-sm">{[["Category", course.category], ["Estimated duration", course.duration], ["Lessons", String(course.lessonCount)], ["Learning format", "Self-paced"]].map(([label, value]) => <div key={label} className="flex justify-between gap-5"><dt className="text-muted">{label}</dt><dd className="max-w-[55%] text-right font-medium">{value}</dd></div>)}</dl><StartCourse courseId={course.id} /></div>
        <section className="rounded-card border border-border bg-surface p-6"><p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--support-green)]">YOUR INSTRUCTOR</p><div className="flex items-center gap-3"><span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-muted text-sm font-semibold text-primary">PAP</span><div><h2 className="text-base">PAP Scholars Learning Team</h2><p className="mt-1 text-xs text-muted">Demo instructor placeholder</p></div></div><p className="mt-4 text-sm leading-7 text-muted">Supporting students with practical skills for learning, personal growth, and community life.</p></section>
      </aside>
    </div>
    <section aria-labelledby="related-heading" className="page-container border-t border-border pt-12"><div className="mb-7 flex flex-wrap items-center justify-between gap-3"><h2 id="related-heading" className="text-2xl sm:text-3xl">Keep your curiosity going</h2><Link href="/courses" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline">View all courses <span aria-hidden="true">→</span></Link></div><div className="grid auto-rows-fr gap-6 sm:grid-cols-2 xl:grid-cols-3">{related.map((item, index) => <Reveal key={item.id} delay={index * 0.04} className="h-full"><CatalogueCard course={item} /></Reveal>)}</div></section>
  </div>;
}
