"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps } from "react";

const AnimatedLink = motion.create(Link);

export function MotionLink(props: ComponentProps<typeof AnimatedLink>) {
  const reduced = useReducedMotion();
  return <AnimatedLink {...props} whileHover={reduced ? undefined : { y: -2 }} whileTap={reduced ? undefined : { scale: 0.98 }} transition={{ duration: 0.18, ease: "easeOut" }} />;
}
