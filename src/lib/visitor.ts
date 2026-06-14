"use client";

// 로그인 없는 가벼운 방문자 신원 (브라우저 localStorage 기반).
// 주의: 진짜 인증이 아니라 식별용. 위변조 가능하므로 민감 데이터에 쓰지 말 것.

const ID_KEY = "visitorId";
const NICK_KEY = "visitorNick";

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(ID_KEY);
  if (!id) {
    id =
      (crypto && "randomUUID" in crypto && crypto.randomUUID()) ||
      `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(ID_KEY, id);
  }
  return id;
}

export function getNickname(): string {
  if (typeof window === "undefined") return "";
  let n = localStorage.getItem(NICK_KEY);
  if (!n) {
    n = `게스트${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem(NICK_KEY, n);
  }
  return n;
}

export function setNickname(name: string) {
  if (typeof window === "undefined") return;
  const clean = name.trim().slice(0, 30) || getNickname();
  localStorage.setItem(NICK_KEY, clean);
}
