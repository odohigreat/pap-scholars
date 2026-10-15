"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

export function AssessmentRefresh() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    const refresh = () => { if (!document.hidden) router.refresh(); };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);
  return <button type="button" className="learning-previous-button" disabled={pending} onClick={() => startTransition(() => router.refresh())}>{pending ? "Checking…" : "Check again"}</button>;
}
