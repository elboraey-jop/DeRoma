"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if splash was already shown in this session
    const hasShown = sessionStorage.getItem("deroma_splash_shown");
    if (!hasShown) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        sessionStorage.setItem("deroma_splash_shown", "true");
      }, 1800); // Display for 1.8s
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FFF9EB] text-[#942E3A]"
        >
          <div className="relative flex flex-col items-center gap-4">
            {/* Animated Brand Name */}
            <motion.span
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="font-playfair text-4xl font-extrabold tracking-wider text-[#942E3A]"
            >
              DeRoma
            </motion.span>
            
            {/* Premium elegant loading line */}
            <div className="h-[2px] w-28 overflow-hidden bg-[#942E3A]/10 rounded-full">
              <div 
                className="h-full w-14 rounded-full bg-[#D8B46A]"
                style={{
                  animation: "shimmer-slide 1.5s infinite ease-in-out"
                }} 
              />
            </div>
          </div>

          <style jsx global>{`
            @keyframes shimmer-slide {
              0% {
                transform: translateX(-100%);
              }
              50% {
                transform: translateX(100%);
              }
              100% {
                transform: translateX(-100%);
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
