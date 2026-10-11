"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue, type MotionStyle } from "motion/react";

const benefits = [
  { title: "Learn at your own pace", text: "Fit short, focused lessons around your studies and everyday commitments." },
  { title: "Build practical skills", text: "Explore ideas you can apply in the classroom, your community, and everyday life." },
  { title: "See your progress", text: "Save completed lessons and return to your learning through your student dashboard." },
];

function Benefit({ benefit, index, progress }: { benefit: (typeof benefits)[number]; index: number; progress: MotionValue<number> }) {
  const reduced = useReducedMotion();
  const ringProgress = useTransform(progress, [index * 2 / 5, (index * 2 + 1) / 5], [0, 1]);
  const lineProgress = useTransform(progress, [(index * 2 + 1) / 5, (index * 2 + 2) / 5], [0, 1]);
  return <div className="learning-benefit">
    {index < benefits.length - 1 && <span aria-hidden="true" className="learning-benefit-connector">
      <motion.span className="learning-benefit-line" style={{ "--line-progress": reduced ? 1 : lineProgress } as MotionStyle} />
    </span>}
    <span aria-hidden="true" className="learning-benefit-number">
      <svg viewBox="0 0 44 44" className="learning-benefit-ring" fill="none">
        <motion.circle cx="22" cy="22" r="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ pathLength: reduced ? 1 : ringProgress }} />
      </svg>
      0{index + 1}
    </span>
    <div><h2 className="text-base font-semibold">{benefit.title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted">{benefit.text}</p></div>
  </div>;
}

export function LearningBenefits() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start 85%", "end 45%"] });
  return <section ref={sectionRef} aria-label="The PAP Scholars learning experience" className="learning-benefits">
    <div className="page-container learning-benefits-grid">{benefits.map((benefit, index) =>
      <Benefit key={benefit.title} benefit={benefit} index={index} progress={scrollYProgress} />
    )}</div>
  </section>;
}
