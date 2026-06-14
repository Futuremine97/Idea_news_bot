"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "./LangProvider";

const TIPS: Record<string, string[]> = {
  ko: [
    "새 AI 서비스를 무료로 등록해보세요! 🚀",
    "마음에 들면 ▲추천을 눌러주세요.",
    "가볼 곳 / 저장 / 가봤음을 표시해보세요 📍",
    "확장/도구 탭에서 플러그인·MCP도 둘러보세요.",
    "리뷰를 남기면 다른 사람에게 큰 도움이 돼요 ⭐",
  ],
  en: [
    "List your AI service for free! 🚀",
    "Like it? Hit the ▲ upvote.",
    "Mark Going / Saved / Been there 📍",
    "Check the Extensions tab for plugins & MCP.",
    "Leave a review to help others ⭐",
  ],
};

export function Mascot() {
  const { lang } = useLang();
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(40);
  const dirRef = useRef(1);
  const walkingRef = useRef(true);
  const reducedRef = useRef(false);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 초기화 (localStorage / reduced-motion)
  useEffect(() => {
    if (localStorage.getItem("mascotHidden") === "1") {
      setHidden(true);
      return;
    }
    reducedRef.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    xRef.current = Math.min(Math.max(window.innerWidth * 0.15, 24), window.innerWidth - 90);
    setReady(true);
  }, []);

  // 걷기 애니메이션 루프 (DOM 직접 갱신 → 리렌더 없음)
  useEffect(() => {
    if (!ready || hidden) return;
    const el = wrapRef.current;
    const flip = flipRef.current;
    if (!el) return;

    el.style.left = `${xRef.current}px`;

    if (reducedRef.current) {
      el.classList.remove("hubi-walking");
      return; // 모션 최소화 모드: 정지 상태로 표시
    }

    let raf = 0;
    let last = performance.now();
    let pauseUntil = 0;
    const speed = 46; // px/초

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (now >= pauseUntil) {
        if (!walkingRef.current) {
          walkingRef.current = true;
          el.classList.add("hubi-walking");
        }
        let nx = xRef.current + dirRef.current * speed * dt;
        const max = window.innerWidth - 78;
        if (nx >= max) {
          nx = max;
          dirRef.current = -1;
        } else if (nx <= 8) {
          nx = 8;
          dirRef.current = 1;
        }
        xRef.current = nx;
        el.style.left = `${nx}px`;
        if (flip) flip.style.transform = `scaleX(${dirRef.current})`;

        // 가끔 멈춰서 쉬기
        if (Math.random() < 0.004) {
          pauseUntil = now + 1000 + Math.random() * 1800;
          walkingRef.current = false;
          el.classList.remove("hubi-walking");
        }
      }
      raf = requestAnimationFrame(tick);
    };
    el.classList.add("hubi-walking");
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready, hidden]);

  const onPet = () => {
    const el = wrapRef.current;
    if (el && !reducedRef.current) {
      el.classList.add("hubi-hop");
      setTimeout(() => el.classList.remove("hubi-hop"), 650);
    }
    const tips = TIPS[lang] ?? TIPS.ko;
    setBubble(tips[Math.floor(Math.random() * tips.length)]);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), 4000);
  };

  const dismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem("mascotHidden", "1");
    setHidden(true);
  };

  if (hidden || !ready) return null;

  return (
    <div
      ref={wrapRef}
      className="hubi-wrap"
      role="img"
      aria-label="AI 서비스 허브 마스코트 허비"
      style={{ left: xRef.current }}
    >
      <style>{`
        .hubi-wrap{position:fixed;bottom:10px;z-index:40;width:64px;height:84px;pointer-events:none;will-change:left}
        .hubi-pet{pointer-events:auto;cursor:pointer;position:relative;width:64px;height:84px}
        .hubi-flip{position:absolute;inset:0;transform-origin:center bottom}
        .hubi-body{animation:none}
        .hubi-walking .hubi-body{animation:hubi-bob .5s ease-in-out infinite}
        .hubi-walking .hubi-legL{animation:hubi-legL .5s ease-in-out infinite}
        .hubi-walking .hubi-legR{animation:hubi-legR .5s ease-in-out infinite}
        .hubi-legL,.hubi-legR{transform-origin:center top}
        .hubi-hop .hubi-pet{animation:hubi-hop .65s ease-out}
        .hubi-x{position:absolute;top:-2px;right:-4px;width:16px;height:16px;border-radius:9999px;
          background:#e2e8f0;color:#475569;font-size:11px;line-height:16px;text-align:center;
          pointer-events:auto;cursor:pointer;opacity:0;transition:opacity .15s;border:none}
        .hubi-pet:hover .hubi-x{opacity:1}
        .hubi-bubble{position:absolute;bottom:78px;left:50%;transform:translateX(-50%);white-space:nowrap;
          background:#fff;border:1px solid #e2e8f0;box-shadow:0 4px 14px rgba(0,0,0,.08);
          border-radius:12px;padding:6px 10px;font-size:12px;color:#334155;pointer-events:none}
        .hubi-bubble:after{content:"";position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);
          width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid #fff}
        @keyframes hubi-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        @keyframes hubi-legL{0%,100%{transform:rotate(20deg)}50%{transform:rotate(-20deg)}}
        @keyframes hubi-legR{0%,100%{transform:rotate(-20deg)}50%{transform:rotate(20deg)}}
        @keyframes hubi-hop{0%{transform:translateY(0)}30%{transform:translateY(-24px)}55%{transform:translateY(0)}72%{transform:translateY(-9px)}100%{transform:translateY(0)}}
      `}</style>

      {bubble && <div className="hubi-bubble">{bubble}</div>}

      <div className="hubi-flip" ref={flipRef}>
        <div className="hubi-pet" onClick={onPet}>
          <button className="hubi-x" onClick={dismiss} aria-label="close">×</button>
          <svg viewBox="0 0 64 84" width="64" height="84" xmlns="http://www.w3.org/2000/svg">
            {/* 그림자 */}
            <ellipse cx="32" cy="80" rx="18" ry="4" fill="#0f172a" opacity="0.12" />
            {/* 다리 */}
            <g className="hubi-legL">
              <rect x="22" y="58" width="7" height="16" rx="3.5" fill="#243b66" />
              <rect x="19" y="71" width="13" height="6" rx="3" fill="#16223b" />
            </g>
            <g className="hubi-legR">
              <rect x="35" y="58" width="7" height="16" rx="3.5" fill="#243b66" />
              <rect x="32" y="71" width="13" height="6" rx="3" fill="#16223b" />
            </g>
            {/* 몸체 */}
            <g className="hubi-body">
              {/* 안테나 */}
              <line x1="32" y1="6" x2="32" y2="16" stroke="#2f4a7a" strokeWidth="2.5" />
              <circle cx="32" cy="5" r="4" fill="#f59e0b" />
              {/* 머리/몸통 */}
              <rect x="12" y="14" width="40" height="46" rx="16" fill="#2f4a7a" />
              <rect x="12" y="14" width="40" height="46" rx="16" fill="url(#hubi-g)" opacity="0.25" />
              {/* 얼굴 패널 */}
              <rect x="18" y="24" width="28" height="20" rx="10" fill="#1e1b4b" />
              {/* 눈 */}
              <circle cx="26" cy="34" r="3.4" fill="#a5f3fc" />
              <circle cx="38" cy="34" r="3.4" fill="#a5f3fc" />
              <circle cx="27" cy="33" r="1.1" fill="#fff" />
              <circle cx="39" cy="33" r="1.1" fill="#fff" />
              {/* 미소 */}
              <path d="M27 39 Q32 43 37 39" stroke="#a5f3fc" strokeWidth="2" fill="none" strokeLinecap="round" />
              {/* 팔 */}
              <rect x="6" y="32" width="8" height="7" rx="3.5" fill="#243b66" />
              <rect x="50" y="32" width="8" height="7" rx="3.5" fill="#243b66" />
              {/* 가슴 표시 */}
              <text x="32" y="55" textAnchor="middle" fontSize="8" fontWeight="700" fill="#e0e7ff">AI</text>
            </g>
            <defs>
              <linearGradient id="hubi-g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
