"use client";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { listenAllMenu, listenOrders, setOrderStatus, toggleMenuToday, MenuItem, CraftOrder, seedMenuOnceIfEmpty } from "@/lib/db";
import { useRouter } from "next/navigation";

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

export default function AdminPage() {
  const router = useRouter();
  const [userUid, setUserUid] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<CraftOrder[]>([]);

  useEffect(() => {
    seedMenuOnceIfEmpty().catch(() => {});
    const unsubAuth = onAuthStateChanged(auth, (u) => setUserUid(u?.uid ?? null));
    const unsubMenu = listenAllMenu(setMenu);
    const unsubOrders = listenOrders(setOrders);
    return () => {
      unsubAuth();
      unsubMenu();
      unsubOrders();
    };
  }, []);

  const isAdmin = useMemo(() => !!userUid && !!ADMIN_UID && userUid === ADMIN_UID, [userUid]);

  useEffect(() => {
    if (userUid === null) return;
    if (!userUid) router.push("/admin/login");
  }, [userUid, router]);

  if (!userUid) return <div className="text-sm text-gray-600">Checking login...</div>;

  if (!isAdmin) {
    return (
      <main className="rounded-xl border p-4">
        <div className="font-semibold">Not allowed</div>
        <div className="text-sm text-gray-600">
          This account is not admin. Set <b>NEXT_PUBLIC_ADMIN_UID</b> correctly in <b>.env.local</b>.
        </div>
        <a className="text-sm underline text-blue-700" href="/admin/login">Go to login</a>
      </main>
    );
  }

  return (
    <main className="grid gap-4">
      <div className="grid md:grid-cols-2 gap-4">
        <section className="rounded-xl border p-4">
          <div className="font-semibold mb-2 text-blue-700">Today’s Menu Controls</div>
          <div className="grid gap-2">
            {menu.map((it) => (
              <div key={it.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{it.name}</div>
                  <div className="text-xs text-gray-600">{it.category} • ₹{it.price}</div>
                </div>
                <button
                  className="px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm"
                  onClick={() => toggleMenuToday(it.id, !it.availableToday)}
                >
                  {it.availableToday ? "Available ✅" : "Unavailable ❌"}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border p-4">
          <div className="font-semibold mb-2 text-blue-700">Live Orders</div>
          {!orders.length ? (
            <div className="text-sm text-gray-600">No orders yet.</div>
          ) : (
            <div className="grid gap-3">
              {orders.map((o) => (
                <div key={o.id} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-xs">{o.id}</div>
                    <div className="text-sm font-semibold">₹{o.total}</div>
                  </div>
                  <div className="text-sm mt-1">
                    Token: <b>{o.tokenNumber}</b> • Status: <b>{o.status}</b>
                  </div>

                  <div className="mt-2 text-xs text-gray-600">
                    {(o.items || []).map((it) => `${it.name}×${it.qty}`).join(", ")}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="px-2 py-1 rounded border text-sm" onClick={() => setOrderStatus(o.id, "PREPARING")}>Preparing</button>
                    <button className="px-2 py-1 rounded border text-sm" onClick={() => setOrderStatus(o.id, "READY")}>Ready</button>
                    <button className="px-2 py-1 rounded border text-sm" onClick={() => setOrderStatus(o.id, "COMPLETED")}>Completed</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
