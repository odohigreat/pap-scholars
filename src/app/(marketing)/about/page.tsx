import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { marketingTheme } from "@/config/marketing-theme";
import { Reveal } from "@/components/animations/reveal";
import workshop from "@public/images/home/pap-scholars-workshop.webp";

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

const principles = [
  { title: "Start with curiosity", text: "Ask questions, explore different perspectives, and make space for new ideas." },
  { title: "Learn through practice", text: "Connect each lesson to a real situation. Small actions make knowledge useful." },
  { title: "Grow with purpose", text: "Build habits that support your studies, your wellbeing, and your contribution to others." },
];

export default function AboutPage() {
  return <div style={marketingTheme} className="bg-background text-foreground">
    <header className="about-hero border-b border-border bg-surface">
      <div className="page-container grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">About PAP Scholars</p>
          <h1 className="mt-5 text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.08]">Learning for life.<br /><span className="text-primary">Growth with purpose.</span></h1>
          <p className="mt-6 max-w-xl text-lead">PAP Scholars is a learning space for students who want to grow in the classroom, in their everyday lives, and in their communities.</p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted">We bring academic skills and practical life lessons together, making room for curiosity, reflection, and small steps that add up over time.</p>
          <Link href="/courses" className="btn btn-primary mt-8">Explore our courses</Link>
        </Reveal>
        <Reveal className="min-w-0">
          <figure className="about-figure">
            <div className="relative aspect-[5/4] overflow-hidden rounded-card lg:aspect-[4/5] lg:max-h-[34rem]">
              <Image src={workshop} alt="Students sharing ideas and learning together in a workshop" fill preload sizes="(min-width: 1280px) 550px, (min-width: 1024px) 45vw, 90vw" className="object-cover" />
            </div>
            <figcaption className="about-image-caption"><span className="block text-xs font-semibold uppercase tracking-[.12em] text-[#e8c98e]">Learning together</span><span className="mt-2 block text-sm leading-6">An idea becomes more useful when you put it into practice.</span></figcaption>
          </figure>
        </Reveal>
      </div>
    </header>

    <section aria-labelledby="purpose-heading" className="section-spacing">
      <div className="page-container">
        <Reveal className="mb-10 max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Our purpose</p><h2 id="purpose-heading" className="mt-4">More than a lesson learned.</h2><p className="mt-5 text-muted">A stronger foundation for your studies. A clearer direction for the life ahead.</p></Reveal>
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal className="about-purpose-panel"><span className="about-section-number">01 / Our mission</span><h3 className="mt-5 text-2xl">Confidence to take your next step.</h3><p className="mt-5 text-base leading-8 text-muted">To help students build the knowledge, habits, and practical skills they need to learn with confidence, make thoughtful choices, and contribute to the people around them.</p></Reveal>
          <Reveal delay={.1} className="about-purpose-panel about-vision-panel"><span className="about-section-number">02 / Our vision</span><h3 className="mt-5 text-2xl">A generation ready to contribute.</h3><p className="mt-5 text-base leading-8">A generation of capable, curious young people who pursue academic excellence, take responsibility for their growth, and play an active role in building stronger communities.</p></Reveal>
        </div>
      </div>
    </section>

    <section aria-labelledby="focus-heading" className="section-spacing border-y border-border bg-surface">
      <div className="page-container">
        <Reveal className="mb-10 grid gap-6 lg:grid-cols-2 lg:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">What we focus on</p><h2 id="focus-heading" className="mt-4">Skills that work together.</h2></div><p className="max-w-xl text-base leading-7 text-muted">Connect what you learn with what you do: study effectively, manage everyday challenges, and turn ideas into positive action.</p></Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{focusAreas.map(([title, description, slug], index) => <Reveal key={title} delay={index * .05} className="about-focus-card"><span className="about-focus-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><h3 className="mt-5 text-xl">{title}</h3><p className="mt-3 flex-1 text-sm leading-7 text-muted">{description}</p><Link href={`/courses/${slug}`} className="btn btn-secondary mt-6 w-fit" aria-label={`Explore courses in ${title}`}>Explore this area</Link></Reveal>)}</div>
      </div>
    </section>

    <section aria-labelledby="approach-heading" className="section-spacing">
      <div className="page-container grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
        <Reveal><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Our approach</p><h2 id="approach-heading" className="mt-4">Small steps.<br />Lasting habits.</h2><p className="mt-5 max-w-sm text-muted">You don’t need to have everything figured out. Start with an interest and build from there.</p></Reveal>
        <div>{principles.map((principle, index) => <Reveal key={principle.title} delay={index * .1} className="flex gap-5 border-b border-border py-6 first:pt-0 last:border-b-0"><span className="about-focus-number shrink-0" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h3 className="text-xl">{principle.title}</h3><p className="mt-3 max-w-lg text-sm leading-7 text-muted">{principle.text}</p></div></Reveal>)}</div>
      </div>
    </section>

    <section aria-labelledby="about-cta" className="page-container pb-section">
      <Reveal className="rounded-card border-t-4 border-[#d5af68] bg-[#18283f] px-6 py-10 text-white sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-12"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#e8c98e]">Your next chapter</p><h2 id="about-cta" className="mt-4 text-3xl sm:text-4xl">Start with something that matters to you.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-white/80">Choose a course, make time for a lesson, and bring one new idea into your day.</p></div><Link href="/register" className="btn btn-secondary mt-7 shrink-0 lg:mt-0">Create your account</Link></Reveal>
    </section>
  </div>;
}
