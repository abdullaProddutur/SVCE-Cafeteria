"use client";

import { MenuItem } from "@/lib/db";
import Stars from "./Stars";
import { useState } from "react";

type RatingInfo = { avg: number; count: number };

export default function MenuList({
  items,
  onAdd,
  ratingMap,
  onSubmitRating,
}: {
  items: MenuItem[];
  onAdd: (item: MenuItem) => void;
  ratingMap: Record<string, RatingInfo>;
  onSubmitRating: (itemId: string, rating: number, comment?: string) => Promise<void>;
}) {
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  if (!items.length) return <div className="text-sm text-gray-600">No items available today.</div>;

  async function submit(itemId: string) {
    setSaving(true);
    try {
      await onSubmitRating(itemId, rating, comment);
      setComment("");
      setRating(5);
      setOpenItemId(null);
      alert("Thanks for rating!");
    } catch (e) {
      alert("Failed to submit rating");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-3">
      {items.map((it) => {
        const info = ratingMap[it.id] || { avg: 0, count: 0 };
        const img = it.imageUrl?.trim();

        return (
          <div key={it.id} className="rounded-xl border p-4">
            <div className="flex gap-3 items-start">
              <div className="w-20 h-20 rounded-lg border overflow-hidden flex items-center justify-center bg-gray-50">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={it.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-xs text-gray-500 text-center px-2">No Image</div>
                )}
              </div>

              <div className="flex-1">
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-gray-600">
                  {it.category} • ₹{it.price}
                </div>

                <div className="mt-1 flex items-center gap-2">
                  <Stars value={Math.round(info.avg)} readonly size="text-base" />
                  <div className="text-xs text-gray-600">
                    {info.count ? `${info.avg.toFixed(1)} (${info.count})` : "No ratings yet"}
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-2 rounded-lg border hover:bg-gray-50 text-blue-700" onClick={() => onAdd(it)}>
                    Add
                  </button>
                  <button
                    className="px-3 py-2 rounded-lg border hover:bg-gray-50"
                    onClick={() => setOpenItemId(openItemId === it.id ? null : it.id)}
                  >
                    Rate
                  </button>
                </div>
              </div>
            </div>

            {openItemId === it.id && (
              <div className="mt-3 rounded-lg border p-3 bg-blue-50/40">
                <div className="text-sm font-medium text-blue-700">Rate {it.name}</div>
                <div className="mt-2">
                  <Stars value={rating} onChange={setRating} />
                </div>
                <textarea
                  className="mt-2 w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Optional comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    disabled={saving}
                    className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    onClick={() => submit(it.id)}
                  >
                    {saving ? "Saving..." : "Submit"}
                  </button>
                  <button className="px-3 py-2 rounded-lg border hover:bg-gray-50" onClick={() => setOpenItemId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
