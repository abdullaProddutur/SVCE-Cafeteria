"use client";



import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      console.log("Admin UID:", cred.user.uid);
      router.push("/admin");
    } catch (e: any) {
      console.error("LOGIN ERROR:", e);
      alert(e?.code || e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await signOut(auth);
    alert("Logged out");
  }

  return (
    <main className="max-w-md">
      <div className="rounded-xl border p-4 grid gap-3">
        <div className="font-semibold text-lg text-blue-700">Admin Login</div>

        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Password"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        <button
          className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
          onClick={login}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button className="text-sm underline text-blue-700" onClick={logout}>
          Logout
        </button>

        <div className="text-xs text-gray-600">
          Ensure <b>NEXT_PUBLIC_ADMIN_UID</b> matches this user&apos;s UID in <b>.env.local</b>.
        </div>
      </div>
    </main>
  );
}
