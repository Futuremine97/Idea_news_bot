"use client";

import { useState } from "react";
import { useLang } from "./LangProvider";

declare global {
  interface Window {
    Kakao?: any;
  }
}

/**
 * 공유 버튼 모음 (KR/US 채널).
 * - 링크 복사 / 모바일 네이티브 공유
 * - 카카오톡 (Kakao JS SDK, NEXT_PUBLIC_KAKAO_JS_KEY 필요 → 없으면 링크 복사로 폴백)
 * - 인스타그램 (웹 공유 URL이 없어 best-effort: 모바일 네이티브 공유 / 링크 복사 후 안내)
 * - X / LinkedIn / Facebook (키 불필요 인텐트 URL)
 */
function loadKakao(): Promise<any | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(null);
    const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!key) return resolve(null);
    const finish = () => {
      try {
        if (window.Kakao && !window.Kakao.isInitialized()) window.Kakao.init(key);
        resolve(window.Kakao ?? null);
      } catch {
        resolve(null);
      }
    };
    if (window.Kakao) return finish();
    const existing = document.getElementById("kakao-sdk");
    if (existing) {
      existing.addEventListener("load", finish);
      return;
    }
    const s = document.createElement("script");
    s.id = "kakao-sdk";
    s.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
    s.onload = finish;
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
}

export function ShareButtons({ title }: { title: string }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const [tip, setTip] = useState("");

  const url = typeof window !== "undefined" ? window.location.href : "";
  const enc = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      return true;
    } catch {
      return false;
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* cancelled */
      }
    } else {
      copy();
    }
  };

  const shareKakao = async () => {
    const Kakao = await loadKakao();
    if (Kakao?.Share) {
      try {
        Kakao.Share.sendDefault({
          objectType: "text",
          text: title,
          link: { mobileWebUrl: url, webUrl: url },
        });
        return;
      } catch {
        /* fall through */
      }
    }
    // 키 미설정/실패 → 링크 복사 폴백
    await copy();
    setTip(t("share_kakao_tip"));
    setTimeout(() => setTip(""), 2500);
  };

  const shareInstagram = async () => {
    // 인스타그램은 웹에서 링크를 직접 공유하는 URL이 없음.
    // 모바일이면 네이티브 공유 시트(인스타 선택 가능), 아니면 링크 복사 + 안내.
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    await copy();
    setTip(t("share_ig_tip"));
    setTimeout(() => setTip(""), 3000);
  };

  const btn = "rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={copy} className={btn}>
          {copied ? `✓ ${t("share_copied")}` : `🔗 ${t("share_copy")}`}
        </button>
        <button onClick={nativeShare} className={btn}>
          ↗ {t("share_native")}
        </button>
        <button
          onClick={shareKakao}
          className="rounded-lg border border-amber-300 bg-amber-300 px-3 py-1.5 text-sm font-medium text-[#3c1e1e] hover:bg-amber-400"
        >
          카카오톡
        </button>
        <button
          onClick={shareInstagram}
          className="rounded-lg border-0 bg-gradient-to-r from-fuchsia-500 to-orange-400 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          Instagram
        </button>
        <a className={btn} href={`https://twitter.com/intent/tweet?text=${text}&url=${enc}`} target="_blank" rel="noopener noreferrer">
          X
        </a>
        <a className={btn} href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc}`} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <a className={btn} href={`https://www.facebook.com/sharer/sharer.php?u=${enc}`} target="_blank" rel="noopener noreferrer">
          Facebook
        </a>
      </div>
      {tip && <p className="text-xs text-slate-500">{tip}</p>}
    </div>
  );
}
