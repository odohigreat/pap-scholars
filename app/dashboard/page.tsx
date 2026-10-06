import type { Metadata } from "next";
import { StudentDashboard } from "../../components/dashboard/student-dashboard";
import "./dashboard.css";

export const metadata: Metadata = { title: "Student dashboard | PAP Scholars", robots: { index: false, follow: false } };

export default function DashboardPage() {
  // TEMPORARY DEMO AUTH BYPASS: render without requiring a Supabase session.
  // To re-enable authentication, check the Supabase user on the server here
  // and redirect unauthenticated visitors to /login before rendering.
  // StudentDashboard currently uses demo student data; keep auth UI and
  // lib/supabase in place for the future authenticated implementation.
  return <StudentDashboard />;
}
