"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Link2,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  Pin,
  ImageIcon,
} from "lucide-react";
import type { InspirationItem, InspirationPriority } from "@rynxpense/shared";
import { formatCurrency } from "@rynxpense/shared";

type Mode = "pending" | "trip";

interface InspirationInboxProps {
  mode: Mode;
  tripId?: string;
  items: InspirationItem[];
  onChange: (items: InspirationItem[]) => void;
  compact?: boolean;
}

const categories = [
  { id: "food", label: "Food" },
  { id: "stay", label: "Stay" },
  { id: "activity", label: "Activity" },
  { id: "transport", label: "Transport" },
  { id: "other", label: "Other" },
] as const;

const priorities: { id: InspirationPriority; label: string }[] = [
  { id: "must", label: "Must do" },
  { id: "maybe", label: "Maybe" },
  { id: "skip", label: "Skip" },
];

export function InspirationInbox({
  items,
  onChange,
  compact = false,
}: InspirationInboxProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [textPaste, setTextPaste] = useState("");
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({
    title: "",
    description: "",
    category: "activity" as InspirationItem["category"],
    estimatedCost: "",
    priority: "maybe" as InspirationPriority,
  });

  const inspoTotal = items
    .filter((i) => i.priority !== "skip")
    .reduce((s, i) => s + (i.estimatedCost ?? 0), 0);

  const addItem = (item: Omit<InspirationItem, "id">) => {
    onChange([{ ...item, id: crypto.randomUUID() }, ...items]);
  };

  const handleLink = async () => {
    if (!linkUrl.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/inspiration/preview-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkUrl.trim() }),
      });
      const data = await res.json();
      addItem({
        title: data.title ?? "Saved link",
        description: data.description ?? "",
        category: "activity",
        sourceUrl: data.sourceUrl ?? linkUrl,
        imageUrl: data.imageUrl ?? undefined,
        sourceType: "link",
        priority: "maybe",
      });
      setLinkUrl("");
    } finally {
      setLoading(false);
    }
  };

  const handleText = async () => {
    if (!textPaste.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/inspiration/parse-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textPaste.trim() }),
      });
      const data = await res.json();
      addItem({
        title: data.title ?? textPaste.slice(0, 60),
        description: data.description ?? textPaste,
        category: data.category ?? "activity",
        estimatedCost: data.estimatedCost ?? undefined,
        sourceType: "text",
        priority: "maybe",
      });
      setTextPaste("");
    } finally {
      setLoading(false);
    }
  };

  const handleManual = () => {
    if (!manual.title.trim()) return;
    addItem({
      title: manual.title.trim(),
      description: manual.description || undefined,
      category: manual.category,
      estimatedCost: manual.estimatedCost ? Number(manual.estimatedCost) : undefined,
      sourceType: "manual",
      priority: manual.priority,
    });
    setManual({
      title: "",
      description: "",
      category: "activity",
      estimatedCost: "",
      priority: "maybe",
    });
    setShowManual(false);
  };

  const updatePriority = (id: string, priority: InspirationPriority) => {
    onChange(items.map((i) => (i.id === id ? { ...i, priority } : i)));
  };

  const remove = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  return (
    <div className={`rounded-2xl bg-white shadow-sm ring-1 ring-border ${compact ? "p-4" : "p-5"}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-text">
            <Pin className="h-5 w-5 text-accent" />
            Inspiration inbox
          </h2>
          <p className="mt-1 text-sm text-muted">
            Paste TikTok, IG, Reddit links or notes — we&apos;ll weave them into your plan.
          </p>
        </div>
        {items.length > 0 && (
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            ~{formatCurrency(inspoTotal)}
          </span>
        )}
      </div>

      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="url"
              placeholder="Paste link from TikTok, IG, Reddit, YouTube..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="button"
            onClick={handleLink}
            disabled={loading || !linkUrl.trim()}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            Add
          </button>
        </div>

        <div className="flex gap-2">
          <textarea
            placeholder='Or paste text: "Saw on TikTok — Ichiran Ramen in Shibuya"'
            value={textPaste}
            onChange={(e) => setTextPaste(e.target.value)}
            rows={2}
            className="flex-1 resize-none rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={handleText}
            disabled={loading || !textPaste.trim()}
            className="flex items-center gap-1 self-end rounded-xl bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Parse
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowManual(!showManual)}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          Add place manually
        </button>

        {showManual && (
          <div className="space-y-2 rounded-xl bg-background p-4 ring-1 ring-border">
            <input
              placeholder="Place name"
              value={manual.title}
              onChange={(e) => setManual({ ...manual, title: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
            <input
              placeholder="Note (optional)"
              value={manual.description}
              onChange={(e) => setManual({ ...manual, description: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-3 gap-2">
              <select
                value={manual.category}
                onChange={(e) =>
                  setManual({
                    ...manual,
                    category: e.target.value as InspirationItem["category"],
                  })
                }
                className="rounded-lg border border-border px-2 py-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Est. ₱"
                value={manual.estimatedCost}
                onChange={(e) => setManual({ ...manual, estimatedCost: e.target.value })}
                className="rounded-lg border border-border px-2 py-2 text-sm"
              />
              <select
                value={manual.priority}
                onChange={(e) =>
                  setManual({
                    ...manual,
                    priority: e.target.value as InspirationPriority,
                  })
                }
                className="rounded-lg border border-border px-2 py-2 text-sm"
              >
                {priorities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleManual}
              className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-white"
            >
              Save place
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted">
          <ImageIcon className="mx-auto mb-2 h-8 w-8 opacity-40" />
          No saves yet — paste your first TikTok or IG find above
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-xl ring-1 ring-border transition hover:ring-primary/30"
            >
              <div className="flex gap-3 p-3">
                {item.imageUrl ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-2xl">
                    {item.category === "food" ? "🍜" : item.category === "stay" ? "🏨" : "📍"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-sm">{item.title}</p>
                  {item.description && (
                    <p className="line-clamp-2 text-xs text-muted">{item.description}</p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-background px-1.5 py-0.5 text-xs capitalize text-muted">
                      {item.category}
                    </span>
                    {item.estimatedCost != null && (
                      <span className="text-xs font-semibold text-primary">
                        {formatCurrency(item.estimatedCost)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => item.id && remove(item.id)}
                  className="shrink-0 text-muted opacity-0 transition group-hover:opacity-100 hover:text-error"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex border-t border-border">
                {priorities.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => item.id && updatePriority(item.id, p.id)}
                    className={`flex-1 py-1.5 text-xs font-medium transition ${
                      item.priority === p.id
                        ? p.id === "must"
                          ? "bg-accent text-white"
                          : p.id === "skip"
                            ? "bg-muted/20 text-muted"
                            : "bg-primary/10 text-primary"
                        : "text-muted hover:bg-background"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
