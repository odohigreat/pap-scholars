import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marketingTheme } from "@/config/marketing-theme";
import { formatArticleDate, getArticle, journalArticles, readingTime } from "@/features/blog/data/articles";
import { BlogCard } from "@/features/blog/components/blog-card";
import { Reveal } from "@/components/animations/reveal";

type ArticleProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return journalArticles.map(article => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticleProps): Promise<Metadata> {
  const article = getArticle((await params).slug);
  return article ? { title: `${article.title} | The PAP Journal`, description: article.excerpt } : { title: "Article not found | PAP Scholars" };
}

export default async function ArticlePage({ params }: ArticleProps) {
  const article = getArticle((await params).slug);
  if (!article) notFound();
  const related = journalArticles.filter(post => post.slug !== article.slug)
    .sort((a, b) => Number(b.category === article.category) - Number(a.category === article.category)).slice(0, 3);

  return (
    <div style={marketingTheme} className="journal-article-page bg-surface pb-section">
      <article>
        <header className="article-masthead pb-10 pt-8 sm:pb-14 sm:pt-10">
          <div className="page-container"><Link href="/blog" className="inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-primary hover:underline"> Back to the journal</Link>
          <Reveal className="mx-auto mt-8 max-w-4xl text-center">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.15em] text-primary">{article.category}</p>
            <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.1] tracking-[-0.04em]">{article.title}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">{article.excerpt}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted"><time dateTime={article.date}>{formatArticleDate(article.date)}</time><span>{readingTime(article)} min read</span><span>The PAP Journal · Demo article</span></div>
          </Reveal>
        </div></header>
        <div className="page-container">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-muted sm:aspect-[16/8]">
            <Image src={article.image} alt={article.alt} fill preload sizes="(min-width: 1200px) 1120px, 95vw" className="object-cover object-center" />
          </div>
        </div>
        <div className="article-layout page-container">
          <aside className="article-contents" aria-label="Article contents"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">In this article</p><nav className="mt-4 flex flex-col gap-3">{article.sections.map((section, index) => <a key={section.heading} href={`#section-${index + 1}`} className="text-sm leading-6 text-foreground hover:text-primary hover:underline">{section.heading}</a>)}</nav><Link href="/blog" className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-primary">All journal stories</Link></aside>
          <div className="article-reading min-w-0">
          <p className="text-lg leading-[1.85] text-foreground">{article.introduction}</p>
          {article.sections.map((section, index) => (
            <section key={section.heading} id={`section-${index + 1}`} className="mt-10 scroll-mt-32">
              <h2 className="text-2xl font-normal leading-snug tracking-tight">{section.heading}</h2>
              {section.paragraphs.map(paragraph => <p key={paragraph} className="mt-5 text-base leading-[1.9] text-muted sm:text-lg">{paragraph}</p>)}
            </section>
          ))}
          <div className="mt-12 border-t border-border pt-6"><p className="text-xs text-muted">From The PAP Journal · Demo editorial content</p><Link href="/blog" className="mt-3 inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-primary hover:underline"> Explore more stories</Link></div>
        </div></div>
      </article>
      <section aria-labelledby="related-heading" className="page-container border-t border-border pt-12">
        <h2 id="related-heading" className="mb-8 text-3xl">Keep reading</h2>
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
          {related.map((post, index) => <Reveal key={post.slug} delay={index * 0.04}><BlogCard post={post} /></Reveal>)}
        </div>
      </section>
    </div>
  );
}
