import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ParkChargeEV Admin",
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
