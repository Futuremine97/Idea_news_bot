export function Stars({ value, className = "" }: { value: number; className?: string }) {
  const full = Math.round(value);
  return (
    <span className={"text-amber-500 " + className} aria-label={`${value.toFixed(1)} / 5`}>
      {"★".repeat(Math.max(0, Math.min(5, full)))}
      <span className="text-slate-300">{"★".repeat(Math.max(0, 5 - full))}</span>
    </span>
  );
}
