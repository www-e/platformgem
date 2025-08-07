// src/components/landing/HeroVisual.tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function HeroVisual() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <div className="h-[40rem] w-[80rem] rounded-full bg-gradient-to-t from-primary/10 to-transparent blur-3xl" />
      </div>
      <motion.div
        className={cn(
          "absolute -bottom-48 left-1/2 h-[50rem] w-[50rem] -translate-x-1/2 rounded-full border border-primary/20",
          "bg-[radial-gradient(closest-side,rgba(255,255,255,0.05),transparent)]"
        )}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}