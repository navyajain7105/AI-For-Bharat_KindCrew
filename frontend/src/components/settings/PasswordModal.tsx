"use client";

import React from "react";
import { FiEye, FiEyeOff, FiX, FiCheck, FiCircle } from "react-icons/fi";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  confirmInput: string;
  setConfirmInput: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean | ((prev: boolean) => boolean)) => void;
  showConfirm: boolean;
  setShowConfirm: (val: boolean | ((prev: boolean) => boolean)) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export function PasswordModal({
  isOpen,
  onClose,
  passwordInput,
  setPasswordInput,
  confirmInput,
  setConfirmInput,
  showPassword,
  setShowPassword,
  showConfirm,
  setShowConfirm,
  onSubmit,
  loading,
}: PasswordModalProps) {
  if (!isOpen) return null;

  const hasMinLength = passwordInput.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordInput);
  const hasLowercase = /[a-z]/.test(passwordInput);
  const hasNumber = /[0-9]/.test(passwordInput);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(passwordInput);
  const passwordsMatch = passwordInput.length > 0 && passwordInput === confirmInput;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-7 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-100">
              Create Email & Password Credential
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Add native email & password login to your existing account.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter strong password"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-600 transition-colors"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Live Password Checklist */}
          {passwordInput.length > 0 && (
            <div className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50 space-y-1.5 text-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Password Requirements
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 ${
                    hasMinLength ? "text-emerald-400 font-medium" : "text-zinc-500"
                  }`}
                >
                  {hasMinLength ? (
                    <FiCheck className="w-3.5 h-3.5" />
                  ) : (
                    <FiCircle className="w-3.5 h-3.5" />
                  )}
                  <span>8+ characters</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasUppercase ? "text-emerald-400 font-medium" : "text-zinc-500"
                  }`}
                >
                  {hasUppercase ? (
                    <FiCheck className="w-3.5 h-3.5" />
                  ) : (
                    <FiCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Uppercase (A-Z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasLowercase ? "text-emerald-400 font-medium" : "text-zinc-500"
                  }`}
                >
                  {hasLowercase ? (
                    <FiCheck className="w-3.5 h-3.5" />
                  ) : (
                    <FiCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Lowercase (a-z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasNumber ? "text-emerald-400 font-medium" : "text-zinc-500"
                  }`}
                >
                  {hasNumber ? (
                    <FiCheck className="w-3.5 h-3.5" />
                  ) : (
                    <FiCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Number (0-9)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasSymbol ? "text-emerald-400 font-medium" : "text-zinc-500"
                  }`}
                >
                  {hasSymbol ? (
                    <FiCheck className="w-3.5 h-3.5" />
                  ) : (
                    <FiCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Symbol (!@#$)</span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="Confirm password"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-600 transition-colors"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirm ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
            </div>
            {confirmInput.length > 0 && !passwordsMatch && (
              <p className="text-[11px] text-rose-400 font-medium">
                Passwords do not match.
              </p>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                !hasMinLength ||
                !hasUppercase ||
                !hasLowercase ||
                !hasNumber ||
                !hasSymbol ||
                !passwordsMatch
              }
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? "Linking..." : "Save Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
