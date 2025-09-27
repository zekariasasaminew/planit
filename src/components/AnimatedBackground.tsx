"use client";

import React from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";

const AnimatedBackground: React.FC = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        zIndex: -1,
        backgroundColor: "#FDF8F6", // Match the landing page background
      }}
    >
      {/* Animated grid */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(230, 128, 87, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(230, 128, 87, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "50px 50px"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Floating orbs */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(191, 117, 135, 0.15) 0%, transparent 70%)`,
            filter: "blur(40px)",
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2,
          }}
          initial={{
            x:
              typeof window !== "undefined"
                ? Math.random() * window.innerWidth
                : Math.random() * 1000,
            y:
              typeof window !== "undefined"
                ? Math.random() * window.innerHeight
                : Math.random() * 1000,
          }}
        />
      ))}
    </Box>
  );
};

export default AnimatedBackground;
