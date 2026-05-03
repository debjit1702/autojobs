"use client";

import { useEffect, useState } from "react";

interface DayData {
  date: string;
  count: number;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getCellColor(count: number): string {
  if (count === 0) return "bg-[#1c1c21]";
  if (count === 1) return "bg-[#4c1d95]";
  if (count === 2) return "bg-[#6d28d9]";
  if (count === 3) return "bg-[#7c3aed]";
  return "bg-[#8b5cf6]";
}

export function ActivityHeatmap() {
  const [days, setDays] = useState<DayData[]>([]);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/heatmap")
      .then(r => r.json())
      .then(data => Array.isArray(data) && setDays(data));
  }, []);

  if (days.length === 0) {
    return <div className="h-24 shimmer rounded-xl" />;
  }

  // Pad front so week starts on Sunday
  const firstDay = new Date(days[0].date).getDay(); // 0=Sun
  const padded: (DayData | null)[] = [...Array(firstDay).fill(null), ...days];

  // Group into weeks (columns of 7)
  const weeks: (DayData | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  // Month labels: find week where month changes
  const monthLabels: { weekIdx: number; label: string }[] = [];
  weeks.forEach((week, wi) => {
    const first = week.find(d => d !== null);
    if (!first) return;
    const m = new Date(first.date).getMonth();
    if (wi === 0 || m !== new Date(weeks[wi - 1].find(d => d !== null)?.date ?? "").getMonth()) {
      monthLabels.push({ weekIdx: wi, label: MONTHS[m] });
    }
  });

  const totalScans = days.reduce((s, d) => s + d.count, 0);
  const activeDays = days.filter(d => d.count > 0).length;

  return (
    <div className="bg-[#0d0d14] border border-[#1c1c21] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">Activity</h2>
        <div className="flex items-center gap-4 text-xs text-[#52525b]">
          <span><span className="text-[#a1a1aa] font-medium">{totalScans}</span> scans in last 12 weeks</span>
          <span><span className="text-[#a1a1aa] font-medium">{activeDays}</span> active days</span>
        </div>
      </div>

      {/* Month labels */}
      <div className="flex mb-1 ml-7">
        {weeks.map((_, wi) => {
          const label = monthLabels.find(m => m.weekIdx === wi);
          return (
            <div key={wi} className="w-[13px] mr-[2px] text-[9px] text-[#3f3f46] shrink-0">
              {label ? label.label : ""}
            </div>
          );
        })}
      </div>

      <div className="flex">
        {/* Day labels */}
        <div className="flex flex-col mr-1.5 gap-[2px]">
          {DAYS.map((d, i) => (
            <div key={d} className="h-[13px] text-[9px] text-[#3f3f46] flex items-center">
              {i % 2 !== 0 ? d.slice(0, 1) : ""}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[2px] relative">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`w-[13px] h-[13px] rounded-sm cursor-default transition-all ${
                    day ? getCellColor(day.count) : "bg-transparent"
                  } ${day?.count ? "hover:ring-1 hover:ring-[#8b5cf6]/60" : ""}`}
                  onMouseEnter={e => {
                    if (!day) return;
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    const label = day.count === 0
                      ? `No scans on ${day.date}`
                      : `${day.count} scan${day.count > 1 ? "s" : ""} on ${day.date}`;
                    setTooltip({ text: label, x: rect.left + rect.width / 2, y: rect.top - 8 });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[10px] text-[#3f3f46]">Less</span>
        {["bg-[#1c1c21]", "bg-[#4c1d95]", "bg-[#6d28d9]", "bg-[#7c3aed]", "bg-[#8b5cf6]"].map(c => (
          <div key={c} className={`w-[10px] h-[10px] rounded-sm ${c}`} />
        ))}
        <span className="text-[10px] text-[#3f3f46]">More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1 rounded-lg bg-[#1c1c21] border border-[#27272a] text-xs text-white pointer-events-none shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
