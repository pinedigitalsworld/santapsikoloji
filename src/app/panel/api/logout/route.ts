import { NextResponse } from "next/server";
import { HINT_COOKIE, SESSION_COOKIE, sameOrigin } from "@/lib/auth";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(HINT_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
