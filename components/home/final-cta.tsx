import { MotionLink as Link } from "../animations/motion-link";
import { Reveal } from "../animations/reveal";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-heading" className="pb-section">
      <div className="page-container"><Reveal><div className="relative overflow-hidden border-t border-border bg-[#18283f] px-6 py-12 text-on-primary sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between lg:gap-12">
        <div className="relative max-w-2xl"><p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Your next chapter</p><h2 id="cta-heading">Stay curious.<br />See where it takes you.</h2><p className="mt-5 max-w-lg text-on-primary/80">There is always something new to discover. Take your first step with PAP Scholars.</p></div>
        <div className="relative mt-8 flex flex-col items-start gap-3 lg:mt-0 lg:shrink-0"><Link href="/register" className="btn btn-secondary btn-lg focus-visible:outline-on-primary">Get Started </Link><Link href="#featured-courses" className="inline-flex min-h-11 items-center rounded-sm text-sm text-on-primary hover:underline focus-visible:outline-on-primary">Or explore the courses first</Link></div>
      </div></Reveal></div>
    </section>
  );
}
