"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { marketingLinks } from "@/config/navigation";
import { Brand } from "@/components/layout/brand";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    const supabase = createClient();
    let active = true;
    let authChanged = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      authChanged = true;
      if (active) setSignedIn(Boolean(session?.user));
    });
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (active && !authChanged) setSignedIn(Boolean(user));
    }).catch(() => { if (active && !authChanged) setSignedIn(false); });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(previous => previous ? window.scrollY > 8 : window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpenPath(null); toggleRef.current?.focus(); }
    };
    const onPointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpenPath(null);
    };
    const desktop = window.matchMedia("(min-width: 64rem)");
    const resize = () => { if (desktop.matches) setOpenPath(null); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    desktop.addEventListener("change", resize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      desktop.removeEventListener("change", resize);
    };
  }, [open]);
  const active = (href: string) => href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return <header ref={headerRef} className={`institution-header sticky top-0 z-50 h-20 xl:h-24 ${scrolled ? "is-floating" : ""}`} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpenPath(null);
  }}>
    <div className="institution-header-frame">
      <div className="page-container flex min-h-20 items-center justify-between gap-4 xl:min-h-24">
        <Brand showLogo />
        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {marketingLinks.map(({ label, href }) => <Link key={href} href={href} aria-current={active(href) ? "page" : undefined} className="institution-nav-link">{label}</Link>)}
        </nav>
        <div className="hidden min-h-11 items-center gap-3 lg:flex">{signedIn === null ? null : signedIn ? <Link href="/dashboard" className="btn btn-primary">My dashboard</Link> : <><Link href="/login" className="btn btn-ghost">Log in</Link><Link href="/register" className="btn btn-primary">Start learning</Link></>}</div>
        <button ref={toggleRef} type="button" onClick={() => setOpenPath(open ? null : pathname)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"} className="flex size-11 items-center justify-center rounded-control border border-border text-primary lg:hidden">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}</svg>
        </button>
      </div>
      <div id="mobile-navigation" hidden={!open} className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-border bg-white lg:hidden">
        <div className="page-container py-5"><nav aria-label="Mobile navigation" className="flex flex-col">
          {marketingLinks.map(({ label, href }) => <Link key={href} href={href} aria-current={active(href) ? "page" : undefined} onClick={() => setOpenPath(null)} className="institution-nav-link min-h-12">{label}</Link>)}
        </nav><div className="mt-5 flex flex-wrap gap-3">{signedIn === null ? null : signedIn ? <Link href="/dashboard" onClick={() => setOpenPath(null)} className="btn btn-primary">My dashboard</Link> : <><Link href="/login" onClick={() => setOpenPath(null)} className="btn btn-secondary">Log in</Link><Link href="/register" onClick={() => setOpenPath(null)} className="btn btn-primary">Start learning</Link></>}</div></div>
      </div>
    </div>
  </header>;
}
