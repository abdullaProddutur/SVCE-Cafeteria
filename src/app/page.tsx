"use client";


import { useEffect, useMemo, useState } from "react";
import MenuList from "@/components/MenuList";
import Cart from "@/components/Cart";
import {
  MenuItem,
  OrderItem,
  createOrder,
  listenTodaysMenu,
  seedMenuOnceIfEmpty,
  generateNextToken,
  listenRatings,
  createRating,
  listenOrders,
  RatingDoc,
  CraftOrder,
} from "@/lib/db";
import { useRouter } from "next/navigation";

type RatingInfo = { avg: number; count: number };

export default function HomePage() {
  const router = useRouter();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [tokenNumber, setTokenNumber] = useState("");
  const [tokenLoading, setTokenLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [ratings, setRatings] = useState<RatingDoc[]>([]);
  const [orders, setOrders] = useState<CraftOrder[]>([]);

  const [budget, setBudget] = useState<number>(50);
  const [pref, setPref] = useState<string>("Any");
  const [suggestions, setSuggestions] = useState<MenuItem[]>([]);

  useEffect(() => {
    seedMenuOnceIfEmpty().catch(() => {});
    const unsubMenu = listenTodaysMenu(setMenu);
    const unsubRatings = listenRatings(setRatings);
    const unsubOrders = listenOrders(setOrders);

    (async () => {
      try {
        setTokenLoading(true);
        const t = await generateNextToken("SVCE");
        setTokenNumber(t);
      } finally {
        setTokenLoading(false);
      }
    })();

    return () => {
      unsubMenu();
      unsubRatings();
      unsubOrders();
    };
  }, []);

  const total = useMemo(() => cart.reduce((s, c) => s + c.price * c.qty, 0), [cart]);

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const found = prev.find((p) => p.id === item.id);
      if (found) return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  }

  function inc(id: string) {
    setCart((prev) => prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p)));
  }

  function dec(id: string) {
    setCart((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p))
        .filter((p) => p.qty > 0)
    );
  }

  async function placeOrder() {
    if (!cart.length) return alert("Cart is empty");
    if (!tokenNumber.trim()) return alert("Token missing (click New)");

    setLoading(true);
    try {
      const id = await createOrder({
        items: cart,
        total,
        tokenNumber: tokenNumber.trim(),
        status: "PENDING_PAYMENT",
      });
      router.push(`/order/${id}`);
    } catch (e: any) {
      alert("Failed to create order");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const ratingMap: Record<string, RatingInfo> = useMemo(() => {
    const sum: Record<string, number> = {};
    const cnt: Record<string, number> = {};
    for (const r of ratings) {
      sum[r.itemId] = (sum[r.itemId] || 0) + Number(r.rating || 0);
      cnt[r.itemId] = (cnt[r.itemId] || 0) + 1;
    }
    const out: Record<string, RatingInfo> = {};
    for (const itemId of Object.keys(cnt)) {
      out[itemId] = { avg: sum[itemId] / cnt[itemId], count: cnt[itemId] };
    }
    return out;
  }, [ratings]);

  const topSelling = useMemo(() => {
    const sold: Record<string, number> = {};
    const ok = new Set(["PAID", "PREPARING", "READY", "COMPLETED"]);
    for (const o of orders) {
      if (!ok.has(o.status)) continue;
      for (const it of o.items || []) {
        sold[it.id] = (sold[it.id] || 0) + (it.qty || 0);
      }
    }
    const arr = menu
      .map((m) => ({ item: m, qty: sold[m.id] || 0 }))
      .filter((x) => x.qty > 0)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
    return arr;
  }, [orders, menu]);

  function runSmartSuggest() {
    const b = Number.isFinite(budget) ? budget : 50;
    let candidates = [...menu];

    if (pref !== "Any") {
      candidates = candidates.filter((m) => m.category === pref);
    }

    candidates = candidates
      .filter((m) => m.price <= b)
      .sort((a, b2) => {
        const ra = ratingMap[a.id]?.avg || 0;
        const rb = ratingMap[b2.id]?.avg || 0;
        if (rb !== ra) return rb - ra;
        return a.price - b2.price;
      });

    setSuggestions(candidates.slice(0, 3));
  }

  return (
    <main className="grid gap-4">
      <section className="rounded-xl border p-4">
        <div className="font-semibold text-blue-700">Most Selling Items</div>
        {!topSelling.length ? (
          <div className="text-sm text-gray-600 mt-2">No sales data yet (complete a payment to see this).</div>
        ) : (
          <div className="mt-2 grid gap-2">
            {topSelling.map(({ item, qty }) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div>
                  <b>{item.name}</b> <span className="text-gray-600">• ₹{item.price}</span>
                </div>
                <div className="text-gray-700">Sold: <b>{qty}</b></div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border p-4">
        <div className="font-semibold text-blue-700">Smart Suggestions (AI)</div>
        <div className="mt-2 grid md:grid-cols-3 gap-2">
          <input
            className="border rounded-lg px-3 py-2"
            type="number"
            min={10}
            placeholder="Budget (₹)"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          />
          <select className="border rounded-lg px-3 py-2" value={pref} onChange={(e) => setPref(e.target.value)}>
            <option>Any</option>
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Beverages</option>
          </select>
          <button className="px-3 py-2 rounded-lg bg-[#0B2E6B] hover:bg-[#1E4FA3] text-white hover:bg-blue-700" onClick={runSmartSuggest}>
            Suggest Items
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="mt-3 grid gap-2">
            {suggestions.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <div>
                  <b>{s.name}</b> <span className="text-gray-600">• ₹{s.price}</span>
                </div>
                <button className="px-3 py-2 rounded-lg border hover:bg-gray-50" onClick={() => addToCart(s)}>
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6 items-start">
        <div>
          <div className="font-semibold mb-2">Available Items Today</div>
          <MenuList
            items={menu}
            onAdd={addToCart}
            ratingMap={ratingMap}
            onSubmitRating={(itemId, rating, comment) => createRating(itemId, rating, comment)}
          />
        </div>

        <div className="grid gap-2">
          <Cart cart={cart} onInc={inc} onDec={dec} onClear={() => setCart([])} total={total} />

           <div className="rounded-xl border p-3 grid gap-2 max-w-md">
            <label className="text-sm font-medium">Token Number</label>
            <div className="flex gap-2">
              <input
                className="border rounded-lg px-3 py-1.5 text-sm flex-1"
                placeholder="Eg: SVCE-123000-111"
                value={tokenNumber}
                onChange={(e) => setTokenNumber(e.target.value)}
              />
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                disabled={tokenLoading}
                onClick={async () => {
                  setTokenLoading(true);
                  try {
                    const t = await generateNextToken("SVCE");
                    setTokenNumber(t);
                  } finally {
                    setTokenLoading(false);
                  }
                }}
              >
                {tokenLoading ? "..." : "New"}
              </button>
            </div>

            <button
              disabled={loading}
              className="mt-2 px-3 py-1.5 text-sm rounded-lg bg-[#0B2E6B] hover:bg-[#1E4FA3] text-white hover:bg-blue-700 disabled:opacity-50"
              onClick={placeOrder}
            >
              {loading ? "Placing..." : "Place Order"}
            </button>

            <div className="text-xs text-gray-600">After placing, pay via Razorpay on the next screen.</div>
          </div>
        </div>
      </div>
    </main>
  );
}
