"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"

export interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  delay?: number
}

export function ScrollReveal({ children, delay = 0, ...props }: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
