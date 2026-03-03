"use client";

import { listenOrder, markOrderPaid } from "@/lib/db";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

async function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    const existing = document.getElementById("razorpay-sdk");
    if (existing) return resolve(true);

    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function OrderPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const unsub = listenOrder(params.id, setOrder);
    return () => unsub();
  }, [params.id]);

  if (order === null) return <div className="text-sm text-gray-600">Loading...</div>;
  if (!order) return <div className="text-sm text-gray-600">Order not found.</div>;

  const canPay = order.status === "PENDING_PAYMENT";

  async function payNow() {
    try {
      setPaying(true);
      const ok = await loadRazorpayScript();
      if (!ok) return alert("Failed to load Razorpay");

      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: order.total,
          receipt: `order_${order.id}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data?.error || "Failed to create payment order");

      const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!rzpKey) return alert("Missing NEXT_PUBLIC_RAZORPAY_KEY_ID in .env.local");

      const options: any = {
        key: rzpKey,
        amount: data.amount,
        currency: data.currency,
        name: "SVCE Craft Area",
        description: `Pay for Token ${order.tokenNumber}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          const v = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const vdata = await v.json();

          if (v.ok && vdata.ok) {
            await markOrderPaid(order.id, {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
            });
            alert("Payment Successful ✅");
          } else {
            alert("Payment verification failed ❌");
          }
        },
        theme: { color: "#2563eb" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  }

  return (
    <main className="grid gap-4">
      <div className="rounded-xl border p-4">
        <div className="text-sm text-gray-600">Order ID</div>
        <div className="font-mono">{order.id}</div>

        <div className="mt-3 grid gap-1">
          <div>
            <span className="text-gray-600">Token:</span> <b>{order.tokenNumber}</b>
          </div>
          <div>
            <span className="text-gray-600">Status:</span> <b>{order.status}</b>
          </div>
          <div>
            <span className="text-gray-600">Total:</span> <b>₹{order.total}</b>
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <div className="font-semibold mb-2">Items</div>
        <div className="grid gap-2">
          {order.items.map((it: any) => (
            <div key={it.id} className="flex items-center justify-between text-sm">
              <div>
                {it.name} × {it.qty}
              </div>
              <div>₹{it.price * it.qty}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border p-4 grid gap-2">
        <div className="font-semibold">Payment (Razorpay Test Mode)</div>
        <button
          disabled={!canPay || paying}
          className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          onClick={payNow}
        >
          {canPay ? (paying ? "Opening..." : "Pay Now") : "Paid"}
        </button>
        <div className="text-xs text-gray-600">
          After success, order becomes <b>PAID</b> automatically.
        </div>
      </div>

      <a className="text-sm underline text-blue-700" href="/">
        ← Back to menu
      </a>
    </main>
  );
}
