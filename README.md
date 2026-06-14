# AI 서비스 허브 (AI Service Hub)

한국·미국·전세계의 **AI 에이전트/서비스**(특히 MVP·pre-MVP 단계)를 모아 보여주고, **누구나 직접 등록해 홍보**할 수 있는 디렉토리 웹사이트입니다. 자영업자는 매장 위치를 **네이버/구글 지도**에 함께 등록할 수 있습니다.

## 주요 기능

- 🗂 **디렉토리** — 카테고리/단계(idea·pre-MVP·MVP·growth)/지역(한국·미국·글로벌) 필터, 키워드·태그 검색
- ✍️ **누구나 등록** — 로그인 없이 폼으로 서비스 등록 (자영업자 포함)
- 📍 **지도 연동** — 네이버 지도 ↔ 구글 지도 전환, 등록된 오프라인 매장 핀 표시
- 🌐 **한/영 i18n** — 우측 상단 KO/EN 토글
- 🤖 **자동 수집 스캐폴드** — 공개 소스에서 정보를 모아 검수 대기(pending) 상태로 저장하는 스크립트 골격
- ▲ **추천(upvote) · 조회수**

## 기술 스택

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma · SQLite(로컬, 운영 시 PostgreSQL 권장)

## 빠른 시작

```bash
# 1) 의존성 설치
npm install

# 2) 환경변수 설정
cp .env.example .env
#   .env 에서 지도 API 키를 채우면 지도가 표시됩니다 (없어도 동작은 합니다).

# 3) DB 생성 + 샘플 데이터 시드
npm run db:push
npm run db:seed

# 4) 개발 서버
npm run dev
# → http://localhost:3000
```

## 페이지

| 경로 | 설명 |
|------|------|
| `/` | 디렉토리 홈 — 일반 AI 서비스 (필터·검색·정렬) |
| `/tools` | 확장/도구 탭 — Claude 플러그인·스킬, ChatGPT GPT·스킬, MCP 서버 |
| `/services/[id]` | 서비스 상세 (+ 매장 지도, 공유 버튼, OG 메타) |
| `/register` | 등록 폼 (서비스 / 확장 선택, 주소→좌표 지오코딩) |
| `/map` | 지도 뷰 (오프라인 매장) |
| `/admin` | 관리자 검수 패널 (ADMIN_TOKEN 필요) |
| `/lists/[visitorId]` | 사용자별 공개 목록 (가볼 곳/저장/가봤음) |
| `/manage/[id]` | 등록자(소유자) 대시보드 — 통계·수정·삭제 (ownerToken 필요) |
| `/sitemap.xml`, `/robots.txt` | SEO (자동 생성) |

## 리뷰 & 별점

각 서비스 상세 페이지에서 별점(1~5) + 후기 작성 가능. 평균 별점은 카드·상세에 표시됩니다. (집계는 `ratingSum`/`ratingCount`로 비정규화 저장)

## 등록자(소유자) 관리 — `/manage/[id]`

등록 시 비공개 **관리 토큰(ownerToken)** 이 자동 발급되어 등록 완료 후 관리 페이지로 이동합니다. 소유자는 이 링크(`/manage/[id]?t=토큰`)로 언제든 돌아와 **조회수·추천·평균별점·리뷰 수·체크인(가볼곳/저장/가봤음)** 통계를 보고, 정보를 **수정/삭제**할 수 있습니다. 토큰은 공개 API 응답에서 제거되며, 수정/삭제는 토큰(또는 ADMIN_TOKEN) 검증을 거칩니다. `status`/`featured` 는 소유자가 바꿀 수 없습니다(관리자 전용).

## 가볼 곳 / 저장 / 가봤음 (소셜)

각 서비스에서 "가볼 곳(going) · 저장(saved) · 가봤음(went)"을 표시할 수 있고, **다른 사용자에게 공개**됩니다. 로그인 없이 브라우저 `visitorId`(localStorage) + 닉네임으로 식별합니다(가벼운 신원이라 위변조 가능 — 민감 용도엔 부적합). 닉네임을 누르면 그 사용자의 공개 목록(`/lists/[visitorId]`)을 볼 수 있습니다.

## 관리자 검수 (`/admin`)

서버 환경변수 `ADMIN_TOKEN` 을 설정하면 검수 모드가 켜집니다: 신규 등록이 `pending` 으로 들어가고, `/admin` 에서 토큰 입력 후 승인/거부/추천(featured)/삭제할 수 있습니다. `ADMIN_TOKEN` 미설정 시에는 등록이 즉시 노출되는 데모 모드입니다.

## API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/services?q=&category=&stage=&region=&localOnly=` | 목록·검색 |
| POST | `/api/services` | 등록 |
| GET | `/api/services/[id]` | 상세 (조회수 +1) |
| POST | `/api/services/[id]` `{action:"upvote"}` | 추천 |

## 지도 API 키 발급

- **네이버 지도**: [NAVER Cloud Platform](https://www.ncloud.com) → AI·NAVER API → Maps → `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`
- **구글 지도**: [Google Cloud Console](https://console.cloud.google.com) → Maps JavaScript API → `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

키가 없으면 지도 자리에 안내 박스와 좌표 목록이 표시됩니다.

## 자동 수집에 대한 중요 안내

`npm run collect` 는 `scripts/collect.ts` 골격을 실행합니다. **Instagram 등 SNS의 무단 스크래핑은 약관 위반**이 될 수 있으므로, 반드시 다음을 지키세요.

- 공식 API(예: Instagram Graph API) 또는 사용자가 직접 제출한 링크/허용된 공개 피드만 사용
- 각 사이트의 `robots.txt`·이용약관 준수
- 수집 데이터는 `status="pending"` 으로 저장 → **사람이 검수 후 승인**

실제 소스 연동은 `scripts/collect.ts` 의 `fetchFromSource()` 안에 구현하세요.

## 배포

Vercel + 무료 PostgreSQL(Neon)로 배포하는 방법은 **[DEPLOY.md](./DEPLOY.md)** 참고. (서버리스에서는 SQLite가 보존되지 않으므로 배포 시 Postgres로 전환)

## 운영 전 체크리스트

1. `prisma/schema.prisma` 의 datasource provider 를 `postgresql` 로 변경 후 마이그레이션
2. 등록 API 의 기본 `status` 를 `"pending"` 으로 바꾸고 관리자 검수 화면 추가
3. 스팸 방지(reCAPTCHA 등)·이미지 업로드(로고)·인증(소유권 확인) 추가
4. (구현됨) 주소 → 좌표 자동 변환(지오코딩) — 서버에 네이버 키 설정 시 동작

## 공유 채널

상세 페이지 공유 버튼: 링크 복사 · 네이티브 공유 · **카카오톡**(JS 키 필요) · **Instagram**(웹 공유 URL이 없어 모바일 네이티브 공유/링크 복사로 best-effort) · X · LinkedIn · Facebook.

## 라이선스

[Apache License 2.0](./LICENSE). 상업적 사용·수정·재배포가 가능하며, 특허 라이선스 조항을 포함합니다. 재배포 시 LICENSE 와 저작권·변경 고지를 유지하세요.
