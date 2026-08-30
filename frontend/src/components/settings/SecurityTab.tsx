"use client";

import React from "react";
import { FiCheck, FiLock, FiAlertCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

interface SecurityTabProps {
  providers: { type: string; connected: boolean }[];
  providersLoading: boolean;
  providersError: string | null;
  onConnectGoogle: () => void;
  onOpenPasswordModal: () => void;
}

export function SecurityTab({
  providers,
  providersLoading,
  providersError,
  onConnectGoogle,
  onOpenPasswordModal,
}: SecurityTabProps) {
  const googleConnected = !!providers.find((p) => p.type === "google" && p.connected);
  const passwordConnected = !!providers.find((p) => p.type === "password" && p.connected);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-zinc-100">
          Connected Login Methods
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Manage your verified authentication credentials. You can connect both Google OAuth and Email/Password to access your account seamlessly from either method.
        </p>
      </div>

      {providersError && (
        <div className="p-4 rounded-xl border border-rose-900/60 bg-rose-950/30 text-rose-300 text-xs flex items-center gap-2">
          <FiAlertCircle className="w-4 h-4 shrink-0" />
          <span>{providersError}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Google Provider Card */}
        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl shadow-inner">
              <FcGoogle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-100">
                Google Account
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                {googleConnected
                  ? "Federated sign-in via Google OAuth is active."
                  : "Connect your Google profile for one-click OAuth sign in."}
              </p>
            </div>
          </div>

          <div>
            {googleConnected ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-3.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Connected</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onConnectGoogle}
                disabled={providersLoading}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
              >
                Connect Google
              </button>
            )}
          </div>
        </div>

        {/* Email & Password Provider Card */}
        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 shadow-inner">
              <FiLock className="w-4 h-4 text-zinc-300" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-100">
                Email & Password
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                {passwordConnected
                  ? "Standard Cognito email & password credentials are active."
                  : "Add a password to sign in without requiring Google."}
              </p>
            </div>
          </div>

          <div>
            {passwordConnected ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-3.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Connected</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenPasswordModal}
                disabled={providersLoading}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
              >
                Add Password
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
