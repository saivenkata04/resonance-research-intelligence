"use client";

import React, { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  label?: string;
  alpha: number;
}

export const ScientificNetwork: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      initNodes();
    };

    window.addEventListener("resize", handleResize);

    // Research concept nodes
    const labels = [
      "Dataset: SQuAD-v2",
      "Model: LLaMA-7B",
      "Eval: Macro-F1",
      "Tokenizer: BPE",
      "Preprocessing: Filter",
      "Metric: ExactMatch",
      "Protocol: 5-Fold",
      "Hypothesis: H1",
      "Embedding: 768d",
      "Optimizer: AdamW",
    ];

    let nodes: Node[] = [];

    const initNodes = () => {
      nodes = [];
      const nodeCount = Math.max(16, Math.floor(width / 50));
      for (let i = 0; i < nodeCount; i++) {
        const isTeal = Math.random() > 0.45;
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: Math.random() * 2.5 + 2,
          color: isTeal ? "#36C9C0" : "#3B6FD8",
          alpha: Math.random() * 0.4 + 0.25,
          label: i < labels.length ? labels[i] : undefined,
        });
      }
    };

    initNodes();

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connection lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 140;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.18;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(54, 201, 192, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw nodes and subtle labels
      nodes.forEach((node) => {
        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
        }

        // Glow ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = node.color === "#36C9C0" ? "rgba(54, 201, 192, 0.08)" : "rgba(59, 111, 216, 0.08)";
        ctx.fill();

        // Node center
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = node.alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Subtle scientific label on selected nodes
        if (node.label && width > 768) {
          ctx.font = "10px Inter, system-ui, sans-serif";
          ctx.fillStyle = "rgba(203, 213, 225, 0.4)";
          ctx.fillText(node.label, node.x + 8, node.y + 3);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-60"
        style={{ filter: "blur(0.4px)" }}
      />
      {/* Subtle radial gradient to blend softly with hero background */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#101827]/40 to-[#101827] pointer-events-none" />
    </div>
  );
};
