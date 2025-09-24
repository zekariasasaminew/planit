"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Paper,
} from "@mui/material";
import { Share as ShareIcon, Schedule, School } from "@mui/icons-material";
import { AcademicPlan, Semester } from "@/types";

export default function SharedPlanPage() {
  const params = useParams();
  const token = params.token as string;
  const [plan, setPlan] = useState<AcademicPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedPlan = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/share/${token}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("This shared plan was not found or has expired.");
          }
          throw new Error("Failed to load shared plan");
        }
        const data = await response.json();

        // Transform the data to match our AcademicPlan interface
        const transformedPlan: AcademicPlan = {
          ...data,
          startSemester: {
            season: data.start_season,
            year: data.start_year,
          },
          endSemester: {
            season: data.end_season || "Spring",
            year: data.end_year || data.start_year + 4,
          },
          majors: [], // Shared plans don't include major/minor details for privacy
          minors: [],
          semesters: (data.plan_semesters || [])
            .sort((a: any, b: any) => a.position - b.position)
            .map(
              (semester: any): Semester => ({
                id: semester.id,
                name: `${semester.season} ${semester.year}`,
                season: semester.season,
                year: semester.year,
                position: semester.position,
                totalCredits: semester.total_credits || 0,
                courses: (semester.plan_courses || [])
                  .map((planCourse: any) => ({
                    id: planCourse.courses?.id,
                    code: planCourse.courses?.code,
                    title: planCourse.courses?.title,
                    credits: planCourse.courses?.credits,
                    type: planCourse.courses?.type,
                  }))
                  .filter((course: any) => course.id),
              })
            ),
        };

        setPlan(transformedPlan);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load shared plan"
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSharedPlan();
    }
  }, [token]);

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Unknown";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 8,
          }}
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading shared plan...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !plan) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">
            <Typography variant="h6" sx={{ mb: 1 }}>
              Unable to Load Plan
            </Typography>
            <Typography variant="body1">
              {error || "This shared plan could not be found."}
            </Typography>
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <ShareIcon sx={{ mr: 2, fontSize: 32, color: "primary.main" }} />
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
              {plan.name}
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Shared Academic Plan
          </Typography>

          {/* Plan Summary */}
          <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 3,
              }}
            >
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Schedule sx={{ mr: 1, color: "text.secondary" }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Duration
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {plan.startSemester?.season || "Fall"}{" "}
                  {plan.startSemester?.year || new Date().getFullYear()} -{" "}
                  {plan.endSemester?.season || "Spring"}{" "}
                  {plan.endSemester?.year || new Date().getFullYear() + 4}
                </Typography>
              </Box>

              <Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <School sx={{ mr: 1, color: "text.secondary" }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Credits
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {(plan.semesters || []).reduce(
                    (sum, sem) => sum + (sem.totalCredits || 0),
                    0
                  )}
                </Typography>
              </Box>

              <Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Semesters
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {(plan.semesters || []).length}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Shared On
                </Typography>
                <Typography variant="body2">
                  {formatDate(new Date())}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Semester Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
            gap: 3,
          }}
        >
          {(plan.semesters || []).map((semester) => (
            <Card key={semester.id} sx={{ height: "fit-content" }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ fontWeight: 600 }}
                  >
                    {semester.name}
                  </Typography>
                  <Chip
                    label={`${semester.totalCredits} credits`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {(semester.courses || []).map((course) => (
                    <Paper
                      key={course.id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        backgroundColor: "grey.50",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {course.code}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.title}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mt: 1,
                        }}
                      >
                        <Chip
                          label={course.type}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.75rem" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {course.credits} credits
                        </Typography>
                      </Box>
                    </Paper>
                  ))}

                  {(semester.courses || []).length === 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "center", py: 2 }}
                    >
                      No courses planned for this semester
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {(plan.semesters || []).length === 0 && (
          <Alert severity="info">
            <Typography variant="h6" sx={{ mb: 1 }}>
              No Semesters Planned
            </Typography>
            <Typography variant="body1">
              This plan doesn&apos;t have any semesters configured yet.
            </Typography>
          </Alert>
        )}
      </Box>
    </Container>
  );
}
