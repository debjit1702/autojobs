"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, AlertTriangle, Loader2, FileText, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface NewScanModalProps {
  onClose: () => void;
}

export function NewScanModal({ onClose }: NewScanModalProps) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const parseFile = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError("");
    setUploadedFileName("");
    setResumeText("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/profile/resume", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to parse file");
      if (!data.text?.trim()) throw new Error("No text found in file. Try pasting your resume manually.");
      setResumeText(data.text);
      setUploadedFileName(file.name);
    } catch (e: any) {
      setUploadError(e.message || "Could not read file. Please paste your resume below.");
    } finally {
      setUploading(false);
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) parseFile(acceptedFiles[0]);
  }, [parseFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: (files) => {
      const err = files[0]?.errors[0];
      if (err?.code === "file-too-large") setUploadError("File is too large (max 10 MB).");
      else if (err?.code === "file-invalid-type") setUploadError("Unsupported file type. Use PDF, DOCX, DOC, or TXT.");
      else setUploadError("Could not accept file. Please try again.");
    },
  });

  const handleSubmit = async () => {
    setSubmitError("");
    if (!companyName.trim()) { setSubmitError("Please enter the company name."); return; }
    if (!jobTitle.trim()) { setSubmitError("Please enter the job title."); return; }
    if (!jdText.trim()) { setSubmitError("Please paste the job description."); return; }
    if (!resumeText.trim()) { setSubmitError("Please upload or paste your resume."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, jobTitle, jdText, resumeText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create scan");
      onClose();
      router.push(`/scan/${data.id}`);
    } catch (e: any) {
      setSubmitError(e.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0d0d14] border border-[#1c1c21] rounded-2xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c1c21]">
          <div>
            <h2 className="text-lg font-semibold text-white">Create New Scan</h2>
            <p className="text-xs text-[#52525b] mt-0.5">Gemini will analyse your resume against the job description</p>
          </div>
          <button onClick={onClose} className="text-[#52525b] hover:text-white transition-colors p-1 rounded-lg hover:bg-[#1c1c21]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden overflow-y-auto md:overflow-hidden">

          {/* Left — Job Details */}
          <div className="flex-1 p-4 sm:p-6 border-b md:border-b-0 md:border-r border-[#1c1c21] overflow-y-auto space-y-4">
            <h3 className="text-xs font-semibold text-[#52525b] uppercase tracking-wider">Job Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#71717a] mb-1.5">Company Name *</label>
                <input className="input-base" placeholder="e.g. Google" value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#71717a] mb-1.5">Job Title *</label>
                <input className="input-base" placeholder="e.g. Software Engineer" value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#71717a] mb-1.5">Job Description *</label>
              <textarea
                className="input-base min-h-[260px] resize-none leading-relaxed text-sm"
                placeholder="Paste the job description here. Include responsibilities and qualifications sections for best results."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            </div>
          </div>

          {/* Right — Resume */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            <h3 className="text-xs font-semibold text-[#52525b] uppercase tracking-wider">Your Resume</h3>

            {/* Upload zone */}
            {!uploadedFileName ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? "border-[#8b5cf6] bg-[#8b5cf6]/10 scale-[1.01]"
                    : "border-[#27272a] hover:border-[#8b5cf6]/60 hover:bg-[#8b5cf6]/5"
                }`}
              >
                <input {...getInputProps()} />
                {uploading ? (
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/10 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-[#8b5cf6] animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Parsing your resume…</p>
                      <p className="text-xs text-[#52525b] mt-0.5">Extracting text from PDF</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="w-10 h-10 rounded-full bg-[#1c1c21] border border-[#27272a] flex items-center justify-center">
                      <Upload className="w-5 h-5 text-[#52525b]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#a1a1aa]">
                        {isDragActive ? "Drop your resume here" : "Click to upload or drag & drop"}
                      </p>
                      <p className="text-xs text-[#3f3f46] mt-0.5">PDF, DOCX, DOC, TXT · max 10 MB</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Success state — file uploaded */
              <div className="border border-[#22c55e]/30 bg-[#22c55e]/5 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{uploadedFileName}</p>
                  <p className="text-xs text-[#52525b] mt-0.5">
                    {resumeText.split(/\s+/).filter(Boolean).length} words extracted
                  </p>
                </div>
                <button
                  onClick={() => { setUploadedFileName(""); setResumeText(""); setUploadError(""); }}
                  className="text-[#52525b] hover:text-white transition-colors shrink-0"
                  title="Remove and re-upload"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Upload error */}
            {uploadError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20">
                <AlertTriangle className="w-4 h-4 text-[#ef4444] shrink-0 mt-0.5" />
                <p className="text-xs text-[#ef4444] leading-relaxed">{uploadError}</p>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#1c1c21]" />
              <span className="text-xs text-[#3f3f46] font-medium">
                {uploadedFileName ? "or edit the extracted text" : "or paste manually"}
              </span>
              <div className="flex-1 h-px bg-[#1c1c21]" />
            </div>

            {/* Text area */}
            <textarea
              className="input-base min-h-[180px] resize-none leading-relaxed text-xs"
              placeholder="Paste your resume text here (if upload didn't work or you prefer)…"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />

            {/* Word count indicator */}
            {resumeText.trim() && (
              <p className="text-[11px] text-[#3f3f46] text-right">
                {resumeText.split(/\s+/).filter(Boolean).length} words · {resumeText.length} chars
              </p>
            )}
          </div>
        </div>

        {/* Tip bar */}
        <div className="px-6 py-2.5 bg-[#f59e0b]/5 border-t border-[#f59e0b]/20 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
          <p className="text-xs text-[#92400e] leading-relaxed">
            <strong className="text-[#f59e0b]">Tip:</strong> Include the <strong>responsibilities and qualifications</strong> sections of the job listing for best ATS results.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1c1c21] flex items-center justify-between gap-4">
          {submitError
            ? <p className="text-xs text-[#ef4444] flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" />{submitError}</p>
            : <div />
          }
          <Button onClick={handleSubmit} loading={submitting} size="md">
            {submitting ? "Creating scan…" : "Create Scan →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
