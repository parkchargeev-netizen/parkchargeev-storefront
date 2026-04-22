const databaseEnvKeys = ["DATABASE_URL"] as const;
const paytrEnvKeys = [
  "PAYTR_MERCHANT_ID",
  "PAYTR_MERCHANT_KEY",
  "PAYTR_MERCHANT_SALT"
] as const;

export type RuntimeEnvKey =
  | (typeof databaseEnvKeys)[number]
  | (typeof paytrEnvKeys)[number];

type RuntimeConfigArea = "database" | "paytr";

type RuntimeConfigErrorInput = {
  area: RuntimeConfigArea;
  missingKeys: RuntimeEnvKey[];
  message: string;
};

export class RuntimeConfigError extends Error {
  readonly area: RuntimeConfigArea;
  readonly missingKeys: RuntimeEnvKey[];

  constructor({ area, missingKeys, message }: RuntimeConfigErrorInput) {
    super(message);
    this.name = "RuntimeConfigError";
    this.area = area;
    this.missingKeys = missingKeys;
  }
}

function listMissingEnv(keys: readonly RuntimeEnvKey[]) {
  return keys.filter((key) => !process.env[key]?.trim());
}

export function assertDatabaseConfig() {
  const missingKeys = listMissingEnv(databaseEnvKeys);

  if (missingKeys.length > 0) {
    throw new RuntimeConfigError({
      area: "database",
      missingKeys,
      message:
        "Veritabanı bağlantısı kurulamadı. DATABASE_URL tanımlanmalı ve erişilebilir bir PostgreSQL örneğine işaret etmelidir."
    });
  }
}

export function getPaytrConfig() {
  const missingKeys = listMissingEnv(paytrEnvKeys);

  if (missingKeys.length > 0) {
    throw new RuntimeConfigError({
      area: "paytr",
      missingKeys,
      message:
        "PayTR yapılandırması eksik. PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY ve PAYTR_MERCHANT_SALT tanımlanmalıdır."
    });
  }

  return {
    merchantId: process.env.PAYTR_MERCHANT_ID as string,
    merchantKey: process.env.PAYTR_MERCHANT_KEY as string,
    merchantSalt: process.env.PAYTR_MERCHANT_SALT as string
  };
}

export function getRuntimeConfigErrorPayload(error: RuntimeConfigError) {
  return {
    ok: false as const,
    code: "runtime_configuration_error" as const,
    area: error.area,
    message: error.message,
    missingEnvironment: error.missingKeys
  };
}

export function isRuntimeConfigError(error: unknown): error is RuntimeConfigError {
  return error instanceof RuntimeConfigError;
}
