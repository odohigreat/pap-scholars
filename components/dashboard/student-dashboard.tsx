"use client";

import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Brand } from "../layout/brand";
import type { DashboardCourse, DashboardNotification, DashboardActivity, AvailableCourse } from "../../lib/dashboard/types";
import { enrollInCourse } from "../../app/dashboard/actions";
const myCoursesHref = "/dashboard#my-courses";


type Section = "Dashboard" | "My Courses" | "Progress" | "Profile" | "Notifications";
type IconName = "grid" | "book" | "chart" | "journal" | "user" | "bell" | "menu" | "close" | "check" | "clock";
const paths: Record<IconName, string> = {
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  book: "M12 5v15 M12 5C8 2 3 4 3 4v15s5-2 9 1c4-3 9-1 9-1V4s-5-2-9 1Z",
  chart: "M4 20h16 M6 16v-5 M12 16V4 M18 16V8",
  journal: "M5 3h14v18H5z M9 8h6 M9 12h6 M9 16h3",
  user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-2a8 8 0 0 1 16 0v2",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4",
  menu: "M4 6h16 M4 12h16 M4 18h16", close: "m6 6 12 12 M18 6 6 18",
  check: "m5 12 4 4L19 6",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 7v5l3 2",
};
function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  return <svg className={`${className} shrink-0`} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}
function ProgressBar({ value, label, green = false }: { value: number; label: string; green?: boolean }) {
  return <div className="dashboard-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{ width: `${value}%`, background: green ? "#326e60" : undefined }} /></div>;
}

