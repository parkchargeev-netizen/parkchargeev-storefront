type LogLevel = "info" | "warn" | "error";

type LogFields = Record<string, unknown>;

const sensitiveKeyPattern = /(password|secret|token|hash|key|salt|authorization|cookie)/i;

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
        key,
        sensitiveKeyPattern.test(key) ? "[redacted]" : sanitizeValue(nestedValue)
      ])
    );
  }

  return value;
}

function writeLog(level: LogLevel, event: string, fields: LogFields = {}) {
  const sanitizedFields = sanitizeValue(fields) as LogFields;
  const entry = {
    level,
    event,
    service: "parkchargeev-storefront",
    timestamp: new Date().toISOString(),
    ...sanitizedFields
  };
  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.info(line);
}

export function logInfo(event: string, fields?: LogFields) {
  writeLog("info", event, fields);
}

export function logWarn(event: string, fields?: LogFields) {
  writeLog("warn", event, fields);
}

export function logError(event: string, error: unknown, fields: LogFields = {}) {
  writeLog("error", event, {
    ...fields,
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message
          }
        : String(error)
  });
}

export function durationSince(startedAt: number) {
  return Date.now() - startedAt;
}
