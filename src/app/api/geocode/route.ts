import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * 주소 → 좌표(위도/경도) 변환. 네이버 Geocoding API 사용.
 * 서버 전용 키 사용 (NEXT_PUBLIC_ 아님 → 브라우저에 노출되지 않음).
 *   NAVER_MAP_CLIENT_ID      = Client ID
 *   NAVER_MAP_CLIENT_SECRET  = Client Secret
 * 키가 없으면 501 로 graceful degrade (등록 시 좌표 직접 입력 가능).
 */
export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query")?.trim();
  if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

  const id = process.env.NAVER_MAP_CLIENT_ID;
  const secret = process.env.NAVER_MAP_CLIENT_SECRET;
  if (!id || !secret) {
    return NextResponse.json({ error: "geocoding_not_configured" }, { status: 501 });
  }

  const endpoint =
    process.env.NAVER_GEOCODE_ENDPOINT ||
    "https://maps.apigw.ntruss.com/map-geocode/v2/geocode";

  try {
    const url = `${endpoint}?query=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": id,
        "X-NCP-APIGW-API-KEY": secret,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "geocode_request_failed", status: res.status }, { status: 502 });
    }
    const data = await res.json();
    const first = data?.addresses?.[0];
    if (!first) return NextResponse.json({ results: [] });

    return NextResponse.json({
      results: [
        {
          lat: Number(first.y),
          lng: Number(first.x),
          roadAddress: first.roadAddress || null,
          jibunAddress: first.jibunAddress || null,
        },
      ],
    });
  } catch {
    return NextResponse.json({ error: "geocode_error" }, { status: 502 });
  }
}
