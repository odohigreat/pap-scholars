import Link from "next/link";
import { getCourseNavigation } from "../../data/course-navigation";

export function StartCourse({ courseId }: { courseId: string }) {
  const navigation = getCourseNavigation(courseId);
  return <div>
    <Link href={navigation.learningUrl} className="btn btn-primary btn-lg w-full">Start Course <span aria-hidden="true">→</span></Link>
    <p className="mt-3 text-xs leading-6 text-muted">Demo course · Explore lessons at your own pace.</p>
  </div>;
}
