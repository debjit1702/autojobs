import { callGemini, parseGeminiJSON } from "./gemini";
import { ATSAnalysisResult } from "./ats-pipeline";

export interface ResumeSection {
  title: string;
  content: string; // markdown-ish plain text
}

export interface GeneratedResume {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  summary: string;
  education: {
    degree: string;
    institution: string;
    cgpa: string;
    year: string;
  };
  experiences: {
    company: string;
    role: string;
    duration: string;
    bullets: string[];
  }[];
  projects: {
    name: string;
    url: string;
    stack: string[];
    bullets: string[];
  }[];
  skills: {
    languages: string[];
    frontend: string[];
    backend: string[];
    databases: string[];
    cloud_devops: string[];
    ml_ai: string[];
  };
  certifications: string[];
  achievements: string[];
}

const SYSTEM_CONTEXT = `You are a professional resume writer specialising in ATS-optimised resumes for tech roles.
Your task is to rewrite the candidate's resume to maximise their ATS score against the target job description.
Rules:
1. Integrate ALL mandatory missing keywords naturally into bullet points — do NOT keyword-stuff.
2. Rewrite bullet points using the STAR method (Situation, Task, Action, Result) with quantified impact where possible.
3. Prioritise skills and projects most relevant to the JD.
4. Keep the output as VALID JSON only — no markdown, no extra text.
5. Preserve all factual claims from the original resume; do NOT invent companies, roles, or technologies the candidate hasn't used.`;

export async function generateATSResume(
  jdText: string,
  originalResumeText: string,
  candidateProfile: any,
  atsAnalysis: ATSAnalysisResult
): Promise<GeneratedResume> {
  const missingKws = atsAnalysis.missing_keywords
    .map((k) => `${k.keyword} (${k.priority}, ×${k.frequency_in_jd} in JD)`)
    .join(", ");

  const prompt = `${SYSTEM_CONTEXT}

JOB DESCRIPTION:
${jdText}

ORIGINAL RESUME TEXT:
${originalResumeText}

CANDIDATE PROFILE (structured):
${JSON.stringify(candidateProfile, null, 2)}

MISSING KEYWORDS TO INTEGRATE: ${missingKws}

Return ONLY a valid JSON object matching this TypeScript type:
{
  "name": string,
  "email": string,
  "phone": string,
  "location": string,
  "linkedin": string,
  "github": string,
  "summary": string (3 sentences, keyword-dense, tailored to JD),
  "education": {
    "degree": string,
    "institution": string,
    "cgpa": string,
    "year": string
  },
  "experiences": [
    {
      "company": string,
      "role": string,
      "duration": string,
      "bullets": string[] (3-5 bullets, STAR format, include metrics)
    }
  ],
  "projects": [
    {
      "name": string,
      "url": string,
      "stack": string[],
      "bullets": string[] (2-3 bullets, quantified impact)
    }
  ],
  "skills": {
    "languages": string[],
    "frontend": string[],
    "backend": string[],
    "databases": string[],
    "cloud_devops": string[],
    "ml_ai": string[]
  },
  "certifications": string[],
  "achievements": string[]
}`;

  const responseText = await callGemini(prompt, 0.2);
  return parseGeminiJSON<GeneratedResume>(responseText);
}
