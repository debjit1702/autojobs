import { callGemini } from "./gemini";

export interface GeneratedCoverLetter {
  subject: string;
  body: string; // plain text, ~300-350 words
  tone: "professional" | "enthusiastic" | "technical";
}

const SYSTEM_CONTEXT = `You are an expert cover letter writer for software engineers and tech professionals.
Write a compelling, tailored cover letter that:
1. Opens with a specific hook referencing the company/role — NOT "I am writing to apply..."
2. Demonstrates knowledge of the company's product/mission (infer from JD)
3. Highlights 2-3 most relevant projects/experiences matching the JD requirements
4. Integrates key technical keywords from the JD naturally
5. Closes with a confident, specific call to action
6. Keeps it to 3 paragraphs, ~300-350 words
7. Tone: professional but not stiff — shows personality`;

export async function generateCoverLetter(
  jdText: string,
  candidateProfile: any,
  companyName: string,
  jobTitle: string
): Promise<GeneratedCoverLetter> {
  const prompt = `${SYSTEM_CONTEXT}

COMPANY: ${companyName}
ROLE: ${jobTitle}

JOB DESCRIPTION:
${jdText}

CANDIDATE PROFILE:
Name: ${candidateProfile.name || "Candidate"}
Skills: ${JSON.stringify(candidateProfile.techStack)}
Projects: ${JSON.stringify(candidateProfile.projects?.slice(0, 3))}
Achievements: ${JSON.stringify(candidateProfile.achievements?.slice(0, 3))}
Education: ${candidateProfile.degree} from ${candidateProfile.institution}

Return ONLY a valid JSON object:
{
  "subject": "Application for ${jobTitle} at ${companyName} — [Candidate Name]",
  "body": "<full cover letter text, plain text no markdown>",
  "tone": "professional" | "enthusiastic" | "technical"
}`;

  const responseText = await callGemini(prompt, 0.7); // higher temp for personality
  const raw = responseText.trim();

  // Parse JSON
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    // If Gemini returns plain text, wrap it
    return {
      subject: `Application for ${jobTitle} at ${companyName}`,
      body: raw,
      tone: "professional",
    };
  }
  return JSON.parse(jsonMatch[0]) as GeneratedCoverLetter;
}
