import { REVIEW_EXISTS_QUERY } from "@/sanity/queries";
import { writeClient } from "@/sanity/write-client";
import { clientIp, rateLimit } from "../../../_lib/rate-limit";

const ID_RE = /^[a-zA-Z0-9._-]{1,128}$/;

/** Counts a "helpful" vote on a published review. */
export async function POST(req: Request) {
  if (!writeClient) return new Response(null, { status: 503 });

  const { id } = (await req.json().catch(() => ({}))) as { id?: unknown };
  if (typeof id !== "string" || !ID_RE.test(id) || id.startsWith("drafts.")) {
    return new Response(null, { status: 400 });
  }

  const ip = clientIp(req);
  if (!rateLimit(`helpful:${ip}:${id}`, 1, 24 * 60 * 60 * 1000) || !rateLimit(`helpful:${ip}`, 30, 60 * 60 * 1000)) {
    return new Response(null, { status: 429 });
  }

  const exists = await writeClient.withConfig({ perspective: "published" }).fetch(REVIEW_EXISTS_QUERY, { id });
  if (!exists) return new Response(null, { status: 404 });

  try {
    await writeClient.patch(id).setIfMissing({ helpfulCount: 0 }).inc({ helpfulCount: 1 }).commit({ autoGenerateArrayKeys: false });
  } catch (err) {
    console.error("[reviews] helpful vote failed", err);
    return new Response(null, { status: 500 });
  }
  return new Response(null, { status: 204 });
}
