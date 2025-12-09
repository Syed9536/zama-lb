// app/share/[handle]/page.tsx
import type { Metadata } from "next";

type SharePageProps = {
  params: { handle: string };
  searchParams: { rank?: string };
};

export async function generateMetadata(
  { params, searchParams }: SharePageProps
): Promise<Metadata> {
  const handle = params.handle;
  const rank = searchParams.rank;

  const base =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://zama-lb.vercel.app";

  const title = `Zama Rank — @${handle}`;
  const desc = rank
    ? `Unofficial Zama All SZN Rank. @${handle} is currently #${rank} on SZN 5 (speculative).`
    : `Unofficial Zama All SZN Rank dashboard. Check your placement & speculative rewards.`;

  const shareUrl = `${base}/share/${encodeURIComponent(handle)}${
    rank ? `?rank=${rank}` : ""
  }`;

  const imageUrl = `${base}/api/share-card?username=${encodeURIComponent(
    handle,
  )}${rank ? `&rank=${rank}` : ""}`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: shareUrl,
      siteName: "Zama Rank — Unofficial",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Zama Rank share card for @${handle}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [imageUrl],
    },
  };
}

// ✅ Yeh default export hi missing tha – error isi wajah se aa raha tha
export default function SharePage({ params, searchParams }: SharePageProps) {
  const handle = params.handle;
  const rank = searchParams.rank;

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="max-w-xl w-full text-center px-4">
        <h1 className="text-xl font-semibold mb-2">
          Zama Rank — Share Preview
        </h1>
        <p className="text-sm text-slate-400 mb-4">
          This link is mainly for X / social previews.
        </p>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-4 text-sm space-y-3">
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-[0.2em]">
              Handle
            </div>
            <div className="text-lg font-semibold">@{handle}</div>
          </div>

          {rank && (
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-[0.2em]">
                Rank (SZN 5 snapshot)
              </div>
              <div className="text-lg font-semibold">#{rank}</div>
            </div>
          )}

          <p className="text-[11px] text-slate-500 pt-2">
            When someone shares their rank from the dashboard, X will use the
            OpenGraph / Twitter image attached to this URL.
          </p>
        </div>
      </div>
    </main>
  );
}
