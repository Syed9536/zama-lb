import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zama-lb.vercel.app"),
  twitter: {
    card: "summary_large_image",
    images: ["/api/share-card"],
  },
  openGraph: {
    images: ["/api/share-card"],
  },
};

/**
 * Maintenance logic:
 *
 * - Localhost pe VERCEL_ENV set nahi hota ⇒ yaha hamesha false rahega
 * - Vercel production pe:
 *     MAINTENANCE_MODE = "1"  → maintenance ON
 *     MAINTENANCE_MODE ≠ "1" → normal site
 */
const IS_MAINTENANCE =
  process.env.VERCEL_ENV === "production" &&
  process.env.MAINTENANCE_MODE === "1";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {IS_MAINTENANCE ? <MaintenancePage /> : children}
      </body>
    </html>
  );
}

function MaintenancePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-3 px-4">
        <div className="text-red-400 font-bold text-sm tracking-[0.25em] uppercase">
          🚧 Under Maintenance
        </div>
        <p className="text-slate-300 text-sm">
          We&apos;re updating the Zama All SZN Rank dashboard.
          <br />
          Please check back in a bit. 🛠️
        </p>
      </div>
    </main>
  );
}
