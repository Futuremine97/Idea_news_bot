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
| `/` | 디렉토리 홈 (필터·검색) |
| `/services/[id]` | 서비스 상세 (+ 매장 지도) |
| `/register` | 서비스 등록 폼 |
| `/map` | 지도 뷰 (오프라인 매장) |

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
4. 주소 → 좌표 자동 변환(지오코딩) 연동
