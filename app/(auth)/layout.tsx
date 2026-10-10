import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Brand } from "../../components/layout/brand";
import "./auth.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell min-h-svh bg-background">
      <a href="#auth-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-primary focus:px-5 focus:py-3 focus:text-white">Skip to form</a>
      <div className="mx-auto grid min-h-svh max-w-[100rem] lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="auth-story relative hidden overflow-hidden bg-[#102c57] lg:flex lg:flex-col" aria-label="Learning at PAP Scholars">
          <Image src="/images/home/pap-scholars-campus.webp" alt="" fill sizes="50vw" className="object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#102c57]/50 via-[#102c57]/30 to-[#102c57]" />
          <div className="relative flex flex-1 flex-col justify-between p-10 xl:p-14">
            <span className="inline-flex w-fit items-center gap-2 text-xs font-medium tracking-wide text-white"><span className="size-2 rounded-full bg-[#d5af68]" /> A brighter future starts here</span>
            <div className="py-16">
              <span className="mb-6 block text-xs font-semibold tracking-[0.22em] text-[#d5af68] uppercase">Learn. Grow. Lead.</span>
              <h2 className="editorial-title max-w-lg text-[clamp(2.5rem,4vw,4rem)] leading-[1.12] text-white">Your potential.<br />A world of<br /><span className="text-[#d5af68]">possibilities.</span></h2>
              <p className="mt-6 max-w-sm text-base leading-7 text-blue-100/85">Build knowledge, discover your strengths, and take your next step with PAP Scholars.</p>
            </div>
            <div className="border-t border-white/20 pt-7">
              <div className="mb-3 flex items-center gap-3 text-sm font-semibold text-white">Small steps. Meaningful growth.</div>
              <p className="text-sm text-blue-100/70">Education for the person you’re becoming.</p>
            </div>
          </div>
        </aside>
        <div className="flex min-w-0 flex-col px-6 sm:px-10 lg:px-12">
          <header className="flex flex-wrap items-center justify-between gap-3 py-6 sm:py-8"><Brand showLogo /><Link href="/" className="auth-link inline-flex min-h-11 items-center gap-2 text-sm"> Back to home</Link></header>
          <main id="auth-content" tabIndex={-1} className="flex flex-1 items-center justify-center py-8 sm:py-12">{children}</main>
          <footer className="flex flex-wrap justify-between gap-2 border-t border-border py-6 text-xs text-muted"><span>© {new Date().getFullYear()} PAP Scholars</span><span>Learn with purpose. Grow with confidence.</span></footer>
        </div>
      </div>
    </div>
  );
}
