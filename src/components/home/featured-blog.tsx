import { marketingTheme } from "@/config/marketing-theme";
import { featuredPosts } from "@/data/blog";
import { Reveal } from "@/components/animations/reveal";
import { FeaturedCourseCarousel } from "@/components/courses/featured-course-carousel";
import { BlogCard } from "@/components/blog/blog-card";

export function FeaturedBlog() {
  return (
    <section aria-labelledby="blog-heading" style={marketingTheme} className="section-spacing bg-surface">
      <div className="page-container">
        <Reveal className="mb-10 flex flex-col gap-6 sm:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><span aria-hidden="true" className="h-px w-6 bg-accent" />Ideas for the journey</p>
            <h2 id="blog-heading" className="text-foreground">The PAP Journal</h2>
            <p className="mt-5 max-w-xl text-muted">Fresh perspectives on learning, life skills, and becoming your best self. Ideas to bring into your everyday life.</p>
          </div>
        </Reveal>
        <p className="mb-4 text-xs text-muted sm:hidden">Swipe to explore articles</p>
        <FeaturedCourseCarousel count={featuredPosts.length} label="Featured journal articles" itemLabel="article" className="home-journal-collection">
          {featuredPosts.map(post => <BlogCard key={post.slug} post={post} />)}
        </FeaturedCourseCarousel>
      </div>
    </section>
  );
}
