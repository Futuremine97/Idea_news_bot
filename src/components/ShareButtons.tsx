"use client";

import { useState } from "react";

/**
 * 키 없이 동작하는 공유 버튼 모음.
 * - 링크 복사 (전 사용자)
 * - 모바일 네이티브 공유 (Web Share API)
 * - X(Twitter) / LinkedIn / Facebook 인텐트 URL
 * KR/US 사용자 모두 익숙한 채널 조합.
 */
export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = encodeURIComponent(title);
  const enc = encodeURIComponent(url);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  };

  const btn =
    "rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={copy} className={btn}>
        {copied ? "✓ 복사됨" : "🔗 링크 복사"}
      </button>
      <button onClick={nativeShare} className={btn}>
        ↗ 공유
      </button>
      <a
        className={btn}
        href={`https://twitter.com/intent/tweet?text=${text}&url=${enc}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        X
      </a>
      <a
        className={btn}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        LinkedIn
      </a>
      <a
        className={btn}
        href={`https://www.facebook.com/sharer/sharer.php?u=${enc}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Facebook
      </a>
    </div>
  );
}
