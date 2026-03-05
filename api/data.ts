/**
 * Sync API: GET returns stored data for the user; POST saves data.
 * Protected by SYNC_SECRET (Authorization: Bearer <secret>).
 * Data is stored in Vercel Blob (one JSON file per user).
 */

import { put, get } from "@vercel/blob";

const PREFIX = "habicard-sync/";

function safePath(user: string): string {
  const sanitized = encodeURIComponent(user.trim().toLowerCase()).replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${PREFIX}${sanitized}.json`;
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin || "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function GET(request: Request): Promise<Response> {
  const origin = request.headers.get("Origin") || null;
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  const secret = process.env.SYNC_SECRET;
  const auth = request.headers.get("Authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }
  const url = new URL(request.url);
  const user = url.searchParams.get("user");
  if (!user || !user.includes("@")) {
    return new Response(JSON.stringify({ error: "Missing or invalid user" }), {
      status: 400,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }
  try {
    const pathname = safePath(user);
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return new Response(JSON.stringify(null), {
        status: 200,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }
    const text = await new Response(result.stream).text();
    const data = text ? JSON.parse(text) : null;
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Sync GET error", e);
    return new Response(JSON.stringify({ error: "Failed to load data" }), {
      status: 500,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get("Origin") || null;
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  const secret = process.env.SYNC_SECRET;
  const auth = request.headers.get("Authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }
  let body: { user?: string; data?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }
  const user = body?.user;
  if (!user || typeof user !== "string" || !user.includes("@")) {
    return new Response(JSON.stringify({ error: "Missing or invalid user" }), {
      status: 400,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }
  const data = body?.data;
  if (data === undefined) {
    return new Response(JSON.stringify({ error: "Missing data" }), {
      status: 400,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }
  try {
    const pathname = safePath(user);
    await put(pathname, JSON.stringify(data), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Sync POST error", e);
    return new Response(JSON.stringify({ error: "Failed to save data" }), {
      status: 500,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