export function StudentDashboard({ fullName, email, learningGoal, userId, courses, availableCourses, activities, notifications: initialNotifications }: { fullName: string; email: string; learningGoal: string; userId: string; courses: DashboardCourse[]; availableCourses: AvailableCourse[]; activities: DashboardActivity[]; notifications: DashboardNotification[] }) {
  const completed = courses.reduce((sum, course) => sum + course.done, 0);
  const total = courses.reduce((sum, course) => sum + course.total, 0);
  const overall = courses.length ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length) : 0;
  const continuing = courses.filter(course => course.total > 0).find(course => course.tag === "In progress") ?? courses.find(course => course.total > 0 && course.tag === "Not started");
  const finished = courses.find(course => course.tag === "Completed");
  const [notifications, setNotifications] = useState(initialNotifications);
  const unread = notifications.filter(notification => !notification.read).length;
  const [savingRead, setSavingRead] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  async function markAllRead() {
    setSavingRead(true);
    setNotificationError("");
    try {
      const ids = notifications.filter(notification => !notification.read).map(notification => notification.id);
      const { error } = await createClient().from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", userId).in("id", ids);
      if (error) throw error;
      setNotifications(current => current.map(notification => ({ ...notification, read: true })));
      router.refresh();
    } catch { setNotificationError("Unable to mark notifications as read. Please try again."); }
    finally { setSavingRead(false); }
  }
  const router = useRouter();
  const initials = fullName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "PS";
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  async function logout() {
    setLoggingOut(true);
    setLogoutError("");
    try {
      const { error } = await createClient().auth.signOut();
      if (error) throw error;
      router.replace("/login");
      router.refresh();
    } catch {
      setLogoutError("Unable to log out. Please try again.");
      setLoggingOut(false);
    }
  }
  const [section, setSection] = useState<Section>("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState("All courses");
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
      {section === "My Courses" && <div className="mb-6 flex flex-wrap gap-2" aria-label="Filter courses">{["All courses", "In progress", "Completed", "Not started"].map(item => <button key={item} onClick={() => setFilter(item)} aria-pressed={filter === item} className={`min-h-11 border-b-2 px-3 text-sm font-medium ${filter === item ? "border-primary text-primary" : "border-transparent text-muted hover:text-primary"}`}>{item}</button>)}</div>}
      {(section === "Dashboard" ? courses : visible).length === 0 && <div className="dashboard-panel p-8"><h3 className="mb-3 text-xl">{courses.length ? "Find your next lesson" : "Your learning journey starts here"}</h3><p className="text-sm text-muted">{courses.length ? "No courses match this filter." : "Explore practical courses for your studies and everyday life. Enrol in a course to save your progress and pick up where you left off."}</p>{!courses.length && <Link href="/courses" className="btn btn-primary mt-6">Explore Courses</Link>}</div>}
      <div className="dashboard-course-list" role="region" aria-label="Your enrolled courses" tabIndex={0}>{(section === "Dashboard" ? courses.slice(0, 3) : visible).map(course => {
        const percent = Math.round(course.progress);
        return <Link key={course.id} href={course.href} aria-label={`${course.done > 0 && course.done < course.total ? "Continue" : "View"} ${course.title}`} className="dashboard-course-card">
          <div className="dashboard-course-image relative">{course.image && <Image unoptimized src={course.image} alt={course.imageAlt} fill sizes="(min-width: 1440px) 25vw, (min-width: 1024px) 35vw, (min-width: 640px) 45vw, 90vw" className="object-cover" />}<span className={`absolute left-2 top-2 px-2 py-1 text-[11px] font-semibold ${percent === 100 ? "bg-[#eaf4ee] text-[#245443]" : "bg-white/95 text-primary"}`}>{course.tag}</span></div>
          <div className="dashboard-course-content"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#326e60]">{course.category}</p><h3 className="mt-2 text-base leading-6">{course.title}</h3><p className="mt-3 text-xs text-muted">{course.lastAccessed ? "Last accessed: " : "First lesson: "}{course.lesson}</p><div className="mt-auto pt-5"><div className="mb-2 flex justify-between text-xs text-muted"><span>{course.done} of {course.total} lessons</span><span className="font-semibold text-foreground">{percent}%</span></div><ProgressBar value={percent} label={`${course.title} progress`} green={percent === 100} /><span className="dashboard-course-action">{course.tag === "Completed" ? "Review Course" : "Continue Learning"}</span></div></div>
        </Link>;
      })}</div>
      {availableCourses.length > 0 && <section className="mt-8"><h2 className="mb-5 text-xl">Available courses</h2><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{availableCourses.map(course => <article key={course.id} className="dashboard-panel p-5"><p className="text-xs text-muted">{course.category}</p><h3 className="mt-2 text-base">{course.title}</h3><form action={enrollInCourse} className="mt-5"><input type="hidden" name="courseId" value={course.id} /><button className="btn btn-secondary">Start course</button></form></article>)}</div></section>}
    </>;
  }

  function progressPanel() {
    return <section className="dashboard-panel p-6"><div className="flex items-center justify-between gap-4"><h2 className="text-lg">Learning progress</h2></div><div className="my-6 flex items-center gap-5"><div className="relative flex size-24 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(#2456a6 ${overall}%, #edf1f7 0)` }}><div className="flex size-20 items-center justify-center rounded-full bg-white text-2xl font-semibold">{overall}%</div></div><div><p className="text-sm font-semibold">Every lesson counts</p><p className="mt-1 text-sm text-muted">{completed} of {total} lessons completed</p></div></div><div className="space-y-5">{courses.map(course => <div key={course.id}><div className="mb-2 flex justify-between gap-3 text-xs"><span className="max-w-[80%] text-muted">{course.title}</span><span className="font-semibold">{Math.round(course.progress)}%</span></div><ProgressBar value={Math.round(course.progress)} label={`${course.title} completion`} green={course.done === course.total} /></div>)}</div></section>;
  }

  return <div className="student-dashboard min-h-svh bg-background text-foreground">
    <a href="#dashboard-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-control focus:bg-primary focus:px-5 focus:py-3 focus:text-white">Skip to dashboard</a>
    {menuOpen && <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" aria-hidden="true" onClick={() => { setMenuOpen(false); toggle.current?.focus(); }} />}
    <aside ref={sidebar} id="student-sidebar" role={menuOpen ? "dialog" : undefined} aria-modal={menuOpen ? true : undefined} aria-label="Student navigation" className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col overflow-y-auto border-r border-border bg-white p-5 transition-transform duration-200 motion-reduce:transition-none lg:w-64 lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full invisible lg:visible"}`}>
      <div className="flex items-center justify-between gap-2"><Brand showLogo /><button onClick={() => { setMenuOpen(false); toggle.current?.focus(); }} aria-label="Close navigation" className="flex size-11 items-center justify-center rounded-control hover:bg-surface-muted lg:hidden"><Icon name="close" /></button></div>
      <p className="mb-4 mt-9 px-4 text-[10px] font-semibold uppercase tracking-[.18em] text-muted">Your learning space</p>
      <nav className="space-y-1" aria-label="Dashboard navigation">{([ ["Dashboard", "grid"], ["My Courses", "book"], ["Progress", "chart"], ["PAP Journal", "journal"], ["Profile", "user"], ["Notifications", "bell"] ] as const).map(([name, icon]) => name === "PAP Journal" ? <Link key={name} href="/blog" className="dashboard-nav"><Icon name={icon} />{name}</Link> : <button key={name} onClick={() => navigate(name)} aria-current={section === name ? "page" : undefined} className="dashboard-nav w-full text-left"><Icon name={icon} />{name}{name === "Notifications" && unread > 0 && <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] text-white">{unread}</span>}</button>)}</nav>
      <div className="mt-auto pt-10"><button onClick={() => navigate("Profile")} className="flex w-full items-center gap-3 rounded-control p-2 text-left hover:bg-surface-muted"><span className="flex size-10 items-center justify-center rounded-full bg-[#e9eef9] text-sm font-semibold text-primary">{initials}</span><span><span className="block text-sm font-semibold">{fullName}</span><span className="block text-xs text-muted">Student · View profile</span></span></button><button onClick={logout} disabled={loggingOut} className="dashboard-nav mt-3 w-full border-t border-border">{loggingOut ? "Logging out…" : "Logout"}</button>{logoutError && <p role="alert" className="mt-2 text-sm text-red-700">{logoutError}</p>}</div>
    </aside>
    <div className="lg:ml-64" inert={menuOpen}>
      <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-3 border-b border-border bg-white/95 px-5 backdrop-blur sm:px-8"><div className="flex items-center gap-3"><button ref={toggle} aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="student-sidebar" onClick={() => setMenuOpen(true)} className="flex size-11 items-center justify-center rounded-control border border-border lg:hidden"><Icon name="menu" /></button><div><p className="text-sm font-semibold">{section}</p><p className="hidden text-xs text-muted sm:block">Your space to learn and grow</p></div></div><div className="flex items-center gap-3"><span className="hidden rounded-full border border-border px-3 py-1 text-[11px] text-muted sm:inline">Student</span><button onClick={() => navigate("Notifications")} aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} className="relative flex size-11 items-center justify-center rounded-full border border-border hover:bg-surface-muted"><Icon name="bell" />{unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-[#d5af68]" />}</button><button onClick={() => navigate("Profile")} aria-label="View your profile" className="flex size-11 items-center justify-center rounded-full bg-[#eaf0fa] text-sm font-semibold text-primary">{initials}</button></div></header>
      <main id="dashboard-main" tabIndex={-1} className="mx-auto max-w-[90rem] px-5 py-7 sm:px-8 sm:py-9">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-[#326e60]">{section === "Dashboard" ? "YOUR LEARNING JOURNEY" : "PAP SCHOLARS"}</p><h1 id={section === "My Courses" ? "my-courses" : undefined} ref={heading} tabIndex={-1} className="text-[clamp(1.75rem,3vw,2.5rem)] tracking-tight">{section === "Dashboard" ? `Welcome back, ${fullName.split(" ")[0] || "Scholar"}` : section === "Progress" ? "Your learning progress" : section === "Profile" ? "Your profile" : section === "My Courses" ? "My courses" : "Notifications"}</h1><p className="mt-2 text-sm text-muted">{section === "Dashboard" ? "A new day, another opportunity to grow. Pick up where you left off." : section === "My Courses" ? "Your next step is right here. Learn at your own pace." : section === "Progress" ? "See how far you’ve come, one lesson at a time." : section === "Profile" ? "A little about you and your learning journey." : "Updates to keep your learning journey moving."}</p></div>{section === "Dashboard" && <button onClick={() => navigate("My Courses")} className="btn btn-secondary text-primary">My courses</button>}</div>
        <motion.div key={section} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .2 }}>
          {section === "Dashboard" && <>
            <dl className="dashboard-summary mb-9">{[{ label: "Courses", icon: "book" as const, value: courses.length, detail: `${courses.filter(course => course.tag === "In progress").length} in progress · ${courses.filter(course => course.tag === "Completed").length} completed` }, { label: "Lessons completed", icon: "check" as const, value: completed, detail: `Of ${total} lessons` }, { label: "Overall progress", icon: "chart" as const, value: `${overall}%`, detail: "Across your enrolled courses" }].map(stat => <div key={stat.label}><dt className="text-xs text-muted"><span className="dashboard-stat-icon"><Icon name={stat.icon} /></span><span>{stat.label}</span></dt><dd><span className="mt-2 block text-3xl font-semibold tracking-tight">{stat.value}</span><span className="mt-2 block text-xs text-muted">{stat.detail}</span></dd></div>)}</dl>
            {continuing && <section className="dashboard-continue mb-10 grid overflow-hidden bg-[#18283f] text-white md:grid-cols-[1.4fr_1fr]" aria-label="Continue learning"><div className="p-6 sm:p-8"><span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.14em] text-[#e6c78f]"><span className="size-1.5 rounded-full bg-[#d5af68]" />Continue learning</span><h2 className="mt-4 text-2xl">{continuing.title}</h2><p className="mt-2 text-sm text-blue-100">Resume: {continuing.lesson}</p><div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-blue-100"><span className="inline-flex items-center gap-1.5"><Icon name="clock" className="size-4" />{continuing.duration}</span><span>Lesson {continuing.lessonNumber} of {continuing.total}</span><span>{Math.round(continuing.progress)}% complete</span></div><Link href={continuing.href} className="btn mt-6 bg-white text-primary hover:bg-blue-50">Continue learning</Link></div><div className="relative hidden min-h-64 md:block">{continuing.image && <Image unoptimized src={continuing.image} alt={continuing.imageAlt} fill sizes="(min-width: 1024px) 35vw, 45vw" className="object-cover" />}<div className="absolute inset-0 bg-gradient-to-r from-[#18283f] to-transparent" /></div></section>}
            <section className="mb-8"><div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-xl">Your recent courses</h2><button onClick={() => { setFilter("All courses"); navigate("My Courses"); }} className="flex min-h-11 items-center gap-2 text-sm font-semibold text-primary">View all</button></div>{courseGrid()}</section>
            <div className="grid items-start gap-6 xl:grid-cols-2">{progressPanel()}<section className="dashboard-activity p-6"><h2 className="text-lg">Recent activity</h2>{activities.length === 0 && <p className="mt-6 text-sm text-muted">No learning activity yet.</p>}<ol className="mt-6 space-y-6">{activities.map(activity => <li key={activity.id} className="flex gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#edf5ef] text-[#326e60]"><Icon name={activity.icon} className="size-4" /></span><div><p className="text-sm font-medium">{activity.title}</p><p className="mt-1 text-xs leading-5 text-muted">{activity.detail}</p><p className="mt-2 text-[11px] text-muted">{activity.time}</p></div></li>)}</ol><div className="mt-7 border-t border-border pt-5"><p className="text-xs text-muted">Your completed lessons appear here.</p></div></section></div>
          </>}
          {section === "My Courses" && courseGrid()}
          {section === "Progress" && <div className="max-w-3xl">{progressPanel()}{finished && <div className="dashboard-panel mt-6 flex items-center gap-4 p-6"><span className="flex size-12 items-center justify-center rounded-full bg-[#fcf5e7] text-[#927033]"><Icon name="check" /></span><div><h2 className="text-base">Completed course</h2><p className="mt-1 text-sm text-muted">{finished.title} · {finished.done} of {finished.total} lessons completed</p></div></div>}</div>}
          {section === "Profile" && <section className="dashboard-profile max-w-3xl p-6 sm:p-8"><div className="flex items-center gap-4"><span className="flex size-20 items-center justify-center rounded-full bg-blue-50 text-2xl font-semibold text-primary">{initials}</span><div><h2 className="text-xl">{fullName}</h2><p className="mt-1 text-sm text-muted">PAP Scholar · Student</p></div></div><dl className="mt-8 grid gap-6 border-t border-border pt-6 sm:grid-cols-2">{[["Full name", fullName], ["Email address", email], ["Learning goal", learningGoal || "Not set"], ["Enrolled courses", `${courses.length} courses`]].map(([label, value]) => <div key={label}><dt className="text-xs text-muted">{label}</dt><dd className="mt-2 break-words text-sm font-medium">{value}</dd></div>)}</dl><p className="mt-8 rounded-control bg-surface-muted p-4 text-xs leading-6 text-muted">Your learning progress is saved to your account.</p></section>}
          {section === "Notifications" && <section className="dashboard-notifications max-w-3xl p-6"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg">Your updates</h2><button onClick={markAllRead} disabled={!unread || savingRead} className="btn btn-secondary btn-sm disabled:opacity-50">{savingRead ? "Saving…" : unread ? "Mark all as read" : "All caught up"}</button></div>{notificationError && <p role="alert" className="mb-4 text-sm text-red-700">{notificationError}</p>}{notifications.length === 0 && <p className="text-sm text-muted">No notifications yet.</p>}<div className="space-y-3">{notifications.map(notification => <article key={notification.id} className={`notification-row border-b px-4 py-5 ${notification.read ? "border-border" : "border-blue-100 bg-blue-50/50"}`}><div className="flex items-center gap-2"><h3 className="text-sm">{notification.title}</h3>{!notification.read && <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />}</div><p className="mt-2 text-sm leading-6 text-muted">{notification.text}</p><p className="mt-3 text-xs text-muted">{notification.time}</p></article>)}</div><p role="status" className="mt-5 text-xs text-muted">{unread ? `${unread} unread notifications` : "You’re all caught up."}</p></section>}
        </motion.div>
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5 text-[11px] text-muted"><span>© {new Date().getFullYear()} PAP Scholars</span><span>Your learning journey, thoughtfully designed.</span></footer>
      </main>
    </div>
  </div>;
}
