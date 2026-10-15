import { Brand } from "@/components/layout/brand";

export function Footer() {
  return <footer className="site-footer border-t border-border">
    <div className="page-container">
      <div className="site-footer-top">
        <Brand showLogo />
      </div>
      <p className="border-t border-border py-5 text-xs text-muted">© {new Date().getFullYear()} PAP Scholars. All rights reserved.</p>
    </div>
  </footer>;
}
