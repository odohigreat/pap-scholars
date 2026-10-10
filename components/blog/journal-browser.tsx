"use client";

import { useState } from "react";
import type { JournalArticle, JournalCategory } from "../../types/blog";
import { journalCategories } from "../../types/blog";
import { BlogCard } from "./blog-card";
import { Reveal } from "../animations/reveal";

export function JournalBrowser({ articles }: { articles: JournalArticle[] }) {
  const [category, setCategory] = useState<JournalCategory | "All">("All");
  const filtered = category === "All" ? articles : articles.filter(article => article.category === category);
  return (
    <section aria-labelledby="all-articles-heading" className="mt-16 border-t border-border pt-10 sm:mt-20">
      <h2 id="all-articles-heading" className="text-2xl">Explore the journal</h2>
      <div role="group" aria-label="Filter articles by category" className="mt-6 flex flex-wrap gap-2">
        {(["All", ...journalCategories] as const).map(item => (
          <button key={item} type="button" aria-pressed={category === item} aria-controls="journal-results" onClick={() => setCategory(item)} className={`min-h-11 border-b-2 px-3 py-2 text-sm font-medium ${category === item ? "border-primary text-primary" : "border-transparent text-muted hover:border-primary hover:text-primary"}`}>{item}</button>
        ))}
      </div>
      <p role="status" className="mt-5 text-xs text-muted">{filtered.length} {filtered.length === 1 ? "article" : "articles"}{category !== "All" ? ` in ${category}` : ""}</p>
      <div id="journal-results" className="journal-index mt-8">
        {filtered.map((post, index) => <Reveal key={post.slug} delay={(index % 3) * 0.04}><BlogCard post={post} /></Reveal>)}
      </div>
    </section>
  );
}
