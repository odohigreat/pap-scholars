import type { ReactNode } from "react";
import { LearningProgressProvider } from "../../components/learn/learning-progress";
import "./learning.css";

export default function LearningLayout({ children }: { children: ReactNode }) {
  return <LearningProgressProvider>{children}</LearningProgressProvider>;
}
