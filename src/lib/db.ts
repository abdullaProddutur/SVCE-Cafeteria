import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  availableToday: boolean;
  imageUrl?: string;
  updatedAt?: any;
};

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export type CraftOrder = {
  id: string;
  items: OrderItem[];
  total: number;
  tokenNumber: string;
  status: "PENDING_PAYMENT" | "PAID" | "PREPARING" | "READY" | "COMPLETED";
  createdAt?: any;
  payment?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  };
};

export type RatingDoc = {
  id: string;
  itemId: string;
  rating: number; // 1..5
  comment?: string;
  createdAt?: any;
};

export function listenTodaysMenu(cb: (items: MenuItem[]) => void) {
  const q = query(collection(db, "menuItems"), where("availableToday", "==", true));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as MenuItem[];
      items.sort((a, b) => (a.category + a.name).localeCompare(b.category + b.name));
      cb(items);
    },
    (err) => console.error("menuItems onSnapshot ERROR:", err)
  );
}

export function listenAllMenu(cb: (items: MenuItem[]) => void) {
  if (!db) {
    console.warn("Firestore not initialized (SSR build).");
    return () => {}; // empty unsubscribe
  }

  return onSnapshot(
    collection(db, "menuItems"),
    (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      })) as MenuItem[];

      items.sort((a, b) =>
        (a.category + a.name).localeCompare(b.category + b.name)
      );

      cb(items);
    },
    (err) => console.error("admin menu onSnapshot ERROR:", err)
  );
}

export async function toggleMenuToday(id: string, availableToday: boolean) {
  await updateDoc(doc(db, "menuItems", id), { availableToday, updatedAt: serverTimestamp() });
}

export async function createOrder(payload: Omit<CraftOrder, "id" | "createdAt">) {
  const ref = await addDoc(collection(db, "orders"), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function listenOrder(orderId: string, cb: (o: CraftOrder | null) => void) {
  return onSnapshot(
    doc(db, "orders", orderId),
    (snap) => {
      if (!snap.exists()) return cb(null);
      cb({ id: snap.id, ...(snap.data() as any) } as CraftOrder);
    },
    (err) => {
      console.error("order onSnapshot ERROR:", err);
      cb(null);
    }
  );
}

export function listenOrders(cb: (orders: CraftOrder[]) => void) {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const orders = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as CraftOrder[];
      cb(orders);
    },
    (err) => console.error("orders onSnapshot ERROR:", err)
  );
}

export async function setOrderStatus(orderId: string, status: CraftOrder["status"]) {
  await updateDoc(doc(db, "orders", orderId), { status });
}

export async function markOrderPaid(orderId: string, payment: { orderId: string; paymentId: string }) {
  await updateDoc(doc(db, "orders", orderId), {
    status: "PAID",
    payment: { razorpayOrderId: payment.orderId, razorpayPaymentId: payment.paymentId },
  });
}

export async function seedMenuOnceIfEmpty() {
  const snap = await getDocs(collection(db, "menuItems"));
  if (!snap.empty) return;

  const starter: Omit<MenuItem, "id">[] = [
    { name: "Idli (2 pcs)", price: 20, category: "Breakfast", availableToday: true, imageUrl: "" },
    { name: "Dosa", price: 40, category: "Breakfast", availableToday: true, imageUrl: "" },
    { name: "Veg Fried Rice", price: 60, category: "Lunch", availableToday: true, imageUrl: "" },
    { name: "Meals", price: 70, category: "Lunch", availableToday: true, imageUrl: "" },
    { name: "Tea", price: 15, category: "Beverages", availableToday: true, imageUrl: "" },
    { name: "Coffee", price: 20, category: "Beverages", availableToday: true, imageUrl: "" },
  ];

  for (const it of starter) {
    await addDoc(collection(db, "menuItems"), { ...it, updatedAt: serverTimestamp() });
  }
}

export async function generateNextToken(prefix = "SVCE") {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `${prefix}-${hh}${mm}${ss}-${rand}`;
}

export function listenRatings(cb: (ratings: RatingDoc[]) => void) {
  const q = query(collection(db, "ratings"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const ratings = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as RatingDoc[];
      cb(ratings);
    },
    (err) => console.error("ratings onSnapshot ERROR:", err)
  );
}

export async function createRating(itemId: string, rating: number, comment?: string) {
  const safeRating = Math.max(1, Math.min(5, Math.round(rating)));
  await addDoc(collection(db, "ratings"), {
    itemId,
    rating: safeRating,
    comment: comment?.trim() || "",
    createdAt: serverTimestamp(),
  });
}
