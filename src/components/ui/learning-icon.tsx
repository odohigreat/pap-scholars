export type LearningIconName = "book" | "clock" | "growth" | "spark" | "account" | "progress";

export function LearningIcon({ name }: { name: LearningIconName }) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {name === "book" && <path d="M12 5v15M12 5C9 3 5 3 3 4v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-2-1-6-1-9 1Z" />}
      {name === "clock" && <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}
      {name === "growth" && <><path d="M12 21V10m0 4C4 14 3 8 3 5c7 0 9 3 9 9Zm0-3c0-6 3-9 9-9 0 6-3 9-9 9Z" /></>}
      {name === "spark" && <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" /></>}
      {name === "account" && <><circle cx="10" cy="7" r="4" /><path d="M3 21v-2a7 7 0 0 1 12-5m4-2v8m-4-4h8" /></>}
      {name === "progress" && <><path d="M4 20h16M6 16v-4m6 4V8m6 8V4" /><path d="m5 7 5-4" /></>}
    </svg>
  );
}
