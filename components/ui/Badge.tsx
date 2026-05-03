import { cn } from "@/lib/utils";

interface BadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ScoreBadge({ score, size = "md", className }: BadgeProps) {
  const colorClass =
    score >= 80 ? "score-green" : score >= 70 ? "score-amber" : "score-red";

  const sizes = {
    sm: "text-xs px-2 py-0.5 text-[11px]",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5 font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold border",
        colorClass,
        sizes[size],
        className
      )}
    >
      {score}%
    </span>
  );
}

interface StatusBadgeProps {
  status: "processing" | "ready" | "failed" | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const map: Record<string, { label: string; cls: string }> = {
    processing: { label: "Analysing...", cls: "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30" },
    ready:      { label: "Ready",        cls: "text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/30" },
    failed:     { label: "Failed",       cls: "text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/30" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "text-[#a1a1aa] bg-[#a1a1aa]/10 border-[#a1a1aa]/30" };

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full text-xs font-semibold border px-2 py-0.5", cls, className)}>
      {status === "processing" && (
        <span className="w-1.5 h-1.5 rounded-full bg-current processing-pulse" />
      )}
      {label}
    </span>
  );
}
