import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "RESONANCE — Research Intelligence | Scientific Conflict & Root-Cause Discovery",
  description:
    "Scientific research conflict analysis and root-cause discovery system. Identifies methodological and experimental factors behind conflicting findings without proprietary LLMs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F5F7FA] text-[#101827] antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
