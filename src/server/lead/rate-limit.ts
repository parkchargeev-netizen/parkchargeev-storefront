type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const attempts = new Map<string, RateLimitBucket>();

function getRequestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "local"
  );
}

export function getLeadRateLimitKey(request: Request, email: string) {
  return ["lead", getRequestIp(request), email.toLowerCase()].join(":");
}

export function consumeLeadAttempt(key: string, limit = 4, windowMs = 10 * 60 * 1000) {
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

  attempts.set(key, {
    count: current.count + 1,
    resetAt: current.resetAt
  });

  return {
    allowed: true,
    retryAfterSeconds: 0
  };
}
