type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const attempts = new Map<string, RateLimitBucket>();

export function getCustomerAuthRateLimitKey(request: Request, scope: string, email?: string) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "local";

  return [scope, ipAddress, email?.toLowerCase() ?? "anonymous"].join(":");
}

export function consumeCustomerAuthAttempt(
  key: string,
  limit = 8,
  windowMs = 15 * 60 * 1000
) {
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, {
      count: 1,
      resetAt: now + windowMs
    });

    return {
      allowed: true,
      remaining: limit - 1,
      retryAfterSeconds: 0
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000)
    };
  }

  current.count += 1;
  attempts.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(limit - current.count, 0),
    retryAfterSeconds: 0
  };
}
