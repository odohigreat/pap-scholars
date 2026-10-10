import { enrollInCourse } from "../../app/dashboard/actions";
import { enrollmentLabel, type Enrollment } from "../../lib/enrollments/server";

export function StartCourse({ courseId, enrollment }: { courseId: string; enrollment?: Enrollment }) {
  return <form action={enrollInCourse}>
    <input type="hidden" name="courseId" value={courseId} />
    <button className="btn btn-primary btn-lg w-full">{enrollment ? enrollmentLabel(enrollment) : "Enroll in Course"}</button>
    <p className="mt-3 text-xs leading-6 text-muted">Learn at your own pace. Your progress is saved to your account.</p>
  </form>;
}
