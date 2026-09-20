import type { Metadata } from "next";

import "@/styles/globals.css";
import "@/styles/admin.css";
import { AdminAuthProvider } from "@/components/admin/Auth";

export const metadata: Metadata = {
  title: "Adaptis admin",
  // The editing surface is never indexed.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
