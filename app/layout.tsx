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
 * Yahi toggle hai:
 *  true  = poori site UNDER MAINTENANCE
 *  false = normal site
 */
const IS_MAINTENANCE = true; // <- jab update complete ho jaye to isko false kar dena

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
      <div className="text-center space-y-3">
        <div className="text-red-400 font-bold text-sm">
          🚧 Under Maintenance
        </div>
        <p className="text-slate-300 text-sm">
          We&apos;re updating the Zama All SZN Rank dashboard.  
          Please check back in a bit. 🛠️
        </p>
      </div>
    </main>
  );
}
