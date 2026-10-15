"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const ProgressContext = createContext<{
  completed: Record<string, string[]>;
  completeLesson: (courseId: string, lessonId: string) => void;
} | null>(null);

// Lives only for this learning session. No storage or backend writes.
export function LearningProgressProvider({ children }: { children: ReactNode }) {
  const [completed, setCompleted] = useState<Record<string, string[]>>({});
  function completeLesson(courseId: string, lessonId: string) {
    setCompleted(current => {
      const lessons = current[courseId] ?? [];
      return lessons.includes(lessonId) ? current : { ...current, [courseId]: [...lessons, lessonId] };
    });
  }
  return <ProgressContext.Provider value={{ completed, completeLesson }}>{children}</ProgressContext.Provider>;
}

export function useLearningProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error("Learning progress requires LearningProgressProvider");
  return value;
}
