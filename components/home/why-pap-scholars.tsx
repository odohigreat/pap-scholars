import Image from "next/image";
import { marketingTheme } from "../../config/marketing-theme";
import studyImage from "../../public/images/courses/academic-excellence.webp";
import { Reveal } from "../animations/reveal";

export function WhyPapScholars() {
  return (
    <section aria-labelledby="why-heading" style={marketingTheme} className="section-spacing bg-surface">
      <div className="page-container">
        <Reveal className="mb-12 border-b border-border pb-8 sm:mb-16 sm:pb-10">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Why PAP Scholars</p>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-20">
            <h2 id="why-heading" className="max-w-2xl text-[clamp(2.25rem,4vw,3.5rem)] font-normal leading-[1.12] tracking-[-0.035em] text-foreground">Learning that<br />stays with you.</h2>
            <p className="max-w-md text-base leading-relaxed text-muted">Good learning reaches beyond a lesson. It shapes how you study, make decisions, and contribute to the world around you.</p>
          </div>
        </Reveal>

        <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 xl:gap-24">
          <Reveal>
            <figure>
              <Reveal image className="relative aspect-[4/3] overflow-hidden bg-surface-muted lg:aspect-[4/5]">
                <Image src={studyImage} alt="Student concentrating on her notes and an open textbook in a university library" fill sizes="(min-width: 1280px) 430px, (min-width: 1024px) 40vw, 90vw" className="object-cover object-[50%_35%]" />
              </Reveal>
              <figcaption className="mt-5 flex items-start gap-3 text-xs leading-relaxed text-muted"><span aria-hidden="true" className="mt-1 h-7 w-px shrink-0 bg-accent" /><span>The classroom is a starting point.<br />What you do with your learning matters.</span></figcaption>
            </figure>
          </Reveal>

          <div className="lg:pt-2">
            <Reveal className="mb-10 sm:mb-12">
              <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--support-green)]"><span className="font-mono text-muted">01</span>Practical learning</p>
              <h3 className="max-w-lg text-[clamp(1.875rem,3vw,2.75rem)] font-medium leading-[1.15] tracking-[-0.035em] text-primary">Useful in class.<br />Valuable in life.</h3>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted">Build skills you can put to work: managing money, communicating clearly, and approaching everyday challenges with confidence.</p>
            </Reveal>

            <Reveal className="border-t border-border py-7 sm:py-8">
              <div className="grid gap-3 sm:grid-cols-[2rem_1fr] sm:gap-5">
                <span className="pt-1 font-mono text-xs text-muted">02</span>
                <div><h3 className="text-xl font-semibold leading-snug text-foreground">A stronger academic foundation</h3><p className="mt-3 max-w-md text-sm leading-relaxed text-muted">Study with intention. Develop habits that help you understand more and make better use of your time.</p></div>
              </div>
            </Reveal>

            <div className="grid gap-7 border-t border-border pt-7 sm:grid-cols-[1fr_1.1fr] sm:gap-8 sm:pt-8">
              <Reveal><p className="mb-3 font-mono text-xs text-muted">03</p><h3 className="text-lg font-semibold leading-snug text-foreground">Growth from within</h3><p className="mt-3 text-sm leading-relaxed text-muted">Understand yourself better. Build self-awareness, empathy, and a clearer sense of direction.</p></Reveal>
              <Reveal className="sm:pt-6"><p className="mb-3 font-mono text-xs text-muted">04</p><h3 className="text-lg font-semibold leading-snug text-foreground">Leadership in everyday life</h3><p className="mt-3 text-sm leading-relaxed text-muted">Learn to listen, take responsibility, and make a thoughtful contribution to your community.</p></Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
