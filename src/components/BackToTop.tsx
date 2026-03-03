"use client";

import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50
                 bg-gradient-to-r from-[#0B2E6B] to-[#1E4FA3]
                 text-white p-4 rounded-full
                 shadow-xl border-2 border-[#D4A017]
                 hover:scale-110 hover:shadow-2xl
                 transition-all duration-300"
      aria-label="Back to top"
      title="Back to top"
    >
      <FaArrowUp className="text-lg" />
    </button>
  );
}