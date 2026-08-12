"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

export interface GlassPanelProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  tilt?: boolean
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, children, tilt = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={tilt ? { scale: 1.02, rotateX: 2, rotateY: 2 } : { scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "glass-card rounded-2xl p-6 overflow-hidden relative",
          className
        )}
        {...props}
      >
        <div className="relative z-10">{children}</div>
        
        {/* Subtle inner glow */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-2xl" />
      </motion.div>
    )
  }
)
GlassPanel.displayName = "GlassPanel"
