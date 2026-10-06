import { demoCourses } from "./course-details";
import type { LearningCourse } from "../types/learning";

// Replace this adapter with real course data later. All lessons are available in the demo.
export const learningCourses: LearningCourse[] = demoCourses.map(course => ({
  id: course.id,
  title: course.title,
  poster: course.image.src,
  modules: course.modules.map((module, moduleIndex) => ({
    id: `module-${moduleIndex + 1}`,
    title: module.title,
    lessons: module.lessons.map((title, lessonIndex) => ({
      id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      title,
      description: `Explore ${title.toLowerCase()} through practical examples. Take a moment to reflect on how these ideas connect to your everyday life, then choose one small action to put into practice.`,
      durationMinutes: 6 + ((moduleIndex + lessonIndex) % 7),
      videoSrc: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    })),
  })),
}));

export function getLearningCourse(courseId: string) {
  return learningCourses.find(course => course.id === courseId);
}

export function lessonHref(courseId: string, lessonId: string) {
  return `/learn/${courseId}/${lessonId}`;
}
