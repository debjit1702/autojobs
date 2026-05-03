"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { NewScanModal } from "@/components/NewScanModal";

interface Tracker {
  id: string;
  name: string;
  _count: { scans: number };
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

function AppShell({ children }: { children: React.ReactNode }) {
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [trackers, setTrackers] = useState<Tracker[]>([]);

  useEffect(() => {
    fetch("/api/trackers")
      .then(r => r.ok ? r.json() : [])
      .then(data => Array.isArray(data) && setTrackers(data))
      .catch(() => {});
  }, []);

  const handleTrackerCreated = (t: Tracker) => setTrackers(prev => [...prev, t]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#09090b]">
      <Sidebar
        onNewScan={() => setScanModalOpen(true)}
        trackers={trackers}
        onTrackerCreated={handleTrackerCreated}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      {scanModalOpen && (
        <NewScanModal onClose={() => setScanModalOpen(false)} />
      )}
    </div>
  );
}
