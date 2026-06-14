/**
 * Threads 자동 수집 봇 (공식 API 기반, ToS 준수).
 * ─────────────────────────────────────────────────────────────
 * Meta 공식 Threads API 의 keyword_search 엔드포인트로 "공개" 게시물을
 * 키워드 검색해 서비스/확장 후보를 모읍니다. 무단 스크래핑은 하지 않습니다.
 *
 * ⚠️ 준수 사항
 *  - 반드시 공식 API + 본인 앱의 액세스 토큰 사용.
 *  - threads_keyword_search 권한이 앱 심사로 승인돼야 "전체 공개" 검색이 됩니다.
 *    (미승인 시 검색은 인증 사용자 본인 게시물에만 적용됩니다.)
 *  - 레이트 리밋: 7일 롤링 500 쿼리. 키워드 수를 적게 유지하세요.
 *  - 수집물은 status="pending" 으로 저장 → /admin 에서 사람이 검수·승인.
 *
 * 환경변수
 *  THREADS_ACCESS_TOKEN   (필수) 공식 OAuth 액세스 토큰
 *  THREADS_KEYWORDS       (선택) 쉼표 구분 키워드. 기본값 아래.
 *  THREADS_SEARCH_TYPE    (선택) TOP | RECENT (기본 TOP)
 *  THREADS_API_BASE       (선택) 기본 https://graph.threads.net/v1.0
 *
 * 실행:  THREADS_ACCESS_TOKEN="..." npm run collect:threads
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TOKEN = process.env.THREADS_ACCESS_TOKEN || "";
const BASE = process.env.THREADS_API_BASE || "https://graph.threads.net/v1.0";
const SEARCH_TYPE = process.env.THREADS_SEARCH_TYPE || "TOP";
const KEYWORDS = (process.env.THREADS_KEYWORDS ||
  "AI agent,MCP server,ChatGPT GPT,Claude plugin,AI 서비스,AI 에이전트")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

type ThreadPost = { id: string; text?: string; permalink?: string; username?: string };

function firstUrl(text: string): string | null {
  const m = text.match(/https?:\/\/[^\s)]+/);
  return m ? m[0] : null;
}

// 게시물 텍스트로 종류/플랫폼/카테고리 추정
function classify(text: string): { kind: string; platform: string | null; category: string } {
  const t = text.toLowerCase();
  if (/\bmcp\b|model context protocol/.test(t)) return { kind: "extension", platform: "mcp", category: "dev-tool" };
  if (/chatgpt|\bgpt\b|gpt store/.test(t)) return { kind: "extension", platform: "chatgpt-gpt", category: "other" };
  if (/claude.*(plugin|skill)|claude code/.test(t)) return { kind: "extension", platform: "claude-skill", category: "dev-tool" };
  if (/chat|bot|상담|챗봇/.test(t)) return { kind: "service", platform: null, category: "chatbot" };
  if (/market|광고|마케팅|seo/.test(t)) return { kind: "service", platform: null, category: "marketing" };
  if (/code|dev|개발|api/.test(t)) return { kind: "service", platform: null, category: "dev-tool" };
  return { kind: "service", platform: null, category: "other" };
}

function nameFrom(text: string): string {
  // 첫 줄 또는 첫 문장에서 이름 추정 (해시태그/URL 제거)
  const firstLine = text.split("\n")[0].replace(/https?:\/\/\S+/g, "").replace(/#[^\s]+/g, "").trim();
  return firstLine.slice(0, 80) || "Threads 수집 항목";
}

async function searchKeyword(keyword: string): Promise<ThreadPost[]> {
  const url =
    `${BASE}/keyword_search?q=${encodeURIComponent(keyword)}` +
    `&search_type=${SEARCH_TYPE}` +
    `&fields=id,text,permalink,username,timestamp` +
    `&access_token=${encodeURIComponent(TOKEN)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.warn(`  ⚠️ "${keyword}" 검색 실패 (HTTP ${res.status}). ${body.slice(0, 200)}`);
    return [];
  }
  const json = await res.json().catch(() => ({}));
  return Array.isArray(json?.data) ? (json.data as ThreadPost[]) : [];
}

async function upsert(post: ThreadPost): Promise<boolean> {
  const text = (post.text || "").trim();
  if (!text) return false;
  const sourceUrl = post.permalink || null;

  // 중복 방지: 동일 sourceUrl 있으면 skip
  if (sourceUrl) {
    const exists = await prisma.service.findFirst({ where: { sourceUrl }, select: { id: true } });
    if (exists) return false;
  }

  const { kind, platform, category } = classify(text);
  const name = nameFrom(text);
  const link = firstUrl(text);

  await prisma.service.create({
    data: {
      nameKo: name,
      nameEn: name,
      taglineKo: text.slice(0, 160),
      taglineEn: text.slice(0, 160),
      descKo: text.slice(0, 1000),
      descEn: text.slice(0, 1000),
      category,
      stage: "mvp",
      region: "global",
      kind,
      platform,
      websiteUrl: link && /^https?:\/\//.test(link) ? link : null,
      pricing: null,
      tags: post.username ? `threads,@${post.username}` : "threads",
      source: "collected",
      sourceUrl,
      // 자동 수집 → 반드시 사람이 검수 후 노출
      status: "pending",
    },
  });
  return true;
}

async function main() {
  if (!TOKEN) {
    console.log("⚠️  THREADS_ACCESS_TOKEN 이 없습니다. 공식 토큰을 설정한 뒤 실행하세요.");
    console.log("    1) https://developers.facebook.com 에서 앱 생성 → Threads API 추가");
    console.log("    2) threads_basic (+ 승인 시 threads_keyword_search) 권한으로 액세스 토큰 발급");
    console.log("    3) THREADS_ACCESS_TOKEN=\"...\" npm run collect:threads");
    return;
  }
  console.log(`🤖 Threads 수집 시작 — 키워드 ${KEYWORDS.length}개 (${SEARCH_TYPE})`);
  let added = 0;
  let seen = 0;
  for (const kw of KEYWORDS) {
    const posts = await searchKeyword(kw);
    seen += posts.length;
    for (const p of posts) if (await upsert(p)) added++;
    console.log(`  • "${kw}" → ${posts.length}건 조회`);
  }
  console.log(`✅ 수집 후보 ${seen}건 중 신규 ${added}건 저장(status=pending). /admin 에서 검수하세요.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
