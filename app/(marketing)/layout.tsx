import type { ReactNode } from "react";
import { Navbar } from "../../components/navigation/navbar";
import { Footer } from "../../components/layout/footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-control focus:bg-primary focus:px-5 focus:py-3 focus:text-on-primary">Skip to content</a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
