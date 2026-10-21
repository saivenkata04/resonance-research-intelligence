"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Library,
  GitCompare,
  Network,
  SearchCheck,
  FileText,
  Activity,
  Cpu,
  ShieldCheck,
} from "lucide-react";

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      activePattern: ["/", "/dashboard"],
    },
    {
      label: "Paper Library",
      href: "/papers",
      icon: Library,
      activePattern: ["/papers"],
    },
    {
      label: "Comparisons",
      href: "/comparisons",
      icon: GitCompare,
      activePattern: ["/comparisons"],
    },
    {
      label: "Experiment Graph",
      href: "/graph",
      icon: Network,
      activePattern: ["/graph"],
    },
    {
      label: "Root Causes",
      href: "/root-causes",
      icon: SearchCheck,
      activePattern: ["/root-causes"],
    },
    {
      label: "Reports",
      href: "/reports",
      icon: FileText,
      activePattern: ["/reports"],
    },
  ];

  const isItemActive = (patterns: string[], href: string) => {
    if (href === "/dashboard" && (pathname === "/" || pathname === "/dashboard")) {
      return true;
    }
    return patterns.some((p) => p !== "/" && p !== "/dashboard" && pathname.startsWith(p));
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#172235] text-slate-300 border-r border-[#1f2d44]">
      {/* Navigation items */}
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Intelligence Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.activePattern, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center space-x-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                active
                  ? "bg-[#1e2c44] text-[#36C9C0] border-l-4 border-[#36C9C0] shadow-sm font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-[#1e2c44]/70"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  active ? "text-[#36C9C0]" : "text-slate-400 group-hover:text-slate-200"
                }`}
              />
              <span>{item.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#36C9C0] animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>

      {/* System Status / Engine badge at bottom */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-[#101827]/80 border border-[#23334d] text-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#36C9C0]" /> Pipeline Engine
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30">
            Active
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Local Scientific NLP & Dependency Graph Analyzer connected.
        </p>
        <div className="pt-2 border-t border-[#1f2d44] flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#36C9C0]" /> Local Processing Pipeline
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-[260px] lg:w-[280px] shrink-0 sticky top-[88px] h-[calc(100vh-88px)] z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#172235] shadow-xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
