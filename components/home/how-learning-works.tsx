import { MotionLink as Link } from "../animations/motion-link";
import { marketingTheme } from "../../config/marketing-theme";
import { Reveal } from "../animations/reveal";

const steps = [
  { title: "Create your account", label: "Begin", description: "Make a space for your learning. Your account is the starting point for the journey ahead." },
  { title: "Choose a course", label: "Find your direction", description: "Explore the courses and choose a topic that connects with your interests or the skills you want to build." },
  { title: "Learn at your own pace", label: "Make it a habit", description: "Work through each lesson in your own time. Pause, reflect, and put new ideas into practice." },
  { title: "Track your progress", label: "Keep moving forward", description: "See what you've covered, recognise your progress, and choose your next step." },
];

export function HowLearningWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" style={marketingTheme} className="section-spacing scroll-mt-24 border-y border-border bg-background">
      <div className="page-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 xl:gap-24">
        <Reveal className="lg:pt-2">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">How learning works</p>
          <h2 id="how-heading" className="max-w-md text-[clamp(2.25rem,3.5vw,3.25rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-foreground">A clear path.<br />Your own pace.</h2>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-muted">You don't need to have it all figured out. Start with an interest, then take it one step at a time.</p>
          <Link href="/register" className="btn btn-primary mt-8 gap-3">Start your journey <span aria-hidden="true">↗</span></Link>
          <div aria-hidden="true" className="mt-10 flex items-center gap-2"><span className="h-px w-12 bg-accent" /><span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted">From curiosity to progress</span></div>
        </Reveal>

        <ol className="relative">
          {steps.map((step, index) => (
            <li key={step.title} className="relative pl-16 sm:pl-20">
              {index < steps.length - 1 && <span data-journey-line aria-hidden="true" className="absolute bottom-0 left-[21px] top-11 w-px bg-primary/20" />}
              <span className={`absolute left-0 top-0 flex size-11 items-center justify-center rounded-full border font-mono text-xs ${index === 0 ? "border-primary bg-primary text-on-primary" : index === steps.length - 1 ? "border-[var(--support-green)]/25 bg-surface text-[var(--support-green)]" : "border-primary/25 bg-surface text-primary"}`}><span className="sr-only">Step </span>0{index + 1}</span>
              <Reveal delay={index * 0.05} className={index === steps.length - 1 ? "pb-1 pt-1" : "border-b border-border pb-8 pt-1 sm:pb-9"}>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--support-green)]">{step.label}</p>
                <h3 className="text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">{step.title}</h3>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted sm:text-base">{step.description}</p>
              </Reveal>
              {index < steps.length - 1 && <div aria-hidden="true" className="h-8 sm:h-9" />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
