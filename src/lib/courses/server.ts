import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type CatalogCourse = {
  id: string; title: string; description: string; category: string;
  overview: string; outcomes: string[]; image: string; imageAlt: string;
  duration: string; lessonCount: number; isDemo: boolean; instructor: string;
  modules: { title: string; lessons: string[] }[];
};

export const getPublishedCourses = cache(async (): Promise<CatalogCourse[]> => {
  const supabase = await createClient();
  const [courses, modules, lessons] = await Promise.all([
    supabase.from("courses").select("id,title,description,category,overview,outcomes,image_url,image_alt,duration_minutes,is_demo,instructor_name").eq("is_published", true).order("created_at").order("id"),
    supabase.from("course_modules").select("course_id,id,title,position").order("position"),
    supabase.from("lesson_previews").select("course_id,module_id,title,position").order("position"),
  ]);
  if (courses.error || modules.error || lessons.error) throw new Error("Unable to load the course catalogue.");
  return (courses.data ?? []).map(course => {
    const curriculum = (modules.data ?? []).filter(module => module.course_id === course.id).map(module => ({
      title: module.title,
      lessons: (lessons.data ?? []).filter(lesson => lesson.course_id === course.id && lesson.module_id === module.id).map(lesson => lesson.title as string),
    }));
    return { id: course.id, title: course.title, description: course.description, category: course.category,
      overview: course.overview, outcomes: course.outcomes, image: course.image_url, imageAlt: course.image_alt,
      duration: `${course.duration_minutes} min`, lessonCount: curriculum.reduce((count, module) => count + module.lessons.length, 0),
      isDemo: course.is_demo, instructor: course.instructor_name, modules: curriculum };
  });
});
export async function getPublishedCourse(id: string) {
  return (await getPublishedCourses()).find(course => course.id === id);
}
