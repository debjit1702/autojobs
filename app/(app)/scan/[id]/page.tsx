"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ScoreGauge } from "@/components/ui/Gauge";
import { ScoreBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft, Trash2, AlertCircle, CheckCircle, MinusCircle,
  TrendingUp, Tag, FileText, Mail, Download, Copy, Sparkles, Loader2
} from "lucide-react";
import Link from "next/link";

interface MissingKeyword {
  keyword: string;
  frequency_in_jd: number;
  priority: "mandatory" | "preferred";
}

interface ScanResult {
  missingKeywords: MissingKeyword[];
  matchedKeywords: string[];
  strategy: string;
  verdict: string;
}

interface Scan {
  id: string;
  companyName: string;
  jobTitle: string;
  jdText: string;
  status: string;
  atsScoreGenerated: number | null;
  createdAt: string;
  result: ScanResult | null;
}

export default function ScanPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { status } = useSession();
  const router = useRouter();
  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"report" | "resume" | "cover">("report");
  const [deleting, setDeleting] = useState(false);
  const [resume, setResume] = useState<any | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [coverLoading, setCoverLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  const fetchScan = async () => {
    const res = await fetch(`/api/scans/${id}`);
    if (!res.ok) { router.push("/dashboard"); return; }
    setScan(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchScan(); }, [id]);

  // Poll if still processing
  useEffect(() => {
    if (scan?.status !== "processing") return;
    const timer = setTimeout(fetchScan, 4000);
    return () => clearTimeout(timer);
  }, [scan]);

  // Lazy-load resume when tab selected
  const handleTabChange = useCallback(async (tab: "report" | "resume" | "cover") => {
    setActiveTab(tab);
    if (tab === "resume" && !resume && scan?.status === "ready") {
      setResumeLoading(true);
      try {
        const res = await fetch(`/api/scans/${id}/resume`);
        const data = await res.json();
        setResume(data.resume);
      } catch {}
      finally { setResumeLoading(false); }
    }
    if (tab === "cover" && !coverLetter && scan?.status === "ready") {
      setCoverLoading(true);
      try {
        const res = await fetch(`/api/scans/${id}/cover`);
        const data = await res.json();
        setCoverLetter(data.coverLetter);
      } catch {}
      finally { setCoverLoading(false); }
    }
  }, [id, resume, coverLetter, scan?.status]);

  const generateResume = async () => {
    setResumeLoading(true);
    try {
      const res = await fetch(`/api/scans/${id}/resume`, { method: "POST" });
      const data = await res.json();
      setResume(data.resume);
    } catch {}
    finally { setResumeLoading(false); }
  };

  const generateCover = async () => {
    setCoverLoading(true);
    try {
      const res = await fetch(`/api/scans/${id}/cover`, { method: "POST" });
      const data = await res.json();
      setCoverLetter(typeof data.coverLetter === "string" ? data.coverLetter : data.coverLetter?.body);
    } catch {}
    finally { setCoverLoading(false); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this scan?")) return;
    setDeleting(true);
    await fetch(`/api/scans/${id}`, { method: "DELETE" });
    router.push("/dashboard");
  };

  if (loading) return <ScanSkeleton />;
  if (!scan) return null;

  const score = scan.atsScoreGenerated ?? 0;
  const mandatory = scan.result?.missingKeywords.filter((k) => k.priority === "mandatory") ?? [];
  const preferred = scan.result?.missingKeywords.filter((k) => k.priority === "preferred") ?? [];
  const matched = scan.result?.matchedKeywords ?? [];

  // Highlight JD text with matched/missing keywords
  const highlightedJD = (() => {
    if (!scan.result) return scan.jdText;
    let text = scan.jdText;
    const missing = (scan.result.missingKeywords ?? []).map((k) => k.keyword);
    const matchedSet = matched;
    const allKeywords = [...missing, ...matchedSet].sort((a, b) => b.length - a.length);
    allKeywords.forEach((kw) => {
      const isMissing = missing.includes(kw);
      const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
      text = text.replace(
        regex,
        `<mark class="${isMissing ? "kw-missing" : "kw-matched"}" data-kw="${kw}">$&</mark>`
      );
    });
    return text;
  })();

  return (
    <div className="flex flex-col h-screen">
      {/* Top action bar */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 bg-[#0d0d14] border-b border-[#1c1c21] sticky top-0 z-20">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/dashboard" className="text-[#52525b] hover:text-[#a1a1aa] transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <span className="text-sm font-semibold text-white truncate max-w-[100px] sm:max-w-none">{scan.jobTitle}</span>
              <span className="text-xs text-[#52525b] hidden sm:inline">·</span>
              <span className="text-xs sm:text-sm text-[#71717a] truncate max-w-[80px] sm:max-w-none">{scan.companyName}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {score > 0 && <ScoreBadge score={score} size="sm" />}
          <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1c1c21] bg-[#0d0d14] px-2 sm:px-6 overflow-x-auto">
        {[
          { key: "report", label: "Report", fullLabel: "Match Report", icon: <Tag className="w-3.5 h-3.5" /> },
          { key: "resume", label: "Resume", fullLabel: "Generated Resume", icon: <FileText className="w-3.5 h-3.5" /> },
          { key: "cover", label: "Cover", fullLabel: "Cover Letter", icon: <Mail className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key as typeof activeTab)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "border-[#8b5cf6] text-white"
                : "border-transparent text-[#71717a] hover:text-[#a1a1aa]"
            }`}
          >
            {tab.icon}
            <span className="sm:hidden">{tab.label}</span>
            <span className="hidden sm:inline">{tab.fullLabel}</span>
          </button>
        ))}
      </div>

      {/* Processing state */}
      {scan.status === "processing" && (
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1c1c21] flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-[#8b5cf6] processing-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-white">Analysing your resume...</h3>
          <p className="text-sm text-[#71717a]">Gemini is running ATS gap analysis. This takes ~30–60 seconds.</p>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[#8b5cf6] processing-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Match Report */}
      {scan.status === "ready" && activeTab === "report" && (
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left panel */}
          <div className="w-full md:w-[55%] overflow-y-auto p-4 sm:p-6 space-y-6 border-b md:border-b-0 md:border-r border-[#1c1c21]">
            {/* Score */}
            <ScoreGauge score={score} />

            {/* Strategy */}
            {scan.result?.strategy && (
              <div className="bg-[#1c1c21] rounded-xl p-4 border border-[#27272a]">
                <h3 className="text-xs font-semibold text-[#52525b] uppercase tracking-wider mb-2">AI Strategy</h3>
                <p className="text-sm text-[#a1a1aa] leading-relaxed">{scan.result.strategy}</p>
              </div>
            )}

            {/* Missing Keywords — Mandatory */}
            {mandatory.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-[#ef4444]" />
                  <h3 className="text-sm font-semibold text-white">Hard Skills Gap</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30">
                    {mandatory.length} missing
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mandatory.map((kw) => (
                    <span
                      key={kw.keyword}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/25 text-xs text-[#fca5a5] font-medium"
                    >
                      {kw.keyword}
                      <span className="text-[#ef4444]/60 text-[10px]">×{kw.frequency_in_jd}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Keywords — Preferred */}
            {preferred.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MinusCircle className="w-4 h-4 text-[#f59e0b]" />
                  <h3 className="text-sm font-semibold text-white">Preferred Keywords</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30">
                    {preferred.length} missing
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {preferred.map((kw) => (
                    <span
                      key={kw.keyword}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/25 text-xs text-[#fcd34d] font-medium"
                    >
                      {kw.keyword}
                      <span className="text-[#f59e0b]/60 text-[10px]">×{kw.frequency_in_jd}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Already Strong */}
            {matched.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                  <h3 className="text-sm font-semibold text-white">Already Strong</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                    {matched.length} matched
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {matched.map((kw) => (
                    <span
                      key={kw}
                      className="px-2.5 py-1 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/25 text-xs text-[#86efac] font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right panel — JD with highlights */}
          <div className="w-full md:w-[45%] overflow-y-auto p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-[#52525b]" />
              <h3 className="text-sm font-semibold text-white">Job Description</h3>
              <div className="flex items-center gap-3 ml-auto text-xs text-[#52525b]">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#22c55e]/30 inline-block border border-[#22c55e]/50" /> matched</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#f59e0b]/30 inline-block border border-[#f59e0b]/50" /> missing</span>
              </div>
            </div>
            <div
              className="text-sm text-[#a1a1aa] leading-relaxed whitespace-pre-wrap jd-highlight"
              dangerouslySetInnerHTML={{ __html: highlightedJD }}
            />
          </div>
        </div>
      )}

      {/* Generated Resume tab */}
      {activeTab === "resume" && scan?.status === "ready" && (
        <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
          {resumeLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin" />
              <p className="text-sm text-[#71717a]">Gemini is rewriting your resume…</p>
            </div>
          ) : !resume ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#1c1c21] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#8b5cf6]" />
              </div>
              <h3 className="text-lg font-semibold text-white">AI Resume Rewrite</h3>
              <p className="text-sm text-[#71717a] max-w-sm">Gemini will rewrite your resume, integrating all missing keywords while preserving facts.</p>
              <Button onClick={generateResume}><Sparkles className="w-4 h-4" /> Generate Resume</Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">ATS-Optimised Resume</h2>
                <button onClick={() => copyToClipboard(JSON.stringify(resume, null, 2))}
                  className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-[#1c1c21] hover:border-[#27272a]">
                  {copied ? <CheckCircle className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy JSON"}
                </button>
              </div>
              {/* Header */}
              <div className="bg-[#0d0d14] border border-[#1c1c21] rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-white">{resume.name}</h1>
                <p className="text-sm text-[#71717a] mt-1">{resume.email} · {resume.phone} · {resume.location}</p>
                <div className="flex gap-3 mt-2">
                  {resume.linkedin && <a href={resume.linkedin} target="_blank" rel="noreferrer" className="text-xs text-[#8b5cf6] hover:underline">LinkedIn</a>}
                  {resume.github && <a href={resume.github} target="_blank" rel="noreferrer" className="text-xs text-[#8b5cf6] hover:underline">GitHub</a>}
                </div>
              </div>
              {/* Summary */}
              {resume.summary && (
                <ResumeSection title="Professional Summary">
                  <p className="text-sm text-[#a1a1aa] leading-relaxed">{resume.summary}</p>
                </ResumeSection>
              )}
              {/* Skills */}
              {resume.skills && (
                <ResumeSection title="Skills">
                  <div className="space-y-2">
                    {Object.entries(resume.skills).filter(([, v]: any) => v?.length).map(([k, v]: any) => (
                      <div key={k} className="flex gap-2 items-start">
                        <span className="text-xs text-[#52525b] w-24 shrink-0 pt-0.5 capitalize">{k.replace("_", " / ")}</span>
                        <div className="flex flex-wrap gap-1.5">{v.map((s: string) => (
                          <span key={s} className="px-2 py-0.5 rounded-full bg-[#1c1c21] border border-[#27272a] text-xs text-[#a1a1aa]">{s}</span>
                        ))}</div>
                      </div>
                    ))}
                  </div>
                </ResumeSection>
              )}
              {/* Experiences */}
              {resume.experiences?.length > 0 && (
                <ResumeSection title="Experience">
                  <div className="space-y-4">
                    {resume.experiences.map((exp: any, i: number) => (
                      <div key={i}>
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <span className="text-sm font-semibold text-white">{exp.role}</span>
                            <span className="text-sm text-[#71717a]"> · {exp.company}</span>
                          </div>
                          <span className="text-xs text-[#52525b]">{exp.duration}</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1">
                          {exp.bullets?.map((b: string, j: number) => (
                            <li key={j} className="text-sm text-[#a1a1aa] leading-relaxed">{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </ResumeSection>
              )}
              {/* Projects */}
              {resume.projects?.length > 0 && (
                <ResumeSection title="Projects">
                  <div className="space-y-4">
                    {resume.projects.map((proj: any, i: number) => (
                      <div key={i}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">{proj.name}</span>
                          {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs text-[#8b5cf6] hover:underline">↗</a>}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {proj.stack?.map((s: string) => (
                            <span key={s} className="px-1.5 py-0.5 rounded bg-[#1c1c21] text-[10px] text-[#71717a]">{s}</span>
                          ))}
                        </div>
                        <ul className="list-disc list-inside space-y-1">
                          {proj.bullets?.map((b: string, j: number) => (
                            <li key={j} className="text-sm text-[#a1a1aa]">{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </ResumeSection>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cover Letter tab */}
      {activeTab === "cover" && scan?.status === "ready" && (
        <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
          {coverLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin" />
              <p className="text-sm text-[#71717a]">Crafting your cover letter…</p>
            </div>
          ) : !coverLetter ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#1c1c21] flex items-center justify-center">
                <Mail className="w-8 h-8 text-[#8b5cf6]" />
              </div>
              <h3 className="text-lg font-semibold text-white">AI Cover Letter</h3>
              <p className="text-sm text-[#71717a] max-w-sm">A tailored, company-specific cover letter — 3 paragraphs, keyword-dense, personality intact.</p>
              <Button onClick={generateCover}><Sparkles className="w-4 h-4" /> Generate Cover Letter</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Cover Letter</h2>
                <div className="flex gap-2">
                  <button onClick={() => copyToClipboard(typeof coverLetter === "string" ? coverLetter : (coverLetter as any)?.body ?? "")}
                    className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-[#1c1c21] hover:border-[#27272a]">
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={generateCover}
                    className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-[#1c1c21] hover:border-[#27272a]">
                    <Sparkles className="w-3.5 h-3.5" /> Regenerate
                  </button>
                </div>
              </div>
              <div className="bg-[#0d0d14] border border-[#1c1c21] rounded-2xl p-8">
                <p className="text-sm text-[#a1a1aa] leading-8 whitespace-pre-wrap">
                  {typeof coverLetter === "string" ? coverLetter : (coverLetter as any)?.body}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Keyword highlight styles */}
      <style>{`
        .kw-matched { background: rgba(34,197,94,0.2); border-radius: 3px; padding: 0 2px; border-bottom: 1px solid rgba(34,197,94,0.5); color: #86efac; font-weight: 600; }
        .kw-missing  { background: rgba(245,158,11,0.2); border-radius: 3px; padding: 0 2px; border-bottom: 1px solid rgba(245,158,11,0.5); color: #fcd34d; font-weight: 600; }
      `}</style>
    </div>
  );
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0d0d14] border border-[#1c1c21] rounded-2xl p-6">
      <h3 className="text-xs font-semibold text-[#52525b] uppercase tracking-wider mb-4">{title}</h3>
      {children}
    </div>
  );
}

function ScanSkeleton() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="h-8 w-64 shimmer rounded-lg mb-6" />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-96 shimmer rounded-2xl" />
        <div className="h-96 shimmer rounded-2xl" />
      </div>
    </div>
  );
}
