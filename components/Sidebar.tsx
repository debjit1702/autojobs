"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, Plus, HelpCircle, MessageSquare,
  LogOut, Zap, Folder, Kanban, User, X, Check, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface Tracker {
  id: string;
  name: string;
  _count: { scans: number };
}

interface SidebarProps {
  trackers?: Tracker[];
  onNewScan?: () => void;
  onTrackerCreated?: (t: Tracker) => void;
}

export function Sidebar({ trackers = [], onNewScan, onTrackerCreated }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [addingTracker, setAddingTracker] = useState(false);
  const [newTrackerName, setNewTrackerName] = useState("");
  const [saving, setSaving] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard",   icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: "/tracker",   label: "Job Tracker", icon: <Kanban className="w-4 h-4" /> },
    { href: "/profile",   label: "Profile",     icon: <User className="w-4 h-4" /> },
  ];

  const createTracker = async () => {
    if (!newTrackerName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/trackers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTrackerName.trim() }),
      });
      if (res.ok) {
        const tracker = await res.json();
        onTrackerCreated?.(tracker);
        setNewTrackerName("");
        setAddingTracker(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col flex-1 overflow-y-auto px-3 py-3 gap-1">
      {/* Nav links */}
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClose}
          className={cn("sidebar-link", pathname?.startsWith(link.href) && "active")}
        >
          {link.icon}
          {link.label}
        </Link>
      ))}

      {/* New Scan CTA */}
      <button
        onClick={() => { onNewScan?.(); onClose?.(); }}
        className="sidebar-link mt-1 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#a78bfa] hover:bg-[#8b5cf6]/20 hover:text-[#c4b5fd] w-full"
      >
        <Plus className="w-4 h-4" />
        New Scan
      </button>

      {/* Job Trackers */}
      <div className="mt-4">
        <div className="flex items-center justify-between px-2 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#3f3f46]">Trackers</span>
          <button
            onClick={() => setAddingTracker(v => !v)}
            className="text-[#52525b] hover:text-[#a1a1aa] transition-colors"
            title="New tracker"
          >
            {addingTracker ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>

        {addingTracker && (
          <div className="flex items-center gap-1 px-1 mb-1">
            <input
              autoFocus
              className="flex-1 bg-[#1c1c21] border border-[#27272a] rounded-lg px-2 py-1 text-xs text-white placeholder-[#52525b] outline-none focus:border-[#8b5cf6]"
              placeholder="Tracker name…"
              value={newTrackerName}
              onChange={e => setNewTrackerName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createTracker()}
            />
            <button
              onClick={createTracker}
              disabled={saving || !newTrackerName.trim()}
              className="p-1 rounded-lg bg-[#8b5cf6] text-white hover:bg-[#7c3aed] disabled:opacity-40 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {trackers.length === 0 ? (
          <div className="px-2 py-2 text-xs text-[#3f3f46]">No trackers yet</div>
        ) : (
          trackers.map((t) => (
            <Link
              key={t.id}
              href="/tracker"
              onClick={onClose}
              className={cn("sidebar-link w-full", pathname === "/tracker" && "active")}
            >
              <Folder className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate flex-1">{t.name}</span>
              <span className="text-[10px] text-[#3f3f46] shrink-0">{t._count.scans}</span>
            </Link>
          ))
        )}
      </div>

      {/* Plan badge */}
      <div className="mt-4 mx-1 p-3 bg-[#1c1c21] rounded-xl border border-[#27272a]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#a1a1aa]">Free Plan</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8b5cf6]/20 text-[#a78bfa] font-semibold">FREE</span>
        </div>
        <div className="text-xs text-[#52525b] mb-2">Unlimited scans on free tier</div>
        <div className="h-1.5 bg-[#27272a] rounded-full">
          <div className="h-full bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] rounded-full" style={{ width: "20%" }} />
        </div>
      </div>

      <div className="flex-1" />

      {/* Bottom links */}
      <div className="border-t border-[#1c1c21] pt-2 mt-2 space-y-1">
        <a href="https://github.com" target="_blank" rel="noreferrer" className="sidebar-link w-full">
          <HelpCircle className="w-4 h-4" />
          Help Center
        </a>
        <button className="sidebar-link w-full">
          <MessageSquare className="w-4 h-4" />
          Feedback
        </button>
      </div>

      {/* User */}
      {session?.user && (
        <div className="border-t border-[#1c1c21] pt-3 mt-1">
          <div className="flex items-center gap-2.5 px-2">
            {session.user.image ? (
              <Image src={session.user.image} alt={session.user.name ?? "User"} width={32} height={32} className="rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white text-sm font-semibold">
                {session.user.name?.[0] ?? "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-[#fafafa] truncate">{session.user.name}</div>
              <div className="text-[10px] text-[#52525b] truncate">{session.user.email}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-[#52525b] hover:text-[#ef4444] transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar (md+) ───────────────────────────── */}
      <aside className="hidden md:flex w-64 flex-shrink-0 h-screen sticky top-0 flex-col bg-[#0d0d14] border-r border-[#1c1c21]">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-[#1c1c21]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center flex-shrink-0">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">autojobs</span>
          </div>
        </div>
        <SidebarContent />
      </aside>

      {/* ── Mobile top bar (< md) ───────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0d0d14] border-b border-[#1c1c21]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">autojobs</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-[#a1a1aa] hover:bg-[#1c1c21] hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ── Mobile drawer overlay ───────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative w-72 max-w-[85vw] h-full flex flex-col bg-[#0d0d14] border-r border-[#1c1c21] shadow-2xl animate-fade-in">
            <div className="px-4 py-5 border-b border-[#1c1c21] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-base font-bold text-white tracking-tight">autojobs</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-[#52525b] hover:text-white hover:bg-[#1c1c21] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
