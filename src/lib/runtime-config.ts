const databaseEnvKeys = ["DATABASE_URL"] as const;
const paytrEnvKeys = [
  "PAYTR_MERCHANT_ID",
  "PAYTR_MERCHANT_KEY",
  "PAYTR_MERCHANT_SALT"
] as const;
const adminAuthEnvKeys = ["ADMIN_JWT_SECRET"] as const;
const supabaseServerEnvKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY"
] as const;

export type RuntimeEnvKey =
  | (typeof databaseEnvKeys)[number]
  | (typeof paytrEnvKeys)[number]
  | (typeof adminAuthEnvKeys)[number]
  | (typeof supabaseServerEnvKeys)[number];

type RuntimeConfigArea = "database" | "paytr" | "adminAuth" | "supabase";

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

export function hasDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function assertConfig(keys: readonly RuntimeEnvKey[], area: RuntimeConfigArea, message: string) {
  const missingKeys = listMissingEnv(keys);

  if (missingKeys.length > 0) {
    throw new RuntimeConfigError({
      area,
      missingKeys,
      message
    });
  }
}

export function assertDatabaseConfig() {
  if (hasDatabaseConfig()) {
    return;
  }

  assertConfig(
    databaseEnvKeys,
    "database",
    "Veritabani baglantisi kurulamadı. DATABASE_URL tanimli ve erisilebilir bir PostgreSQL ya da Supabase baglantisini isaret etmelidir."
  );
}

export function assertAdminAuthConfig() {
  assertConfig(
    adminAuthEnvKeys,
    "adminAuth",
    "Admin oturum yonetimi eksik. ADMIN_JWT_SECRET tanimli olmadan /admin route korumasi acilamaz."
  );
}

export function getPaytrConfig() {
  assertConfig(
    paytrEnvKeys,
    "paytr",
    "PayTR yapilandirmasi eksik. PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY ve PAYTR_MERCHANT_SALT tanimlanmalidir."
  );

  return {
    merchantId: process.env.PAYTR_MERCHANT_ID as string,
    merchantKey: process.env.PAYTR_MERCHANT_KEY as string,
    merchantSalt: process.env.PAYTR_MERCHANT_SALT as string
  };
}

export function getAdminAuthConfig() {
  assertAdminAuthConfig();

  return {
    jwtSecret: process.env.ADMIN_JWT_SECRET as string,
    cookieName: "parkchargeev_admin_session",
    sessionTtlSeconds: 60 * 60 * 12
  };
}

export function getSupabaseServerConfig() {
  assertConfig(
    supabaseServerEnvKeys,
    "supabase",
    "Supabase sunucu baglantisi eksik. NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY ve SUPABASE_SERVICE_ROLE_KEY tanimlanmalidir."
  );

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY as string
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
