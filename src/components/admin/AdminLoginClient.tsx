"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldAlert, ShieldCheck } from "lucide-react";
import { AdminDashboard } from "./AdminDashboard";

export function AdminLoginClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    setTimeout(() => {
      // Configured credentials
      if (email.trim() === "xtreamutd@gmail.com" && password === "Xsam.@2025") {
        setIsAuthenticated(true);
        setLoading(false);
      } else {
        setErrorMsg("Invalid administrative credentials. Access denied.");
        setLoading(false);
      }
    }, 450);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
    setErrorMsg("");
  };

  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="admin-portal-wrapper">
      <div className="admin-portal-card">
        {/* Card Header */}
        <div className="admin-card-header">
          <div className="admin-icon-glow">
            <ShieldCheck size={28} className="admin-icon-svg" />
          </div>
          <h1 className="admin-card-title">Xtream UTD Admin</h1>
          <p className="admin-card-subtitle">
            Restricted management access. Authenticate to manage inventory and store settings.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="admin-error-box" role="alert">
            <ShieldAlert size={16} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-field">
            <label className="admin-field-label" htmlFor="admin-email">
              Admin Email
            </label>
            <div className="admin-input-wrap">
              <Mail size={16} className="admin-input-icon" />
              <input
                id="admin-email"
                type="email"
                required
                placeholder="xtreamutd@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-text-input"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-field-label" htmlFor="admin-password">
              Security Key
            </label>
            <div className="admin-input-wrap">
              <Lock size={16} className="admin-input-icon" />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-text-input pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="admin-eye-btn"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="admin-submit-btn">
            {loading ? "Authenticating..." : "Access Admin Portal"}
          </button>
        </form>

        {/* Return to Store */}
        <div className="admin-footer-links">
          <Link href="/" className="admin-return-link">
            <ArrowLeft size={14} />
            <span>Return to Store</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
