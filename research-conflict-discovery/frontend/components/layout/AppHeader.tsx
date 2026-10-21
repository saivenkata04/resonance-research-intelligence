"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, User, Sparkles, Search, Menu, X, LogOut } from "lucide-react";
import { getCurrentUser, logout } from "@/lib/auth";

interface AppHeaderProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="w-full bg-[#101827] border-b border-[#1f293d] text-white sticky top-0 z-40">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-[88px] flex items-center justify-between">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/dashboard" className="flex items-center space-x-3.5 group">
            {/* Teal rounded-square logo with connected-node icon */}
            <div className="w-11 h-11 rounded-xl bg-[#36C9C0] flex items-center justify-center shadow-lg shadow-[#36C9C0]/20 group-hover:scale-105 transition-transform duration-200">
              <svg
                className="w-6 h-6 text-[#101827]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Connected research nodes */}
                <circle cx="6" cy="6" r="2.5" />
                <circle cx="18" cy="6" r="2.5" />
                <circle cx="12" cy="18" r="2.5" />
                <line x1="8" y1="7" x2="16" y2="7" />
                <line x1="7.5" y1="8" x2="11" y2="16" />
                <line x1="16.5" y1="8" x2="13" y2="16" />
              </svg>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-wider text-white font-sans">
                  RESONANCE
                </span>
                <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-[#36C9C0]/20 text-[#36C9C0] border border-[#36C9C0]/30 hidden sm:inline-block">
                  v1.2 Beta
                </span>
              </div>
              <span className="text-xs font-medium text-slate-400 tracking-wide">
                Research Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search / System Status */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search experiments, datasets, models, or conflicts..."
              className="w-full bg-[#172235] border border-[#23334d] text-sm text-slate-200 placeholder-slate-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#36C9C0] focus:ring-1 focus:ring-[#36C9C0] transition-colors"
            />
          </div>
        </div>

        {/* User & Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Notification dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#172235] transition-colors focus:outline-none"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#36C9C0] ring-2 ring-[#101827]"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#172235] border border-[#23334d] rounded-xl shadow-xl z-50 p-3 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[#23334d] mb-2">
                  <span className="font-semibold text-white">Notifications</span>
                  <span className="text-xs text-[#36C9C0]">2 new</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2 rounded-lg bg-[#101827]/60 border border-slate-700/50">
                    <p className="text-xs text-white font-medium">New conflict detected</p>
                    <p className="text-[11px] text-slate-400">ViT-Base vs DeiT-Base shows 3 high-impact differences.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#101827]/60 border border-slate-700/50">
                    <p className="text-xs text-white font-medium">Paper extracted</p>
                    <p className="text-[11px] text-slate-400">Dosovitskiy et al. (2021) attributes normalized.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Sign Out */}
          <div className="flex items-center pl-2 sm:pl-3 border-l border-slate-700/60 space-x-3">
            <div className="w-9 h-9 rounded-full bg-[#1e2c44] border border-[#36C9C0]/40 flex items-center justify-center text-[#36C9C0] font-semibold text-sm shadow-inner">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-white">{currentUser?.name || "Dr. Aris Vance"}</span>
              <span className="text-[11px] text-slate-400 capitalize">{currentUser?.role || "Lead Investigator"}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors ml-1"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
