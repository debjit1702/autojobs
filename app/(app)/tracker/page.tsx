"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ScoreBadge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils";
import { Briefcase, Eye, CheckCircle, XCircle, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Scan {
  id: string;
  companyName: string;
  jobTitle: string;
  status: string;
  atsScoreGenerated: number | null;
  trackerList: string;
  createdAt: string;
}

const COLUMNS = [
  { key: "watchlist",   label: "Watchlist",   icon: <Eye className="w-4 h-4" />,         color: "#52525b" },
  { key: "applied",     label: "Applied",     icon: <Briefcase className="w-4 h-4" />,    color: "#8b5cf6" },
  { key: "interviewing",label: "Interviewing",icon: <Star className="w-4 h-4" />,         color: "#f59e0b" },
  { key: "offer",       label: "Offer",       icon: <CheckCircle className="w-4 h-4" />,  color: "#22c55e" },
  { key: "rejected",    label: "Rejected",    icon: <XCircle className="w-4 h-4" />,      color: "#ef4444" },
];

export default function TrackerPage() {
  const { status } = useSession();
  const router = useRouter();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/scans")
      .then(r => r.json())
      .then(data => setScans(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const moveScan = async (scanId: string, newList: string) => {
    // Optimistic update
    setScans(prev => prev.map(s => s.id === scanId ? { ...s, trackerList: newList } : s));
    await fetch(`/api/scans/${scanId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackerList: newList }),
    });
  };

  const handleDragStart = (e: React.DragEvent, scanId: string) => {
    e.dataTransfer.setData("scanId", scanId);
    setDragging(scanId);
  };

  const handleDrop = (e: React.DragEvent, columnKey: string) => {
    const scanId = e.dataTransfer.getData("scanId");
    if (scanId) moveScan(scanId, columnKey);
    setDragging(null);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  if (loading) return (
    <div className="p-8 grid grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => <div key={i} className="h-64 shimmer rounded-2xl" />)}
    </div>
  );

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Job Tracker</h1>
        <p className="text-sm text-[#71717a] mt-0.5">Drag cards between columns to update your application status.</p>
      </div>

      <div className="grid grid-cols-5 gap-4 min-h-[calc(100vh-200px)]">
        {COLUMNS.map(col => {
          const cards = scans.filter(s => s.trackerList === col.key);
          return (
            <div
              key={col.key}
              onDrop={e => handleDrop(e, col.key)}
              onDragOver={handleDragOver}
              className="flex flex-col rounded-2xl border border-[#1c1c21] bg-[#0a0a0f] overflow-hidden"
            >
              {/* Column header */}
              <div className="px-3 py-3 border-b border-[#1c1c21] flex items-center justify-between">
                <div className="flex items-center gap-2" style={{ color: col.color }}>
                  {col.icon}
                  <span className="text-xs font-semibold text-white">{col.label}</span>
                </div>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#1c1c21] text-[#52525b] font-medium">{cards.length}</span>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {cards.length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-center">
                    <p className="text-xs text-[#3f3f46]">Drop here</p>
                  </div>
                ) : (
                  cards.map(scan => (
                    <div
                      key={scan.id}
                      draggable
                      onDragStart={e => handleDragStart(e, scan.id)}
                      className={`bg-[#0d0d14] border rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all group ${
                        dragging === scan.id
                          ? "opacity-40 border-[#8b5cf6]/50"
                          : "border-[#1c1c21] hover:border-[#27272a] hover:bg-[#141417]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-[#1c1c21] border border-[#27272a] flex items-center justify-center text-xs font-bold text-[#a1a1aa] shrink-0">
                          {scan.companyName[0]?.toUpperCase()}
                        </div>
                        {scan.atsScoreGenerated != null && (
                          <ScoreBadge score={scan.atsScoreGenerated} size="sm" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-white leading-snug mb-0.5">{scan.jobTitle}</p>
                      <p className="text-[11px] text-[#52525b] mb-2">{scan.companyName}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#3f3f46]">{formatRelativeTime(scan.createdAt)}</span>
                        <Link href={`/scan/${scan.id}`}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#52525b] hover:text-[#8b5cf6]">
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      {/* Quick move buttons */}
                      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {COLUMNS.filter(c => c.key !== col.key).map(c => (
                          <button key={c.key}
                            onClick={() => moveScan(scan.id, c.key)}
                            title={`Move to ${c.label}`}
                            className="flex-1 text-[9px] py-0.5 rounded bg-[#1c1c21] text-[#52525b] hover:text-white hover:bg-[#27272a] transition-colors truncate"
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
