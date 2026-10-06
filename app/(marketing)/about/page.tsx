import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { marketingTheme } from "../../../config/marketing-theme";
import workshop from "../../../public/images/home/pap-scholars-workshop.webp";

export const metadata: Metadata = {
  title: "About | PAP Scholars",
  description: "Discover PAP Scholars: purposeful learning for academic growth, practical life skills, and responsible citizenship.",
};

const focusAreas = [
  ["Academic excellence", "Build study habits, set achievable goals, and approach your education with intention.", "academic-excellence"],
  ["Personal development", "Develop self-awareness, emotional intelligence, and the confidence to keep growing.", "emotional-intelligence"],
  ["Financial intelligence", "Understand everyday money choices, plan your spending, and save with purpose.", "financial-intelligence"],
  ["Leadership", "Practise responsibility, work with others, and lead through service in your community.", "nation-building"],
  ["Communication", "Express your ideas clearly, listen thoughtfully, and navigate conversations with respect.", "effective-communication"],
  ["Nation building", "Explore shared values and meaningful ways to contribute to a stronger community.", "nation-building"],
] as const;

export default function AboutPage() {
  return <div style={marketingTheme} className="bg-background text-foreground">
    <header className="page-container grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
      <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">ABOUT PAP SCHOLARS</p><h1 className="mt-5 text-[clamp(2.25rem,5vw,4rem)] leading-[1.1]">Learning for the life<br className="hidden sm:block" /> ahead of you.</h1><p className="mt-6 max-w-xl text-lead">PAP Scholars is a learning space for students who want to grow in the classroom, in their everyday lives, and in their communities.</p><p className="mt-4 max-w-xl text-sm leading-7 text-muted">We bring academic skills and practical life lessons together, making room for curiosity, reflection, and small steps that add up over time.</p><Link href="/courses" className="btn btn-primary mt-7">Explore our courses <span aria-hidden="true">→</span></Link></div>
      <figure className="min-w-0"><div className="relative aspect-[4/5] max-h-[32rem] overflow-hidden rounded-card sm:aspect-[5/4] lg:aspect-[4/5]"><Image src={workshop} alt="Students sharing ideas and learning together in a workshop" fill preload sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" /></div><figcaption className="mt-3 text-xs text-muted">An idea becomes more useful when you put it into practice.</figcaption></figure>
    </header>
    <section aria-labelledby="purpose-heading" className="border-y border-border bg-surface py-12 sm:py-16"><div className="page-container grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-20"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--support-green)]">OUR PURPOSE</p><h2 id="purpose-heading" className="mt-4 text-3xl sm:text-4xl">More than<br />a lesson learned.</h2></div><div className="min-w-0"><div className="border-b border-border pb-8"><h3 className="text-xl">Our mission</h3><p className="mt-4 text-base leading-8 text-muted">To help students build the knowledge, habits, and practical skills they need to learn with confidence, make thoughtful choices, and contribute to the people around them.</p></div><div className="pt-8"><h3 className="text-xl">Our vision</h3><p className="mt-4 text-base leading-8 text-muted">A generation of capable, curious young people who pursue academic excellence, take responsibility for their growth, and play an active role in building stronger communities.</p></div></div></div></section>
    <section aria-labelledby="focus-heading" className="page-container py-12 sm:py-16"><div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr] lg:gap-20"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">WHAT WE FOCUS ON</p><h2 id="focus-heading" className="mt-4 text-3xl sm:text-4xl">Skills that<br />work together.</h2><p className="mt-5 max-w-sm text-sm leading-7 text-muted">Our aim is to connect what students learn with what they do: studying effectively, managing everyday challenges, and turning ideas into positive action.</p></div><ol className="min-w-0">{focusAreas.map(([title, description, slug], index) => <li key={title} className="border-b border-border first:border-t"><Link href={`/courses/${slug}`} className="group flex min-h-28 items-start gap-4 py-6 sm:gap-6"><span className="pt-1 text-xs font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><h3 className="text-lg group-hover:text-primary">{title}</h3><p className="mt-2 text-sm leading-7 text-muted">{description}</p></div><span aria-hidden="true" className="pt-1 text-primary">↗</span></Link></li>)}</ol></div></section>
    <section aria-labelledby="about-cta" className="bg-[#102f63] py-12 text-white sm:py-16"><div className="page-container flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#e7b34d]">YOUR NEXT CHAPTER</p><h2 id="about-cta" className="mt-4 text-3xl sm:text-4xl">Start with something that matters to you.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-blue-100">Choose a course, make time for a lesson, and bring one new idea into your day.</p></div><div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col xl:flex-row"><Link href="/register" className="btn bg-white text-[#102f63] hover:bg-blue-50">Create an account <span aria-hidden="true">→</span></Link><Link href="/courses" className="btn border-white/40 text-white hover:bg-white/10">Browse courses</Link></div></div></section>
  </div>;
}
