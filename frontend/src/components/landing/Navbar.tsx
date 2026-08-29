"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import { FiArrowRight, FiMenu, FiX } from "react-icons/fi";

interface NavbarProps {
  authenticated: boolean;
  onLogin: () => void;
  loading: boolean;
}

export function Navbar({ authenticated, onLogin, loading }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Platform", href: "#features" },
    { name: "Creator Context", href: "#features" },
    { name: "Multi-Platform Studio", href: "#features" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/90 backdrop-blur-md border-b border-zinc-800/80 py-3.5 shadow-xl shadow-black/40"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 group-hover:scale-105 group-hover:border-zinc-700 transition-all shadow-sm">
            <FaHeart className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-zinc-200 transition-colors">
            KindCrew
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-sm px-3 shadow-inner">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="px-4 py-1.5 rounded-full text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {authenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            >
              <span>Open Studio</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={onLogin}
                disabled={loading}
                className="px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={onLogin}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-sm disabled:opacity-50"
              >
                <span>{loading ? "Connecting..." : "Start Creating Free"}</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 pt-3 pb-6 bg-zinc-950/95 border-b border-zinc-800 backdrop-blur-xl space-y-3 animate-fade-in">
          <div className="space-y-1">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-900"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-zinc-800 space-y-2">
            {authenticated ? (
              <Link
                href="/dashboard"
                className="w-full py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <span>Open Studio</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogin();
                }}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                <span>{loading ? "Connecting..." : "Start Creating Free"}</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
