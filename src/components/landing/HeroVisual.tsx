// src/components/landing/HeroVisual.tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function HeroVisual() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {/* Enhanced Main Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50" />
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-100/30 via-transparent to-secondary-100/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-white/80 to-transparent" />

      {/* Large Gradient Orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-primary-200/30 to-primary-300/20 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-secondary-200/30 to-secondary-300/20 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />

      {/* Animated Geometric Shapes */}
      <motion.div
        className="absolute top-20 right-20 w-24 h-24 border-2 border-primary-300/20 rounded-2xl"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <motion.div
        className="absolute bottom-32 right-32 w-16 h-16 bg-gradient-to-br from-secondary-300/30 to-secondary-400/20 rounded-full"
        animate={{
          y: [-20, 20, -20],
          x: [-10, 10, -10],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-1/3 left-20 w-32 h-32 border border-primary-200/30 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Floating Academic Icons */}
      <motion.div
        className="absolute top-40 left-1/3 w-12 h-12 bg-white/50 backdrop-blur-sm rounded-lg shadow-elevation-2 flex items-center justify-center"
        animate={{
          y: [-15, 15, -15],
          rotate: [0, 5, 0, -5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <span className="text-2xl">📚</span>
      </motion.div>

      <motion.div
        className="absolute bottom-40 right-1/3 w-12 h-12 bg-white/50 backdrop-blur-sm rounded-lg shadow-elevation-2 flex items-center justify-center"
        animate={{
          y: [15, -15, 15],
          rotate: [0, -5, 0, 5, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <span className="text-2xl">🎓</span>
      </motion.div>

      <motion.div
        className="absolute top-2/3 left-1/4 w-12 h-12 bg-white/50 backdrop-blur-sm rounded-lg shadow-elevation-2 flex items-center justify-center"
        animate={{
          y: [-10, 20, -10],
          x: [-5, 5, -5],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      >
        <span className="text-2xl">⭐</span>
      </motion.div>
      {/* Additional Premium Elements */}
      <motion.div
        className="absolute top-1/2 right-10 w-16 h-16 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-lg rounded-2xl shadow-2xl flex items-center justify-center border border-white/30"
        animate={{
          y: [-20, 10, -20],
          rotate: [0, 3, 0, -3, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      >
        <span className="text-2xl">🏆</span>
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 left-10 w-14 h-14 bg-gradient-to-br from-primary-100/80 to-primary-200/60 backdrop-blur-lg rounded-xl shadow-xl flex items-center justify-center border border-primary-200/40"
        animate={{
          x: [-10, 15, -10],
          y: [10, -5, 10],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      >
        <span className="text-xl">📖</span>
      </motion.div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Radial Highlight */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/20" />

      {/* Top Edge Gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/50 to-transparent" />
    </div>
  );
}
