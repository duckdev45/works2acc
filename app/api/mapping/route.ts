import { NextRequest, NextResponse } from "next/server";

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL!;

function missingUrl() {
  return NextResponse.json({ error: "APPS_SCRIPT_URL not configured" }, { status: 500 });
}

// GET — 讀現有對照表
export async function GET() {
  if (!APPS_SCRIPT_URL) return missingUrl();

  const res = await fetch(APPS_SCRIPT_URL, { redirect: "follow" });
  if (!res.ok) {
    return NextResponse.json({ error: `Upstream ${res.status}` }, { status: 502 });
  }
  const data = await res.json().catch(() => ({ rows: [] }));
  return NextResponse.json(data);
}

// POST — 清空舊資料再全量寫入
export async function POST(req: NextRequest) {
  if (!APPS_SCRIPT_URL) return missingUrl();

  const body = await req.json();

  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(body),
    redirect: "follow",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json({ error: text || `Upstream ${res.status}` }, { status: 502 });
  }

  const data = await res.json().catch(() => ({ success: true }));
  return NextResponse.json(data);
}
