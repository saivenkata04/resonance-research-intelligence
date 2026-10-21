"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronDown, 
  Menu, 
  X, 
  Layers, 
  GitFork, 
  FileText, 
  Search, 
  SlidersHorizontal, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { isAuthenticated } from "@/lib/auth";

interface LandingNavbarProps {
  onOpenSignInModal?: (mode?: "signin" | "signup") => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onOpenSignInModal }) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [capabilitiesDropdownOpen, setCapabilitiesDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const productRef = useRef<HTMLDivElement>(null);
  const capabilitiesRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated()) {
      router.push("/dashboard");
    } else {
      onOpenSignInModal?.("signup");
    }
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (productRef.current && !productRef.current.contains(e.target as Node)) {
        setProductDropdownOpen(false);
      }
      if (capabilitiesRef.current && !capabilitiesRef.current.contains(e.target as Node)) {
        setCapabilitiesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Track scroll for sticky backdrop blur
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#101827]/90 backdrop-blur-md border-b border-white/10 shadow-lg py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#36C9C0] rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#3B6FD8] to-[#36C9C0] flex items-center justify-center shadow-[0_0_15px_rgba(54,201,192,0.35)] group-hover:shadow-[0_0_20px_rgba(54,201,192,0.5)] transition-all">
              <svg 
                className="w-5 h-5 text-white" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M3 12h3" />
                <path d="M18 12h3" />
                <path d="M4.93 4.93l2.12 2.12" />
                <path d="M16.95 16.95l2.12 2.12" />
                <path d="M4.93 19.07l2.12-2.12" />
                <path d="M16.95 7.05l2.12-2.12" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white font-sans flex items-center">
                RESONANCE
                <span className="ml-2 px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold rounded bg-[#36C9C0]/20 text-[#36C9C0] border border-[#36C9C0]/30 hidden sm:inline-block">
                  Research Intelligence
                </span>
              </span>
              <span className="text-[11px] text-[#CBD5E1] tracking-wide font-normal sm:hidden">
                Research Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            
            {/* Product Dropdown */}
            <div className="relative" ref={productRef}>
              <button
                type="button"
                onClick={() => {
                  setProductDropdownOpen(!productDropdownOpen);
                  setCapabilitiesDropdownOpen(false);
                }}
                className={`flex items-center space-x-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  productDropdownOpen 
                    ? "text-[#36C9C0] bg-white/5" 
                    : "text-[#CBD5E1] hover:text-white hover:bg-white/5"
                }`}
                aria-expanded={productDropdownOpen}
              >
                <span>Product</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${productDropdownOpen ? "rotate-180 text-[#36C9C0]" : ""}`} />
              </button>

              {productDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 rounded-xl bg-[#172235] border border-white/10 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[11px] font-semibold text-[#CBD5E1]/60 px-3 py-1.5 uppercase tracking-wider font-mono">
                    Product Showcase
                  </div>
                  <a
                    href="#problem"
                    onClick={() => setProductDropdownOpen(false)}
                    className="flex items-start space-x-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <GitFork className="w-5 h-5 text-[#36C9C0] mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-[#36C9C0] transition-colors">
                        Cross-Paper Comparison
                      </div>
                      <div className="text-xs text-[#CBD5E1]/80">
                        Side-by-side experimental variable matrix
                      </div>
                    </div>
                  </a>
                  <a
                    href="#visualization"
                    onClick={() => setProductDropdownOpen(false)}
                    className="flex items-start space-x-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <SlidersHorizontal className="w-5 h-5 text-[#3B6FD8] mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-[#3B6FD8] transition-colors">
                        Root-Cause Ranking
                      </div>
                      <div className="text-xs text-[#CBD5E1]/80">
                        Ranked methodological candidate factors
                      </div>
                    </div>
                  </a>
                  <a
                    href="#visualization"
                    onClick={() => setProductDropdownOpen(false)}
                    className="flex items-start space-x-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <Layers className="w-5 h-5 text-[#36C9C0] mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-[#36C9C0] transition-colors">
                        Interactive Dependency Graph
                      </div>
                      <div className="text-xs text-[#CBD5E1]/80">
                        Visual research lineage & divergence paths
                      </div>
                    </div>
                  </a>

                  <div className="pt-2 mt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleGetStarted}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#36C9C0] transition-colors"
                    >
                      <span>Open Workspace Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Capabilities Dropdown */}
            <div className="relative" ref={capabilitiesRef}>
              <button
                type="button"
                onClick={() => {
                  setCapabilitiesDropdownOpen(!capabilitiesDropdownOpen);
                  setProductDropdownOpen(false);
                }}
                className={`flex items-center space-x-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  capabilitiesDropdownOpen 
                    ? "text-[#36C9C0] bg-white/5" 
                    : "text-[#CBD5E1] hover:text-white hover:bg-white/5"
                }`}
                aria-expanded={capabilitiesDropdownOpen}
              >
                <span>Capabilities</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${capabilitiesDropdownOpen ? "rotate-180 text-[#36C9C0]" : ""}`} />
              </button>

              {capabilitiesDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 rounded-xl bg-[#172235] border border-white/10 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[11px] font-semibold text-[#CBD5E1]/60 px-3 py-1.5 uppercase tracking-wider font-mono">
                    System Architecture
                  </div>
                  <a
                    href="#capabilities"
                    onClick={() => setCapabilitiesDropdownOpen(false)}
                    className="flex items-start space-x-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <Search className="w-5 h-5 text-[#36C9C0] mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-[#36C9C0] transition-colors">
                        Structured Extraction
                      </div>
                      <div className="text-xs text-[#CBD5E1]/80">
                        Parse protocols, datasets, hyperparameters
                      </div>
                    </div>
                  </a>
                  <a
                    href="#visualization"
                    onClick={() => setCapabilitiesDropdownOpen(false)}
                    className="flex items-start space-x-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <GitFork className="w-5 h-5 text-[#3B6FD8] mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-[#3B6FD8] transition-colors">
                        Conflict Analysis Engine
                      </div>
                      <div className="text-xs text-[#CBD5E1]/80">
                        Isolate divergence in evaluation & metrics
                      </div>
                    </div>
                  </a>
                  <a
                    href="#trust"
                    onClick={() => setCapabilitiesDropdownOpen(false)}
                    className="flex items-start space-x-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <ShieldCheck className="w-5 h-5 text-[#34D399] mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-[#34D399] transition-colors">
                        Verifiable Evidence Trace
                      </div>
                      <div className="text-xs text-[#CBD5E1]/80">
                        Source citations, page bounds, quote audits
                      </div>
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* How It Works Link */}
            <a
              href="#how-it-works"
              className="px-3 py-2 text-sm font-medium text-[#CBD5E1] hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              How It Works
            </a>

            {/* About / Trust Link */}
            <a
              href="#trust"
              className="px-3 py-2 text-sm font-medium text-[#CBD5E1] hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              Trust & Transparency
            </a>
          </nav>

          {/* Right Side Action Buttons */}
          <div className="hidden sm:flex items-center space-x-2.5">
            <button
              type="button"
              onClick={() => (onOpenSignInModal ? onOpenSignInModal("signin") : router.push("/login"))}
              className="px-3.5 py-2 text-sm font-medium text-white hover:text-[#36C9C0] hover:bg-white/5 rounded-lg transition-all"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => (onOpenSignInModal ? onOpenSignInModal("signup") : router.push("/register"))}
              className="px-3.5 py-2 text-sm font-semibold text-white border border-[#36C9C0]/50 hover:bg-[#36C9C0]/10 hover:border-[#36C9C0] rounded-lg transition-all"
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={handleGetStarted}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#3B6FD8] hover:bg-[#2F5CB8] active:bg-[#254ea3] rounded-lg shadow-[0_0_20px_rgba(59,111,216,0.4)] hover:shadow-[0_0_25px_rgba(59,111,216,0.6)] transition-all flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-[#3B6FD8]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Hamburger Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#CBD5E1] hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#36C9C0]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#172235] border-b border-white/10 px-4 pt-4 pb-6 space-y-4 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase text-[#36C9C0] tracking-wider px-3 py-1 font-semibold">
              Navigation
            </div>
            <a
              href="#problem"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-white hover:bg-white/5"
            >
              Cross-Paper Comparisons
            </a>
            <a
              href="#visualization"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-white hover:bg-white/5"
            >
              Root-Cause Ranking
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-white hover:bg-white/5"
            >
              How It Works
            </a>
            <a
              href="#capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-white hover:bg-white/5"
            >
              Capabilities
            </a>
            <a
              href="#trust"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-white hover:bg-white/5"
            >
              Trust & Transparency
            </a>
          </div>

          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSignInModal?.("signin");
                }}
                className="w-full text-center py-2.5 text-sm font-medium text-white border border-white/20 rounded-lg hover:bg-white/5"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSignInModal?.("signup");
                }}
                className="w-full text-center py-2.5 text-sm font-semibold text-[#101827] bg-[#36C9C0] rounded-lg hover:bg-[#2EB8AF]"
              >
                Sign Up
              </button>
            </div>
            <button
              type="button"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleGetStarted(e);
              }}
              className="w-full text-center py-2.5 text-sm font-semibold text-white bg-[#3B6FD8] rounded-lg shadow-md flex items-center justify-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
