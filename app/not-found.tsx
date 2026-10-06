import Link from "next/link";
import { Brand } from "../components/layout/brand";
import { marketingTheme } from "../config/marketing-theme";

export default function NotFound() {
  return <div style={marketingTheme} className="min-h-svh bg-background text-foreground"><header className="page-container py-6"><Brand showLogo /></header><main className="page-container py-16 sm:py-24"><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">PAGE NOT FOUND · 404</p><h1 className="mt-5 text-[clamp(2.25rem,5vw,4rem)]">Let’s find your next step.</h1><p className="mt-6 max-w-xl text-lead">This page may have moved, or the link may be incorrect. You can return home or explore the course catalogue.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/" className="btn btn-primary">Back to home</Link><Link href="/courses" className="btn btn-secondary">Browse courses</Link></div></main></div>;
}
