"use client";

import React from "react";
import Image from "next/image";

export const HeroImage: React.FC = () => {
  return (
    <div className="relative flex items-center justify-center w-full max-w-[480px] lg:max-w-[560px] xl:max-w-[620px] aspect-square mx-auto lg:mx-0">
      {/* Ambient background glow */}
      <div 
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#36C9C0]/15 via-[#3B6FD8]/20 to-transparent blur-3xl pointer-events-none transform -translate-y-4" 
        aria-hidden="true"
      />

      {/* Outer scientific orbital ring 1 */}
      <div 
        className="absolute inset-0 rounded-full border border-[#36C9C0]/20 pointer-events-none scale-105 animate-[spin_60s_linear_infinite]"
        style={{ borderStyle: "dashed" }}
        aria-hidden="true"
      />

      {/* Outer scientific ring 2 with telemetry markers */}
      <div 
        className="absolute -inset-4 rounded-full border border-white/5 pointer-events-none"
        aria-hidden="true"
      >
        <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-widest text-[#36C9C0]/60 uppercase">
          [EXP-DIVERGENCE-VERIFIED]
        </span>
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-widest text-[#CBD5E1]/40 uppercase">
          ROOT-CAUSE TRACE: ACTIVE
        </span>
      </div>

      {/* Main Circular Image Frame */}
      <div className="relative w-full h-full rounded-full p-2 bg-gradient-to-b from-[#3B6FD8]/30 via-white/10 to-transparent shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(59,111,216,0.25)] overflow-hidden">
        <div className="relative w-full h-full rounded-full overflow-hidden border border-white/20">
          <Image
            src="/hero-researcher.jpg"
            alt="Scientific researcher analyzing experiment datasets and conflicting literature findings in a modern laboratory"
            fill
            priority
            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 620px"
            className="object-cover object-center scale-[1.02] hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Gentle cinematic cool navy gradient overlay to harmonize with #101827 */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-[#101827]/40 via-transparent to-transparent pointer-events-none" 
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Floating Micro Scientific Telemetry Badge */}
      <div className="absolute -bottom-2 -left-2 sm:bottom-6 sm:-left-6 bg-[#172235]/90 backdrop-blur-md border border-[#36C9C0]/30 rounded-xl px-4 py-3 shadow-2xl flex items-center space-x-3 pointer-events-none z-10">
        <div className="w-2.5 h-2.5 rounded-full bg-[#36C9C0] animate-pulse" />
        <div>
          <div className="text-[11px] font-mono uppercase text-[#36C9C0] font-semibold tracking-wider">
            Evidence Audit Confirmed
          </div>
          <div className="text-xs text-white/90 font-medium">
            2 Hypotheses Traced to Methods
          </div>
        </div>
      </div>

      {/* Floating Delta Badge */}
      <div className="absolute top-8 -right-2 sm:top-12 sm:-right-4 bg-[#172235]/90 backdrop-blur-md border border-[#F43F5E]/40 rounded-xl px-3.5 py-2.5 shadow-2xl flex items-center space-x-2.5 pointer-events-none z-10">
        <div className="w-2 h-2 rounded-full bg-[#F43F5E]" />
        <div>
          <div className="text-[10px] font-mono uppercase text-[#F43F5E] font-medium tracking-wider">
            Conflict Identified
          </div>
          <div className="text-xs text-white font-medium">
            Δ 12.4% Metric Discrepancy
          </div>
        </div>
      </div>
    </div>
  );
};
