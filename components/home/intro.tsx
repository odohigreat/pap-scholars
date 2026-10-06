import { MotionLink as Link } from "../animations/motion-link";
import { Reveal } from "../animations/reveal";

export function Intro() {
  return (
    <section aria-labelledby="intro-heading" className="section-spacing bg-surface">
      <Reveal className="page-container grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
        <div><p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Meet PAP Scholars</p><h2 id="intro-heading">Room to learn.<br />Space to grow.</h2></div>
        <div className="max-w-2xl"><p className="text-lead">Learning opens doors. PAP Scholars is a place to explore your interests and take the next step toward the person you want to become.</p><p className="mt-5 text-muted">Our vision is simple: make learning feel purposeful, approachable, and connected to everyday life. Start with an interest. Build understanding. Keep moving forward.</p><Link href="/about" className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-sm text-sm font-semibold text-primary hover:underline">Get to know us <span aria-hidden="true">↗</span></Link></div>
      </Reveal>
    </section>
  );
}
