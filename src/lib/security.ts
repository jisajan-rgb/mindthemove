import { NextRequest } from "next/server";

export function getClientIp(request: NextRequest | Request) {
  if (request instanceof Request && !("headers" in request)) return "unknown";

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";

  return request.headers.get("x-real-ip") || "unknown";
}

export function isSpamTrapFilled(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}
