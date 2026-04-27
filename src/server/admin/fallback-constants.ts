import type { AdminRole } from "@/server/auth/authorization";

export const bootstrapAdminId = "00000000-0000-4000-8000-000000000001";

type FallbackAdminSeed = {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  status: "active";
};

export const fallbackAssignableAdminSeeds: FallbackAdminSeed[] = [
  {
    id: "00000000-0000-4000-8000-000000000002",
    email: "satis@parkchargeev.local",
    fullName: "Selin Kaya",
    role: "sales",
    status: "active"
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    email: "operasyon@parkchargeev.local",
    fullName: "Emre Acar",
    role: "operations",
    status: "active"
  }
];
