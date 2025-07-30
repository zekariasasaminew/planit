"use client";

import React, { useEffect } from "react";
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
  School,
  Timeline,
  CheckCircle,
  ArrowForward,
  BookmarkBorder,
} from "@mui/icons-material";
import { useAuth } from "@/app/context/authContext";

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

  const features = [
    {
      icon: <AutoAwesome sx={{ fontSize: 48, color: "primary.main" }} />,
      title: "AI-Powered Planning",
      description:
        "Generate personalized academic plans using advanced AI that understands course prerequisites and requirements.",
    },
    {
      icon: <Timeline sx={{ fontSize: 48, color: "secondary.main" }} />,
      title: "Semester-by-Semester View",
      description:
        "Visualize your entire academic journey with clear semester-by-semester course planning.",
    },
    {
      icon: <CheckCircle sx={{ fontSize: 48, color: "success.main" }} />,
      title: "Requirement Tracking",
      description:
        "Automatically track graduation requirements, major courses, and general education credits.",
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Hero Section */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: "linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
              }}
            >
              Welcome to PlanIt
            </Typography>
            <Typography
              variant="h5"
              component="h2"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 600, mx: "auto" }}
            >
              Your intelligent academic planning assistant that helps you
              navigate your college journey with confidence
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              endIcon={<ArrowForward />}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 3,
                fontSize: "1.1rem",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: 3,
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Get Started
            </Button>
          </Box>
        </Fade>

        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h4"
            component="h3"
            sx={{ textAlign: "center", mb: 6, fontWeight: 600 }}
          >
            Why Choose PlanIt?
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              alignItems: "stretch",
            }}
          >
            {features.map((feature, index) => (
              <Fade in timeout={1000 + index * 200} key={index}>
                <Card
                  sx={{
                    flex: 1,
                    textAlign: "center",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: 8,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ mb: 3 }}>{feature.icon}</Box>
                    <Typography
                      variant="h6"
                      component="h4"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
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
  );
}
