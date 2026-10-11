"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MotionLink as Link } from "@/components/animations/motion-link";
import { motion, useInView, useReducedMotion } from "motion/react";
import libraryImage from "@public/images/home/pap-scholars-hero.webp";
import workshopImage from "@public/images/home/pap-scholars-workshop.webp";
import campusImage from "@public/images/home/pap-scholars-campus.webp";

const slides = [
  { image: libraryImage, label: "Discover together", position: "object-[60%_30%] sm:object-[50%_22%] lg:object-[50%_18%]" },
  { image: workshopImage, label: "Put ideas into practice", position: "object-[65%_center] lg:object-center" },
  { image: campusImage, label: "Explore new possibilities", position: "object-[65%_center] lg:object-center" },
] as const;

const heroColors = {
  "--brand-primary": "#2456a6",
  "--brand-primary-hover": "#1b4385",
  "--brand-accent": "#d5af68",
  "--focus": "#ffffff",
} as CSSProperties;

const ROTATION_DELAY = 3000;

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const visible = useInView(heroRef, { amount: 0.15 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [requestedIndex, setRequestedIndex] = useState(0);
  const [ready, setReady] = useState([false, false, false]);
  const [focused, setFocused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const loading = requestedIndex !== activeIndex;
  const rotationEnabled = !focused && reducedMotion === false;
  const rotating = rotationEnabled && visible && pageVisible && !loading && ready[activeIndex];

  useEffect(() => {
    const onVisibilityChange = () => setPageVisible(!document.hidden);
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setTimeout(() => {
      const next = (activeIndex + 1) % slides.length;
      setRequestedIndex(next);
      if (ready[next]) setActiveIndex(next);
    }, ROTATION_DELAY);
    return () => window.clearTimeout(timer);
  }, [rotating, activeIndex, ready]);

  return (
    <section
      ref={heroRef}
      aria-labelledby="hero-heading"
      style={heroColors}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      className="institution-hero relative isolate overflow-hidden bg-[#071b2d] text-on-primary"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-8 -z-20"
        data-hero-parallax
      >
        {slides.map((item, index) => (
          <motion.div
            key={item.label}
            initial={false}
            animate={{
              opacity: activeIndex === index ? 1 : 0,

            }}
            transition={{ duration: reducedMotion ? 0 : 0.9, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={item.image}
              alt=""
              fill
              preload={index === 0}
              loading={index === 0 ? undefined : requestedIndex === index ? "eager" : "lazy"}
              sizes="100vw"
              onLoad={() => {
                setReady(previous => previous[index] ? previous : previous.map((value, i) => i === index || value));
                if (requestedIndex === index) setActiveIndex(index);
              }}
              className={`object-cover ${item.position}`}
            />
          </motion.div>
        ))}
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[#071b2d]/35 lg:bg-[#071b2d]/20" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,18,35,0.45),rgba(5,18,35,0.65))] lg:bg-[linear-gradient(180deg,rgba(5,18,35,0.5),rgba(5,18,35,0.7))]" />

      <div className="page-container flex min-h-[38rem] items-center justify-center py-16 sm:min-h-[42rem] lg:min-h-[44rem]">
        <div
          data-hero-content
          className="relative w-full max-w-[46rem] text-center"
        >
          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <h1 id="hero-heading" className="text-[clamp(2.8rem,5.8vw,5.5rem)] font-semibold leading-[1.02] tracking-[-0.045em]">
              Build the skills.<br />Shape <span className="text-[#e8d1a5]">your future.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-on-primary/90 sm:mt-7 sm:text-lg">
              Turn your curiosity into confidence. Explore new ideas, build practical skills, and shape your next chapter with PAP Scholars.
            </p>
          </motion.div>

          {/* Stable links retain keyboard focus when a slide changes. */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/courses" className="btn btn-primary btn-lg gap-3 shadow-soft">
              Explore courses
            </Link>
            <Link href="/register" className="btn btn-lg border-white/40 text-on-primary hover:bg-on-primary/10">Create your account</Link>
          </div>

        </div>
      </div>
    </section>
  );
}
