"use client";

import Link from "next/link";
import { useLang } from "./LangProvider";

export function Header() {
  const { lang, setLang, t } = useLang();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-600">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">AI</span>
          <span>{t("siteName")}</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm sm:gap-3">
          <Link href="/" className="rounded px-2 py-1 text-slate-600 hover:bg-slate-100">
            {t("nav_directory")}
          </Link>
          <Link href="/map" className="rounded px-2 py-1 text-slate-600 hover:bg-slate-100">
            {t("nav_map")}
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-brand-600 px-3 py-1.5 font-medium text-white hover:bg-brand-700"
          >
            {t("nav_register")}
          </Link>
          <div className="ml-1 flex overflow-hidden rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setLang("ko")}
              className={lang === "ko" ? "bg-brand-600 px-2 py-1 text-white" : "px-2 py-1 text-slate-500"}
            >
              KO
            </button>
            <button
              onClick={() => setLang("en")}
              className={lang === "en" ? "bg-brand-600 px-2 py-1 text-white" : "px-2 py-1 text-slate-500"}
            >
              EN
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
