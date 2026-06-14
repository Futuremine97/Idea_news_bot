/**
 * 인기 AI 확장 자동 등록 스크립트 (Claude 플러그인/스킬 · ChatGPT GPT · MCP 서버).
 * 웹/유튜브/커뮤니티에서 널리 쓰이는 것들을 큐레이션해 디렉토리에 시드합니다.
 *
 * 안전성:
 *  - 기존 데이터를 지우지 않습니다(deleteMany 없음).
 *  - 동일 nameEn + kind 가 이미 있으면 건너뜁니다(중복 방지) → 여러 번 실행해도 안전.
 *
 * 실행: DATABASE_URL 설정 후  `npm run seed:ext`
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Ext = {
  nameKo: string; nameEn: string;
  taglineKo: string; taglineEn: string;
  descEn: string;
  category: string;
  platform: string;
  websiteUrl?: string;
  repoUrl?: string;
  featured?: boolean;
};

const REPO_MCP = "https://github.com/modelcontextprotocol/servers";

const extensions: Ext[] = [
  // ── MCP 서버 ──────────────────────────────────────────
  {
    nameKo: "GitHub MCP 서버", nameEn: "GitHub MCP Server",
    taglineKo: "AI가 PR·이슈·코드 검색에 접근하는 공식 MCP", taglineEn: "Official MCP for PRs, issues & code search",
    descEn: "GitHub's official MCP server letting agents read repos, PRs, issues and search code.",
    category: "dev-tool", platform: "mcp", repoUrl: "https://github.com/github/github-mcp-server", featured: true,
  },
  {
    nameKo: "Playwright MCP", nameEn: "Playwright MCP",
    taglineKo: "브라우저를 자동 조작하는 MS 공식 MCP", taglineEn: "Microsoft's browser-automation MCP",
    descEn: "Lets LLMs drive a real browser via accessibility snapshots. Maintained by Microsoft.",
    category: "dev-tool", platform: "mcp", repoUrl: "https://github.com/microsoft/playwright-mcp", featured: true,
  },
  {
    nameKo: "Filesystem MCP", nameEn: "Filesystem MCP",
    taglineKo: "안전한 파일 읽기/쓰기 레퍼런스 서버", taglineEn: "Secure file operations reference server",
    descEn: "Official reference MCP server for controlled local file access.",
    category: "dev-tool", platform: "mcp", repoUrl: REPO_MCP,
  },
  {
    nameKo: "Fetch MCP", nameEn: "Fetch MCP",
    taglineKo: "웹 페이지를 가져와 마크다운으로", taglineEn: "Fetch & convert web pages for LLMs",
    descEn: "Official reference server that fetches URLs and converts content for the model.",
    category: "research", platform: "mcp", repoUrl: REPO_MCP,
  },
  {
    nameKo: "Memory MCP", nameEn: "Memory MCP",
    taglineKo: "지식 그래프 기반 영속 메모리", taglineEn: "Knowledge-graph persistent memory",
    descEn: "Official reference server giving agents long-term memory via a knowledge graph.",
    category: "productivity", platform: "mcp", repoUrl: REPO_MCP,
  },
  {
    nameKo: "Sequential Thinking MCP", nameEn: "Sequential Thinking MCP",
    taglineKo: "단계적 추론을 돕는 사고 시퀀스", taglineEn: "Structured step-by-step reasoning",
    descEn: "Official reference server for dynamic, reflective multi-step problem solving.",
    category: "other", platform: "mcp", repoUrl: REPO_MCP,
  },
  {
    nameKo: "Notion MCP", nameEn: "Notion MCP",
    taglineKo: "노션 워크스페이스를 읽고 쓰기", taglineEn: "Read & write your Notion workspace",
    descEn: "Notion's official MCP server for pages, databases and search.",
    category: "productivity", platform: "mcp", repoUrl: "https://github.com/makenotion/notion-mcp-server",
  },
  {
    nameKo: "Supabase MCP", nameEn: "Supabase MCP",
    taglineKo: "Postgres·엣지함수에 컨텍스트 연결", taglineEn: "Bridge Postgres & edge functions to LLMs",
    descEn: "Community MCP server to query Supabase Postgres and manage projects.",
    category: "dev-tool", platform: "mcp", repoUrl: "https://github.com/supabase-community/supabase-mcp",
  },
  {
    nameKo: "Exa MCP", nameEn: "Exa MCP",
    taglineKo: "가장 많이 쓰이는 웹 검색 MCP", taglineEn: "The most-used web search MCP",
    descEn: "Exa's MCP server for high-quality semantic web search inside agents.",
    category: "research", platform: "mcp", repoUrl: "https://github.com/exa-labs/exa-mcp-server", featured: true,
  },
  {
    nameKo: "Context7 MCP", nameEn: "Context7 MCP",
    taglineKo: "최신 라이브러리 문서를 프롬프트에", taglineEn: "Up-to-date library docs in your prompt",
    descEn: "Upstash's MCP server injecting current, version-accurate docs for coding.",
    category: "dev-tool", platform: "mcp", repoUrl: "https://github.com/upstash/context7",
  },
  {
    nameKo: "Stripe MCP", nameEn: "Stripe MCP",
    taglineKo: "결제·구독을 다루는 공식 도구", taglineEn: "Payments & billing toolkit",
    descEn: "Stripe's agent toolkit / MCP for payments, customers and subscriptions.",
    category: "dev-tool", platform: "mcp", repoUrl: "https://github.com/stripe/agent-toolkit",
  },
  {
    nameKo: "Sentry MCP", nameEn: "Sentry MCP",
    taglineKo: "에러·이슈를 AI로 분석", taglineEn: "Triage errors & issues with AI",
    descEn: "Sentry's official MCP server to inspect issues, events and traces.",
    category: "dev-tool", platform: "mcp", repoUrl: "https://github.com/getsentry/sentry-mcp",
  },
  {
    nameKo: "Slack MCP", nameEn: "Slack MCP",
    taglineKo: "슬랙 채널·메시지 연동", taglineEn: "Read & post Slack messages",
    descEn: "Reference MCP server for Slack channels and messaging.",
    category: "productivity", platform: "mcp", repoUrl: REPO_MCP,
  },

  // ── ChatGPT GPT ──────────────────────────────────────
  {
    nameKo: "Consensus", nameEn: "Consensus",
    taglineKo: "2억 편 논문 기반 연구 어시스턴트", taglineEn: "Research answers from 200M papers",
    descEn: "Top-ranked research GPT giving science-based answers from academic papers.",
    category: "research", platform: "chatgpt-gpt", websiteUrl: "https://consensus.app", featured: true,
  },
  {
    nameKo: "Canva", nameEn: "Canva",
    taglineKo: "대화로 디자인·콘텐츠 생성", taglineEn: "Design & content ideas in chat",
    descEn: "Generate presentations, social posts and graphics ideas, then open in Canva.",
    category: "no-code", platform: "chatgpt-gpt", websiteUrl: "https://www.canva.com", featured: true,
  },
  {
    nameKo: "Scholar GPT", nameEn: "Scholar GPT",
    taglineKo: "문헌 리뷰·학술 검색 GPT", taglineEn: "Literature review & academic search",
    descEn: "Popular GPT for academic literature review and citation-backed answers.",
    category: "research", platform: "chatgpt-gpt",
  },
  {
    nameKo: "Write For Me", nameEn: "Write For Me",
    taglineKo: "분량·톤 맞춤 글쓰기 GPT", taglineEn: "Tailored writing with word-count control",
    descEn: "One of the most-used writing GPTs for high-quality, audience-tuned content.",
    category: "marketing", platform: "chatgpt-gpt", websiteUrl: "https://chatgpt.com/g/g-iBnrrI5W0-write-for-me",
  },
  {
    nameKo: "Code Copilot", nameEn: "Code Copilot",
    taglineKo: "코딩 보조 GPT", taglineEn: "Coding assistant GPT",
    descEn: "Popular GPT Store assistant for writing, reviewing and debugging code.",
    category: "dev-tool", platform: "chatgpt-gpt",
  },
  {
    nameKo: "Diagrams: Show Me", nameEn: "Diagrams: Show Me",
    taglineKo: "설명을 다이어그램으로", taglineEn: "Turn explanations into diagrams",
    descEn: "Generates flowcharts and diagrams from natural-language descriptions.",
    category: "productivity", platform: "chatgpt-gpt",
  },
  {
    nameKo: "Video GPT by VEED", nameEn: "Video GPT by VEED",
    taglineKo: "AI 비디오 생성", taglineEn: "Generate videos with AI",
    descEn: "Create short videos and clips from prompts, powered by VEED.",
    category: "marketing", platform: "chatgpt-gpt", websiteUrl: "https://www.veed.io",
  },
  {
    nameKo: "Data Analyst", nameEn: "Data Analyst",
    taglineKo: "파일 업로드로 데이터 분석", taglineEn: "Analyze uploaded data & charts",
    descEn: "OpenAI's GPT for analyzing spreadsheets/CSVs and producing charts.",
    category: "analytics", platform: "chatgpt-gpt",
  },

  // ── Claude 플러그인 / 스킬 ────────────────────────────
  {
    nameKo: "Anthropic Agent Skills", nameEn: "Anthropic Agent Skills",
    taglineKo: "docx·pptx·pdf·xlsx 등 공식 스킬", taglineEn: "Official skills: docx, pptx, pdf, xlsx",
    descEn: "Anthropic's public Agent Skills repo — document creation and more.",
    category: "productivity", platform: "claude-skill", repoUrl: "https://github.com/anthropics/skills", featured: true,
  },
  {
    nameKo: "Claude 공식 플러그인", nameEn: "Claude Official Plugins",
    taglineKo: "Anthropic 공식 플러그인 마켓플레이스", taglineEn: "Anthropic's official plugin marketplace",
    descEn: "Curated official plugins bundling skills, agents and MCP servers for Claude Code.",
    category: "dev-tool", platform: "claude-plugin", repoUrl: "https://github.com/anthropics/claude-plugins-official",
  },
  {
    nameKo: "PR 리뷰 툴킷", nameEn: "PR Review Toolkit",
    taglineKo: "풀리퀘스트 자동 리뷰 플러그인", taglineEn: "Automated pull-request review plugin",
    descEn: "Official Claude Code plugin for structured PR reviews.",
    category: "dev-tool", platform: "claude-plugin", repoUrl: "https://github.com/anthropics/claude-plugins-official",
  },
  {
    nameKo: "Commit Commands", nameEn: "Commit Commands",
    taglineKo: "깔끔한 깃 커밋 워크플로", taglineEn: "Clean Git commit workflows",
    descEn: "Official Claude Code plugin for guided, consistent commits.",
    category: "dev-tool", platform: "claude-plugin", repoUrl: "https://github.com/anthropics/claude-plugins-official",
  },
  {
    nameKo: "Agent SDK Dev", nameEn: "Agent SDK Dev",
    taglineKo: "Claude Agent SDK 개발 도우미", taglineEn: "Build with the Claude Agent SDK",
    descEn: "Official plugin to scaffold and build agents on the Claude Agent SDK.",
    category: "dev-tool", platform: "claude-plugin", repoUrl: "https://github.com/anthropics/claude-plugins-official",
  },
  {
    nameKo: "Qodo Skills", nameEn: "Qodo Skills",
    taglineKo: "코드 품질·테스트·보안 스킬", taglineEn: "Code quality, testing & security skills",
    descEn: "Reusable agent skills for code quality checks, testing and security scanning.",
    category: "dev-tool", platform: "claude-skill", websiteUrl: "https://www.qodo.ai",
  },
  {
    nameKo: "Mapbox 스킬·MCP", nameEn: "Mapbox Skills & MCP",
    taglineKo: "위치 기반 앱용 지오 도구", taglineEn: "Geospatial tools for location apps",
    descEn: "Mapbox skills and MCP server for maps, geocoding and style management.",
    category: "vertical-agent", platform: "claude-skill", websiteUrl: "https://www.mapbox.com",
  },
];

async function main() {
  console.log(`🌐 인기 확장 ${extensions.length}건 등록 시작...`);
  let added = 0;
  let skipped = 0;
  for (const e of extensions) {
    const exists = await prisma.service.findFirst({
      where: { nameEn: e.nameEn, kind: "extension" },
      select: { id: true },
    });
    if (exists) {
      skipped++;
      continue;
    }
    await prisma.service.create({
      data: {
        nameKo: e.nameKo,
        nameEn: e.nameEn,
        taglineKo: e.taglineKo,
        taglineEn: e.taglineEn,
        descKo: e.descEn, // 간단히 동일 설명 사용(원하면 번역 보강)
        descEn: e.descEn,
        category: e.category,
        stage: "growth",
        region: "global",
        kind: "extension",
        platform: e.platform,
        websiteUrl: e.websiteUrl ?? null,
        repoUrl: e.repoUrl ?? null,
        pricing: "free",
        tags: [e.platform, e.category].join(","),
        featured: !!e.featured,
        source: "collected",
        status: "approved",
      },
    });
    added++;
  }
  console.log(`✅ 신규 ${added}건 등록, 중복 ${skipped}건 건너뜀.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
