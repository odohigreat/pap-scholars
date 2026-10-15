// Decorative geometry keeps the layout independent of future brand photography.
export function LearningArt({ variant = "grid" }: { variant?: "grid" | "orbit" | "steps" }) {
  return (
    <div aria-hidden="true" className="relative flex h-full min-h-44 items-center justify-center overflow-hidden bg-surface-muted">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,var(--surface),transparent_65%)]" />
      {variant === "grid" && <div className="relative grid rotate-[-12deg] grid-cols-3 gap-2">{Array.from({ length: 9 }, (_, i) => <span key={i} className={`size-9 rounded-lg sm:size-11 ${i === 4 ? "bg-accent" : i % 2 ? "bg-primary/20" : "bg-primary"}`} />)}</div>}
      {variant === "orbit" && <div className="relative flex size-36 items-center justify-center rounded-full border border-primary/25"><div className="flex size-24 items-center justify-center rounded-full border border-primary/40"><div className="size-12 rounded-full bg-primary" /></div><span className="absolute right-1 top-4 size-7 rounded-full bg-accent" /></div>}
      {variant === "steps" && <div className="relative flex h-32 items-end gap-3">{["h-12", "h-20", "h-28"].map((height, i) => <span key={height} className={`w-12 rounded-t-xl ${height} ${i === 2 ? "bg-accent" : "bg-primary"}`} />)}</div>}
    </div>
  );
}
