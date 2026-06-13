/**
 * 자동 수집 스크립트 (스캐폴드)
 * ────────────────────────────────────────────────────────────
 * 공개 웹/디렉토리에서 AI 서비스 정보를 수집해 DB에 "pending" 상태로 저장합니다.
 *
 * ⚠️ 중요 (법적/기술적 주의사항)
 *  - Instagram 등 대부분의 SNS는 자동 스크래핑을 약관(ToS)으로 금지합니다.
 *    공식 API(예: Instagram Graph API) 또는 사용자가 직접 제출한 링크만 사용하세요.
 *  - robots.txt 와 각 사이트 약관을 반드시 준수하세요.
 *  - 수집 데이터는 status="pending" 으로 저장 후 사람이 검수(approve)하는 것을 권장합니다.
 *
 * 이 파일은 "연결 지점"만 제공하는 골격입니다. 실제 소스 연동은
 * fetchFromSource() 안에 각자 구현하세요. (RSS, 공개 JSON API, 공식 SNS API 등)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type RawItem = {
  name: string;
  tagline: string;
  desc?: string;
  category?: string;
  region?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  sourceUrl?: string;
};

/**
 * 실제 데이터 소스를 여기에 연결하세요.
 * 예시: 공개 런치 디렉토리의 JSON 엔드포인트, RSS 피드, 공식 SNS API 등.
 * 아래는 형식 예시를 위한 더미 반환입니다.
 */
async function fetchFromSource(): Promise<RawItem[]> {
  // 예) const res = await fetch("https://your-allowed-source/feed.json");
  //     const json = await res.json();
  //     return json.items.map(normalize);
  console.log("⚠️  fetchFromSource()는 아직 실제 소스에 연결되지 않았습니다.");
  console.log("    공식 API/허용된 피드를 연결한 뒤 다시 실행하세요.");
  return [];
}

function guessCategory(text: string): string {
  const t = text.toLowerCase();
  if (/chat|bot|상담|챗/.test(t)) return "chatbot";
  if (/market|광고|마케팅|seo/.test(t)) return "marketing";
  if (/code|dev|개발|api/.test(t)) return "dev-tool";
  if (/data|analy|분석/.test(t)) return "analytics";
  if (/no.?code|노코드|builder/.test(t)) return "no-code";
  if (/research|논문|리서치/.test(t)) return "research";
  return "other";
}

async function upsertItem(item: RawItem) {
  const category = item.category || guessCategory(`${item.name} ${item.tagline} ${item.desc ?? ""}`);
  // 중복 방지: 동일 websiteUrl 이 이미 있으면 skip
  if (item.websiteUrl) {
    const exists = await prisma.service.findFirst({ where: { websiteUrl: item.websiteUrl } });
    if (exists) return false;
  }
  await prisma.service.create({
    data: {
      nameKo: item.name,
      nameEn: item.name,
      taglineKo: item.tagline,
      taglineEn: item.tagline,
      descKo: item.desc || "",
      descEn: item.desc || "",
      category,
      stage: "mvp",
      region: item.region || "global",
      websiteUrl: item.websiteUrl || null,
      instagramUrl: item.instagramUrl || null,
      source: "collected",
      sourceUrl: item.sourceUrl || null,
      // 자동 수집 데이터는 검수 전이므로 비공개 상태로 저장
      status: "pending",
    },
  });
  return true;
}

async function main() {
  console.log("🤖 자동 수집 시작...");
  const items = await fetchFromSource();
  let added = 0;
  for (const item of items) {
    if (await upsertItem(item)) added++;
  }
  console.log(`✅ ${added}건 추가됨 (status=pending, 검수 필요). 수집 후보: ${items.length}건`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
