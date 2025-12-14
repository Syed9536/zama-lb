import { NextRequest, NextResponse } from "next/server";
import seasons from "@/data/seasons.json";

// 👇 TERA COOKIE YAHAN ADD KAR DIYA HAI
const MY_COOKIE = "__Host-authjs.csrf-token=358f4a65707003a0d62310e7b3591e0a4b0162ee7842da9ebf15b56989159ef2%7Cf40d0624bbe3f5823433aa98c3f71790c60f505e7b7ee32aa7fb647853e60ce3; __Secure-authjs.callback-url=https%3A%2F%2Fwww.cookie.fun%2Ftokens%2Fzama; cf_clearance=uLfgHZ325_DZSD3RvBBCwE1CQRjTnq4Dg4coLTIL3r0-1765688185-1.2.1.1-w6vojytx8xkVv8rdW1btxo021Hn8abx8Mwl5AhXhvA26_xjp3.lIoQ41YN7Aam1KcsxuowmP5pwvzuzLdMejGbidURNYOqymOFDlKN3nEbdBPe8esCY3KX2GV45mrAmzREzl2v5m9M2J4sO32ztKbC3gcm7ZkEeHS.6HbaBFGY8GABbTqM.t6lYOuZ4SaFDlEktTDMqGxSFKLhiKXc05v2J192rJsTByc42R7vNPswU9H2GSU6bPnriJnMmr_l2a";

// ---------- LIVE S5 SEARCH (Cookie.fun) ----------
async function searchUser(username: string, timeframe: string): Promise<any> {
  const u = username.toLowerCase();

  // 1. Timeframe Mapping
  let dataPoint = "_24HoursAgo"; 
  if (timeframe === "7d") dataPoint = "_7DaysAgo";
  if (timeframe === "30d") dataPoint = "_30DaysAgo"; 

  // 2. Exact Input Object
  const inputObj = {
    json: {
      projectsFilter: { searchFilter: "zama" },
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
            // ✅ HEADERS MEIN TERA COOKIE USE HO RAHA HAI
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Referer": "https://www.cookie.fun/tokens/zama",
            "Origin": "https://www.cookie.fun",
            "Cookie": MY_COOKIE, 
            "x-trpc-source": "nextjs-react",
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        console.error(`❌ Cookie API Error (${timeframe}): ${res.status}`);
        return { timeframe, found: false };
    }

    const responseData = await res.json();
    const list = responseData?.result?.data?.json || [];

    if (!list.length) return { timeframe, found: false };

    // 4. User Matching Logic
    for (let i = 0; i < list.length; i++) {
      const row = list[i];
      
      let twitterHandle = "";
      if (Array.isArray(row.twitterUsernames)) {
        twitterHandle = row.twitterUsernames[0]?.toLowerCase() || "";
      } else if (typeof row.twitterUsernames === "string") {
        twitterHandle = row.twitterUsernames.toLowerCase();
      }
        
      const name = (row.name || "").toLowerCase();

      // Check match
      if (twitterHandle === u || name === u || name.includes(u)) {
        
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

// ---------- S1–S4 HISTORY LOOKUP (Unchanged) ----------
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
  // Sirf 24h aur 7d check karte hain, 30d option optional rakhte hain
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