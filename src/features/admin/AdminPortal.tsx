"use client";

import { useSyncExternalStore } from "react";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";

const ADMIN_AUTH_KEY = "xtream_admin_auth";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

export function AdminPortal() {
  const isAuthenticated = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleLoginSuccess = () => {
    try {
      sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
      window.dispatchEvent(new Event("storage"));
    } catch {
      // sessionStorage might be restricted
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Ignore
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={handleLoginSuccess} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

