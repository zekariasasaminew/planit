"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Fab,
} from "@mui/material";
import {
  Timeline,
  Download,
  Share,
  Edit,
  CheckCircle,
  Add,
} from "@mui/icons-material";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SemesterCard } from "@/components/SemesterCard";
import { AcademicPlan } from "@/types";

function PlannerPageContent() {
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState<AcademicPlan | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        // Check if this is a newly generated plan
        const generated = searchParams.get("generated") === "true";
        setIsGenerated(generated);

        const planId = searchParams.get("id");
        if (!planId) {
          setError(
            "No plan ID provided. Please generate a plan or select one from your saved plans."
          );
          return;
        }

        const response = await fetch(`/api/plans/${planId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch plan");
        }

        const planData = await response.json();
        setPlan(planData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load plan");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [searchParams]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="h5" color="text.secondary">
            Loading your academic plan...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">
            <Typography variant="h6" sx={{ mb: 1 }}>
              Error Loading Plan
            </Typography>
            <Typography variant="body1">
              {error}. Please try refreshing the page.
            </Typography>
          </Alert>
        </Box>
      </Container>
    );
  }

  if (!plan) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="h5" color="text.secondary">
            Plan not found
          </Typography>
        </Box>
      </Container>
    );
  }

  const semesters = plan.semesters || [];
  const totalCredits = semesters.reduce(
    (sum, semester) => sum + (semester.totalCredits || 0),
    0
  );
  const completedSemesters = 0; // This would be calculated based on current date
  const progressPercentage =
    semesters.length > 0
      ? Math.round((completedSemesters / semesters.length) * 100)
      : 0;

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Success Alert for New Plans */}
        {isGenerated && (
          <Alert
            severity="success"
            sx={{ mb: 4 }}
            action={
              <Button color="inherit" size="small">
                Save Plan
              </Button>
            }
          >
            <AlertTitle>Plan Generated Successfully!</AlertTitle>
            Your personalized academic plan is ready. Review the
            semester-by-semester breakdown below.
          </Alert>
        )}

        {/* Plan Header */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 3,
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Timeline sx={{ mr: 2, fontSize: 32, color: "primary.main" }} />
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{ fontWeight: 700 }}
                >
                  {plan.name}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                {(plan.majors || []).map((major) => (
                  <Chip
                    key={major.id}
                    label={major.name}
                    color="primary"
                    variant="outlined"
                  />
                ))}
                {(plan.minors || []).map((minor) => (
                  <Chip
                    key={minor.id}
                    label={`Minor: ${minor.name}`}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Edit Plan">
                <IconButton color="primary">
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share Plan">
                <IconButton color="primary">
                  <Share />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download PDF">
                <IconButton color="primary">
                  <Download />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Plan Summary */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Duration
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {plan.startSemester.season} {plan.startSemester.year} -{" "}
                {plan.endSemester.season} {plan.endSemester.year}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Credits
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {totalCredits} credits
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Semesters
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {plan.semesters.length} semesters
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "success.main" }}
              >
                {progressPercentage}% Complete
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Semester Timeline */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{ mb: 3, fontWeight: 600 }}
          >
            Semester-by-Semester Plan
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 3,
              overflowX: "auto",
              pb: 2,
              "&::-webkit-scrollbar": {
                height: 8,
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "rgba(0,0,0,0.1)",
                borderRadius: 4,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0,0.3)",
                borderRadius: 4,
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.5)",
                },
              },
            }}
          >
            {semesters.map((semester, index) => (
              <Box key={semester.id} sx={{ position: "relative" }}>
                {index < completedSemesters && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      zIndex: 1,
                    }}
                  >
                    <CheckCircle sx={{ color: "success.main", fontSize: 24 }} />
                  </Box>
                )}
                <SemesterCard semester={semester} />
              </Box>
            ))}

            {/* Add Semester Button */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 300,
                height: 200,
                border: "2px dashed",
                borderColor: "grey.300",
                borderRadius: 3,
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "action.hover",
                },
                cursor: "pointer",
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Add sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  Add Semester
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Plan Insights */}
        <Paper sx={{ p: 4 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{ mb: 3, fontWeight: 600 }}
          >
            Plan Insights
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            <Alert severity="info" sx={{ flex: 1, minWidth: 300 }}>
              <AlertTitle>Prerequisites Met</AlertTitle>
              All course prerequisites are satisfied in your current plan.
            </Alert>
            <Alert severity="success" sx={{ flex: 1, minWidth: 300 }}>
              <AlertTitle>On Track for Graduation</AlertTitle>
              {"You're on schedule to graduate in "}
              {plan.endSemester.season} {plan.endSemester.year}.
            </Alert>
            <Alert severity="warning" sx={{ flex: 1, minWidth: 300 }}>
              <AlertTitle>Credit Load</AlertTitle>
              Some semesters have high credit loads. Consider adjusting if
              needed.
            </Alert>
          </Box>
        </Paper>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
          }}
        >
          <Add />
        </Fab>
      </Box>
    </Container>
  );
}

export default function PlannerPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div>Loading...</div>}>
        <PlannerPageContent />
      </Suspense>
    </ProtectedRoute>
  );
}
