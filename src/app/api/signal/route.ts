import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { recordSignal } from "@/lib/analytics/ingest";
import { rateLimit } from "@/lib/analytics/rate";

export async function POST(request: Request) {
  const key = createHash("sha256")
    .update(request.headers.get("x-forwarded-for") ?? "local")
    .update(request.headers.get("user-agent") ?? "")
    .digest("hex")
    .slice(0, 16);
  if (!rateLimit(key, 90, 60_000)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const result = await recordSignal({
      body: {
        name: typeof body.name === "string" ? body.name : undefined,
        path: typeof body.path === "string" ? body.path : undefined,
        referrer: typeof body.referrer === "string" ? body.referrer : undefined,
        utmSource: typeof body.utmSource === "string" ? body.utmSource : undefined,
        utmMedium: typeof body.utmMedium === "string" ? body.utmMedium : undefined,
        utmCampaign: typeof body.utmCampaign === "string" ? body.utmCampaign : undefined,
        utmTerm: typeof body.utmTerm === "string" ? body.utmTerm : undefined,
        utmContent: typeof body.utmContent === "string" ? body.utmContent : undefined,
        screen: typeof body.screen === "string" ? body.screen : undefined,
        connection: typeof body.connection === "string" ? body.connection : undefined,
        engagementMs: typeof body.engagementMs === "number" ? body.engagementMs : undefined,
        scroll: typeof body.scroll === "number" ? body.scroll : undefined,
        detail: typeof body.detail === "string" ? body.detail : undefined,
        score: typeof body.score === "number" ? body.score : undefined,
      },
      userAgent: request.headers.get("user-agent"),
      cookieHeader: request.headers.get("cookie"),
      address: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip"),
    });
    const response = NextResponse.json({ ok: true });
    if (!result.ignored) {
      for (const cookie of result.setCookies) response.headers.append("Set-Cookie", cookie);
    }
    return response;
  } catch (error) {
    console.error("[signal]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
