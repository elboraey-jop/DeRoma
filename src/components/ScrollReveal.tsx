"use client";

import React from "react";
import { motion } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  className?: string;
  scale?: boolean;
  once?: boolean;
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.8,
  className = "",
  scale = false,
  once = true,
}: ScrollRevealProps) {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
    none: { y: 0, x: 0 },
  };

  const initialOffset = directions[direction];

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: initialOffset.y,
        x: initialOffset.x,
        scale: scale ? 0.96 : 1,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
      }}
      viewport={{ once: once, margin: "-8% 0px -8% 0px" }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.16, 1, 0.3, 1], // Cubic Bezier curve for custom ease out
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: React.ReactNode;
  delayChildren?: number;
  staggerDelay?: number;
  className?: string;
  once?: boolean;
}

export function StaggerContainer({
  children,
  delayChildren = 0,
  staggerDelay = 0.1,
  className = "",
  once = true,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: once, margin: "-8% 0px -8% 0px" }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  className?: string;
  scale?: boolean;
}

export function StaggerItem({
  children,
  direction = "up",
  duration = 0.8,
  className = "",
  scale = false,
}: StaggerItemProps) {
  const directions = {
    up: { y: 35, x: 0 },
    down: { y: -35, x: 0 },
    left: { y: 0, x: 35 },
    right: { y: 0, x: -35 },
    none: { y: 0, x: 0 },
  };

  const initialOffset = directions[direction];

  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: initialOffset.y,
          x: initialOffset.x,
          scale: scale ? 0.96 : 1,
        },
        show: {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          transition: {
            duration: duration,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
