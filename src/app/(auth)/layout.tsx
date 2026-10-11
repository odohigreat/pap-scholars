import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell min-h-svh">
      <a href="#auth-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-primary focus:px-5 focus:py-3 focus:text-white">Skip to form</a>
      <div className="auth-layout">
        <main id="auth-content" tabIndex={-1} className="auth-main">{children}</main>
        <aside className="auth-story" aria-label="Learning at PAP Scholars">
          <Image src="/images/home/pap-scholars-hero.webp" alt="Students studying together in a library" fill sizes="(min-width: 1024px) 50vw, 1px" className="object-cover object-center" />
          <div className="auth-story-overlay" />
          <div className="auth-story-copy">
            <h2>Learn with<br />PAP Scholars.</h2>
            <p>Build practical skills for your studies and everyday life. Learn wherever you are, at your own pace.</p>
            <div className="auth-story-note"><span aria-hidden="true" className="auth-note-mark">PAP</span><p>Your courses and learning progress, together in one place.</p></div>
          </div>
        </aside>
      </div>
      <footer className="auth-footer"><span>© {new Date().getFullYear()} PAP Scholars</span><Link href="/contact" className="auth-link inline-flex min-h-11 items-center">Need help?</Link></footer>
    </div>
  );
}
