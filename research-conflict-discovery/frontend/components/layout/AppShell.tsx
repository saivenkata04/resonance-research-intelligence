"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppHeader } from "./AppHeader";
import { Sidebar } from "./Sidebar";
import { isAuthenticated } from "@/lib/auth";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const publicRoutes = ["/", "/login", "/register", "/forgot-password"];
    const isPublic = publicRoutes.includes(pathname);
    if (isPublic) {
      setIsAuthorized(true);
      return;
    }

    const authed = isAuthenticated();
    if (!authed) {
      setIsAuthorized(false);
      router.replace("/login?auth=required");
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  // If on public routes (landing, login, register, forgot-password), render children directly without dashboard header and sidebar
  const publicRoutes = ["/", "/login", "/register", "/forgot-password"];
  if (publicRoutes.includes(pathname)) {
    return <div className="min-h-screen bg-[#101827] text-white selection:bg-[#3B6FD8] selection:text-white">{children}</div>;
  }

  // If verifying authentication or unauthenticated on a protected dashboard route, display loading/redirecting guard
  if (isAuthorized === false || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#101827] flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B6FD8] to-[#36C9C0] flex items-center justify-center animate-pulse mb-4 shadow-lg shadow-[#36C9C0]/20">
          <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-300">Checking researcher credentials...</p>
        <p className="text-xs text-slate-500 mt-1">Redirecting to sign in...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-sans text-[#101827]">
      <AppHeader
        isMobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />
      
      <div className="flex-1 flex w-full">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
        
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};


