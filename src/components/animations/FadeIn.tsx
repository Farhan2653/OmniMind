"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"

export interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number
  duration?: number
}

export function FadeIn({ children, delay = 0, duration = 0.5, ...props }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
