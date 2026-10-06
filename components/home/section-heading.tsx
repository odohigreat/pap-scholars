import type { ReactNode } from "react";

export function SectionHeading({ id, eyebrow, title, description, action }: {
  id: string; eyebrow: string; title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col gap-6 sm:mb-12 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h2 id={id}>{title}</h2>
        {description && <p className="mt-5 max-w-xl text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
