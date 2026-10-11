"use client";

import { useDeferredValue, useState } from "react";
import type { JournalArticle, JournalCategory } from "@/types/blog";
import { journalCategories } from "@/types/blog";
import { BlogCard } from "@/components/blog/blog-card";
import { Reveal } from "@/components/animations/reveal";

export function JournalBrowser({ articles }: { articles: JournalArticle[] }) {
  const [category, setCategory] = useState<JournalCategory | "All">("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const query = useDeferredValue(search).trim().toLowerCase();
  const filtered = articles.filter(article => (category === "All" || article.category === category) && `${article.title} ${article.excerpt} ${article.category}`.toLowerCase().includes(query)).sort((a, b) => sort === "title" ? a.title.localeCompare(b.title) : b.date.localeCompare(a.date));
  return (
    <section aria-labelledby="all-articles-heading" className="mt-16 border-t border-border pt-10 sm:mt-20">
      <h2 id="all-articles-heading" className="text-2xl">Explore the journal</h2>
      <p className="mt-3 text-sm text-muted">Find a fresh perspective on something that matters to you.</p>
      <div className="catalogue-toolbar journal-search-toolbar mt-6"><div className="min-w-0 flex-1"><label htmlFor="journal-search" className="mb-2 block text-xs font-semibold text-muted">Search the journal</label><input id="journal-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search stories, topics, or ideas" className="catalogue-input" /></div><div className="w-full sm:w-60"><label htmlFor="journal-sort" className="mb-2 block text-xs font-semibold text-muted">Sort stories</label><select id="journal-sort" value={sort} onChange={event => setSort(event.target.value)} className="catalogue-input"><option value="latest">Latest first</option><option value="title">Title: A–Z</option></select></div></div>
      <div role="group" aria-label="Filter articles by category" className="flex gap-2 overflow-x-auto pb-2">
        {(["All", ...journalCategories] as const).map(item => (
          <button key={item} type="button" aria-pressed={category === item} aria-controls="journal-results" onClick={() => setCategory(item)} className="catalogue-topic journal-topic">{item === "All" ? "All stories" : item}<span className="journal-topic-count">{item === "All" ? articles.length : articles.filter(article => article.category === item).length}</span></button>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3"><p role="status" aria-live="polite" className="text-xs text-muted">{filtered.length} {filtered.length === 1 ? "article" : "articles"}{category !== "All" ? ` in ${category}` : ""}</p>{(search || category !== "All") && <button type="button" className="min-h-11 text-sm font-semibold text-primary underline underline-offset-4" onClick={() => { setSearch(""); setCategory("All"); }}>Reset filters</button>}</div>
      <div id="journal-results" className="journal-library-grid mt-8">
        {filtered.map((post, index) => <Reveal key={post.slug} delay={(index % 3) * 0.04} className="journal-library-card"><BlogCard post={post} /></Reveal>)}
      </div>
      {filtered.length === 0 && <div className="rounded-card border border-border bg-white p-10 text-center"><h3 className="text-xl">No stories match your search</h3><p className="mt-3 text-sm text-muted">Try another topic or clear the filters to explore all stories.</p><button type="button" onClick={() => { setSearch(""); setCategory("All"); }} className="btn btn-primary mt-5">Clear filters</button></div>}
    </section>
  );
}
