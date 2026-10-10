import Link from "next/link";
import { marketingTheme } from "../../config/marketing-theme";
import { featuredPosts } from "../../data/blog";
import { Reveal } from "../animations/reveal";
import { BlogCard } from "../blog/blog-card";

export function FeaturedBlog() {
  return (
    <section aria-labelledby="blog-heading" style={marketingTheme} className="section-spacing bg-surface">
      <div className="page-container">
        <Reveal className="mb-10 flex flex-col gap-6 sm:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><span aria-hidden="true" className="h-px w-6 bg-accent" />Ideas for the journey</p>
            <h2 id="blog-heading" className="font-normal text-foreground">The PAP Journal</h2>
            <p className="mt-5 max-w-xl text-muted">Fresh perspectives on learning, life skills, and becoming your best self. Ideas to bring into your everyday life.</p>
          </div>
          <Link href="/blog" className="btn btn-secondary w-fit shrink-0 gap-3 border-primary/20 text-primary">Explore the PAP Journal </Link>
        </Reveal>
        <div className="grid gap-10 lg:grid-cols-[1.7fr_1fr] lg:gap-12">
          <Reveal><BlogCard post={featuredPosts[0]} prominent stacked /></Reveal>
          <div className="journal-support grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
            {featuredPosts.slice(1).map((post, index) => <Reveal key={post.slug} delay={index * 0.06} className="border-t border-border pt-6"><BlogCard post={post} /></Reveal>)}
          </div>
        </div>
      </div>
    </section>
  );
}
