export type Lang = "ko" | "en";

export const CATEGORIES = [
  "chatbot",
  "marketing",
  "dev-tool",
  "productivity",
  "analytics",
  "no-code",
  "research",
  "vertical-agent",
  "other",
] as const;

export const STAGES = ["idea", "pre-mvp", "mvp", "growth"] as const;
export const REGIONS = ["kr", "us", "global"] as const;
export const PRICING = ["free", "freemium", "paid", "contact"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Stage = (typeof STAGES)[number];
export type Region = (typeof REGIONS)[number];

export const CATEGORY_LABELS: Record<string, { ko: string; en: string }> = {
  chatbot: { ko: "챗봇", en: "Chatbot" },
  marketing: { ko: "마케팅", en: "Marketing" },
  "dev-tool": { ko: "개발도구", en: "Dev Tool" },
  productivity: { ko: "생산성", en: "Productivity" },
  analytics: { ko: "분석", en: "Analytics" },
  "no-code": { ko: "노코드", en: "No-Code" },
  research: { ko: "리서치", en: "Research" },
  "vertical-agent": { ko: "버티컬 에이전트", en: "Vertical Agent" },
  other: { ko: "기타", en: "Other" },
};

export const STAGE_LABELS: Record<string, { ko: string; en: string }> = {
  idea: { ko: "아이디어", en: "Idea" },
  "pre-mvp": { ko: "pre-MVP", en: "Pre-MVP" },
  mvp: { ko: "MVP", en: "MVP" },
  growth: { ko: "성장기", en: "Growth" },
};

export const REGION_LABELS: Record<string, { ko: string; en: string }> = {
  kr: { ko: "한국", en: "Korea" },
  us: { ko: "미국", en: "USA" },
  global: { ko: "글로벌", en: "Global" },
};
