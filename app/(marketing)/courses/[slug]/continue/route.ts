import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { enrollmentFields, resumeHref, type Enrollment } from "../../../../../lib/enrollments/server";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  const { data, error } = await supabase.from("enrollments").select(enrollmentFields).eq("user_id", user.id).eq("course_id", slug).maybeSingle();
  if (error) throw new Error("Unable to load your enrolment.");
  const href = data ? await resumeHref(supabase, data as Enrollment) : `/courses/${encodeURIComponent(slug)}`;
  return NextResponse.redirect(new URL(href, request.url));
}
