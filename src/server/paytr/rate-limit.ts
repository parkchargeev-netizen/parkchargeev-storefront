type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const attempts = new Map<string, RateLimitBucket>();

export function getPaytrTokenRateLimitKey(request: Request, email: string) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "local";

  return ["paytr-token", ipAddress, email.toLowerCase()].join(":");
}

export function consumePaytrTokenAttempt(key: string, limit = 6, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, {
      count: 1,
      resetAt: now + windowMs
    });

    return {
      allowed: true,
      retryAfterSeconds: 0
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000)
    };
  }

  current.count += 1;
  attempts.set(key, current);

  return {
    allowed: true,
    retryAfterSeconds: 0
  };
}
