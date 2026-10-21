"use client";

import React from "react";
import Link from "next/link";
import { GitFork, Shield, FileText, ArrowUp, Github } from "lucide-react";

export const LandingFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#101827] border-t border-white/10 text-white pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Col (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B6FD8] to-[#36C9C0] flex items-center justify-center shadow-[0_0_15px_rgba(54,201,192,0.3)]">
                <svg
                  className="w-4 h-4 text-white"
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
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                RESONANCE
              </span>
            </Link>

            <p className="text-sm text-[#CBD5E1] leading-relaxed max-w-sm">
              Scientific Research Conflict Analysis and Root-Cause Discovery System. Helping researchers decode experimental discrepancies through structured extraction, cross-study comparison, and verifiable evidence tracing.
            </p>

            <div className="text-xs text-[#CBD5E1]/60 font-mono">
              Research Intelligence • Deterministic Epistemic Auditing
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#36C9C0]">
              Product Modules
            </h4>
            <ul className="space-y-2 text-sm text-[#CBD5E1]">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  Upload & Extraction Pipeline
                </a>
              </li>
              <li>
                <a href="#problem" className="hover:text-white transition-colors">
                  Variable Comparison Matrix
                </a>
              </li>
              <li>
                <a href="#visualization" className="hover:text-white transition-colors">
                  Root-Cause Ranking Engine
                </a>
              </li>
              <li>
                <a href="#visualization" className="hover:text-white transition-colors">
                  Interactive Lineage Graph
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#36C9C0] transition-colors flex items-center space-x-1 font-medium">
                  <span>Open Active Workspace →</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#36C9C0]">
              Research & Docs
            </h4>
            <ul className="space-y-2 text-sm text-[#CBD5E1]">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  Methodology Guide
                </a>
              </li>
              <li>
                <a href="#visualization" className="hover:text-white transition-colors">
                  Interactive Audit Demo
                </a>
              </li>
              <li>
                <a href="#trust" className="hover:text-white transition-colors">
                  Epistemic Integrity
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Sample Workspace
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Institutional */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#36C9C0]">
              Compliance
            </h4>
            <ul className="space-y-2 text-sm text-[#CBD5E1]">
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">
                  Open Research Ethics
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">
                  Data Privacy & Retention
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">
                  Source Attribution Policy
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#CBD5E1]/60 gap-4">
          <div>
            © {new Date().getFullYear()} RESONANCE Research Intelligence. All rights reserved.
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={scrollToTop}
              className="flex items-center space-x-1.5 hover:text-white transition-colors"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
