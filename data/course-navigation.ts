import { learningCourses, lessonHref } from "./learning-courses";

export const dashboardHref = "/dashboard";
export const myCoursesHref = "/dashboard#my-courses";

// IDs and slugs currently match; keeping both explicit supports future backend IDs.
export const demoCourseNavigation = learningCourses.map(course => {
  const firstLessonId = course.modules[0].lessons[0].id;
  return {
    slug: course.id,
    courseId: course.id,
    firstLessonId,
    courseDetailUrl: `/courses/${course.id}`,
    learningUrl: lessonHref(course.id, firstLessonId),
  };
});

export function getCourseNavigation(courseId: string) {
  const navigation = demoCourseNavigation.find(course => course.courseId === courseId);
  if (!navigation) throw new Error(`Unknown demo course: ${courseId}`);
  return navigation;
}

// Demo dashboard snapshot only. Independent of the player's session-only progress.
export function getDashboardCourseDestination(courseId: string, completedLessons: number) {
  const navigation = getCourseNavigation(courseId);
  const lessons = learningCourses.find(course => course.id === courseId)!.modules.flatMap(module => module.lessons);
  if (completedLessons === 0 || completedLessons >= lessons.length) return navigation.courseDetailUrl;
  return lessonHref(courseId, lessons[completedLessons].id);
}
