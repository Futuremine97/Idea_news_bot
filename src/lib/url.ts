/**
 * 외부 URL 안전 처리.
 * javascript:, data:, vbscript: 등 위험한 스킴을 차단하고
 * http/https 만 허용한다. (저장 시 & 렌더링 시 모두 사용)
 */
export function safeExternalUrl(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
    return null;
  } catch {
    return null;
  }
}
