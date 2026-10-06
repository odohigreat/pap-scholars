import type { Metadata } from "next";
import { marketingTheme } from "../../../config/marketing-theme";
import { journalArticles } from "../../../data/blog";
import { BlogCard } from "../../../components/blog/blog-card";
import { JournalBrowser } from "../../../components/blog/journal-browser";
import { Reveal } from "../../../components/animations/reveal";

export const metadata: Metadata = {
  title: "The PAP Journal | PAP Scholars",
  description: "Ideas and practical perspectives on academic excellence, personal development, money, communication, and leadership.",
};

export default function JournalPage() {
  return (
    <div style={marketingTheme} className="section-spacing bg-surface">
      <div className="page-container">
        <Reveal className="mb-12 border-b border-border pb-10">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Ideas for the journey</p>
          <h1 className="text-[clamp(3rem,6vw,5rem)] tracking-[-0.045em]">The PAP Journal</h1>
          <p className="mt-6 max-w-2xl text-lead">Thoughtful perspectives on learning, life, and becoming who you want to be.</p>
          <p className="mt-4 text-xs text-muted">Demo edition · Six stories to explore</p>
        </Reveal>
        <section aria-label="Featured article">
          <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.15em] text-primary"><span aria-hidden="true" className="h-px w-8 bg-accent" />Editor's pick</p>
          <Reveal><BlogCard post={journalArticles[0]} prominent /></Reveal>
        </section>
        <JournalBrowser articles={journalArticles} />
      </div>
    </div>
  );
}
