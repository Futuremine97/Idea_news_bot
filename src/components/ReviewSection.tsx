"use client";

import { useEffect, useState } from "react";
import { useLang } from "./LangProvider";
import { Stars } from "./Stars";

type Review = {
  id: string;
  author: string;
  rating: number;
  body: string;
  createdAt: string;
};

export function ReviewSection({
  serviceId,
  initialSum,
  initialCount,
}: {
  serviceId: string;
  initialSum: number;
  initialCount: number;
}) {
  const { t } = useLang();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sum, setSum] = useState(initialSum);
  const [count, setCount] = useState(initialCount);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/services/${serviceId}/reviews`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .catch(() => {});
  }, [serviceId]);

  const avg = count > 0 ? sum / count : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setStatus("submitting");
    setError("");
    try {
      const r = await fetch(`/api/services/${serviceId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, rating, body }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || "Error");
      }
      const d = await r.json();
      setReviews((prev) => [d.review, ...prev]);
      setSum((s) => s + rating);
      setCount((c) => c + 1);
      setBody("");
      setAuthor("");
      setRating(5);
      setStatus("done");
    } catch (err: any) {
      setStatus("error");
      setError(err.message);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{t("reviews_title")}</h2>
        {count > 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Stars value={avg} />
            <span>
              {avg.toFixed(1)} ({count})
            </span>
          </div>
        )}
      </div>

      {/* 작성 폼 */}
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3 rounded-xl bg-slate-50 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-slate-700">{t("review_rating")}</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={"text-2xl leading-none " + (n <= rating ? "text-amber-500" : "text-slate-300")}
                aria-label={`${n} star`}
              >
                ★
              </button>
            ))}
          </div>
          <input
            className={inputCls + " sm:max-w-[200px]"}
            placeholder={t("review_author")}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <textarea
          className={inputCls}
          rows={3}
          placeholder={t("review_body")}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        {status === "error" && <p className="text-sm text-red-600">⚠️ {error}</p>}
        {status === "done" && <p className="text-sm text-emerald-600">✓ {t("review_thanks")}</p>}
        <button
          type="submit"
          disabled={status === "submitting" || !body.trim()}
          className="self-start rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {status === "submitting" ? t("review_submitting") : t("review_submit")}
        </button>
      </form>

      {/* 목록 */}
      <div className="mt-5 flex flex-col gap-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-400">{t("reviews_none")}</p>
        ) : (
          reviews.map((rv) => (
            <div key={rv.id} className="border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2 text-sm">
                <Stars value={rv.rating} />
                <span className="font-medium text-slate-700">{rv.author}</span>
                <span className="text-xs text-slate-400">{new Date(rv.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{rv.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
