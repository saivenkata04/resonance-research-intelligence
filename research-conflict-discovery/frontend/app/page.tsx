"use client";

import React, { useState, useEffect } from "react";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { ExperimentVisualization } from "@/components/landing/ExperimentVisualization";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { TrustSection } from "@/components/landing/TrustSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { SignInModal } from "@/components/landing/SignInModal";
import { isAuthenticated } from "@/lib/auth";

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");

  const openAuthModal = (mode: "signin" | "signup" = "signin") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("auth") === "required" && !isAuthenticated()) {
        openAuthModal("signin");
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#101827] text-white selection:bg-[#3B6FD8] selection:text-white">
      {/* Navigation */}
      <LandingNavbar onOpenSignInModal={openAuthModal} />

      {/* Main Landing Sections */}
      <main>
        {/* Hero Section with Signature Asymmetrical Curved Boundary & Circular Scientific Visual */}
        <HeroSection onOpenSignInModal={() => openAuthModal("signup")} />

        {/* Below-the-Fold Content */}
        {/* Section A: The Problem */}
        <ProblemSection />

        {/* Section B: How RESONANCE Works */}
        <WorkflowSection />

        {/* Section C: Interactive Experiment Divergence Visualization */}
        <ExperimentVisualization />

        {/* Section D: Core Capabilities */}
        <FeatureGrid />

        {/* Section E: Trust, Transparency & Epistemic Integrity */}
        <TrustSection />

        {/* Section F: Final Call To Action */}
        <FinalCTA onOpenSignInModal={openAuthModal} />
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Authentication Modal */}
      <SignInModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
