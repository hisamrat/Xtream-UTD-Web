import { Metadata } from "next";
import { AdminLoginClient } from "@/components/admin/AdminLoginClient";

export const metadata: Metadata = {
  title: "Admin Portal | Xtream UTD",
  description: "Administrative console for Xtream UTD store settings and inventory.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  return <AdminLoginClient />;
}
