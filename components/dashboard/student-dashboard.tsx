"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Brand } from "../layout/brand";
import { getDashboardCourseDestination, myCoursesHref } from "../../data/course-navigation";
import { featuredCourses } from "../../data/courses";

type Section = "Dashboard" | "My Courses" | "Progress" | "Profile" | "Notifications";
type IconName = "grid" | "book" | "chart" | "journal" | "user" | "bell" | "logout" | "menu" | "close" | "arrow" | "check" | "clock";
const paths: Record<IconName, string> = {
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  book: "M12 5v15 M12 5C8 2 3 4 3 4v15s5-2 9 1c4-3 9-1 9-1V4s-5-2-9 1Z",
  chart: "M4 20h16 M6 16v-5 M12 16V4 M18 16V8",
  journal: "M5 3h14v18H5z M9 8h6 M9 12h6 M9 16h3",
  user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-2a8 8 0 0 1 16 0v2",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4",
  logout: "M10 4H4v16h6 M10 12h11 M17 8l4 4-4 4",
  menu: "M4 6h16 M4 12h16 M4 18h16", close: "m6 6 12 12 M18 6 6 18",
  arrow: "M5 12h14 M14 7l5 5-5 5", check: "m5 12 4 4L19 6",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 7v5l3 2",
};
function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  return <svg className={`${className} shrink-0`} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}
const courses = [
  { ...featuredCourses[0], done: 8, total: 12, lesson: "Creating a budget that works", duration: "12 min", tag: "In progress" },
  { ...featuredCourses[1], done: 3, total: 10, lesson: "Making useful visual notes", duration: "9 min", tag: "In progress" },
  { ...featuredCourses[2], done: 8, total: 8, lesson: "Putting your study plan into practice", duration: "10 min", tag: "Completed" },
  { ...featuredCourses[3], done: 0, total: 10, lesson: "Understanding your emotions", duration: "8 min", tag: "Not started" },
];
const completed = courses.reduce((sum, course) => sum + course.done, 0);
const total = courses.reduce((sum, course) => sum + course.total, 0);
const overall = Math.round(completed / total * 100);
const activities = [
  { title: "Completed “Saving with intention”", detail: "Financial Intelligence", time: "Today · 10:24 AM", icon: "check" as const },
  { title: "Continued your learning journey", detail: "Understanding and Utilizing Your Learning Styles", time: "Yesterday · 4:15 PM", icon: "book" as const },
  { title: "Finished Academic Excellence Tips", detail: "All 8 lessons completed. Well done!", time: "2 days ago", icon: "check" as const },
];
const notifications = [
  { title: "A milestone worth celebrating", text: "You completed Academic Excellence Tips. Take a moment to celebrate your progress.", time: "2 days ago" },
  { title: "Your next lesson is ready", text: "Continue Financial Intelligence with “Creating a budget that works”.", time: "Today" },
  { title: "Make time for your next chapter", text: "A little learning goes a long way. Your learning styles course is ready when you are.", time: "Yesterday" },
];
function ProgressBar({ value, label, green = false }: { value: number; label: string; green?: boolean }) {
  return <div className="dashboard-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{ width: `${value}%`, background: green ? "#326e60" : undefined }} /></div>;
}

