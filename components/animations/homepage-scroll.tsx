"use client";

import { useEffect } from "react";

// No wrapper: scroll effects never change the homepage's document flow.
export function HomepageScroll() {
  useEffect(() => {
    let disposed = false;
    let initializing = false;
    let cleanup: (() => void) | undefined;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");

    async function setup() {
      if (preference.matches || initializing) return;
      initializing = true;
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"), import("gsap/ScrollTrigger"),
      ]);
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      media.add({
        motion: "(prefers-reduced-motion: no-preference)",
        desktop: "(min-width: 768px)",
      }, context => {
        if (!context.conditions?.motion) return;
        const desktop = context.conditions.desktop;
        const hero = document.querySelector('[aria-labelledby="hero-heading"]');
        const image = hero?.querySelector("[data-hero-parallax]");
        const content = hero?.querySelector("[data-hero-content]");
        if (hero && image && content) {
          gsap.timeline({
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 },
          })
            .fromTo(image, { y: 0, scale: 1 }, { y: desktop ? 12 : 0, scale: 1, ease: "none" }, 0)
            .to(content, { y: 0, ease: "none" }, 0);
        }

        // The existing connecting lines gradually settle into view as each stage is reached.
        document.querySelectorAll<HTMLElement>("[data-journey-line]").forEach(line => {
          gsap.fromTo(line, { scaleY: 0.15, transformOrigin: "top" }, {
            scaleY: 1, ease: "none",
            scrollTrigger: { trigger: line.parentElement, start: "top 80%", end: "bottom 55%", scrub: 0.4 },
          });
        });
      });
      cleanup = () => media.revert();
    }

    void setup();
    // A preference switched from reduced to full motion can initialize lazily.
    const onPreference = () => { if (!preference.matches && !cleanup) void setup(); };
    preference.addEventListener("change", onPreference);
    return () => {
      disposed = true;
      preference.removeEventListener("change", onPreference);
      cleanup?.();
    };
  }, []);
  return null;
}
