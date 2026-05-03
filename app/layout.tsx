import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "autojobs — AI-Powered ATS Resume Builder",
  description:
    "Upload your resume, paste a job description, and get an 80+ ATS score resume and branded cover letter in under 3 minutes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#09090b] text-[#fafafa] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
