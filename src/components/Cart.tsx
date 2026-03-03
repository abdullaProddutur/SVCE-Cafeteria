"use client";

import { OrderItem } from "@/lib/db";

export default function Cart({
  cart,
  onInc,
  onDec,
  onClear,
  total,
}: {
  cart: OrderItem[];
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  onClear: () => void;
  total: number;
}) {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-blue-700">Your Cart</div>
        <button className="text-sm underline text-blue-700" onClick={onClear}>
          Clear
        </button>
      </div>

      {!cart.length ? (
        <div className="text-sm text-gray-600 mt-3">Cart is empty.</div>
      ) : (
        <div className="mt-3 grid gap-2">
          {cart.map((c) => (
            <div key={c.id} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-gray-600">
                  ₹{c.price} × {c.qty}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded border" onClick={() => onDec(c.id)}>
                  -
                </button>
                <div className="w-6 text-center">{c.qty}</div>
                <button className="w-8 h-8 rounded border" onClick={() => onInc(c.id)}>
                  +
                </button>
              </div>
            </div>
          ))}

          <div className="pt-2 mt-2 border-t flex items-center justify-between">
            <div className="font-semibold">Total</div>
            <div className="font-semibold">₹{total}</div>
          </div>
        </div>
      )}
    </div>
  );
}
