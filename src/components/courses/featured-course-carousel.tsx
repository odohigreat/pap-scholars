"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function FeaturedCourseCarousel({ children, count, label = "Featured courses", itemLabel = "course", className = "" }: { children: ReactNode; count: number; label?: string; itemLabel?: string; className?: string }) {
  const trackId = useId();
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const cards = Array.from(element.children) as HTMLElement[];
        const origin = cards[0]?.offsetLeft ?? 0;
        let closest = 0;
        cards.forEach((card, index) => {
          if (Math.abs(card.offsetLeft - origin - element.scrollLeft) < Math.abs((cards[closest]?.offsetLeft ?? origin) - origin - element.scrollLeft)) closest = index;
        });
        setActive(closest);
      });
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    update();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); element.removeEventListener("scroll", update); };
  }, []);
  function goTo(index: number) {
    const element = track.current;
    const cards = element?.children;
    if (!element || !cards?.[index]) return;
    element.scrollTo({
      left: (cards[index] as HTMLElement).offsetLeft - (cards[0] as HTMLElement).offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }
  return <>
    <div ref={track} id={trackId} className={`course-collection home-course-collection ${className}`} role="region" aria-label={label} tabIndex={0}>{children}</div>
    {count > 1 && <div className="course-carousel-controls mt-5 flex justify-end gap-2 sm:hidden">
      <button type="button" aria-label={`Previous ${itemLabel}`} aria-controls={trackId} disabled={active === 0} onClick={() => goTo(active - 1)} className="course-carousel-control"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14 6-6 6 6 6" /></svg></button>
      <button type="button" aria-label={`Next ${itemLabel}`} aria-controls={trackId} disabled={active === count - 1} onClick={() => goTo(active + 1)} className="course-carousel-control course-carousel-control-next"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10 6 6 6-6 6" /></svg></button>
    </div>}
  </>;
}
