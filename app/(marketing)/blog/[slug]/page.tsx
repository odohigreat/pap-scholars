import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marketingTheme } from "../../../../config/marketing-theme";
import { formatArticleDate, getArticle, journalArticles, readingTime } from "../../../../data/blog";
import { BlogCard } from "../../../../components/blog/blog-card";
import { Reveal } from "../../../../components/animations/reveal";

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
    <div style={marketingTheme} className="bg-surface pb-section">
      <article>
        <header className="page-container pb-10 pt-10 sm:pb-14 sm:pt-14">
          <Link href="/blog" className="inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-primary hover:underline"><span aria-hidden="true">←</span> Back to the journal</Link>
          <Reveal className="mx-auto mt-8 max-w-4xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--support-green)]">{article.category}</p>
            <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.1] tracking-[-0.04em]">{article.title}</h1>
            <p className="mt-6 max-w-2xl text-lead">{article.excerpt}</p>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted"><time dateTime={article.date}>{formatArticleDate(article.date)}</time><span>{readingTime(article)} min read</span><span>Demo article</span></div>
          </Reveal>
        </header>
        <div className="page-container">
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted sm:aspect-[16/8]">
            <Image src={article.image} alt={article.alt} fill preload sizes="(min-width: 1200px) 1120px, 95vw" className="object-cover object-center" />
          </div>
        </div>
        <div className="mx-auto max-w-[46rem] px-gutter py-12 sm:py-16">
          <p className="text-lg leading-[1.85] text-foreground">{article.introduction}</p>
          {article.sections.map(section => (
            <section key={section.heading} className="mt-10">
              <h2 className="text-2xl font-semibold leading-snug tracking-tight">{section.heading}</h2>
              {section.paragraphs.map(paragraph => <p key={paragraph} className="mt-5 text-base leading-[1.9] text-muted sm:text-lg">{paragraph}</p>)}
            </section>
          ))}
          <div className="mt-12 border-t border-border pt-6"><p className="text-xs text-muted">From The PAP Journal · Demo editorial content</p><Link href="/blog" className="mt-3 inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-primary hover:underline"><span aria-hidden="true">←</span> Explore more stories</Link></div>
        </div>
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
