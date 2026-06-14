// 동적 펜 로고: 펜촉이 살짝 흔들리고, 워드마크 아래 밑줄이 직접 그려졌다 사라지는 루프.
export function Logo({ label }: { label: string }) {
  return (
    <span className="plogo">
      <style>{`
        .plogo{display:inline-flex;align-items:center;gap:9px}
        .plogo-nib{width:30px;height:30px;flex:none;transform-origin:50% 90%;animation:plogo-wiggle 2.8s ease-in-out infinite}
        .plogo-text{position:relative;font-family:var(--font-hand,'Gaegu',cursive);font-weight:700;
          font-size:23px;line-height:1;color:#1a2c4e;padding-bottom:7px;white-space:nowrap}
        .plogo-underline{position:absolute;left:0;right:0;bottom:0;width:100%;height:9px;overflow:visible}
        .plogo-underline path{fill:none;stroke:#243b66;stroke-width:2.4;stroke-linecap:round;
          stroke-dasharray:150;stroke-dashoffset:150;animation:plogo-draw 4.5s ease-in-out infinite}
        @keyframes plogo-draw{
          0%{stroke-dashoffset:150}
          40%{stroke-dashoffset:0}
          78%{stroke-dashoffset:0}
          100%{stroke-dashoffset:150}
        }
        @keyframes plogo-wiggle{
          0%,100%{transform:rotate(-7deg)}
          50%{transform:rotate(6deg)}
        }
        @media (prefers-reduced-motion: reduce){
          .plogo-nib{animation:none}
          .plogo-underline path{animation:none;stroke-dashoffset:0}
        }
      `}</style>

      {/* 펜촉(만년필 nib) */}
      <svg className="plogo-nib" viewBox="0 0 32 34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M16 2 C 21 11, 23 20, 17 30 L 15 30 C 9 20, 11 11, 16 2 Z" fill="#243b66" />
        <line x1="16" y1="12" x2="16" y2="26" stroke="#f4ecd8" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="16" cy="12" r="1.9" fill="#f4ecd8" />
        <circle cx="16" cy="31" r="1.5" fill="#c0392b" />
      </svg>

      {/* 손글씨 워드마크 + 직접 그려지는 밑줄 */}
      <span className="plogo-text">
        {label}
        <svg className="plogo-underline" viewBox="0 0 140 9" preserveAspectRatio="none" aria-hidden="true">
          <path d="M2 6 Q 34 1, 68 5 T 138 4" />
        </svg>
      </span>
    </span>
  );
}
