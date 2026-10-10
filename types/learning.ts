export interface LearningLesson {
  id: string;
  title: string;
  description: string;
  content?: string;
  durationMinutes: number;
  videoSrc: string;
}

export interface LearningModule {
  id: string;
  title: string;
  lessons: LearningLesson[];
}

export interface LearningCourse {
  id: string;
  title: string;
  poster: string;
  modules: LearningModule[];
}
