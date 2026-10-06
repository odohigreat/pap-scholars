import type { Metadata } from "next";
import Link from "next/link";
import { marketingTheme } from "../../../config/marketing-theme";
import { ContactForm } from "../../../components/contact/contact-form";
import "./contact.css";

export const metadata: Metadata = { title: "Contact | PAP Scholars", description: "Get in touch with PAP Scholars about learning, the platform, or collaboration. Explore our demo contact form." };

export default function ContactPage() {
  return <div style={marketingTheme} className="bg-background text-foreground">
    <header className="page-container border-b border-border py-12 sm:py-16"><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">CONTACT PAP SCHOLARS</p><h1 className="mt-5 text-[clamp(2.25rem,5vw,4rem)] leading-[1.1]">A conversation<br />can be a good start.</h1><p className="mt-6 max-w-2xl text-lead">Have a question about learning, an idea to share, or an interest in working with us? We’d like to hear what’s on your mind.</p></header>
    <div className="page-container grid items-start gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-20">
      <section aria-labelledby="form-heading" className="min-w-0"><h2 id="form-heading" className="text-2xl">Leave a message</h2><p className="mb-8 mt-3 text-sm leading-7 text-muted">Use the form below to preview the contact experience. All fields are required.</p><ContactForm /></section>
      <aside aria-labelledby="contact-details" className="min-w-0 border-t border-border pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0"><p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--support-green)]">LET’S CONNECT</p><h2 id="contact-details" className="mt-4 text-2xl">Contact information</h2><p className="mt-4 text-sm leading-7 text-muted">We’re preparing our support channels. These details will be updated when direct contact is available.</p><dl className="mt-7 divide-y divide-border"><div className="py-5"><dt className="text-sm font-semibold">Email</dt><dd className="mt-2 text-sm text-muted">Support email coming soon</dd></div><div className="py-5"><dt className="text-sm font-semibold">Phone</dt><dd className="mt-2 text-sm text-muted">Contact number coming soon</dd></div><div className="py-5"><dt className="text-sm font-semibold">Social channels</dt><dd className="mt-2 text-sm leading-7 text-muted">Instagram · LinkedIn · X<br /><span className="text-xs">Official profiles will be linked here when available.</span></dd></div></dl><div className="mt-7 border-t border-border pt-7"><h3 className="text-base">Looking for your next course?</h3><p className="mt-3 text-sm leading-7 text-muted">Explore practical lessons in academic growth, personal development, and everyday life skills.</p><Link href="/courses" className="mt-3 inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-primary hover:underline">Browse courses <span aria-hidden="true">→</span></Link></div></aside>
    </div>
  </div>;
}
