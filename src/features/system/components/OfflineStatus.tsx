"use client";

import { StatusPage } from "./StatusPage";

export function OfflineStatus() {
  return (
    <StatusPage
      title="system.offline.title"
      lede="system.offline.lede"
      icon={<span className="offline-symbol">{"///"}</span>}
      action={{ label: "system.offline.retry", onClick: () => window.location.reload() }}
      showLinks={false}
    />
  );
}
