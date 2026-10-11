"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

export function Reveal({ children, className = "", hover = false, delay = 0, image = false }: {
  children: ReactNode; className?: string; hover?: boolean; delay?: number; image?: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduced ? undefined : image
        ? { clipPath: ["inset(0 0 7% 0)", "inset(0 0 0% 0)"] }
        : { y: [6, 0], opacity: [0.9, 1] }}
      whileHover={hover && !reduced ? { y: -1 } : undefined}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: image ? 0.65 : 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
