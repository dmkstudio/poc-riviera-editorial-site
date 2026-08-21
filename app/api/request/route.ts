import { NextResponse } from "next/server";
import { requests } from "../../../db/schema";
import { getDb } from "../../../db";
import { env } from "cloudflare:workers";

const directions = new Set([
  "business",
  "property",
  "relocation",
  "mobility",
  "brand",
  "custom",
  "unsure",
]);
const locales = new Set(["en", "fr", "ru"]);
const MAX_BODY_BYTES = 16_384;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;
const REQUEST_RECIPIENT = "contact.poc@gmail.com";
const windows = new Map<string, { count: number; resetAt: number }>();
const noStore = { "Cache-Control": "no-store" };

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>\"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '\"': "&quot;",
    "'": "&#39;",
  })[character] || character);
}

async function sendRequestEmail({ name, email, phone, direction, task, locale, sourcePath }: {
  name: string;
  email: string;
  phone: string;
  direction: string;
  task: string;
  locale: string;
  sourcePath: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  const from = process.env.RESEND_FROM_EMAIL || "POC Website <onboarding@resend.dev>";
  const subject = `[POC] New private request — ${direction}`;
  const text = [
    "New private request",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "—"}`,
    `Direction: ${direction}`,
    `Locale: ${locale}`,
    `Source: ${sourcePath}`,
    "",
    "What needs to be resolved:",
    task,
  ].join("\n");
  const html = `
    <h2>New private request</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone || "—")}</p>
    <p><strong>Direction:</strong> ${escapeHtml(direction)}</p>
    <p><strong>Locale:</strong> ${escapeHtml(locale)}</p>
    <p><strong>Source:</strong> ${escapeHtml(sourcePath)}</p>
    <h3>What needs to be resolved</h3>
    <p>${escapeHtml(task).replace(/\n/g, "<br />")}</p>
  `;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [REQUEST_RECIPIENT], reply_to: email, subject, text, html }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend rejected request: ${response.status} ${detail.slice(0, 300)}`);
  }
}

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, { status, headers: noStore });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return json({ ok: false, error: "origin" }, 403);
  }
  if (!(request.headers.get("content-type") || "").toLowerCase().includes("application/json")) {
    return json({ ok: false, error: "content_type" }, 415);
  }
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) return json({ ok: false, error: "too_large" }, 413);
  const client = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now(); const bucket = windows.get(client);
  if (!bucket || bucket.resetAt <= now) windows.set(client, { count: 1, resetAt: now + WINDOW_MS });
  else if (bucket.count >= MAX_REQUESTS_PER_WINDOW) return json({ ok: false, error: "rate_limited" }, 429);
  else bucket.count += 1;
  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) return json({ ok: false, error: "too_large" }, 413);
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const name = clean(body.name, 100);
  const email = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone, 40);
  const direction = clean(body.direction, 30);
  const task = clean(body.task, 3000);
  const locale = clean(body.locale, 2);
  const rawSourcePath = clean(body.sourcePath, 250);
  const sourcePath = rawSourcePath.startsWith("/") ? rawSourcePath : "/";
  const website = clean(body.website, 200);

  // Quietly accept bot-trap submissions without persisting or revealing the check.
  if (website) return json({ ok: true }, 201);

  if (
    name.length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !directions.has(direction) ||
    task.length < 20 ||
    !locales.has(locale)
  ) {
    return json({ ok: false, error: "validation" }, 422);
  }

  try {
    const id = crypto.randomUUID();
    const d1 = env.DB;
    if (!d1) return json({ ok: false, error: "unavailable" }, 503);
    await d1.batch([
      d1.prepare(`CREATE TABLE IF NOT EXISTS requests (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        direction TEXT NOT NULL,
        task TEXT NOT NULL,
        locale TEXT NOT NULL,
        source_path TEXT NOT NULL,
        status TEXT DEFAULT 'new' NOT NULL,
        created_at INTEGER NOT NULL
      )`),
      d1.prepare("CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at)"),
      d1.prepare("CREATE INDEX IF NOT EXISTS idx_requests_status_created_at ON requests(status, created_at)"),
    ]);
    await getDb().insert(requests).values({
      id,
      name,
      email,
      phone: phone || null,
      direction,
      task,
      locale,
      sourcePath,
      status: "new",
      createdAt: Date.now(),
    });
    try {
      await sendRequestEmail({ name, email, phone, direction, task, locale, sourcePath });
    } catch (error) {
      console.error("POC request email delivery failed", error);
      return json({ ok: false, error: "email_unavailable", requestId: id }, 503);
    }
    return json({ ok: true, requestId: id }, 201);
  } catch (error) {
    console.error("POC request persistence failed", error);
    return json({ ok: false, error: "unavailable" }, 503);
  }
}
