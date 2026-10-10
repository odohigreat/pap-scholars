export type DashboardCourse = {
  id: string; title: string; category: string; image: string; imageAlt: string;
  progress: number; lastAccessed: boolean; done: number; total: number; lesson: string; lessonNumber: number; duration: string; href: string;
  tag: "Not started" | "In progress" | "Completed";
};
export type DashboardNotification = { id: string; title: string; text: string; time: string; read: boolean };
export type DashboardActivity = { id: string; title: string; detail: string; time: string; icon: "check" | "book" };

export type AvailableCourse = { id: string; title: string; category: string };
