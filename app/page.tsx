"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
  Zap, FileText, Target, ArrowRight, CheckCircle, Sparkles, BarChart3,
} from "lucide-react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.setupCompleted) {
        router.push("/dashboard");
      } else {
        router.push("/setup");
      }
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen bg-[#09090b] dot-pattern relative overflow-hidden">
      {/* Purple glow orbs */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#7c3aed]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-[#8b5cf6]/8 blur-[80px] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">autojobs</span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => signIn("google")}
          disabled={status === "loading"}
        >
          Sign in
        </Button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-28 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 text-[#a78bfa] text-sm font-medium mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by Google Gemini 2.5 Flash · Free
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6 animate-fade-in">
          Beat the ATS.{" "}
          <span className="gradient-text">Land the interview.</span>
        </h1>

        <p className="text-lg md:text-xl text-[#a1a1aa] max-w-2xl mb-10 leading-relaxed animate-fade-in">
          Upload your resume + paste any job description. Our AI rewrites your resume to score{" "}
          <strong className="text-white">80+ on ATS</strong> and generates a{" "}
          <strong className="text-white">company-branded cover letter</strong> — in under 3 minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 animate-fade-in">
          <Button
            size="lg"
            onClick={() => signIn("google")}
            disabled={status === "loading"}
            className="text-base"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Get Started Free
          </Button>
          <span className="text-sm text-[#52525b] flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-[#22c55e]" />
            No credit card required
          </span>
        </div>

        {/* Mock UI Preview */}
        <div className="w-full max-w-3xl glass rounded-2xl p-1 glow-purple animate-fade-in">
          <div className="bg-[#0d0d14] rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent" />
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
              <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
              <div className="flex-1 bg-[#1c1c21] rounded-md h-6 mx-4" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "ATS Score", val: "87%", color: "#22c55e" },
                { label: "Keywords Matched", val: "34/38", color: "#8b5cf6" },
                { label: "Score Boost", val: "+24pts", color: "#f59e0b" },
              ].map((item) => (
                <div key={item.label} className="bg-[#141417] rounded-xl p-4 border border-[#27272a]">
                  <div className="text-2xl font-bold mb-1" style={{ color: item.color }}>{item.val}</div>
                  <div className="text-xs text-[#52525b]">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 h-2 bg-[#1c1c21] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#7c3aed] to-[#22c55e] rounded-full" style={{ width: "87%" }} />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to get hired</h2>
          <p className="text-[#a1a1aa] text-lg">One tool. Every step of the application.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Target className="w-6 h-6 text-[#8b5cf6]" />,
              title: "ATS Gap Analysis",
              desc: "Our AI acts as an enterprise ATS system — scanning your resume against the JD and pinpointing every missing keyword with frequency data.",
              badge: "Step 1",
            },
            {
              icon: <FileText className="w-6 h-6 text-[#22c55e]" />,
              title: "AI Resume Rewrite",
              desc: "Gemini 2.5 Flash rewrites your resume targeting the JD. All matched keywords bolded. Projects reframed. Zero fabrication.",
              badge: "Step 2",
            },
            {
              icon: <BarChart3 className="w-6 h-6 text-[#f59e0b]" />,
              title: "Branded Cover Letter",
              desc: "A company-branded cover letter with the exact primary/accent colours from their website. Specific, not generic. Sounds human.",
              badge: "Step 3",
            },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 hover:border-[#8b5cf6]/30 transition-all duration-300 border border-[rgba(255,255,255,0.06)]">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#52525b] mb-4">
                <span className="px-2 py-0.5 bg-[#1c1c21] rounded-full border border-[#27272a]">{f.badge}</span>
              </div>
              <div className="mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-[#71717a] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto glass rounded-2xl p-12 glow-purple">
          <h2 className="text-3xl font-bold mb-4">Ready to land more interviews?</h2>
          <p className="text-[#a1a1aa] mb-8">Join hundreds of job seekers using autojobs to break through the ATS wall.</p>
          <Button size="lg" onClick={() => signIn("google")} className="text-base">
            Start for Free
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-[#3f3f46] text-sm border-t border-[#141417]">
        autojobs © 2026 · Built with Gemini 2.5 Flash
      </footer>
    </div>
  );
}
