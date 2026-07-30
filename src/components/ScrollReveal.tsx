"use client";

import React, { useEffect, useRef } from "react";

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
  duration = 0.45,
  className = "",
  scale = false,
  once = true,
}: ScrollRevealProps) {
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = revealRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("is-visible");
          if (once) observer.unobserve(element);
        } else if (!once) {
          element.classList.remove("is-visible");
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once]);

  const directions = {
    up: { y: 18, x: 0 },
    down: { y: -18, x: 0 },
    left: { y: 0, x: 18 },
    right: { y: 0, x: -18 },
    none: { y: 0, x: 0 },
  };

  const initialOffset = directions[direction];

  return (
    <div
      ref={revealRef}
      style={{
        "--reveal-x": `${initialOffset.x}px`,
        "--reveal-y": `${initialOffset.y}px`,
        "--reveal-scale": scale ? 0.98 : 1,
        "--reveal-delay": `${delay}s`,
        "--reveal-duration": `${duration}s`,
      } as React.CSSProperties}
      data-reveal
      className={className}
    >
      {children}
    </div>
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
  staggerDelay = 0.05,
  className = "",
  once = true,
}: StaggerContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("is-visible");
          if (once) observer.unobserve(element);
        } else if (!once) {
          element.classList.remove("is-visible");
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={containerRef}
      data-reveal-stagger
      style={{
        "--stagger-delay": `${delayChildren}s`,
        "--stagger-step": `${staggerDelay}s`,
      } as React.CSSProperties}
      className={className}
    >
      {children}
    </div>
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
  duration = 0.45,
  className = "",
  scale = false,
}: StaggerItemProps) {
  const directions = {
    up: { y: 18, x: 0 },
    down: { y: -18, x: 0 },
    left: { y: 0, x: 18 },
    right: { y: 0, x: -18 },
    none: { y: 0, x: 0 },
  };

  const initialOffset = directions[direction];

  return (
    <div
      data-reveal-item
      style={{
        "--reveal-x": `${initialOffset.x}px`,
        "--reveal-y": `${initialOffset.y}px`,
        "--reveal-scale": scale ? 0.98 : 1,
        "--reveal-duration": `${duration}s`,
      } as React.CSSProperties}
      className={className}
    >
      {children}
    </div>
  );
}
