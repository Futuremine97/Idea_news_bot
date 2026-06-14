"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/LangProvider";

type Svc = {
  id: string;
  nameKo: string;
  nameEn: string;
  status: string;
  featured: boolean;
  kind: string;
  category: string;
  region: string;
  createdAt: string;
  websiteUrl?: string | null;
};

export default function AdminPage() {
  const { t } = useLang();
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [services, setServices] = useState<Svc[]>([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("adminToken") : "";
    if (saved) {
      setToken(saved);
      setAuthed(true);
    }
  }, []);

  const load = async (tok: string, status: string) => {
    setError("");
    const r = await fetch(`/api/admin?status=${status}`, { headers: { "x-admin-token": tok } });
    if (r.status === 401) {
      setError(t("admin_unauthorized"));
      setAuthed(false);
      return;
    }
    if (r.status === 501) {
      setError("ADMIN_TOKEN not configured on server.");
      return;
    }
    const d = await r.json();
    setServices(d.services ?? []);
    setAuthed(true);
    localStorage.setItem("adminToken", tok);
  };

  useEffect(() => {
    if (authed && token) load(token, filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, filter]);

  const act = async (id: string, action: string) => {
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ id, action }),
    });
    if (r.ok) load(token, filter);
    else setError((await r.json().catch(() => ({}))).error || "Action failed");
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setAuthed(false);
    setToken("");
    setServices([]);
  };

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm">
        <h1 className="text-2xl font-bold">{t("admin_title")}</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(token, filter);
          }}
          className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6"
        >
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={t("admin_token")}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          {error && <p className="text-sm text-red-600">⚠️ {error}</p>}
          <button className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">
            {t("admin_login")}
          </button>
        </form>
      </div>
    );
  }

  const badge = (status: string) =>
    status === "approved"
      ? "bg-emerald-100 text-emerald-700"
      : status === "pending"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("admin_title")}</h1>
        <button onClick={logout} className="text-sm text-slate-500 hover:text-brand-600">
          logout
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              "rounded-full px-3 py-1.5 text-sm " +
              (filter === f ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")
            }
          >
            {f}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">⚠️ {error}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-slate-500">
            <tr>
              <th className="p-3">이름</th>
              <th className="p-3">상태</th>
              <th className="p-3">분류</th>
              <th className="p-3">액션</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b border-slate-100">
                <td className="p-3">
                  <a href={`/services/${s.id}`} target="_blank" rel="noreferrer" className="font-medium text-slate-800 hover:text-brand-600">
                    {s.nameKo || s.nameEn}
                  </a>
                  {s.featured && <span className="ml-1 text-amber-500">★</span>}
                </td>
                <td className="p-3">
                  <span className={"rounded-full px-2 py-0.5 text-xs font-medium " + badge(s.status)}>{s.status}</span>
                </td>
                <td className="p-3 text-slate-500">{s.kind}/{s.category}/{s.region}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1.5">
                    {s.status !== "approved" && (
                      <button onClick={() => act(s.id, "approve")} className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100">
                        {t("admin_approve")}
                      </button>
                    )}
                    {s.status !== "rejected" && (
                      <button onClick={() => act(s.id, "reject")} className="rounded bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100">
                        {t("admin_reject")}
                      </button>
                    )}
                    <button onClick={() => act(s.id, s.featured ? "unfeature" : "feature")} className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-700 hover:bg-amber-100">
                      {s.featured ? t("admin_unfeature") : t("admin_feature")}
                    </button>
                    <button onClick={() => act(s.id, "delete")} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200">
                      {t("admin_delete")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-400">—</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
