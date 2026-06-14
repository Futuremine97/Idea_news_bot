import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";
import { Header } from "@/components/Header";
import { Mascot } from "@/components/Mascot";

export const metadata: Metadata = {
  title: "AI 서비스 허브 | AI Service Hub",
  description: "한국·미국·전세계 AI 에이전트/서비스 디렉토리 & 홍보 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <LangProvider>
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400">
            <p>AI Service Hub · 누구나 등록 가능한 AI 서비스 디렉토리</p>
            <p className="mt-2">
              <a href="/privacy" className="underline hover:text-slate-600">개인정보처리방침 / Privacy</a>
            </p>
          </footer>
          <Mascot />
        </LangProvider>
      </body>
    </html>
  );
}
