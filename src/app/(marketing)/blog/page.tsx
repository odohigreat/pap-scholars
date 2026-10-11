import type { Metadata } from "next";
import { marketingTheme } from "@/config/marketing-theme";
import { formatArticleDate, readingTime, journalArticles } from "@/data/blog";
import Image from "next/image";
import Link from "next/link";
import { JournalBrowser } from "@/components/blog/journal-browser";
import { Reveal } from "@/components/animations/reveal";

export const metadata: Metadata = {
  title: "The PAP Journal | PAP Scholars",
  description: "Ideas and practical perspectives on academic excellence, personal development, money, communication, and leadership.",
};

export default function JournalPage() {
  const featured = journalArticles[0];
  return <div style={marketingTheme} className="bg-background pb-section">
    <header className="journal-page-hero">
      <div className="page-container grid items-end gap-8 py-14 sm:py-20 lg:grid-cols-[1.4fr_.6fr] lg:gap-16">
        <Reveal><p className="mb-5 text-xs font-semibold uppercase tracking-[.18em] text-[#e8c98e]">Ideas for the journey</p><h1 className="text-[clamp(2.8rem,6vw,5rem)] leading-[1.08]">The PAP Journal</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">Thoughtful perspectives on learning, life, and becoming who you want to be. Make time for an idea that stays with you.</p></Reveal>
        <Reveal className="border-l-2 border-[#d5af68] pl-6"><p className="text-sm font-semibold">Read. Reflect. Put it into practice.</p><p className="mt-3 text-sm leading-7 text-white/75">Academic growth, personal development, and the everyday skills that make a difference.</p><p className="mt-5 text-xs text-[#e8c98e]">Demo edition · {journalArticles.length} stories to explore</p></Reveal>
      </div>
    </header>
    <div className="page-container">
      {featured && <section aria-labelledby="featured-article-heading" className="pt-10 sm:pt-14">
        <div className="mb-6 flex items-center gap-3"><span aria-hidden="true" className="h-px w-8 bg-accent" /><h2 id="featured-article-heading" className="text-sm font-semibold uppercase tracking-[.12em] text-primary">Editor’s pick</h2></div>
        <Reveal className="journal-feature-story">
          <div className="relative aspect-[4/3] min-w-0 overflow-hidden lg:aspect-auto lg:min-h-[28rem]"><Image src={featured.image} alt={featured.alt} fill preload sizes="(min-width: 1024px) 60vw, 90vw" className="object-cover" /><span className="journal-feature-label">Featured story</span></div>
          <div className="flex flex-col justify-center p-7 sm:p-10"><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#e8c98e]">{featured.category}</p><h3 className="mt-5 text-[clamp(1.75rem,3vw,2.75rem)] leading-tight">{featured.title}</h3><p className="mt-5 text-sm leading-7 text-white/80">{featured.excerpt}</p><div className="mt-6 flex flex-wrap gap-3 text-xs text-white/70"><time dateTime={featured.date}>{formatArticleDate(featured.date)}</time><span aria-hidden="true">·</span><span>{readingTime(featured)} min read</span></div><Link href={`/blog/${featured.slug}`} aria-label={`Read ${featured.title}`} className="btn btn-secondary mt-7 w-fit">Read Article</Link></div>
        </Reveal>
      </section>}
      <JournalBrowser articles={journalArticles} />
      <aside className="journal-reflection mt-14 rounded-card border-l-4 border-accent bg-white p-6 sm:p-8"><p className="mb-3 text-xs font-semibold uppercase tracking-[.14em] text-primary">Beyond the page</p><p className="text-lg font-semibold">Take one idea into your day.</p><p className="mt-3 max-w-2xl text-sm leading-7 text-muted">After reading, choose something small to try: a study habit, a better question, or a thoughtful conversation. Reflection becomes useful when you put it into practice.</p><Link href="/courses" className="btn btn-primary mt-6">Explore related courses</Link></aside>
    </div>
  </div>;
}
