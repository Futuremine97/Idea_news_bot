"use client";

import { useLang } from "@/components/LangProvider";

const UPDATED = "2026-06-15";
const CONTACT = "futuremine97@gmail.com";

export default function PrivacyPage() {
  const { lang } = useLang();
  const ko = lang === "ko";

  return (
    <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 leading-relaxed text-slate-700">
      <h1 className="text-2xl font-bold text-slate-900">
        {ko ? "개인정보처리방침" : "Privacy Policy"}
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        {ko ? "최종 업데이트" : "Last updated"}: {UPDATED}
      </p>

      {ko ? (
        <div className="mt-6 flex flex-col gap-5 text-[15px]">
          <p>
            AI 서비스 허브(이하 “서비스”)는 한국·미국·전세계의 AI 에이전트/서비스와 확장(플러그인·스킬·MCP)을
            모아 소개하고, 누구나 등록·홍보할 수 있게 하는 디렉토리입니다. 본 방침은 서비스가 어떤 정보를
            수집하고 어떻게 사용하는지 설명합니다.
          </p>

          <Section title="1. 수집하는 정보">
            <ul className="ml-5 list-disc space-y-1">
              <li>등록 정보: 서비스/확장의 이름, 소개, 링크(웹사이트·인스타그램·저장소), 카테고리, 등록자 이름·이메일(선택), 매장 주소·좌표(선택).</li>
              <li>리뷰: 별점, 후기 내용, 표시 이름(선택).</li>
              <li>체크인(가볼 곳/저장/가봤음): 브라우저에서 생성한 임의 식별자(visitorId)와 닉네임.</li>
              <li>로컬 저장소: 언어 설정, visitorId, 닉네임, 소유자 관리 토큰, 마스코트 표시 여부. (브라우저에만 저장)</li>
              <li>자동 수집: Threads 등 공식 API로 가져온 공개 게시물의 텍스트·링크·작성자명·게시물 URL (검수 대기 상태로 저장).</li>
              <li>기술 로그: 접속 시 일반적인 서버 로그(IP, 시각 등)가 호스팅 제공자에 의해 처리될 수 있습니다.</li>
            </ul>
          </Section>

          <Section title="2. 정보 사용 목적">
            <p>수집한 정보는 디렉토리 표시·검색·정렬, 등록물 검수, 통계(조회·추천·별점) 제공, 부정 사용 방지, 서비스 개선을 위해 사용합니다. 광고 목적의 개인정보 판매는 하지 않습니다.</p>
          </Section>

          <Section title="3. 제3자 서비스">
            <ul className="ml-5 list-disc space-y-1">
              <li>지도: 네이버 클라우드 Maps, Google Maps (위치 표시).</li>
              <li>공유: 카카오, X, LinkedIn, Facebook, Instagram (사용자가 공유 버튼을 누를 때).</li>
              <li>Meta(Threads): 공개 콘텐츠 수집을 위한 <b>공식 Threads API</b>만 사용합니다(무단 스크래핑 없음).</li>
              <li>인프라: Vercel(호스팅), Neon(PostgreSQL 데이터베이스).</li>
            </ul>
            <p className="mt-2">각 제공자는 자체 개인정보처리방침을 따릅니다.</p>
          </Section>

          <Section title="4. Threads/Meta 데이터">
            <p>
              본 서비스는 Meta의 공식 Threads API를 통해 <b>공개</b> 게시물 정보를 키워드로 수집할 수 있습니다.
              수집된 항목은 자동 공개되지 않고 <b>관리자 검수(pending)</b>를 거칩니다. Meta 플랫폼 데이터는
              Meta 플랫폼 약관에 따라 처리하며, 요청 시 삭제합니다.
            </p>
          </Section>

          <Section title="5. 쿠키 / 로컬 저장소">
            <p>로그인 기능이 없으며, 식별은 브라우저 로컬 저장소(localStorage)의 임의 식별자에 의존합니다. 브라우저 데이터를 지우면 해당 식별자도 삭제됩니다.</p>
          </Section>

          <Section title="6. 데이터 보관 및 삭제">
            <p>등록물·리뷰·체크인은 삭제 요청 또는 관리자 삭제 시까지 보관됩니다. 등록자는 발급받은 관리 링크로 본인 등록물을 직접 수정·삭제할 수 있습니다.</p>
          </Section>

          <Section title="7. 이용자 권리">
            <p>본인 정보의 열람·수정·삭제를 원하시면 아래 이메일로 요청하세요. 합리적 기간 내에 처리합니다.</p>
          </Section>

          <Section title="8. 아동">
            <p>본 서비스는 만 14세 미만 아동을 대상으로 하지 않으며, 의도적으로 아동의 개인정보를 수집하지 않습니다.</p>
          </Section>

          <Section title="9. 변경">
            <p>본 방침은 변경될 수 있으며, 변경 시 본 페이지에 최종 업데이트 날짜와 함께 게시합니다.</p>
          </Section>

          <Section title="10. 문의">
            <p>개인정보 관련 문의: <a className="text-brand-700 underline" href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
          </Section>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-5 text-[15px]">
          <p>
            AI Service Hub (the “Service”) is a directory that collects and showcases AI agents/services and
            extensions (plugins, skills, MCP servers) from Korea, the US, and worldwide, letting anyone list and
            promote them. This policy explains what we collect and how we use it.
          </p>

          <Section title="1. Information we collect">
            <ul className="ml-5 list-disc space-y-1">
              <li>Listings: name, description, links (website/Instagram/repo), category, optional submitter name &amp; email, optional address &amp; coordinates.</li>
              <li>Reviews: rating, review text, optional display name.</li>
              <li>Check-ins (Going/Saved/Been there): a random browser-generated identifier (visitorId) and nickname.</li>
              <li>Local storage: language, visitorId, nickname, owner management token, mascot preference (stored only in your browser).</li>
              <li>Automated collection: text, links, author handle, and post URL of public posts retrieved via official APIs such as Threads (stored as pending for review).</li>
              <li>Technical logs: standard server logs (IP, timestamp) may be processed by our hosting provider.</li>
            </ul>
          </Section>

          <Section title="2. How we use information">
            <p>To display, search and sort the directory, moderate submissions, show stats (views, upvotes, ratings), prevent abuse, and improve the Service. We do not sell personal data for advertising.</p>
          </Section>

          <Section title="3. Third-party services">
            <ul className="ml-5 list-disc space-y-1">
              <li>Maps: NAVER Cloud Maps, Google Maps (to display locations).</li>
              <li>Sharing: Kakao, X, LinkedIn, Facebook, Instagram (when you tap a share button).</li>
              <li>Meta (Threads): we use only the <b>official Threads API</b> for public content (no unauthorized scraping).</li>
              <li>Infrastructure: Vercel (hosting), Neon (PostgreSQL database).</li>
            </ul>
            <p className="mt-2">Each provider operates under its own privacy policy.</p>
          </Section>

          <Section title="4. Threads/Meta data">
            <p>
              We may collect <b>public</b> post information by keyword via Meta's official Threads API. Collected
              items are not published automatically; they go through <b>admin review (pending)</b>. Meta platform
              data is handled per Meta Platform Terms and deleted upon request.
            </p>
          </Section>

          <Section title="5. Cookies / local storage">
            <p>There is no login; identification relies on a random identifier in your browser's local storage. Clearing your browser data removes it.</p>
          </Section>

          <Section title="6. Retention &amp; deletion">
            <p>Listings, reviews and check-ins are retained until deletion is requested or performed by an admin. Owners can edit/delete their own listing using the management link issued at registration.</p>
          </Section>

          <Section title="7. Your rights">
            <p>To access, correct, or delete your information, contact us at the email below. We will respond within a reasonable timeframe.</p>
          </Section>

          <Section title="8. Children">
            <p>The Service is not directed to children under 14 and we do not knowingly collect their personal data.</p>
          </Section>

          <Section title="9. Changes">
            <p>We may update this policy; changes are posted here with the updated date.</p>
          </Section>

          <Section title="10. Contact">
            <p>Privacy inquiries: <a className="text-brand-700 underline" href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
          </Section>
        </div>
      )}
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-1 text-lg font-bold text-slate-900">{title}</h2>
      <div className="text-slate-600">{children}</div>
    </section>
  );
}
