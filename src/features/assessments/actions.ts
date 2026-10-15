"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AssessmentResult, AssessmentState } from "@/features/assessments/types";

export async function submitAssessment(courseId: string, _previous: AssessmentState, formData: FormData): Promise<AssessmentState> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");
  const revision = formData.get("revision");
  if (typeof revision !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(revision)) {
    return { error: "Reload the assessment to get the current questions.", result: null };
  }
  const entries = [...formData.entries()].filter(([name]) => name.startsWith("question-"));
  if (!entries.length || entries.length > 100 || entries.some(([, value]) => typeof value !== "string" || !/^[0-3]$/.test(value))) {
    return { error: "Choose an answer for every question.", result: null };
  }
  const answers = Object.fromEntries(entries.map(([name, value]) => [name.slice(9), Number(value)]));
  const { data, error } = await supabase.rpc("submit_course_assessment", { target_course: courseId, submitted_answers: answers, expected_revision: revision });
  if (error || !data) {
    const message = error?.message.includes("Complete all course lessons")
      ? "Complete all lessons before submitting your assessment."
      : error?.message.includes("being reviewed") ? "This course was updated. Its assessment is being reviewed; your previous scores are safe."
        : error?.message.includes("assessment changed") ? "The assessment has changed. Reload to answer the updated questions."
          : "Unable to save your assessment. Your answers are still here; please try again.";
    return { error: message, result: null };
  }
  revalidatePath("/dashboard");
  revalidatePath(`/learn/${encodeURIComponent(courseId)}/assessment`);
  return { error: "", result: data as AssessmentResult };
}
