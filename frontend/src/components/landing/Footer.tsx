"use client";

import React from "react";
import Link from "next/link";
import { FaHeart, FaGithub } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";

export function Footer() {
  return (
    <footer className="w-full relative z-20 border-t border-zinc-800/80 bg-zinc-950/90 py-16 text-xs text-zinc-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand Info */}
          <div className="space-y-3 max-w-sm">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 group-hover:border-zinc-700 transition-all shadow-sm">
                <FaHeart className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-base font-bold tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                KindCrew
              </span>
            </Link>
            <p className="text-zinc-400 leading-relaxed text-xs">
              The autonomous creator workspace for researching, drafting, and distributing high-impact multi-platform content.
            </p>
          </div>

          {/* Quick Links & Author */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            <div className="space-y-2.5">
              <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px] block">
                Platform
              </span>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
                    Creator Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/content/library" className="text-zinc-400 hover:text-white transition-colors">
                    Content Studio
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="text-zinc-400 hover:text-white transition-colors">
                    Creator Profile
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="text-zinc-400 hover:text-white transition-colors">
                    Settings & Security
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px] block">
                Architecture
              </span>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-zinc-400 hover:text-white transition-colors">
                    Deterministic Context
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-zinc-400 hover:text-white transition-colors">
                    Predictive Ideation
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-zinc-400 hover:text-white transition-colors">
                    Multi-Platform Engine
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-zinc-400 hover:text-white transition-colors">
                    Cadence Calendar
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5 col-span-2 sm:col-span-1">
              <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px] block">
                Author & Open Source
              </span>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://github.com/vedrathavi/AI-For-Bharat_KindCrew"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors font-medium"
                  >
                    <FaGithub className="w-4 h-4 text-zinc-300" />
                    <span>GitHub Repository</span>
                    <FiExternalLink className="w-3 h-3 text-zinc-500" />
                  </a>
                </li>
                <li className="text-zinc-300 pt-1">
                  Built by <span className="font-bold text-white">Ved Rathavi</span>
                </li>

              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Attribution Bar */}
        <div className="pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-zinc-400">
            © {new Date().getFullYear()} KindCrew. Engineered by <span className="text-zinc-200 font-medium">Ved Rathavi</span>. All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-zinc-300 text-[11px]">Made with ❤️ for Creators</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
