"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  User, GraduationCap, Code2, Trophy, CheckCircle, Save, Briefcase, Trash2, Plus
} from "lucide-react";

const TABS = [
  { id: "basic",        label: "Basic Info",   icon: <User className="w-4 h-4" /> },
  { id: "education",   label: "Education",     icon: <GraduationCap className="w-4 h-4" /> },
  { id: "experience",  label: "Experience",    icon: <Briefcase className="w-4 h-4" /> },
  { id: "skills",      label: "Skills",        icon: <Code2 className="w-4 h-4" /> },
  { id: "projects",    label: "Projects",      icon: <Trophy className="w-4 h-4" /> },
  { id: "achievements",label: "Achievements",  icon: <CheckCircle className="w-4 h-4" /> },
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    phone: "", linkedinUrl: "", githubUrl: "", leetcodeUrl: "", location: "",
    degree: "", institution: "", cgpa: "", graduationYear: "",
    experiences: [{ company: "", role: "", startDate: "", endDate: "", bullets: "" }] as { company: string; role: string; startDate: string; endDate: string; bullets: string }[],
    techStack: { languages: "", frontend: "", backend: "", databases: "", cloud_devops: "", ml_ai: "" },
    projects: [{ name: "", liveUrl: "", githubUrl: "", stack: "", description: "" }],
    certifications: "", achievements: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(data => {
        if (!data) return;
        setForm({
          phone: data.phone ?? "",
          linkedinUrl: data.linkedinUrl ?? "",
          githubUrl: data.githubUrl ?? "",
          leetcodeUrl: data.leetcodeUrl ?? "",
          location: data.location ?? "",
          degree: data.degree ?? "",
          institution: data.institution ?? "",
          cgpa: data.cgpa ?? "",
          graduationYear: data.graduationYear?.toString() ?? "",
          experiences: data.experiences?.length ? data.experiences.map((e: any) => ({
            company: e.company ?? "",
            role: e.role ?? "",
            startDate: e.startDate ?? "",
            endDate: e.endDate ?? "",
            bullets: Array.isArray(e.bullets) ? e.bullets.join("\n") : "",
          })) : [{ company: "", role: "", startDate: "", endDate: "", bullets: "" }],
          techStack: {
            languages: (data.techStack as any)?.languages?.join(", ") ?? "",
            frontend: (data.techStack as any)?.frontend?.join(", ") ?? "",
            backend: (data.techStack as any)?.backend?.join(", ") ?? "",
            databases: (data.techStack as any)?.databases?.join(", ") ?? "",
            cloud_devops: (data.techStack as any)?.cloud_devops?.join(", ") ?? "",
            ml_ai: (data.techStack as any)?.ml_ai?.join(", ") ?? "",
          },
          projects: data.projects?.length ? data.projects.map((p: any) => ({
            name: p.name ?? "", liveUrl: p.liveUrl ?? "", githubUrl: p.githubUrl ?? "",
            stack: Array.isArray(p.stack) ? p.stack.join(", ") : p.stack ?? "",
            description: p.description ?? "",
          })) : [{ name: "", liveUrl: "", githubUrl: "", stack: "", description: "" }],
          certifications: Array.isArray(data.certifications) ? data.certifications.join("\n") : "",
          achievements: Array.isArray(data.achievements) ? data.achievements.join("\n") : "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));
  const setTech = (k: string, v: string) => setForm(f => ({ ...f, techStack: { ...f.techStack, [k]: v } }));
  const setExp = (i: number, k: string, v: string) => setForm(f => {
    const experiences = [...f.experiences];
    experiences[i] = { ...experiences[i], [k]: v };
    return { ...f, experiences };
  });
  const setProject = (i: number, k: string, v: string) => setForm(f => {
    const projects = [...f.projects];
    projects[i] = { ...projects[i], [k]: v };
    return { ...f, projects };
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.phone, linkedinUrl: form.linkedinUrl, githubUrl: form.githubUrl,
          leetcodeUrl: form.leetcodeUrl, location: form.location,
          degree: form.degree, institution: form.institution, cgpa: form.cgpa,
          graduationYear: form.graduationYear ? parseInt(form.graduationYear) : null,
          experiences: form.experiences.filter(e => e.company && e.role).map(e => ({
            company: e.company, role: e.role,
            startDate: e.startDate || null, endDate: e.endDate || null,
            bullets: e.bullets.split("\n").filter(Boolean),
          })),
          techStack: {
            languages: form.techStack.languages.split(",").map(s => s.trim()).filter(Boolean),
            frontend: form.techStack.frontend.split(",").map(s => s.trim()).filter(Boolean),
            backend: form.techStack.backend.split(",").map(s => s.trim()).filter(Boolean),
            databases: form.techStack.databases.split(",").map(s => s.trim()).filter(Boolean),
            cloud_devops: form.techStack.cloud_devops.split(",").map(s => s.trim()).filter(Boolean),
            ml_ai: form.techStack.ml_ai.split(",").map(s => s.trim()).filter(Boolean),
          },
          projects: form.projects.filter(p => p.name).map((p, i) => ({
            name: p.name, liveUrl: p.liveUrl || null, githubUrl: p.githubUrl || null,
            stack: p.stack.split(",").map(s => s.trim()).filter(Boolean),
            description: p.description || null, bullets: [], stats: [], displayOrder: i,
          })),
          certifications: form.certifications.split("\n").filter(Boolean),
          achievements: form.achievements.split("\n").filter(Boolean),
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-8"><div className="h-8 w-48 shimmer rounded-lg" /></div>;

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center text-white text-2xl font-bold">
            {session?.user?.name?.[0] ?? "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{session?.user?.name}</h1>
            <p className="text-sm text-[#71717a]">{session?.user?.email}</p>
          </div>
        </div>
        <Button onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4" />
          {saved ? "Saved ✓" : "Save Changes"}
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-48 shrink-0 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#1c1c21] text-white border border-[#27272a]"
                  : "text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#141417]"
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#0d0d14] border border-[#1c1c21] rounded-2xl p-6">
          {/* Basic Info */}
          {activeTab === "basic" && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-white mb-5">Basic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#71717a] mb-1.5">Phone</label>
                  <input className="input-base" placeholder="+91 9876543210" value={form.phone} onChange={e => set("phone", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#71717a] mb-1.5">Location</label>
                  <input className="input-base" placeholder="Bangalore, India" value={form.location} onChange={e => set("location", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#71717a] mb-1.5">LinkedIn URL</label>
                <input className="input-base" placeholder="https://linkedin.com/in/yourname" value={form.linkedinUrl} onChange={e => set("linkedinUrl", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#71717a] mb-1.5">GitHub URL</label>
                <input className="input-base" placeholder="https://github.com/yourname" value={form.githubUrl} onChange={e => set("githubUrl", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#71717a] mb-1.5">LeetCode URL</label>
                <input className="input-base" placeholder="https://leetcode.com/yourname" value={form.leetcodeUrl} onChange={e => set("leetcodeUrl", e.target.value)} />
              </div>
            </div>
          )}

          {/* Education */}
          {activeTab === "education" && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-white mb-5">Education</h2>
              <div>
                <label className="block text-xs font-medium text-[#71717a] mb-1.5">Degree</label>
                <input className="input-base" placeholder="B.Tech Computer Science" value={form.degree} onChange={e => set("degree", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#71717a] mb-1.5">Institution</label>
                <input className="input-base" placeholder="IIT Bombay" value={form.institution} onChange={e => set("institution", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#71717a] mb-1.5">CGPA</label>
                  <input className="input-base" placeholder="8.5/10" value={form.cgpa} onChange={e => set("cgpa", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#71717a] mb-1.5">Graduation Year</label>
                  <input className="input-base" placeholder="2025" value={form.graduationYear} onChange={e => set("graduationYear", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Experience */}
          {activeTab === "experience" && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-white mb-2">Work Experience</h2>
              {form.experiences.map((exp, i) => (
                <div key={i} className="bg-[#141417] border border-[#1c1c21] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#71717a]">Experience {i + 1}</span>
                    {form.experiences.length > 1 && (
                      <button onClick={() => setForm(f => ({ ...f, experiences: f.experiences.filter((_, j) => j !== i) }))}
                        className="text-xs text-[#ef4444]/60 hover:text-[#ef4444] transition-colors">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input-base" placeholder="Company *" value={exp.company} onChange={e => setExp(i, "company", e.target.value)} />
                    <input className="input-base" placeholder="Role / Title *" value={exp.role} onChange={e => setExp(i, "role", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input-base" placeholder="Start (e.g. Jun 2023)" value={exp.startDate} onChange={e => setExp(i, "startDate", e.target.value)} />
                    <input className="input-base" placeholder="End (or 'Present')" value={exp.endDate} onChange={e => setExp(i, "endDate", e.target.value)} />
                  </div>
                  <textarea className="input-base resize-none" rows={3}
                    placeholder={"• Built X that improved Y by Z%\n• Led team of N engineers"}
                    value={exp.bullets} onChange={e => setExp(i, "bullets", e.target.value)} />
                </div>
              ))}
              {form.experiences.length < 5 && (
                <button onClick={() => setForm(f => ({ ...f, experiences: [...f.experiences, { company: "", role: "", startDate: "", endDate: "", bullets: "" }] }))}
                  className="text-sm text-[#8b5cf6] hover:text-[#a78bfa] transition-colors flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add another role
                </button>
              )}
            </div>
          )}

          {/* Skills */}
          {activeTab === "skills" && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-white mb-5">Tech Stack</h2>
              {[
                { key: "languages", label: "Languages", ph: "Python, JavaScript, Java" },
                { key: "frontend", label: "Frontend", ph: "React, Next.js, TypeScript" },
                { key: "backend", label: "Backend", ph: "Node.js, FastAPI, Express" },
                { key: "databases", label: "Databases", ph: "PostgreSQL, MongoDB, Redis" },
                { key: "cloud_devops", label: "Cloud / DevOps", ph: "AWS, Docker, Kubernetes" },
                { key: "ml_ai", label: "ML / AI", ph: "PyTorch, TensorFlow, LangChain" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-[#71717a] mb-1.5">{f.label}</label>
                  <input className="input-base" placeholder={f.ph} value={(form.techStack as any)[f.key]} onChange={e => setTech(f.key, e.target.value)} />
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {activeTab === "projects" && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-white mb-2">Projects</h2>
              {form.projects.map((proj, i) => (
                <div key={i} className="bg-[#141417] border border-[#1c1c21] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#71717a]">Project {i + 1}</span>
                    {form.projects.length > 1 && (
                      <button onClick={() => setForm(f => ({ ...f, projects: f.projects.filter((_, j) => j !== i) }))}
                        className="text-xs text-[#ef4444]/60 hover:text-[#ef4444] transition-colors">Remove</button>
                    )}
                  </div>
                  <input className="input-base" placeholder="Project Name *" value={proj.name} onChange={e => setProject(i, "name", e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input-base" placeholder="Live URL" value={proj.liveUrl} onChange={e => setProject(i, "liveUrl", e.target.value)} />
                    <input className="input-base" placeholder="GitHub URL" value={proj.githubUrl} onChange={e => setProject(i, "githubUrl", e.target.value)} />
                  </div>
                  <input className="input-base" placeholder="Tech Stack (comma-separated)" value={proj.stack} onChange={e => setProject(i, "stack", e.target.value)} />
                  <textarea className="input-base resize-none" rows={2} placeholder="Brief description" value={proj.description} onChange={e => setProject(i, "description", e.target.value)} />
                </div>
              ))}
              {form.projects.length < 5 && (
                <button onClick={() => setForm(f => ({ ...f, projects: [...f.projects, { name: "", liveUrl: "", githubUrl: "", stack: "", description: "" }] }))}
                  className="text-sm text-[#8b5cf6] hover:text-[#a78bfa] transition-colors">
                  + Add project
                </button>
              )}
            </div>
          )}

          {/* Achievements */}
          {activeTab === "achievements" && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-white mb-5">Certifications & Achievements</h2>
              <div>
                <label className="block text-xs font-medium text-[#71717a] mb-1.5">Certifications (one per line)</label>
                <textarea className="input-base resize-none" rows={5}
                  placeholder={"AWS Certified Solutions Architect\nGoogle Cloud Professional"}
                  value={form.certifications} onChange={e => set("certifications", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#71717a] mb-1.5">Achievements (one per line)</label>
                <textarea className="input-base resize-none" rows={5}
                  placeholder={"Finalist, Smart India Hackathon 2024\n5-star HackerRank Python"}
                  value={form.achievements} onChange={e => set("achievements", e.target.value)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
