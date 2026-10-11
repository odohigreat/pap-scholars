"use client";

import { useDeferredValue, useState } from "react";
import type { CatalogCourse } from "@/lib/courses/server";
import type { Enrollment } from "@/lib/enrollments/server";
import { CatalogueCard } from "@/components/courses/catalogue-card";

export function CatalogueBrowser({ courses, enrollments }: { courses: CatalogCourse[]; enrollments: Enrollment[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [onlyEnrolled, setOnlyEnrolled] = useState(false);
  const query = useDeferredValue(search).trim().toLowerCase();
  const categories = [...new Set(courses.map(course => course.category))];
  const visible = courses.filter(course => (!onlyEnrolled || enrollments.some(item => item.course_id === course.id)) && (category === "all" || course.category === category) && `${course.title} ${course.description} ${course.category}`.toLowerCase().includes(query)).sort((a, b) => sort === "title" ? a.title.localeCompare(b.title) : sort === "lessons" ? a.lessonCount - b.lessonCount : 0);
  return <>
    <div className="catalogue-toolbar">
      <div className="min-w-0 flex-1"><label htmlFor="course-search" className="mb-2 block text-xs font-semibold text-muted">Find your next course</label><input id="course-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by topic or skill" className="catalogue-input" /></div>
      <div className="w-full sm:w-64"><label htmlFor="course-sort" className="mb-2 block text-xs font-semibold text-muted">Sort courses</label><select id="course-sort" value={sort} onChange={event => setSort(event.target.value)} className="catalogue-input"><option value="default">Recommended order</option><option value="title">Course name: A–Z</option><option value="lessons">Fewest lessons first</option></select></div>
    </div>
    <div className="catalogue-topic-filters mb-6 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter by learning area">
      <button type="button" onClick={() => setCategory("all")} aria-pressed={category === "all"} className="catalogue-topic">All courses</button>
      {categories.map(item => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className="catalogue-topic">{item}</button>)}
    </div>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <p role="status" aria-live="polite" className="text-sm text-muted">{visible.length} {visible.length === 1 ? "course" : "courses"}{category !== "all" ? ` in ${category}` : " to explore"}</p>
      {enrollments.length > 0 && <label className="flex min-h-11 items-center gap-2 text-sm text-muted"><input type="checkbox" checked={onlyEnrolled} onChange={event => setOnlyEnrolled(event.target.checked)} className="size-4 accent-primary" />My enrolled courses</label>}
    </div>
    <div className="course-collection">{visible.map(course => <CatalogueCard key={course.id} course={course} enrollment={enrollments.find(item => item.course_id === course.id)} />)}</div>
    {visible.length === 0 && <div className="rounded-card border border-border bg-white px-6 py-12 text-center"><h3 className="text-xl">{courses.length ? "No courses match your search" : "New learning opportunities are on their way"}</h3><p className="mt-3 text-sm text-muted">{courses.length ? "Try another topic or choose a different learning area." : "Check back soon to explore published courses."}</p>{courses.length > 0 && <button type="button" onClick={() => { setSearch(""); setCategory("all"); setOnlyEnrolled(false); }} className="btn btn-primary mt-6">Clear filters</button>}</div>}
  </>;
}
