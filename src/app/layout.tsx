import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import "@/app/(auth)/auth.css";
import "@/app/(marketing)/contact/contact.css";

export const metadata: Metadata = {
  title: "PAP Scholars | Learn. Grow. Lead.",
  description: "Purposeful learning for academic growth, practical life skills, and a brighter future.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
