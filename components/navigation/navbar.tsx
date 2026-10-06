"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { marketingLinks } from "../../constants/navigation";
import { Brand } from "../layout/brand";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerWidth, setHeaderWidth] = useState(0);
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const duration = reduceMotion ? 0 : 0.2;
  const isActive = (href: string) => href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const onScroll = () => {
      const offset = window.scrollY;
      // Separate thresholds avoid flicker around the top of the page.
      setScrolled(previous => previous ? offset > 8 : offset > 32);
    };
    const measure = () => setHeaderWidth(header.clientWidth);
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    measure();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onResize = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 h-20" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <motion.div
        initial={false}
        animate={{
          width: headerWidth ? scrolled ? Math.min(headerWidth - 24, 1280) : headerWidth : "100%",
          y: scrolled ? 12 : 0,
          borderRadius: scrolled ? 24 : 0,
          backgroundColor: scrolled || open ? "rgba(255, 255, 255, 0.88)" : "rgba(255, 255, 255, 0.96)",
          borderColor: scrolled ? "rgba(213, 221, 213, 0.65)" : "rgba(213, 221, 213, 0)",
          boxShadow: scrolled ? "0 8px 32px rgba(23, 40, 32, 0.12)" : "0 0px 0px rgba(23, 40, 32, 0)",
        }}
        transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 top-0 mx-auto max-w-full border backdrop-blur-xl"
      >
        <div className="mx-auto flex h-20 w-full max-w-[75rem] items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 xl:gap-6 xl:px-10">
          <Brand showLogo />
          <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
            {marketingLinks.map(({ label, href }) => (
              <motion.div key={href} whileHover={reduceMotion ? undefined : { y: -2 }} transition={{ duration }}>
                <Link href={href} aria-current={isActive(href) ? "page" : undefined} className={`relative flex min-h-11 items-center rounded-control px-3 text-sm font-medium xl:px-4 transition-colors motion-reduce:transition-none hover:bg-surface-muted hover:text-primary ${isActive(href) ? "text-primary" : "text-muted"}`}>
                  {label}
                  {isActive(href) && <span aria-hidden="true" className="absolute bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary" />}
                </Link>
              </motion.div>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <Link href="/login" className="btn btn-ghost">Login</Link>
            <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }} transition={{ duration }}>
              <Link href="/register" className="btn btn-primary">Get Started <span aria-hidden="true">↗</span></Link>
            </motion.div>
          </div>
          <motion.button ref={toggleRef} type="button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation menu" : "Open navigation menu"} onClick={() => setOpen(!open)} whileTap={reduceMotion ? undefined : { scale: 0.95 }} className="flex size-11 items-center justify-center rounded-control border border-border bg-surface text-primary lg:hidden">
            <span aria-hidden="true" className="relative block h-4 w-5">
              <motion.span className="absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-current" animate={{ y: open ? 7 : 0, rotate: open ? 45 : 0 }} transition={{ duration }} />
              <motion.span className="absolute left-0 top-[7px] block h-0.5 w-5 rounded-full bg-current" animate={{ opacity: open ? 0 : 1 }} transition={{ duration }} />
              <motion.span className="absolute bottom-0 left-0 block h-0.5 w-5 rounded-full bg-current" animate={{ y: open ? -7 : 0, rotate: open ? -45 : 0 }} transition={{ duration }} />
            </span>
          </motion.button>
        </div>
        <motion.div id="mobile-navigation" initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} transition={{ duration, ease: "easeInOut" }} inert={!open} aria-hidden={!open} className="max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain rounded-b-[inherit] lg:hidden">
          <div className="page-container pb-6 pt-2">
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
              {marketingLinks.map(({ label, href }) => (
                <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={isActive(href) ? "page" : undefined} className={`flex min-h-12 items-center justify-between rounded-control px-3 text-sm font-medium xl:px-4 transition-colors motion-reduce:transition-none hover:bg-surface-muted ${isActive(href) ? "bg-surface-muted text-primary" : "text-muted"}`}>
                  {label}{isActive(href) && <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />}
                </Link>
              ))}
            </nav>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-5">
              <Link href="/login" onClick={() => setOpen(false)} className="btn btn-secondary">Login</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="btn btn-primary">Get Started <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </header>
  );
}
