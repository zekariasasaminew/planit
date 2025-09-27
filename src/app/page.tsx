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
} from "@mui/material";
import {
  AutoAwesome,
  ArrowForward,
  BookmarkBorder,
  Refresh,
  School,
  Person,
  Settings,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAuth } from "@/app/context/authContext";
import { AnimatedBackground } from "@/components";
import { iconSizes } from "@/theme/theme";

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [checkingPlans, setCheckingPlans] = useState(false);

  // Check for saved plans when user is authenticated (removed auto-redirect)
  useEffect(() => {
    const checkSavedPlans = async () => {
      if (!user) return;

      try {
        setCheckingPlans(true);
        const response = await fetch("/api/plans");
        if (response.ok) {
          await response.json();
        }
      } catch (error) {
        console.error("Error checking saved plans:", error);
      } finally {
        setCheckingPlans(false);
      }
    };

    if (user) {
      checkSavedPlans();
    }
  }, [user, router]);

  // Handle redirect logic in useEffect to avoid SSR issues
  useEffect(() => {
    if (user === null) {
      router.push("/signin");
    }
  }, [user, router]);

  // Show loading while checking auth
  if (authLoading || user === null || user === undefined || checkingPlans) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <AutoAwesome
              sx={{ fontSize: iconSizes.xlarge, color: "primary.main", mb: 2 }}
            />
          </motion.div>
          <Typography variant="h6" color="text.secondary">
            {checkingPlans ? "Setting up your dashboard..." : "Loading..."}
          </Typography>
        </Box>
      </Box>
    );
  }

  const handleGetStarted = () => {
    router.push("/generate");
  };

  // If user is logged in but has no saved plans, show impressive landing page
  return (
    <Box sx={{ minHeight: "100vh", position: "relative" }}>
      <AnimatedBackground />

      {/* Transparent Header Navigation */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 2,
            }}
          >
            {/* Centered Navigation Links - No background, completely transparent */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 6, // Increased gap between buttons
              }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="text"
                  startIcon={<AutoAwesome />}
                  onClick={() => router.push("/generate")}
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                    textTransform: "none",
                    background: "transparent",
                    py: 1,
                    px: 2,
                    "&:hover": {
                      background: "transparent",
                      opacity: 0.8,
                    },
                  }}
                >
                  Generate Plan
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="text"
                  startIcon={<BookmarkBorder />}
                  onClick={() => router.push("/saved-plans")}
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                    textTransform: "none",
                    background: "transparent",
                    py: 1,
                    px: 2,
                    "&:hover": {
                      background: "transparent",
                      opacity: 0.8,
                    },
                  }}
                >
                  Saved Plans
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="text"
                  startIcon={<School />}
                  onClick={() => router.push("/majors")}
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                    textTransform: "none",
                    background: "transparent",
                    py: 1,
                    px: 2,
                    "&:hover": {
                      background: "transparent",
                      opacity: 0.8,
                    },
                  }}
                >
                  Majors
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="text"
                  startIcon={<Person />}
                  onClick={() => router.push("/profile")}
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                    textTransform: "none",
                    background: "transparent",
                    py: 1,
                    px: 2,
                    "&:hover": {
                      background: "transparent",
                      opacity: 0.8,
                    },
                  }}
                >
                  Profile
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="text"
                  startIcon={<Settings />}
                  onClick={() => router.push("/settings")}
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                    textTransform: "none",
                    background: "transparent",
                    py: 1,
                    px: 2,
                    "&:hover": {
                      background: "transparent",
                      opacity: 0.8,
                    },
                  }}
                >
                  Settings
                </Button>
              </motion.div>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            py: 4,
            pt: 8,
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ width: "100%" }}
          >
            <Box sx={{ textAlign: "center", mb: 8 }}>
              {/* Logo and Title */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <Box sx={{ mb: 4 }}>
                  <motion.div
                    animate={{
                      rotateY: [0, 10, -10, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <School
                      sx={{
                        fontSize: iconSizes.xlarge,
                        color: "primary.main",
                        mb: 2,
                      }}
                    />
                  </motion.div>
                  <Typography
                    variant="h1"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      background:
                        "linear-gradient(135deg, #E68057 0%, #BF7587 50%, #993A8B 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      letterSpacing: "-0.02em",
                      textShadow: "0 0 20px rgba(230, 128, 87, 0.3)",
                    }}
                  >
                    PlanIt
                  </Typography>
                </Box>
              </motion.div>

              {/* Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Typography
                  variant="h2"
                  component="h2"
                  sx={{
                    fontWeight: 600,
                    mb: 3,
                    color: "primary.main",
                  }}
                >
                  Your Academic Journey, Simplified
                </Typography>

                <Typography
                  variant="h5"
                  color="text.secondary"
                  sx={{
                    mb: 6,
                    maxWidth: 700,
                    mx: "auto",
                    lineHeight: 1.6,
                    fontWeight: 400,
                  }}
                >
                  Welcome! Ready to create your first personalized academic
                  plan? Our AI-powered platform will help you navigate course
                  prerequisites, optimize your schedule, and track your progress
                  toward graduation.
                </Typography>
              </motion.div>

              {/* Main CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    onClick={handleGetStarted}
                    endIcon={<ArrowForward />}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: 3,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      textTransform: "none",
                      boxShadow: "0 4px 16px rgba(230, 128, 87, 0.3)",
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
                          "linear-gradient(90deg, transparent, rgba(255,245,240,0.2), transparent)",
                        transition: "left 0.6s",
                      },
                      "&:hover": {
                        boxShadow: "0 12px 40px rgba(230, 128, 87, 0.4)",
                      },
                      "&:hover::before": {
                        left: "100%",
                      },
                    }}
                  >
                    Start Your Journey
                  </Button>
                </motion.div>
              </motion.div>
            </Box>
          </motion.div>
        </Box>
      </Container>

      {/* What is PlanIt Section */}
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ py: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h2"
              component="h3"
              sx={{
                textAlign: "center",
                mb: 6,
                fontWeight: 700,
                background: "linear-gradient(135deg, #E68057 0%, #BF7587 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
              }}
            >
              What is PlanIt?
            </Typography>

            <Box
              sx={{ maxWidth: 1000, mx: "auto", textAlign: "center", mb: 8 }}
            >
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{
                  mb: 4,
                  lineHeight: 1.7,
                  fontSize: { xs: "1.2rem", md: "1.4rem" },
                }}
              >
                PlanIt is your intelligent academic planning companion that
                transforms the complex process of course scheduling into a
                seamless, personalized experience. Using advanced AI and
                comprehensive course data, we help students create optimal
                academic pathways that align with their goals, preferences, and
                graduation requirements.
              </Typography>
            </Box>
          </motion.div>
        </Box>
      </Container>

      {/* Features Section */}
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ py: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h2"
              component="h3"
              sx={{
                textAlign: "center",
                mb: 10,
                fontWeight: 700,
                background: "linear-gradient(135deg, #E68057 0%, #BF7587 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
              }}
            >
              What PlanIt Does
            </Typography>
          </motion.div>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 6,
              alignItems: "stretch",
            }}
          >
            {[
              {
                icon: (
                  <AutoAwesome
                    sx={{ fontSize: iconSizes.large, color: "#FFF5F0" }}
                  />
                ),
                title: "AI-Powered Course Planning",
                description:
                  "Generate personalized academic plans using advanced AI that understands course prerequisites, requirements, and your unique preferences to create the optimal path to graduation.",
              },
              {
                icon: (
                  <Refresh
                    sx={{ fontSize: iconSizes.large, color: "#FFF5F0" }}
                  />
                ),
                title: "Dynamic Plan Updates",
                description:
                  "Instantly modify and regenerate your academic plan when your goals or circumstances change. Our system adapts to schedule conflicts, preference updates, and requirement changes.",
              },
              {
                icon: (
                  <School
                    sx={{ fontSize: iconSizes.large, color: "#FFF5F0" }}
                  />
                ),
                title: "Graduation Requirements Tracking",
                description:
                  "Automatically track graduation requirements, major courses, minor requirements, and general education credits with precision. Never miss a requirement again.",
              },
              {
                icon: (
                  <BookmarkBorder
                    sx={{ fontSize: iconSizes.large, color: "#FFF5F0" }}
                  />
                ),
                title: "Multiple Plan Management",
                description:
                  "Save and compare multiple academic plans. Explore different majors, minors, or graduation timelines side-by-side to make informed decisions about your future.",
              },
              {
                icon: (
                  <ArrowForward
                    sx={{ fontSize: iconSizes.large, color: "#FFF5F0" }}
                  />
                ),
                title: "Semester-by-Semester Planning",
                description:
                  "Get detailed semester breakdowns with course loads, credit hours, and timeline visualization. Plan years ahead with confidence and clarity.",
              },
              {
                // Light color for visibility
                icon: (
                  <AutoAwesome
                    sx={{ fontSize: iconSizes.large, color: "#FFF5F0" }}
                  />
                ),
                title: "Smart Recommendations",
                description:
                  "Receive intelligent suggestions for course selections, scheduling optimizations, and alternative pathways based on your academic performance and preferences.",
              },
            ].map((feature, index) => {
              const isSpecial = true; // Make all cards special with light background
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50, rotateX: 10 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  whileHover={{
                    y: -10,
                    transition: { duration: 0.3 },
                  }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      textAlign: "center",
                      background: isSpecial
                        ? "linear-gradient(135deg, rgba(255, 245, 240, 0.95) 0%, rgba(254, 237, 230, 0.95) 100%)" // Light background for special cards
                        : "rgba(74, 43, 42, 0.8)", // Dark background for others
                      backdropFilter: "blur(20px)",
                      border: isSpecial
                        ? "2px solid rgba(230, 128, 87, 0.3)" // Orange border for special
                        : "1px solid rgba(191, 117, 135, 0.3)", // Rose border for others
                      borderRadius: 4,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: isSpecial
                          ? "linear-gradient(135deg, rgba(255, 245, 240, 1) 0%, rgba(254, 237, 230, 1) 100%)"
                          : "rgba(74, 43, 42, 0.9)",
                        border: isSpecial
                          ? "2px solid rgba(230, 128, 87, 0.5)"
                          : "1px solid rgba(191, 117, 135, 0.5)",
                        boxShadow: isSpecial
                          ? "0 12px 40px rgba(230, 128, 87, 0.4)"
                          : "0 8px 32px rgba(191, 117, 135, 0.3)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <motion.div
                        whileHover={{
                          scale: 1.1,
                          rotate: [0, -5, 5, 0],
                          transition: { duration: 0.5 },
                        }}
                      >
                        <Box sx={{ mb: 3 }}>
                          {/* Update icon colors conditionally */}
                          {React.cloneElement(feature.icon, {
                            sx: {
                              ...feature.icon.props.sx,
                              color: isSpecial ? "#E68057" : "#FFF5F0",
                            },
                          })}
                        </Box>
                      </motion.div>
                      <Typography
                        variant="h5"
                        component="h4"
                        sx={{
                          mb: 3,
                          fontWeight: 700,
                          color: isSpecial ? "#A2574F" : "#FFF5F0", // Dark for light bg, light for dark bg
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          lineHeight: 1.7,
                          fontSize: "1.1rem",
                          color: isSpecial ? "#74433F" : "#E6D5D3", // Dark for light bg, light for dark bg
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </Box>
        </Box>
      </Container>

      {/* Navigation Section */}
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ py: 12 }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h2"
              component="h3"
              sx={{
                textAlign: "center",
                mb: 10,
                fontWeight: 700,
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
              }}
            >
              Where to Go
            </Typography>
          </motion.div>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 4,
              maxWidth: 1000,
              mx: "auto",
            }}
          >
            {[
              {
                // Warm orange for primary card
                icon: (
                  <AutoAwesome
                    sx={{ fontSize: iconSizes.xlarge, color: "#E68057" }}
                  />
                ),
                title: "Generate Your First Plan",
                description:
                  "Start your academic planning journey by creating a personalized plan based on your major, preferences, and timeline.",
                action: "Start Planning",
                onClick: handleGetStarted,
                primary: true,
              },
              {
                icon: (
                  <BookmarkBorder
                    sx={{ fontSize: iconSizes.xlarge, color: "#FFF5F0" }}
                  />
                ),
                title: "View Saved Plans",
                description:
                  "Access and manage your previously created academic plans. Compare different options and track your progress.",
                action: "View Plans",
                onClick: () => router.push("/saved-plans"),
                primary: false,
              },
              {
                icon: (
                  <School
                    sx={{ fontSize: iconSizes.xlarge, color: "#FFF5F0" }}
                  />
                ),
                title: "Browse Majors & Minors",
                description:
                  "Explore available majors and minors to help you make informed decisions about your academic path.",
                action: "Browse Catalog",
                onClick: () => router.push("/majors"),
                primary: false,
              },
              {
                icon: (
                  <Refresh
                    sx={{ fontSize: iconSizes.xlarge, color: "#FFF5F0" }}
                  />
                ),
                title: "Planner Interface",
                description:
                  "Use our interactive planner to visualize your academic timeline and make adjustments to your course schedule.",
                action: "Open Planner",
                onClick: () => router.push("/planner"),
                primary: false,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    background: item.primary
                      ? "linear-gradient(135deg, rgba(255, 245, 240, 0.95) 0%, rgba(254, 237, 230, 0.95) 100%)" // Light peachy background for primary
                      : "rgba(74, 43, 42, 0.8)", // Darker background for others
                    backdropFilter: "blur(20px)",
                    border: item.primary
                      ? "2px solid rgba(230, 128, 87, 0.3)"
                      : "1px solid rgba(191, 117, 135, 0.3)",
                    borderRadius: 4,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: item.primary
                        ? "linear-gradient(135deg, rgba(255, 245, 240, 1) 0%, rgba(254, 237, 230, 1) 100%)"
                        : "rgba(74, 43, 42, 0.9)",
                      border: item.primary
                        ? "2px solid rgba(230, 128, 87, 0.5)"
                        : "2px solid rgba(191, 117, 135, 0.5)",
                      boxShadow: item.primary
                        ? "0 12px 40px rgba(230, 128, 87, 0.4)"
                        : "0 8px 32px rgba(191, 117, 135, 0.3)",
                    },
                  }}
                  onClick={item.onClick}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      {item.icon}
                      <Typography
                        variant="h5"
                        sx={{
                          ml: 2,
                          fontWeight: 700,
                          color: item.primary ? "#A2574F" : "#FFF5F0", // Dark reddish-brown for primary, light for others
                        }}
                      >
                        {item.title}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 3,
                        lineHeight: 1.6,
                        color: item.primary ? "#74433F" : "#E6D5D3", // Darker brown for primary, lighter for others
                      }}
                    >
                      {item.description}
                    </Typography>
                    <Button
                      variant={item.primary ? "contained" : "outlined"}
                      endIcon={<ArrowForward />}
                      sx={{
                        borderRadius: 3,
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      {item.action}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        </Box>
      </Container>

      {/* Footer with Links */}
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            py: 8,
            borderTop: "1px solid rgba(230, 128, 87, 0.2)",
            mt: 8,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Ready to Transform Your Academic Journey?
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Join thousands of students who have simplified their path to
                graduation
              </Typography>

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
                    py: 2.5,
                    px: 6,
                    borderRadius: 4,
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    textTransform: "none",
                    boxShadow: "0 8px 32px rgba(230, 128, 87, 0.3)",
                  }}
                >
                  Get Started Now
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}
