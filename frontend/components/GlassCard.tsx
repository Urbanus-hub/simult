"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({ children, className = "", hover = true }: GlassCardProps) {
  return (
    <motion.div
      className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 ${className}`}
      whileHover={hover ? { y: -5, borderColor: "rgba(255,255,255,0.2)" } : {}}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
