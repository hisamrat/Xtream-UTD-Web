import type { Metadata } from "next";
import { OfflineStatus } from "@/features/system/components/OfflineStatus";

export const metadata: Metadata = {
  title: "Offline",
  description: "Xtream UTD offline state."
};

export default function OfflinePage() {
  return <OfflineStatus />;
}
