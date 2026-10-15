import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/components/auth-form";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Log in | PAP Scholars", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");
  const { error } = await searchParams;
  return <AuthForm mode="login" initialError={error === "confirmation" ? "This confirmation link is invalid or has expired. Request a new email using the form below." : undefined} />;
}
