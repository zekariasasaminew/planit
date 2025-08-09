"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Paper,
  Fade,
} from "@mui/material";
import {
  AutoAwesome,
  ArrowForward,
  BookmarkBorder,
  Refresh,
  School,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAuth } from "@/app/context/authContext";

// Animated background component
const AnimatedBackground = () => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        zIndex: -1,
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
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
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
            background: `radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)`,
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
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
        />
      ))}
    </Box>
  );
};

// Typewriter effect component
const TypewriterText = ({
  text,
  delay = 0,
}: {
  text: string;
  delay?: number;
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }
    }, delay + 50);

    return () => clearTimeout(timer);
  }, [currentIndex, text, delay]);

  return (
    <span>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        style={{ display: currentIndex < text.length ? "inline" : "none" }}
      >
        |
      </motion.span>
    </span>
  );
};

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  // Handle redirect logic in useEffect to avoid SSR issues
  useEffect(() => {
    if (user === null) {
      router.push("/signin");
    }
  }, [user, router]);

  // Show loading or nothing while checking auth or redirecting
  if (user === null || user === undefined) {
    return null;
  }

  const handleGetStarted = () => {
    router.push("/generate");
  };

  const handleHowItWorks = () => {
    document.getElementById("features-section")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const features = [
    {
      icon: <AutoAwesome sx={{ fontSize: 48, color: "primary.main" }} />,
      title: "Auto Course Planning",
      description:
        "Generate personalized academic plans using advanced AI that understands course prerequisites and requirements.",
    },
    {
      icon: <Refresh sx={{ fontSize: 48, color: "secondary.main" }} />,
      title: "Re-plan Instantly",
      description:
        "Instantly modify and regenerate your academic plan when your goals or circumstances change.",
    },
    {
      icon: <School sx={{ fontSize: 48, color: "success.main" }} />,
      title: "Graduation Tracker",
      description:
        "Automatically track graduation requirements, major courses, and general education credits with precision.",
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <AnimatedBackground />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ py: 4 }}>
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Box sx={{ textAlign: "center", mb: 12, pt: 8 }}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: { xs: "3rem", md: "4.5rem", lg: "5.5rem" },
                    letterSpacing: "-0.02em",
                    textShadow: "0 0 40px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  PlanIt
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: "primary.main",
                    fontSize: { xs: "1.5rem", md: "2rem" },
                  }}
                >
                  Smarter Schedules. Simpler Semesters.
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Typography
                  variant="h6"
                  component="p"
                  color="text.secondary"
                  sx={{
                    mb: 6,
                    maxWidth: 700,
                    mx: "auto",
                    fontSize: { xs: "1.1rem", md: "1.25rem" },
                    lineHeight: 1.6,
                  }}
                >
                  <TypewriterText
                    text="Your intelligent academic planning assistant that helps you navigate your college journey with confidence and precision."
                    delay={1200}
                  />
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGetStarted}
                    endIcon={<ArrowForward />}
                    sx={{
                      py: 2,
                      px: 5,
                      borderRadius: 4,
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      textTransform: "none",
                      position: "relative",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "100%",
                        height: "100%",
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                        transition: "left 0.5s",
                      },
                      "&:hover::before": {
                        left: "100%",
                      },
                    }}
                  >
                    Try It Now
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleHowItWorks}
                    sx={{
                      py: 2,
                      px: 5,
                      borderRadius: 4,
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      textTransform: "none",
                      borderWidth: 2,
                      "&:hover": {
                        borderWidth: 2,
                        boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)",
                      },
                    }}
                  >
                    How It Works
                  </Button>
                </motion.div>
              </motion.div>
            </Box>
          </motion.div>

          {/* Features Section */}
          <Box id="features-section" sx={{ mb: 12, py: 8 }}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="h3"
                component="h3"
                sx={{
                  textAlign: "center",
                  mb: 8,
                  fontWeight: 700,
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: { xs: "2rem", md: "2.5rem" },
                }}
              >
                Why Choose PlanIt?
              </Typography>
            </motion.div>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 4,
                alignItems: "stretch",
              }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50, rotateX: 10 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.2,
                    ease: "easeOut",
                  }}
                  whileHover={{
                    y: -10,
                    rotateX: -5,
                    transition: { duration: 0.3 },
                  }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      textAlign: "center",
                      background: "rgba(30, 41, 59, 0.6)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      position: "relative",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "2px",
                        background:
                          "linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)",
                        transform: "translateX(-100%)",
                        transition: "transform 0.6s ease",
                      },
                      "&:hover::before": {
                        transform: "translateX(0)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 5 }}>
                      <motion.div
                        whileHover={{
                          scale: 1.1,
                          rotate: [0, -10, 10, 0],
                          transition: { duration: 0.5 },
                        }}
                      >
                        <Box sx={{ mb: 4 }}>{feature.icon}</Box>
                      </motion.div>
                      <Typography
                        variant="h5"
                        component="h4"
                        sx={{
                          mb: 3,
                          fontWeight: 700,
                          color: "primary.main",
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ lineHeight: 1.7 }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </Box>

          {/* Quick Actions */}
          <Fade in timeout={1400}>
            <Paper sx={{ p: 4, bgcolor: "background.paper", borderRadius: 3 }}>
              <Typography
                variant="h5"
                component="h3"
                sx={{ mb: 3, fontWeight: 600, textAlign: "center" }}
              >
                Quick Actions
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 3,
                }}
              >
                <Card
                  sx={{
                    flex: 1,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: 4,
                      transform: "scale(1.02)",
                    },
                  }}
                  onClick={handleGetStarted}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <AutoAwesome sx={{ mr: 2, color: "primary.main" }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Generate New Plan
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Create a personalized academic plan based on your major,
                      preferences, and timeline
                    </Typography>
                  </CardContent>
                </Card>
                <Card
                  sx={{
                    flex: 1,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: 4,
                      transform: "scale(1.02)",
                    },
                  }}
                  onClick={() => router.push("/saved-plans")}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <BookmarkBorder sx={{ mr: 2, color: "secondary.main" }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        View Saved Plans
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Access and manage your previously created academic plans
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Paper>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
}
