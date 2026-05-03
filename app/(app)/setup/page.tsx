"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Zap, CheckCircle, User, GraduationCap, Code2, Trophy, Plus, Trash2, Briefcase } from "lucide-react";

const STEPS = [
  { id: 1, label: "Basic Info",   icon: <User className="w-4 h-4" /> },
  { id: 2, label: "Education",    icon: <GraduationCap className="w-4 h-4" /> },
  { id: 3, label: "Experience",   icon: <Briefcase className="w-4 h-4" /> },
  { id: 4, label: "Tech Stack",   icon: <Code2 className="w-4 h-4" /> },
  { id: 5, label: "Projects",     icon: <Trophy className="w-4 h-4" /> },
  { id: 6, label: "Achievements", icon: <CheckCircle className="w-4 h-4" /> },
];

export default function SetupPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    phone: "", linkedinUrl: "", githubUrl: "", leetcodeUrl: "", location: "",
    degree: "", institution: "", cgpa: "", graduationYear: "",
    experiences: [{ company: "", role: "", startDate: "", endDate: "", bullets: "" }],
    techStack: { languages: "", frontend: "", backend: "", databases: "", cloud_devops: "", ml_ai: "" },
    projects: [{ name: "", liveUrl: "", githubUrl: "", stack: "", description: "" }],
    certifications: "", achievements: "",
  });

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));
  const setTech = (k: string, v: string) => setForm((f) => ({ ...f, techStack: { ...f.techStack, [k]: v } }));
  const setExp = (i: number, k: string, v: string) => setForm(f => {
    const experiences = [...f.experiences];
    experiences[i] = { ...experiences[i], [k]: v };
    return { ...f, experiences };
  });
  const setProject = (i: number, k: string, v: string) =>
    setForm((f) => {
      const projects = [...f.projects];
      projects[i] = { ...projects[i], [k]: v };
      return { ...f, projects };
    });

  const handleFinish = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        phone: form.phone, linkedinUrl: form.linkedinUrl, githubUrl: form.githubUrl,
        leetcodeUrl: form.leetcodeUrl, location: form.location,
        degree: form.degree, institution: form.institution, cgpa: form.cgpa,
        graduationYear: form.graduationYear ? parseInt(form.graduationYear) : null,
        experiences: form.experiences
          .filter(e => e.company && e.role)
          .map(e => ({
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
        projects: form.projects
          .filter(p => p.name)
          .map((p, i) => ({
            name: p.name, liveUrl: p.liveUrl || null, githubUrl: p.githubUrl || null,
            stack: p.stack.split(",").map(s => s.trim()).filter(Boolean),
            description: p.description || null, bullets: [], stats: [],
          })),
        certifications: form.certifications.split("\n").filter(Boolean),
        achievements: form.achievements.split("\n").filter(Boolean),
        setupCompleted: true,
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save profile");
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-white">autojobs</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                step === s.id
                  ? "bg-[#8b5cf6] text-white"
                  : step > s.id
                  ? "text-[#22c55e]"
                  : "text-[#52525b]"
              }`}>
                {step > s.id ? <CheckCircle className="w-3.5 h-3.5" /> : s.icon}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-1 ${step > s.id ? "bg-[#22c55e]/50" : "bg-[#1c1c21]"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-[#0d0d14] border border-[#1c1c21] rounded-2xl p-8 animate-fade-in">
          {/* Step 1 — Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-1">Basic Information</h2>
              <p className="text-sm text-[#71717a] mb-6">Tell us a bit about yourself so we can personalise your resume.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#71717a] mb-1.5">Phone</label>
                  <input className="input-base" placeholder="+91 9876543210" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#71717a] mb-1.5">Location</label>
                  <input className="input-base" placeholder="Bangalore, India" value={form.location} onChange={(e) => set("location", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#71717a] mb-1.5">LinkedIn URL</label>
                <input className="input-base" placeholder="https://linkedin.com/in/yourname" value={form.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#71717a] mb-1.5">GitHub URL</label>
                <input className="input-base" placeholder="https://github.com/yourname" value={form.githubUrl} onChange={(e) => set("githubUrl", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#71717a] mb-1.5">LeetCode URL</label>
                <input className="input-base" placeholder="https://leetcode.com/yourname" value={form.leetcodeUrl} onChange={(e) => set("leetcodeUrl", e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 2 — Education */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-1">Education</h2>
              <p className="text-sm text-[#71717a] mb-6">Your most recent degree.</p>
              <div>
                <label className="block text-xs font-medium text-[#71717a] mb-1.5">Degree</label>
                <input className="input-base" placeholder="B.Tech Computer Science" value={form.degree} onChange={(e) => set("degree", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#71717a] mb-1.5">Institution</label>
                <input className="input-base" placeholder="IIT Bombay" value={form.institution} onChange={(e) => set("institution", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#71717a] mb-1.5">CGPA</label>
                  <input className="input-base" placeholder="8.5/10" value={form.cgpa} onChange={(e) => set("cgpa", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#71717a] mb-1.5">Graduation Year</label>
                  <input className="input-base" placeholder="2025" value={form.graduationYear} onChange={(e) => set("graduationYear", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Experience */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white mb-1">Work Experience</h2>
              <p className="text-sm text-[#71717a] mb-2">Add your work history. Skip if you're a fresher.</p>
              {form.experiences.map((exp, i) => (
                <div key={i} className="bg-[#1c1c21] rounded-xl p-4 border border-[#27272a] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#71717a]">Experience {i + 1}</span>
                    {form.experiences.length > 1 && (
                      <button onClick={() => setForm(f => ({ ...f, experiences: f.experiences.filter((_, j) => j !== i) }))}
                        className="text-[#ef4444]/60 hover:text-[#ef4444] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
                    placeholder={"• Built X that improved Y by Z%\n• Led team of N engineers to deliver…"}
                    value={exp.bullets} onChange={e => setExp(i, "bullets", e.target.value)} />
                </div>
              ))}
              {form.experiences.length < 5 && (
                <button onClick={() => setForm(f => ({ ...f, experiences: [...f.experiences, { company: "", role: "", startDate: "", endDate: "", bullets: "" }] }))}
                  className="text-sm text-[#8b5cf6] hover:text-[#a78bfa] transition-colors">
                  <span className="flex items-center gap-1"><Plus className="w-4 h-4" /> Add another role</span>
                </button>
              )}
            </div>
          )}

          {/* Step 4 — Tech Stack */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-1">Tech Stack</h2>
              <p className="text-sm text-[#71717a] mb-6">Enter skills separated by commas. Only include what you can genuinely speak to.</p>
              {[
                { key: "languages",  label: "Languages",        ph: "Python, JavaScript, Java, C++" },
                { key: "frontend",   label: "Frontend",         ph: "React, Next.js, TypeScript, Tailwind" },
                { key: "backend",    label: "Backend",          ph: "Node.js, FastAPI, Express, Django" },
                { key: "databases",  label: "Databases",        ph: "PostgreSQL, MongoDB, Redis" },
                { key: "cloud_devops", label: "Cloud / DevOps", ph: "AWS, Docker, GitHub Actions" },
                { key: "ml_ai",      label: "ML / AI",          ph: "TensorFlow, PyTorch, Scikit-learn" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-[#71717a] mb-1.5">{field.label}</label>
                  <input
                    className="input-base"
                    placeholder={field.ph}
                    value={(form.techStack as any)[field.key]}
                    onChange={(e) => setTech(field.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Step 5 — Projects */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-1">Projects</h2>
              <p className="text-sm text-[#71717a] mb-2">Add up to 5 projects. These will be reframed per JD on every scan.</p>
              {form.projects.map((proj, i) => (
                <div key={i} className="bg-[#1c1c21] rounded-xl p-4 border border-[#27272a] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#71717a]">Project {i + 1}</span>
                    {form.projects.length > 1 && (
                      <button onClick={() => setForm((f) => ({ ...f, projects: f.projects.filter((_, j) => j !== i) }))}
                        className="text-[#ef4444]/60 hover:text-[#ef4444] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input className="input-base" placeholder="Project Name" value={proj.name} onChange={(e) => setProject(i, "name", e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input-base" placeholder="Live URL (optional)" value={proj.liveUrl} onChange={(e) => setProject(i, "liveUrl", e.target.value)} />
                    <input className="input-base" placeholder="GitHub URL (optional)" value={proj.githubUrl} onChange={(e) => setProject(i, "githubUrl", e.target.value)} />
                  </div>
                  <input className="input-base" placeholder="Tech Stack (comma-separated)" value={proj.stack} onChange={(e) => setProject(i, "stack", e.target.value)} />
                  <textarea className="input-base resize-none" rows={2} placeholder="Brief description..." value={proj.description} onChange={(e) => setProject(i, "description", e.target.value)} />
                </div>
              ))}
              {form.projects.length < 5 && (
                <button
                  onClick={() => setForm((f) => ({ ...f, projects: [...f.projects, { name: "", liveUrl: "", githubUrl: "", stack: "", description: "" }] }))}
                  className="flex items-center gap-2 text-sm text-[#8b5cf6] hover:text-[#a78bfa] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add another project
                </button>
              )}
            </div>
          )}

          {/* Step 6 — Achievements */}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-1">Certifications & Achievements</h2>
              <p className="text-sm text-[#71717a] mb-6">One per line. Include competition rankings, publications, or awards.</p>
              <div>
                <label className="block text-xs font-medium text-[#71717a] mb-1.5">Certifications</label>
                <textarea
                  className="input-base resize-none"
                  rows={4}
                  placeholder={"AWS Certified Solutions Architect\nGoogle Cloud Professional Data Engineer"}
                  value={form.certifications}
                  onChange={(e) => set("certifications", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#71717a] mb-1.5">Achievements</label>
                <textarea
                  className="input-base resize-none"
                  rows={4}
                  placeholder={"Finalist, Smart India Hackathon 2024\n5-star HackerRank Python rating"}
                  value={form.achievements}
                  onChange={(e) => set("achievements", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          {error && <p className="text-xs text-[#ef4444] mt-4">{error}</p>}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#1c1c21]">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              ← Back
            </Button>
            {step < STEPS.length ? (
              <Button onClick={() => setStep((s) => s + 1)}>Continue →</Button>
            ) : (
              <Button onClick={handleFinish} loading={saving}>
                Complete Setup 🎉
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-[#3f3f46] mt-6">
          You can update your profile anytime from the sidebar.
        </p>
      </div>
    </div>
  );
}
