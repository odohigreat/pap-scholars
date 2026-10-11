import Image from "next/image";
import Link from "next/link";
import { formatArticleDate, readingTime } from "@/data/blog";
import type { JournalArticle } from "@/types/blog";

export function BlogCard({ post, prominent = false, stacked = false }: { post: JournalArticle; prominent?: boolean; stacked?: boolean }) {
  return (
    <article className={prominent ? `journal-feature grid h-full min-w-0 gap-6 ${stacked ? "content-start" : "lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-10"}` : "flex h-full min-w-0 flex-col"}>
      <div className={`journal-card-image relative block overflow-hidden bg-surface-muted ${prominent ? "aspect-[4/3] lg:aspect-[5/4]" : "aspect-[16/10]"}`}>
        <Image src={post.image} alt={post.alt} fill sizes={prominent ? "(min-width: 1024px) 720px, 90vw" : "(min-width: 1280px) 360px, (min-width: 768px) 45vw, 90vw"} className="object-cover object-center" />
      </div>
      <div className={prominent ? "py-2" : "flex flex-1 flex-col pt-5"}>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--support-green)]">{post.category}</p>
        <h3 className={prominent ? "text-[clamp(1.75rem,3vw,2.75rem)] font-normal leading-[1.15] tracking-[-0.035em]" : "text-xl font-semibold leading-snug tracking-tight"}>{post.title}</h3>
        <p className="mt-4 text-sm leading-relaxed text-muted">{post.excerpt}</p>
        <div className="mt-auto pt-5">
          <div className="flex flex-wrap gap-2 text-xs text-muted"><time dateTime={post.date}>{formatArticleDate(post.date)}</time><span aria-hidden="true">·</span><span>{readingTime(post)} min read</span></div>
          <Link href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`} className="journal-read-button mt-4">Read Article </Link>
        </div>
      </div>
    </article>
  );
}
