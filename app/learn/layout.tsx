import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import type { ReactNode } from "react";
import "./learning.css";

export default async function LearningLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  return <>{children}</>;
}
