"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  FiHome,
  FiEdit,
  FiCompass,
  FiBarChart2,
  FiCalendar,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiX,
  FiSettings,
  FiPlusCircle,
  FiList,
  FiTarget,
  FiEdit3,
  FiZap,
  FiFeather,
  FiTrendingUp,
  FiLock,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { getDisplayName } from "@/lib/userUtils";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

type SidebarProps = {
  onLogout: () => void;
  collapsed?: boolean;
  setCollapsed?: (value: boolean) => void;
  onCloseDrawer?: () => void;
};

interface NavSubItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  subItems?: NavSubItem[];
}

function SidebarNavContent({
  onLogout,
  collapsed = false,
  setCollapsed,
  onCloseDrawer,
}: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { userInfo } = useAuth();

  const currentTab = searchParams.get("tab") || (pathname === "/settings" ? "creator" : "");

  // Expanded submenus state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Ideation: true,
    Content: true,
    Planning: false,
    Analytics: false,
    Settings: true,
  });

  const toggleSection = (name: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const navItems: NavItem[] = [
    {
      name: "Home",
      href: "/dashboard",
      icon: FiHome,
    },
    {
      name: "Ideation",
      href: "/ideation",
      icon: FiCompass,
      subItems: [
        { name: "Overview", href: "/ideation", icon: FiCompass },
        { name: "Zero Idea", href: "/ideation/zero", icon: FiZap },
        { name: "Refine Idea", href: "/ideation/some", icon: FiEdit3 },
        { name: "Evaluate Idea", href: "/ideation/full", icon: FiTarget },
        { name: "My Ideas", href: "/ideation/my-ideas", icon: FiList },
      ],
    },
    {
      name: "Content",
      href: "/content/create",
      icon: FiEdit,
      subItems: [
        { name: "Create Content", href: "/content/create", icon: FiPlusCircle },
        { name: "Content Library", href: "/content/library", icon: FiList },
      ],
    },
    {
      name: "Planning",
      href: "/dashboard/planning",
      icon: FiCalendar,
      subItems: [
        { name: "Calendar", href: "/dashboard/planning", icon: FiCalendar },
      ],
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: FiBarChart2,
      subItems: [
        { name: "Overview", href: "/analytics", icon: FiBarChart2 },
      ],
    },
    {
      name: "Settings",
      href: "/settings",
      icon: FiSettings,
      subItems: [
        { name: "Creator Details", href: "/settings?tab=creator", icon: FiSettings },
        { name: "Writing & AI Tone", href: "/settings?tab=style", icon: FiFeather },
        { name: "Strategy & Goals", href: "/settings?tab=strategy", icon: FiTrendingUp },
        { name: "Security", href: "/settings?tab=security", icon: FiLock },
      ],
    },
  ];

  const isExactActive = (href: string) => {
    if (href.includes("?tab=")) {
      const tab = href.split("?tab=")[1];
      return pathname === "/settings" && currentTab === tab;
    }
    return pathname === href;
  };

  const isSectionActive = (item: NavItem) => {
    if (pathname === item.href) return true;
    if (item.subItems?.some((sub) => isExactActive(sub.href))) return true;
    return false;
  };

  const profileActive = pathname === "/profile" || pathname.startsWith("/profile/");

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } h-full min-h-screen flex flex-col border-r border-zinc-800/80 bg-zinc-950 transition-[width] duration-300 select-none z-30`}
    >
      {/* Mobile Close Button */}
      {onCloseDrawer && (
        <div className="p-4 flex justify-end lg:hidden border-b border-zinc-800/80">
          <button
            onClick={onCloseDrawer}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
            aria-label="Close menu"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-zinc-800/80 flex items-center justify-between">
        {!collapsed ? (
          <Link
            href="/dashboard"
            onClick={onCloseDrawer}
            className="flex items-center gap-2.5 px-2 group"
          >
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 group-hover:scale-105 group-hover:border-zinc-700 transition-all shadow-sm">
              <FaHeart className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-base font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
              KindCrew
            </span>
          </Link>
        ) : (
          <Link
            href="/dashboard"
            onClick={onCloseDrawer}
            className="mx-auto"
          >
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 hover:scale-105 transition-all shadow-sm">
              <FaHeart className="w-4 h-4 text-amber-400" />
            </div>
          </Link>
        )}

        {setCollapsed && !onCloseDrawer && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <FiChevronRight className="w-4 h-4" />
            ) : (
              <FiChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div
        className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const sectionActive = isSectionActive(item);
          const isExpanded = !!expandedSections[item.name];
          const hasSubItems = !!item.subItems && item.subItems.length > 0;

          // Collapsed Mode Item
          if (collapsed) {
            return (
              <div key={item.name} className="flex justify-center my-1">
                <InfoTooltip content={item.name} side="right">
                  <Link
                    href={item.href}
                    onClick={onCloseDrawer}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                      sectionActive
                        ? "bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                </InfoTooltip>
              </div>
            );
          }

          // Expanded Mode Item (Without Submenu)
          if (!hasSubItems) {
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseDrawer}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isExactActive(item.href)
                    ? "bg-zinc-900 text-zinc-100 border border-zinc-800/80 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          }

          // Expanded Mode Item (With Submenu)
          return (
            <div key={item.name} className="space-y-1">
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-all ${
                  sectionActive
                    ? "text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                }`}
                onClick={() => toggleSection(item.name)}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                <FiChevronDown
                  className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* Submenu links */}
              {isExpanded && (
                <div className="pl-7 pr-1 py-0.5 space-y-1 border-l border-zinc-800/60 ml-4">
                  {item.subItems?.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = isExactActive(sub.href);
                    return (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        onClick={onCloseDrawer}
                        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isSubActive
                            ? "bg-zinc-900 text-zinc-100 border border-zinc-800/60 shadow-sm"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                        }`}
                      >
                        <SubIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        <span>{sub.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Profile & Logout Bottom Section */}
      <div className="p-3 border-t border-zinc-800/80 space-y-2">
        {!collapsed ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <Link
              href="/profile"
              onClick={onCloseDrawer}
              className="flex items-center gap-2.5 min-w-0 flex-1 group"
            >
              {userInfo?.profileImage ? (
                <img
                  src={userInfo.profileImage}
                  alt={getDisplayName(userInfo)}
                  className="w-8 h-8 rounded-full ring-1 ring-zinc-700 object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-200 uppercase shrink-0">
                  {getDisplayName(userInfo).charAt(0) || "U"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">
                  {getDisplayName(userInfo)}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">
                  {userInfo?.email || "Creator"}
                </p>
              </div>
            </Link>

            <InfoTooltip content="Sign Out">
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                aria-label="Logout"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </InfoTooltip>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <InfoTooltip content={`Profile (${getDisplayName(userInfo)})`} side="right">
              <Link
                href="/profile"
                onClick={onCloseDrawer}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  profileActive
                    ? "bg-zinc-900 border border-zinc-700"
                    : "hover:bg-zinc-900"
                }`}
              >
                {userInfo?.profileImage ? (
                  <img
                    src={userInfo.profileImage}
                    alt={getDisplayName(userInfo)}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-200 uppercase">
                    {getDisplayName(userInfo).charAt(0) || "U"}
                  </div>
                )}
              </Link>
            </InfoTooltip>

            <InfoTooltip content="Sign Out" side="right">
              <button
                type="button"
                onClick={onLogout}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                aria-label="Logout"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </InfoTooltip>
          </div>
        )}
      </div>
    </aside>
  );
}

export default function Sidebar(props: SidebarProps) {
  return (
    <Suspense
      fallback={
        <aside
          className={`${
            props.collapsed ? "w-20" : "w-64"
          } h-full min-h-screen border-r border-zinc-800/80 bg-zinc-950`}
        />
      }
    >
      <SidebarNavContent {...props} />
    </Suspense>
  );
}
