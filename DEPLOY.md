# 배포 가이드 (Vercel + Neon PostgreSQL)

로컬은 SQLite로 돌아가지만, **Vercel 같은 서버리스 환경은 파일이 보존되지 않아 SQLite로는 등록 데이터가 사라집니다.** 그래서 배포용 DB는 무료 PostgreSQL(Neon)을 씁니다. (Supabase·Vercel Postgres도 동일한 방식)

소요 시간: 약 10분.

---

## 0. 준비
- GitHub 계정, Vercel 계정(둘 다 무료, GitHub로 로그인 가능)
- Neon 계정 (https://neon.tech, 무료, 카드 불필요)

## 1. 코드를 GitHub에 올리기

```bash
cd ~/Documents/marketing_bot
git init
git add .
git commit -m "AI Service Hub 초기 버전"
# GitHub에서 새 repo 생성 후:
git remote add origin https://github.com/<내아이디>/marketing_bot.git
git branch -M main
git push -u origin main
```

## 2. Neon에서 PostgreSQL 만들기
1. https://neon.tech 가입 → **Create project**
2. 생성되면 **Connection string** 복사 (이런 형태):
   ```
   postgresql://USER:PASSWORD@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

## 3. Prisma를 PostgreSQL로 전환

`prisma/schema.prisma` 에서 **한 줄만** 변경합니다.

```diff
 datasource db {
-  provider = "sqlite"
+  provider = "postgresql"
   url      = env("DATABASE_URL")
 }
```

> 로컬에서도 계속 쓰려면 `.env` 의 `DATABASE_URL` 을 위 Neon 주소로 바꾸면 됩니다.
> (로컬은 SQLite, 배포는 Postgres로 나눠 쓰고 싶다면 이 변경은 배포용 브랜치에서만 하세요.)

## 4. 배포 DB 초기화 (로컬에서 Neon 주소로 1회 실행)

```bash
# Neon 주소를 환경변수로 주고 스키마 푸시 + 시드
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" npm run db:push
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" npm run db:seed
```

## 5. Vercel에 배포
1. https://vercel.com → **Add New → Project** → 방금 푸시한 GitHub repo 선택
2. Framework: **Next.js** 자동 인식 (Build Command 그대로 두면 됨 — `npm run build` 안에서 `prisma generate` 실행)
3. **Environment Variables** 에 추가:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Neon 연결 문자열 |
   | `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` | 네이버 지도 키 (선택) |
   | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | 구글 지도 키 (선택) |
   | `NEXT_PUBLIC_DEFAULT_MAP_PROVIDER` | `naver` 또는 `google` |

4. **Deploy** 클릭 → 1~2분 후 `https://<프로젝트>.vercel.app` 공개 ✅

## 6. 배포 후
- 코드 수정 → `git push` 하면 Vercel이 자동 재배포합니다.
- 네이버 지도 키는 **웹 서비스 URL**에 배포 도메인(`https://<프로젝트>.vercel.app`)을 등록해야 동작합니다. (NAVER Cloud 콘솔 → Maps → Application → Web 서비스 URL)
- 구글 지도 키도 **HTTP 리퍼러 제한**에 배포 도메인을 추가하세요.

---

## ⚠️ 운영 전 권장 사항
- `src/app/api/services/route.ts` 의 등록 `status` 기본값을 `"approved"` → `"pending"` 으로 바꾸고, 관리자 검수 후 노출되도록 변경 (스팸 방지)
- 등록 폼에 reCAPTCHA / 간단한 인증 추가
- 주소 → 좌표 자동 변환(지오코딩) 연동 (현재는 위도·경도 직접 입력)
- 커스텀 도메인 연결 (Vercel → Settings → Domains)
