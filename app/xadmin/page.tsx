import type { Metadata } from "next";
import { AdminPortal } from "@/features/admin/AdminPortal";

export const metadata: Metadata = {
  title: "Admin Portal | Xtream UTD",
  description: "Administrative console for Xtream UTD store settings and inventory.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  return <AdminPortal />;
}

