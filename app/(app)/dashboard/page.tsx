"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ScoreBadge, StatusBadge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils";
import { FileSearch, TrendingUp, Briefcase, Star, Plus, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NewScanModal } from "@/components/NewScanModal";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import Link from "next/link";

interface Stats {
  scanned: number;
  applied: number;
  interviewing: number;
  avgScore: number;
}

interface Scan {
  id: string;
  companyName: string;
  jobTitle: string;
  status: string;
  atsScoreGenerated: number | null;
  createdAt: string;
  trackerList: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanModalOpen, setScanModalOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
    if (status === "authenticated" && !(session?.user as any)?.setupCompleted) {
      router.push("/setup");
    }
  }, [status, session, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, scansRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/scans"),
      ]);
      setStats(await statsRes.json());
      setScans(await scansRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Auto-refresh if any scans are processing
  useEffect(() => {
    const processing = scans.some((s) => s.status === "processing");
    if (!processing) return;
    const timer = setTimeout(fetchData, 5000);
    return () => clearTimeout(timer);
  }, [scans]);

  if (status === "loading" || loading) return <DashboardSkeleton />;

  const statCards = [
    { label: "Jobs Scanned", value: stats?.scanned ?? 0, icon: <FileSearch className="w-5 h-5 text-[#8b5cf6]" />, color: "#8b5cf6" },
    { label: "Applied", value: stats?.applied ?? 0, icon: <Briefcase className="w-5 h-5 text-[#22c55e]" />, color: "#22c55e" },
    { label: "Interviewing", value: stats?.interviewing ?? 0, icon: <Star className="w-5 h-5 text-[#f59e0b]" />, color: "#f59e0b" },
    { label: "Avg ATS Score", value: stats?.avgScore ? `${stats.avgScore}%` : "—", icon: <TrendingUp className="w-5 h-5 text-[#a78bfa]" />, color: "#a78bfa" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-[#71717a] mt-0.5">
            Welcome back, {session?.user?.name?.split(" ")[0]} 👋
          </p>
        </div>
        <Button onClick={() => setScanModalOpen(true)} size="md">
          <Plus className="w-4 h-4" />
          New Scan
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-[#0d0d14] border border-[#1c1c21] rounded-2xl p-5 hover:border-[#27272a] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#52525b] uppercase tracking-wider">{card.label}</span>
              <div className="p-1.5 bg-[#1c1c21] rounded-lg">{card.icon}</div>
            </div>
            <div className="text-3xl font-bold" style={{ color: card.color }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Activity Heatmap */}
      <div className="mb-8">
        <ActivityHeatmap />
      </div>

      {/* Recent Scans */}
      <div className="bg-[#0d0d14] border border-[#1c1c21] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1c1c21] flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Recent Scans</h2>
          <button onClick={fetchData} className="text-[#52525b] hover:text-[#a1a1aa] transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {scans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-[#1c1c21] flex items-center justify-center mb-4">
              <FileSearch className="w-8 h-8 text-[#52525b]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No scans yet</h3>
            <p className="text-sm text-[#52525b] mb-6 max-w-xs">
              Create your first scan to see your ATS score, missing keywords, and a tailored resume.
            </p>
            <Button onClick={() => setScanModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Create First Scan
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[#1c1c21]">
            {scans.map((scan) => (
              <div key={scan.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#141417] transition-colors group">
                {/* Company avatar */}
                <div className="w-10 h-10 rounded-xl bg-[#1c1c21] border border-[#27272a] flex items-center justify-center text-sm font-bold text-[#a1a1aa] flex-shrink-0">
                  {scan.companyName[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white truncate">{scan.jobTitle}</span>
                    <span className="text-sm text-[#52525b]">·</span>
                    <span className="text-sm text-[#71717a] truncate">{scan.companyName}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={scan.status} />
                    <span className="text-xs text-[#3f3f46]">{formatRelativeTime(scan.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {scan.atsScoreGenerated != null && (
                    <ScoreBadge score={scan.atsScoreGenerated} size="sm" />
                  )}
                  {scan.status === "ready" && (
                    <Link
                      href={`/scan/${scan.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[#52525b] hover:text-[#8b5cf6]"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {scanModalOpen && <NewScanModal onClose={() => { setScanModalOpen(false); fetchData(); }} />}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="h-8 w-48 shimmer rounded-lg mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 shimmer rounded-2xl" />
        ))}
      </div>
      <div className="h-64 shimmer rounded-2xl" />
    </div>
  );
}
