"use client";

import { useEffect } from "react";
import { StatusPage } from "@/features/system/components/StatusPage";

export default function RouteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <StatusPage title="system.error.title" lede="system.error.lede" action={{ label: "system.error.retry", onClick: retry }} />;
}
