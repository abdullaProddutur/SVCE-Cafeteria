import "./globals.css";
import Image from "next/image";
import BackToTop from "@/components/BackToTop";
import ThemeToggle from "@/components/ThemeToggle";
import { FaFacebook, FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "SVCE Cafeteria",
  description: "Order food from SVCE Cafeteria",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* pt-36 pushes content below fixed header */}
      <body className="min-h-screen bg-gradient-to-br from-[#0B2E6B] via-[#123B8F] to-[#1E4FA3] pt-36 dark:from-[#050A18] dark:via-[#0B1635] dark:to-[#0E1C44]">
        {/* ================= HEADER (Fixed / Curved / Gold Border) ================= */}
        <header className="fixed top-4 left-0 w-full z-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-[#0B2E6B]/95 backdrop-blur-md text-white rounded-2xl border-2 border-[#D4A017] shadow-2xl">
              <div className="flex items-center justify-between p-4">
                {/* Left: Logo + Title */}
                <div className="flex items-center gap-4">
                  <Image
                    src="/logo.jpeg"
                    alt="SVCE Logo"
                    width={95}
                    height={50}
                    className="rounded-full bg-white p-2 shadow-lg"
                    priority
                  />
                  <div className="text-left">
                    <div className="text-2xl font-bold tracking-wide">
                      SVCE Cafeteria
                    </div>
                    <div className="text-sm opacity-80">
                      Smart Food Ordering System
                    </div>
                  </div>
                </div>

                {/* Right: Theme Toggle + Admin */}
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <a
                    href="/admin/login"
                    className="bg-white text-[#0B2E6B] px-5 py-2 rounded-lg font-semibold hover:bg-[#D4A017] hover:text-white transition-all duration-300 shadow-md"
                  >
                    Admin
                  </a>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ================= MAIN CONTENT CARD (Watermark) ================= */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative bg-white text-gray-900 dark:bg-[#0B1220] dark:text-gray-100 rounded-2xl shadow-2xl p-6 mb-10 overflow-hidden">
            {/* Watermark Background */}
        

            {/* Real content */}
            <div className="relative z-10">
              {children}

              {/* ================= FOOTER (Premium) ================= */}
              <footer className="mt-16 bg-[#0B2E6B] text-white rounded-2xl overflow-hidden">
                <div className="p-6 grid gap-8 md:grid-cols-3">
                  {/* About */}
                  <div>
                    <div className="text-lg font-bold">SVCE Cafeteria</div>
                    <p className="text-sm opacity-90 mt-2">
                      Queue-free ordering system built for SVCE campus Cafeteria.
                    </p>
                    <div className="mt-4 text-sm opacity-80">
                      Powered by Next.js • Firebase • Firestore • Razorpay • Tailwind CSS
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div>
                    <div className="font-semibold text-[#D4A017]">
                      Quick Links
                    </div>
                    <div className="mt-3 grid gap-2 text-sm">
                      <a href="/" className="hover:text-[#D4A017] transition">
                        Today’s Menu
                      </a>
                      <a
                        href="/admin/login"
                        className="hover:text-[#D4A017] transition"
                      >
                        Admin Login
                      </a>
                    </div>
                  </div>

                  {/* Social */}
                  <div>
                    <div className="font-semibold text-[#D4A017]">Connect</div>
                    <div className="mt-4 flex gap-5 text-2xl">
                      <a
                        href={process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#D4A017] transition"
                        aria-label="Instagram"
                      >
                        <FaInstagram />
                      </a>
                      <a
                        href={process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#D4A017] transition"
                        aria-label="LinkedIn"
                      >
                        <FaLinkedin />
                      </a>
                      <a
                        href={process.env.NEXT_PUBLIC_SOCIAL_GITHUB || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#D4A017] transition"
                        aria-label="GitHub"
                      >
                        <FaGithub />
                      </a>
                      <a
                        href={process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#D4A017] transition"
                        aria-label="Facebook"
                      >
                        <FaFacebook />
                      </a>
                    </div>

                    <div className="mt-4 text-xs opacity-80">
                      Set social links in <b>.env.local</b> (optional).
                    </div>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/20 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-sm">
                  <div>
                    © {new Date().getFullYear()} SVCE Cafeteria — All Rights Reserved
                  </div>
                  <div>
                    Developed by{" "}
                    <span className="text-[#D4A017] font-semibold">
                      AI / ML Branch Students
                    </span>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>

        {/* Back to top */}
        <BackToTop />
      </body>
    </html>
  );
}