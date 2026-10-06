import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoursePlayer } from "../../../../components/learn/course-player";
import { getLearningCourse } from "../../../../data/learning-courses";

type Props = { params: Promise<{ courseId: string; lessonId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseId, lessonId } = await params;
  const course = getLearningCourse(courseId);
  const lesson = course?.modules.flatMap(module => module.lessons).find(item => item.id === lessonId);
  return { title: `${lesson?.title ?? "Learning"} | PAP Scholars`, robots: { index: false, follow: false } };
}

export default async function LessonPage({ params }: Props) {
  const { courseId, lessonId } = await params;
  const course = getLearningCourse(courseId);
  if (!course || !course.modules.some(module => module.lessons.some(lesson => lesson.id === lessonId))) notFound();
  return <CoursePlayer course={course} lessonId={lessonId} />;
}