export function StudentDashboard() {
  const [section, setSection] = useState<Section>("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState("All courses");
  const [read, setRead] = useState(false);
  const reduced = useReducedMotion();
  const sidebar = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sidebar.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const close = () => { setMenuOpen(false); toggle.current?.focus(); };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key !== "Tab") return;
      const elements = Array.from(sidebar.current?.querySelectorAll<HTMLElement>("a, button") || []).filter(element => element.getClientRects().length);
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const desktop = window.matchMedia("(min-width: 64rem)");
    const resize = () => { if (desktop.matches) close(); };
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", resize);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKey); desktop.removeEventListener("change", resize); };
  }, [menuOpen]);

  function navigate(next: Section) {
    setSection(next); setMenuOpen(false);
    window.history.replaceState(null, "", next === "My Courses" ? myCoursesHref : "/dashboard");
    requestAnimationFrame(() => heading.current?.focus());
  }

  useEffect(() => {
    const syncSection = () => setSection(window.location.hash === "#my-courses" ? "My Courses" : "Dashboard");
    syncSection();
    window.addEventListener("hashchange", syncSection);
    return () => window.removeEventListener("hashchange", syncSection);
  }, []);

  function courseGrid() {
    const visible = courses.filter(course => filter === "All courses" || course.tag === filter);
    return <>
      {section === "My Courses" && <div className="mb-6 flex flex-wrap gap-2" aria-label="Filter courses">{["All courses", "In progress", "Completed", "Not started"].map(item => <button key={item} onClick={() => setFilter(item)} aria-pressed={filter === item} className={`min-h-11 rounded-control border px-4 text-sm font-medium ${filter === item ? "border-primary bg-primary text-white" : "border-border bg-white text-muted hover:bg-surface-muted"}`}>{item}</button>)}</div>}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{(section === "Dashboard" ? courses.slice(0, 3) : visible).map(course => {
        const percent = Math.round(course.done / course.total * 100);
        return <Link key={course.id} href={getDashboardCourseDestination(course.id, course.done)} aria-label={`${course.done > 0 && course.done < course.total ? "Continue" : "View"} ${course.title}`} className="dashboard-panel flex min-w-0 flex-col overflow-hidden">
          <div className="relative aspect-[16/9]"><Image src={course.image} alt={course.imageAlt} fill sizes="(min-width: 1280px) 28vw, (min-width: 640px) 45vw, 90vw" className="object-cover" /><span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold ${percent === 100 ? "bg-[#eaf4ee] text-[#245443]" : "bg-white/95 text-primary"}`}>{course.tag}</span></div>
          <div className="flex flex-1 flex-col p-5"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#326e60]">{course.category}</p><h3 className="mt-2 text-base leading-6">{course.title}</h3><div className="mt-auto pt-5"><div className="mb-2 flex justify-between text-xs text-muted"><span>{course.done} of {course.total} lessons</span><span className="font-semibold text-foreground">{percent}%</span></div><ProgressBar value={percent} label={`${course.title} progress`} green={percent === 100} /><span className="mt-4 flex min-h-11 w-full items-center justify-between rounded-control bg-surface-muted px-3 text-sm font-semibold text-primary hover:bg-blue-100">{percent === 100 ? "Review course" : percent > 0 ? "Continue course" : "Explore course"}<Icon name="arrow" className="size-4" /></span></div></div>
        </Link>;
      })}</div>
    </>;
  }

  function progressPanel() {
    return <section className="dashboard-panel p-6"><div className="flex items-center justify-between gap-4"><h2 className="text-lg">Learning progress</h2><span className="rounded-full bg-[#eaf4ee] px-3 py-1 text-xs font-medium text-[#326e60]">Keep growing</span></div><div className="my-6 flex items-center gap-5"><div className="relative flex size-24 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(#2456a6 ${overall}%, #edf1f7 0)` }}><div className="flex size-20 items-center justify-center rounded-full bg-white text-2xl font-semibold">{overall}%</div></div><div><p className="text-sm font-semibold">Every lesson counts</p><p className="mt-1 text-sm text-muted">{completed} of {total} lessons completed</p></div></div><div className="space-y-5">{courses.map(course => <div key={course.id}><div className="mb-2 flex justify-between gap-3 text-xs"><span className="max-w-[80%] text-muted">{course.title}</span><span className="font-semibold">{Math.round(course.done / course.total * 100)}%</span></div><ProgressBar value={Math.round(course.done / course.total * 100)} label={`${course.title} completion`} green={course.done === course.total} /></div>)}</div></section>;
  }

  return <div className="student-dashboard min-h-svh bg-background text-foreground">
    <a href="#dashboard-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-control focus:bg-primary focus:px-5 focus:py-3 focus:text-white">Skip to dashboard</a>
    {menuOpen && <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" aria-hidden="true" onClick={() => { setMenuOpen(false); toggle.current?.focus(); }} />}
    <aside ref={sidebar} id="student-sidebar" role={menuOpen ? "dialog" : undefined} aria-modal={menuOpen ? true : undefined} aria-label="Student navigation" className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col overflow-y-auto border-r border-border bg-white p-5 transition-transform duration-200 motion-reduce:transition-none lg:w-64 lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full invisible lg:visible"}`}>
      <div className="flex items-center justify-between gap-2"><Brand showLogo /><button onClick={() => { setMenuOpen(false); toggle.current?.focus(); }} aria-label="Close navigation" className="flex size-11 items-center justify-center rounded-control hover:bg-surface-muted lg:hidden"><Icon name="close" /></button></div>
      <p className="mb-4 mt-9 px-4 text-[10px] font-semibold uppercase tracking-[.18em] text-muted">Your learning space</p>
      <nav className="space-y-1" aria-label="Dashboard navigation">{([ ["Dashboard", "grid"], ["My Courses", "book"], ["Progress", "chart"], ["PAP Journal", "journal"], ["Profile", "user"], ["Notifications", "bell"] ] as const).map(([name, icon]) => name === "PAP Journal" ? <Link key={name} href="/blog" className="dashboard-nav"><Icon name={icon} />{name}<span className="ml-auto text-xs" aria-hidden="true">↗</span></Link> : <button key={name} onClick={() => navigate(name)} aria-current={section === name ? "page" : undefined} className="dashboard-nav w-full text-left"><Icon name={icon} />{name}{name === "Notifications" && !read && <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] text-white">3</span>}</button>)}</nav>
      <div className="mt-auto pt-10"><div className="mb-5 rounded-card bg-[#f3f6ef] p-4"><span className="text-xs font-semibold text-[#326e60]">A little progress, every day.</span><p className="mt-2 text-xs leading-5 text-muted">Make your next lesson a small investment in yourself.</p></div><button onClick={() => navigate("Profile")} className="flex w-full items-center gap-3 rounded-control p-2 text-left hover:bg-surface-muted"><span className="flex size-10 items-center justify-center rounded-full bg-[#e9eef9] text-sm font-semibold text-primary">AO</span><span><span className="block text-sm font-semibold">Amara Okafor</span><span className="block text-xs text-muted">Student · View profile</span></span></button><Link href="/login" className="dashboard-nav mt-3 border-t border-border" title="Return to the login screen (UI preview)"><Icon name="logout" />Logout</Link></div>
    </aside>
    <div className="lg:ml-64" inert={menuOpen}>
      <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-3 border-b border-border bg-white/95 px-5 backdrop-blur sm:px-8"><div className="flex items-center gap-3"><button ref={toggle} aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="student-sidebar" onClick={() => setMenuOpen(true)} className="flex size-11 items-center justify-center rounded-control border border-border lg:hidden"><Icon name="menu" /></button><div><p className="text-sm font-semibold">{section}</p><p className="hidden text-xs text-muted sm:block">Your space to learn and grow</p></div></div><div className="flex items-center gap-3"><span className="hidden rounded-full border border-border px-3 py-1 text-[11px] text-muted sm:inline">Demo student</span><button onClick={() => navigate("Notifications")} aria-label={`Notifications${read ? "" : ", 3 unread"}`} className="relative flex size-11 items-center justify-center rounded-full border border-border hover:bg-surface-muted"><Icon name="bell" />{!read && <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-[#d5af68]" />}</button><button onClick={() => navigate("Profile")} aria-label="View your profile" className="flex size-11 items-center justify-center rounded-full bg-[#eaf0fa] text-sm font-semibold text-primary">AO</button></div></header>
      <main id="dashboard-main" tabIndex={-1} className="mx-auto max-w-[90rem] px-5 py-7 sm:px-8 sm:py-9">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-[#326e60]">{section === "Dashboard" ? "YOUR LEARNING JOURNEY" : "PAP SCHOLARS"}</p><h1 id={section === "My Courses" ? "my-courses" : undefined} ref={heading} tabIndex={-1} className="text-2xl sm:text-3xl">{section === "Dashboard" ? "Welcome back, Amara" : section === "Progress" ? "Your learning progress" : section === "Profile" ? "Your profile" : section === "My Courses" ? "My courses" : "Notifications"}</h1><p className="mt-2 text-sm text-muted">{section === "Dashboard" ? "A new day, another opportunity to grow. Pick up where you left off." : section === "My Courses" ? "Your next step is right here. Learn at your own pace." : section === "Progress" ? "See how far you’ve come, one lesson at a time." : section === "Profile" ? "A little about you and your learning journey." : "Updates to keep your learning journey moving."}</p></div>{section === "Dashboard" && <button onClick={() => navigate("My Courses")} className="btn btn-secondary text-primary">My courses<Icon name="arrow" className="size-4" /></button>}</div>
        <motion.div key={section} initial={false} animate={reduced ? undefined : { opacity: [0.6, 1], y: [6, 0] }} transition={{ duration: .2 }}>
          {section === "Dashboard" && <>
            <div className="mb-7 grid gap-4 sm:grid-cols-3">{[{ label: "Enrolled courses", value: courses.length, detail: "2 in progress · 1 completed", icon: "book" as const, color: "bg-blue-50 text-primary" }, { label: "Completed lessons", value: completed, detail: `Out of ${total} lessons in your courses`, icon: "check" as const, color: "bg-[#edf5ef] text-[#326e60]" }, { label: "Overall progress", value: `${overall}%`, detail: "Every step brings you closer", icon: "chart" as const, color: "bg-[#fcf5e7] text-[#927033]" }].map(stat => <div key={stat.label} className="dashboard-panel p-5"><div className="flex items-center justify-between"><span className="text-sm text-muted">{stat.label}</span><span className={`flex size-10 items-center justify-center rounded-control ${stat.color}`}><Icon name={stat.icon} /></span></div><p className="mt-2 text-3xl font-semibold tracking-tight">{stat.value}</p><p className="mt-2 text-xs text-muted">{stat.detail}</p></div>)}</div>
            <section className="mb-8 grid overflow-hidden rounded-card bg-[#173d77] text-white md:grid-cols-[1.4fr_1fr]" aria-label="Continue learning"><div className="p-6 sm:p-8"><span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.14em] text-[#e6c78f]"><span className="size-1.5 rounded-full bg-[#d5af68]" />Continue learning</span><h2 className="mt-4 text-2xl">Financial Intelligence</h2><p className="mt-2 text-sm text-blue-100">Up next: Creating a budget that works</p><div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-blue-100"><span className="inline-flex items-center gap-1.5"><Icon name="clock" className="size-4" />12 min</span><span>Lesson 9 of 12</span><span>67% complete</span></div><Link href={getDashboardCourseDestination(courses[0].id, courses[0].done)} className="btn mt-6 bg-white text-primary hover:bg-blue-50">Continue learning<Icon name="arrow" className="size-4" /></Link></div><div className="relative hidden min-h-64 md:block"><Image src={courses[0].image} alt={courses[0].imageAlt} fill sizes="(min-width: 1024px) 35vw, 45vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-[#173d77] to-transparent" /></div></section>
            <section className="mb-8"><div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-xl">Your recent courses</h2><button onClick={() => { setFilter("All courses"); navigate("My Courses"); }} className="flex min-h-11 items-center gap-2 text-sm font-semibold text-primary">View all<Icon name="arrow" className="size-4" /></button></div>{courseGrid()}</section>
            <div className="grid items-start gap-6 xl:grid-cols-2">{progressPanel()}<section className="dashboard-panel p-6"><h2 className="text-lg">Recent activity</h2><ol className="mt-6 space-y-6">{activities.map(activity => <li key={activity.title} className="flex gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#edf5ef] text-[#326e60]"><Icon name={activity.icon} className="size-4" /></span><div><p className="text-sm font-medium">{activity.title}</p><p className="mt-1 text-xs leading-5 text-muted">{activity.detail}</p><p className="mt-2 text-[11px] text-muted">{activity.time}</p></div></li>)}</ol><div className="mt-7 border-t border-border pt-5"><p className="text-xs text-muted">You’re building momentum. Keep it going.</p></div></section></div>
          </>}
          {section === "My Courses" && courseGrid()}
          {section === "Progress" && <div className="max-w-3xl">{progressPanel()}<div className="dashboard-panel mt-6 flex items-center gap-4 p-6"><span className="flex size-12 items-center justify-center rounded-full bg-[#fcf5e7] text-[#927033]"><Icon name="check" /></span><div><h2 className="text-base">Your first completed course</h2><p className="mt-1 text-sm text-muted">Academic Excellence Tips · 8 of 8 lessons completed</p></div></div></div>}
          {section === "Profile" && <section className="dashboard-panel max-w-2xl p-6 sm:p-8"><div className="flex items-center gap-4"><span className="flex size-20 items-center justify-center rounded-full bg-blue-50 text-2xl font-semibold text-primary">AO</span><div><h2 className="text-xl">Amara Okafor</h2><p className="mt-1 text-sm text-muted">PAP Scholar · Student</p></div></div><dl className="mt-8 grid gap-6 border-t border-border pt-6 sm:grid-cols-2">{[["Full name", "Amara Okafor"], ["Email address", "amara.okafor@example.com"], ["Learning goal", "Build skills for a brighter future"], ["Enrolled courses", "4 courses"]].map(([label, value]) => <div key={label}><dt className="text-xs text-muted">{label}</dt><dd className="mt-2 break-words text-sm font-medium">{value}</dd></div>)}</dl><p className="mt-8 rounded-control bg-surface-muted p-4 text-xs leading-6 text-muted">This demo profile is here to help you explore the student experience. Profile editing will be available in a future update.</p></section>}
          {section === "Notifications" && <section className="dashboard-panel max-w-3xl p-6"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg">Your updates</h2><button onClick={() => setRead(true)} disabled={read} className="btn btn-secondary btn-sm disabled:opacity-50">{read ? "All caught up" : "Mark all as read"}</button></div><div className="space-y-3">{notifications.map(notification => <article key={notification.title} className={`rounded-control border p-4 ${read ? "border-border" : "border-blue-100 bg-blue-50/50"}`}><div className="flex items-center gap-2"><h3 className="text-sm">{notification.title}</h3>{!read && <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />}</div><p className="mt-2 text-sm leading-6 text-muted">{notification.text}</p><p className="mt-3 text-xs text-muted">{notification.time}</p></article>)}</div><p role="status" className="mt-5 text-xs text-muted">{read ? "All notifications marked as read in this preview." : "3 unread notifications"}</p></section>}
        </motion.div>
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5 text-[11px] text-muted"><span>© {new Date().getFullYear()} PAP Scholars</span><span>Demo content · Your learning journey, thoughtfully designed.</span></footer>
      </main>
    </div>
  </div>;
}
