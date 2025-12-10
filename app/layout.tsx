import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  twitter: {
    card: "summary_large_image",
    images: [`/api/share-card`],
  },
  openGraph: {
    images: [`/api/share-card`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const host = headers().get("host") || "";
  const isLocalhost = host.includes("localhost");
  const isMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE === "true";

  // ➤ If maintenance ON and NOT on localhost → show maintenance page
  if (isMaintenance && !isLocalhost) {
    return (
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200 text-center px-4">
            <h1 className="text-3xl font-bold mb-2">🚧 Under Maintenance</h1>
            <p className="text-sm text-slate-400">
              We are deploying new updates and improvements.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Please check back in a few minutes.
            </p>
          </div>
        </body>
      </html>
    );
  }

  // ➤ Normal Website (Localhost & Live when maintenance is off)
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
