"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLang } from "@/components/LangProvider";
import { ServiceCard, type ServiceLite } from "@/components/ServiceCard";

type Groups = { going: ServiceLite[]; saved: ServiceLite[]; went: ServiceLite[] };

export default function ListsPage() {
  const { visitorId } = useParams<{ visitorId: string }>();
  const { t } = useLang();
  const [nickname, setNickname] = useState("");
  const [groups, setGroups] = useState<Groups>({ going: [], saved: [], went: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/lists/${visitorId}`)
      .then((r) => r.json())
      .then((d) => {
        setNickname(d.nickname ?? "");
        setGroups(d.groups ?? { going: [], saved: [], went: [] });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [visitorId]);

  const sections: { key: keyof Groups; emoji: string; label: string }[] = [
    { key: "going", emoji: "🚩", label: t("ci_going") },
    { key: "saved", emoji: "🔖", label: t("ci_saved") },
    { key: "went", emoji: "✅", label: t("ci_went") },
  ];

  const total = groups.going.length + groups.saved.length + groups.went.length;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">
        {nickname}
        {t("lists_title")}
      </h1>

      {loading ? (
        <p className="py-12 text-center text-slate-400">…</p>
      ) : total === 0 ? (
        <p className="py-12 text-center text-slate-400">{t("lists_empty")}</p>
      ) : (
        sections.map(({ key, emoji, label }) =>
          groups[key].length === 0 ? null : (
            <section key={key} className="flex flex-col gap-3">
              <h2 className="text-lg font-bold">
                {emoji} {label} <span className="text-slate-400">({groups[key].length})</span>
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groups[key].map((s) => (
                  <ServiceCard key={s.id} s={s} />
                ))}
              </div>
            </section>
          )
        )
      )}
    </div>
  );
}
