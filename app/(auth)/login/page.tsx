import type { Metadata } from "next";
import { AuthForm } from "../../../components/auth/auth-form";

export const metadata: Metadata = { title: "Log in | PAP Scholars", robots: { index: false, follow: false } };

export default function Page() {
  return <AuthForm mode="login" />;
}
