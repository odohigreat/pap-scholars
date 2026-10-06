import Link from "next/link";
import { marketingTheme } from "../../config/marketing-theme";
import { Brand } from "./brand";

const links = [
  { label: "About", href: "/about" },
  { label: "Courses", href: "/courses" },
  { label: "The PAP Journal", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer style={marketingTheme} className="border-t border-border bg-background">
      <div className="page-container py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-sm"><Brand showLogo /><p className="mt-3 text-sm text-muted">Purposeful learning. Practical skills. A brighter next chapter.</p></div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-1">{links.map(({ label, href }) => <Link key={href} href={href} className="inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-muted transition-colors hover:text-primary motion-reduce:transition-none">{label}</Link>)}</nav>
        </div>
        <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">© {new Date().getFullYear()} PAP Scholars. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs text-muted">Social channels coming soon</p>
            <div role="group" aria-label="Social media placeholders" className="flex gap-2">
              {[
                { name: "Instagram", mark: <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" /></svg> },
                { name: "LinkedIn", mark: <span aria-hidden="true" className="text-sm font-bold">in</span> },
                { name: "X", mark: <span aria-hidden="true" className="text-sm">𝕏</span> },
              ].map(({ name, mark }) => <button key={name} type="button" disabled aria-label={`${name} — coming soon`} title={`${name} — coming soon`} className="flex size-11 items-center justify-center rounded-full border border-border bg-surface text-muted">{mark}</button>)}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
