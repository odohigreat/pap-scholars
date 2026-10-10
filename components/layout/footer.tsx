import Link from "next/link";
import { marketingTheme } from "../../config/marketing-theme";
import { Brand } from "./brand";

const links = [{ label: "About", href: "/about" }, { label: "Courses", href: "/courses" }, { label: "The PAP Journal", href: "/blog" }, { label: "Contact", href: "/contact" }];

export function Footer() {
  return <footer style={marketingTheme} className="site-footer border-t border-border">
    <div className="page-container">
      <div className="site-footer-top"><div><Brand showLogo /><p className="mt-6 max-w-sm text-base leading-7 text-muted">Purposeful learning for the classroom, and the life beyond it.</p><Link href="/courses" className="mt-5 inline-flex min-h-11 items-center gap-6 text-sm font-semibold text-primary">Find your next course</Link></div><div><p className="mb-4 text-[10px] font-semibold uppercase tracking-[.16em] text-muted">Explore PAP Scholars</p><nav aria-label="Footer navigation">{links.map(({ label, href }) => <Link key={href} href={href} className="inline-flex min-h-11 items-center text-sm hover:text-primary hover:underline">{label}</Link>)}</nav></div></div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-6 text-xs text-muted"><p>© {new Date().getFullYear()} PAP Scholars. All rights reserved.</p><span>Learn. Grow. Lead.</span></div>
    </div>
  </footer>;
}
