export type AssessmentQuestion = { id: string; lessonId?: string; prompt: string; options: string[] };
export type AssessmentReview = AssessmentQuestion & { selectedIndex: number; correctIndex: number; explanation: string };
export type AssessmentResult = {
  id: string; revision?: string; score: number; correct: number; total: number; passed: boolean;
  passMark: number; review: AssessmentReview[]; submittedAt: string;
};
export type CourseAssessment = {
  revision: string; needsReview: boolean; previousResult: AssessmentResult | null;
  questions: AssessmentQuestion[]; passMark: number; latestResult: AssessmentResult | null; bestScore: number | null;
};
export type AssessmentState = { error: string; result: AssessmentResult | null };
