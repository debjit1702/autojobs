import { callGemini, parseGeminiJSON } from "./gemini";

export interface MissingKeyword {
  keyword: string;
  frequency_in_jd: number;
  priority: "mandatory" | "preferred";
}

export interface ATSAnalysisResult {
  ats_score: number;
  verdict: string;
  missing_keywords: MissingKeyword[];
  matched_keywords: string[];
  strategy: string;
}

const SYSTEM_CONTEXT = `You are an enterprise ATS (Applicant Tracking System). 
Analyse the candidate's resume against the job description and return a structured JSON gap analysis. 
Be precise, not generous. Only mark a keyword as matched if it appears clearly in the resume. 
Do not fabricate matches.`;

export async function runATSGapAnalysis(
  jdText: string,
  resumeText: string
): Promise<ATSAnalysisResult> {
  const prompt = `${SYSTEM_CONTEXT}

JOB DESCRIPTION:
${jdText}

CANDIDATE RESUME:
${resumeText}

Return ONLY a valid JSON object with this exact structure:
{
  "ats_score": <integer 0-100>,
  "verdict": "<one sentence verdict>",
  "missing_keywords": [
    { "keyword": "<keyword>", "frequency_in_jd": <int>, "priority": "mandatory" | "preferred" }
  ],
  "matched_keywords": ["<keyword>", ...],
  "strategy": "<2-3 sentences on framing approach for this specific role>"
}`;

  const responseText = await callGemini(prompt);
  return parseGeminiJSON<ATSAnalysisResult>(responseText);
}
