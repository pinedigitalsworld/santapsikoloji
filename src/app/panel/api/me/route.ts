import { isAdmin } from "@/lib/auth";

export async function GET() {
  return (await isAdmin()) ? Response.json({ ok: true }) : Response.json({ ok: false }, { status: 401 });
}
