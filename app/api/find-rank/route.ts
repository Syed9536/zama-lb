import { NextRequest, NextResponse } from "next/server";
import seasons from "@/data/seasons.json";

// ---------- LIVE S5 SEARCH (Cookie.fun) ----------
async function searchUser(username: string, timeframe: string): Promise<any> {
  const u = username.toLowerCase();

  // 1. Timeframe Mapping
  let dataPoint = "_24HoursAgo"; 
  if (timeframe === "7d") dataPoint = "_7DaysAgo";
  if (timeframe === "30d") dataPoint = "_30DaysAgo"; 

  // 2. Exact Input Object (Matches Cookie.fun's new structure)
  const inputObj = {
    json: {
      projectsFilter: { 
        searchFilter: "zama" // Ye Zama project ke liye filter hai
      },
      orderColumn: "TwitterMindshare",
      orderDataPoint: dataPoint,
      orderByAscending: false,
      limit: 100,
      dataPoint: dataPoint
    }
  };

  // 3. URL Construction
  const url = `https://www.cookie.fun/api/trpc/cookieFun.leaderboard?input=${encodeURIComponent(JSON.stringify(inputObj))}`;

  try {
    const res = await fetch(url, { 
        cache: "no-store",
        headers: {
            // ✅ IMPORTANT HEADERS TO BYPASS CLOUDFLARE
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Referer": "https://www.cookie.fun/tokens/zama",
            "Origin": "https://www.cookie.fun",
            "x-trpc-source": "nextjs-react", // Ye header bahut zaroori hai
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        console.log(`❌ Cookie API Error (${timeframe}): ${res.status} ${res.statusText}`);
        return { timeframe, found: false };
    }

    const responseData = await res.json();
    const list = responseData?.result?.data?.json || [];

    if (!list.length) return { timeframe, found: false };

    // 4. User Matching Logic
    for (let i = 0; i < list.length; i++) {
      const row = list[i];
      
      // Handle array vs string
      let twitterHandle = "";
      if (Array.isArray(row.twitterUsernames)) {
        twitterHandle = row.twitterUsernames[0]?.toLowerCase() || "";
      } else if (typeof row.twitterUsernames === "string") {
        twitterHandle = row.twitterUsernames.toLowerCase();
      }
        
      const name = (row.name || "").toLowerCase();

      // Check match
      if (twitterHandle === u || name === u || name.includes(u)) {
        
        // Mindshare Extraction
        let msValue = 0;
        if (row[dataPoint] && typeof row[dataPoint].mindshare !== 'undefined') {
            msValue = row[dataPoint].mindshare;
        } else if (typeof row.mindshare !== 'undefined') {
            msValue = row.mindshare;
        }

        return {
          timeframe,
          rank: i + 1,
          username: row.twitterUsernames?.[0] || row.name,
          displayName: row.name,
          mindshare: msValue,
          found: true
        };
      }
    }
  } catch (err) {
    console.error(`S5 Search Failed (${timeframe}):`, err);
  }

  return { timeframe, found: false };
}

// ---------- S1–S4 HISTORY LOOKUP (Wahi Purana) ----------
function getSeasonHistory(username: string): any[] {
  const clean = username.toLowerCase().replace("@", "");
  const SEASONS = ["S1", "S2", "S3", "S4"];

  return SEASONS.map((s) => {
    const rows = (seasons as any)[s] || [];
    const match = rows.find(
      (r: any) =>
        r.handle?.toLowerCase() === clean ||
        r.username?.toLowerCase() === clean
    );

    return {
      season: s,
      rank: match ? match.rank : null,
    };
  });
}

// ---------- MAIN ROUTE ----------
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "username required" }, { status: 400 });
  }

  const clean = username.trim().replace(/^@/, "");
  // Check all timeframes
  const TIMEFRAMES = ["24h", "7d", "30d"];

  try {
    const [tfResults, history] = await Promise.all([
      Promise.all(TIMEFRAMES.map((tf) => searchUser(clean, tf))),
      Promise.resolve(getSeasonHistory(clean)),
    ]);

    const body: any = { username: clean };

    for (const r of tfResults) {
      body[r.timeframe] = r;
    }

    body.history = history;

    return NextResponse.json(body);
  } catch (err) {
    console.error("find-rank error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}