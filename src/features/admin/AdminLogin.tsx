"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldAlert, ShieldCheck } from "lucide-react";

type AdminLoginProps = {
  onSuccess: () => void;
};

export function AdminLogin({ onSuccess }: AdminLoginProps) {
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
      // Configured administrative credentials
      const cleanEmail = email.trim().toLowerCase();
      if (
        (cleanEmail === "xtreamutd@gmail.com" || cleanEmail === "admin@xtreamutd.com") &&
        password === "Xsam.@2025"
      ) {
        setLoading(false);
        onSuccess();
      } else {
        setErrorMsg("Invalid administrative credentials. Access denied.");
        setLoading(false);
      }
    }, 350);
  };

  return (
    <div className="admin-portal-wrapper">
      <div className="admin-bg-glow-top" aria-hidden="true" />
      <div className="admin-bg-glow-bottom" aria-hidden="true" />

      <div className="admin-portal-card">
        {/* Card Header */}
        <div className="admin-card-header">
          <div className="admin-icon-glow">
            <ShieldCheck size={28} className="admin-icon-svg" />
          </div>
          <h1 className="admin-card-title">Xtream UTD Admin</h1>
          <p className="admin-card-subtitle">
            Administrative management console. Sign in to manage store catalog, inventory, and website information.
          </p>
        </div>

        {/* Error Box */}
        {errorMsg && (
          <div className="admin-error-box" role="alert">
            <ShieldAlert size={16} className="admin-error-icon" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-field">
            <label className="admin-field-label" htmlFor="admin-email">
              Admin Email
            </label>
            <div className="admin-input-wrap">
              <Mail size={16} className="admin-input-icon" aria-hidden="true" />
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
              <Lock size={16} className="admin-input-icon" aria-hidden="true" />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-text-input has-eye-btn"
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
            {loading ? (
              <span className="admin-btn-loading">
                <span className="admin-spinner" aria-hidden="true" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <span>Access Admin Portal</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="admin-footer-links">
          <Link href="/" className="admin-return-link">
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Return to Store</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

