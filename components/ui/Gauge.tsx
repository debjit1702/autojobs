interface GaugeProps {
  score: number;
  size?: number;
}

export function ScoreGauge({ score, size = 160 }: GaugeProps) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 80 ? "#22c55e" : score >= 70 ? "#f59e0b" : "#ef4444";
  const verdict =
    score >= 80
      ? "Excellent ATS match!"
      : score >= 70
      ? "Almost there, a few more keywords needed"
      : "Significant gaps detected";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 120 120" className="-rotate-90">
          {/* Track */}
          <circle
            cx="60" cy="60" r={r}
            fill="none"
            stroke="#27272a"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="60" cy="60" r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-out, stroke 0.5s ease" }}
          />
        </svg>
        {/* Score label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-[#a1a1aa] font-medium">ATS Score</span>
        </div>
      </div>
      <p className="text-sm text-[#a1a1aa] text-center max-w-[200px]">{verdict}</p>
    </div>
  );
}
