"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "./LangProvider";
import { getVisitorId, getNickname, setNickname as saveNick } from "@/lib/visitor";

type Person = { visitorId: string; nickname: string; status: string };
type Counts = { going: number; saved: number; went: number };

const STATUSES = ["going", "saved", "went"] as const;
type Status = (typeof STATUSES)[number];

export function CheckinButtons({ serviceId }: { serviceId: string }) {
  const { t } = useLang();
  const [visitorId, setVisitorId] = useState("");
  const [nick, setNick] = useState("");
  const [counts, setCounts] = useState<Counts>({ going: 0, saved: 0, went: 0 });
  const [people, setPeople] = useState<Person[]>([]);
  const [mine, setMine] = useState<Status | null>(null);

  const load = async () => {
    const r = await fetch(`/api/services/${serviceId}/checkin`);
    const d = await r.json();
    setCounts(d.counts ?? { going: 0, saved: 0, went: 0 });
    setPeople(d.people ?? []);
  };

  useEffect(() => {
    const id = getVisitorId();
    setVisitorId(id);
    setNick(getNickname());
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  useEffect(() => {
    const me = people.find((p) => p.visitorId === visitorId);
    setMine((me?.status as Status) ?? null);
  }, [people, visitorId]);

  const setStatus = async (s: Status) => {
    const next = mine === s ? "none" : s;
    await fetch(`/api/services/${serviceId}/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, nickname: nick, status: next }),
    });
    load();
  };

  const onSaveNick = () => {
    saveNick(nick);
    setNick(getNickname());
  };

  const labels: Record<Status, string> = {
    going: t("ci_going"),
    saved: t("ci_saved"),
    went: t("ci_went"),
  };
  const emoji: Record<Status, string> = { going: "🚩", saved: "🔖", went: "✅" };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={
              "rounded-lg px-4 py-2 text-sm font-medium transition " +
              (mine === s
                ? "bg-brand-600 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50")
            }
          >
            {emoji[s]} {labels[s]} <span className="opacity-70">{counts[s]}{t("ci_people")}</span>
          </button>
        ))}
      </div>

      {/* 닉네임 편집 */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-slate-500">{t("ci_nickname")}:</span>
        <input
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          className="w-40 rounded-lg border border-slate-200 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none"
        />
        <button onClick={onSaveNick} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">
          {t("ci_save")}
        </button>
        {visitorId && (
          <Link href={`/lists/${visitorId}`} className="ml-auto text-xs text-brand-600 hover:underline">
            {t("lists_my")} →
          </Link>
        )}
      </div>

      {/* 사용자끼리 보이는 사람 목록 */}
      {people.length > 0 && (
        <div className="mt-4 flex flex-col gap-1.5 border-t border-slate-100 pt-3 text-sm">
          {STATUSES.map((s) => {
            const list = people.filter((p) => p.status === s);
            if (list.length === 0) return null;
            return (
              <div key={s} className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400">{emoji[s]} {labels[s]}:</span>
                {list.slice(0, 30).map((p) => (
                  <Link
                    key={p.visitorId}
                    href={`/lists/${p.visitorId}`}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200"
                  >
                    {p.nickname}
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
