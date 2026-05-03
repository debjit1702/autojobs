import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import path from "path";

// Must run in Node.js — pdfjs-dist and mammoth require Node APIs
export const runtime = "nodejs";
export const maxDuration = 30;

/** Extract plain text from a PDF buffer using pdfjs-dist (Node.js) */
async function parsePdf(buffer: Buffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Point the worker to the bundled worker file on disk
  // In Next.js server context, __dirname is not available — use process.cwd()
  const workerPath = path.join(
    process.cwd(),
    "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
  );
  pdfjs.GlobalWorkerOptions.workerSrc = `file:///${workerPath.replace(/\\/g, "/")}`;

  const doc = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    verbosity: 0,
  } as any).promise;

  const lines: string[] = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();

    let lastY: number | null = null;
    let currentLine: string[] = [];

    for (const item of content.items as any[]) {
      if (!item.str) continue;
      const y: number = item.transform?.[5] ?? 0;

      if (lastY !== null && Math.abs(y - lastY) > 1.5) {
        const line = currentLine.join("").trim();
        if (line) lines.push(line);
        currentLine = [];
      }
      currentLine.push(item.str);
      lastY = y;
    }
    if (currentLine.length) {
      const line = currentLine.join("").trim();
      if (line) lines.push(line);
    }
    lines.push(""); // blank separator between pages
  }

  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Extract text from DOCX/DOC using mammoth */
async function parseDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  const mime = file.type;

  let text = "";
  try {
    if (mime === "application/pdf" || name.endsWith(".pdf")) {
      text = await parsePdf(buffer);
    } else if (
      mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      name.endsWith(".docx")
    ) {
      text = await parseDocx(buffer);
    } else if (mime === "application/msword" || name.endsWith(".doc")) {
      text = await parseDocx(buffer);
    } else if (mime === "text/plain" || name.endsWith(".txt")) {
      text = buffer.toString("utf-8").trim();
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, DOCX, DOC, or TXT." },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error("[resume-parse] error:", err?.message ?? err);
    return NextResponse.json(
      { error: `Could not read file: ${err?.message ?? "unknown error"}` },
      { status: 422 }
    );
  }

  // Check if we actually got meaningful text
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < 10) {
    return NextResponse.json(
      {
        error:
          "This PDF appears to be a scanned image or is password protected. " +
          "Please paste your resume text manually in the text box below.",
      },
      { status: 422 }
    );
  }

  return NextResponse.json({ text });
}
